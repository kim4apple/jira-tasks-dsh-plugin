/**
 * dsh-jira-tasks — HOST half (persistent profile plugin).
 * Serves POST /jira/api/search: reads the JIRA base URL from this entry's own
 * Config (the `jira-tasks` profile entry, editable on the Plugins settings
 * page) and the token from the credentials service — the settings-page
 * JIRA_TASKS_TOKEN first, so it overrides an exported JIRA_API_TOKEN /
 * JIRA_TOKEN — then queries JIRA /rest/api/2/search through subprocess+curl
 * (auth header via stdin --config -), returning normalized issue JSON.
 *
 * Also serves the sidebar statistics page: POST /jira/api/stats pages through a
 * project's issues, aggregating a status-category summary and merging the
 * project version API into a version-statistics list; POST /jira/api/version-issues
 * returns one version's issue rows (plus the current user, so the client can put
 * that user's issues first). The picker itself is client-side: its options are
 * the project keys already configured in this browser, not the whole JIRA
 * project list.
 */
import z from '@deepseek-ai/schemastery';
import path from 'node:path';
import fs from 'node:fs';

/** Settings namespace exposing the editable connection fields in the GUI. */
const SETTINGS_NS = 'jira-tasks';

/**
 * Diagnostics name for this plugin instance. Deliberately the same string as
 * {@link SETTINGS_NS} (= the profile entry id, `jira-tasks`): that id — not this
 * name and not the package name `dsh-jira-tasks` — is the settings namespace the
 * client card edits, so deriving one from the other removes a whole class of
 * confusion when reading loader logs.
 */
const name = SETTINGS_NS;

/**
 * Token references in precedence order. `JIRA_TASKS_TOKEN` is the plugin-owned
 * ref the settings card writes to: unlike `JIRA_API_TOKEN`, the credentials
 * provider can always store it, because the launching environment does not
 * supply it. Listing it first is what makes a saved token override an exported
 * `JIRA_API_TOKEN` / `JIRA_TOKEN`.
 */
const TOKEN_REFS = ['JIRA_TASKS_TOKEN', 'JIRA_API_TOKEN', 'JIRA_TOKEN'];

/**
 * Account references for Basic authentication, in precedence order.
 *
 * The USERNAME half is not a secret: the settings card writes it into this
 * entry's own Config (so the UI can echo it back and show which account is in
 * use). These refs are only the fallback for deployments that configure the
 * account through the environment instead.
 *
 * The PASSWORD half IS a secret, so it lives exclusively in the credentials
 * store — never in Config, because Config is persisted in cleartext into the
 * profile configuration document.
 */
const USERNAME_REFS = ['JIRA_TASKS_USERNAME', 'JIRA_USERNAME'];
const PASSWORD_REFS = ['JIRA_TASKS_PASSWORD', 'JIRA_PASSWORD'];

/**
 * 统计页单次取数的任务上限。统计在前端渲染前由 Host 聚合，因此必须分页扫描
 * 项目的全部任务；用上限兜住超大项目（几万条）的请求时间，超过时结果标记
 * `truncated`，客户端会明确提示“仅统计前 N 条”。
 */
const STATS_MAX_ISSUES = 20000;

/**
 * 统计分页的每页条数。JIRA Server 的 search 接口接受 1000；若实例把上限压得
 * 更小，实际返回条目数会变少，循环按实际条目数推进，不会漏数。
 */
const STATS_PAGE_SIZE = 1000;

/** 统计只取聚合需要的字段（状态分类 + 版本）；不再拉类型/优先级/负责人。 */
const STATS_FIELDS = 'status,fixVersions';

/** 「版本任务列表」需要的字段（列表展示 + 客户端点表头排序）。 */
const VERSION_ISSUE_FIELDS = 'summary,status,priority,issuetype,assignee,updated';

/** 版本任务列表单页条数与总量上限（版本通常只有几十~几百条）。 */
const VERSION_ISSUE_PAGE_SIZE = 1000;
const VERSION_ISSUE_MAX = 5000;

/** 版本任务列表的整体时间预算（若实例把每页压到 100 条，避免串行拖太久）。 */
const VERSION_ISSUE_DEADLINE_MS = 60000;

/**
 * 统计整体时间预算。分页走 curl，每页有 30s 超时；如果没有整体上限，极大项目会
 * 让请求拖到几分钟。预算在每页请求前检查，超过就停止翻页，用已取到的任务出结果
 * 并标记 truncated（最坏情况还会再等当前这一页最多 30s）。
 */
const STATS_DEADLINE_MS = 120000;

/**
 * 搜索路由单次返回条数：缺省 50、上限 200。
 * 50 是既有行为（原先硬编码在 search 请求里），保持不变；200 是本轮加的上限，
 * 防止客户端一次把几千条任务拉回来。两者都只作用于「可选的 maxResults」，
 * 不传时发出的请求与改动前逐字节一致。
 */
const SEARCH_MAX_RESULTS_DEFAULT = 50;
const SEARCH_MAX_RESULTS_LIMIT = 200;

/**
 * Durable connection schema. Since DSH 0.1.5 the settings service no longer
 * takes a `register(ns, schema)` call: a plugin's OWN Config IS the form its
 * settings page is built from, keyed by the profile entry id (`jira-tasks`).
 * `baseUrl` is volatile, so a saved change reaches the running plugin without
 * remounting it. The token is deliberately NOT here — it stays in the
 * credentials store (write-only from the client), so no secret ever lands in
 * the profile configuration document.
 *
 * `username` is here because an account name is not a secret: keeping it in
 * Config lets the settings card show which account is in use. The PASSWORD is
 * NOT here for the same reason the token is not — it lives in the credentials
 * store only.
 */
const Config = z.object({
  baseUrl: z.string().default('').volatile().description('JIRA 地址，例如 http://jira.example.com/'),
  username: z.string().default('').volatile().description('账号（Jira Server 用用户名，Cloud 用邮箱）'),
  maxAttachmentMb: z.number().default(100).description('单个附件下载的大小上限（MB）')
});

const inject = ['subprocess', 'credentials', 'sandboxPolicy', 'webServer'];

/**
 * Answer a non-POST request with 405. `webServer.register` dispatches on the
 * pathname only, so without this guard a stray GET would run a real JIRA
 * query. Returns true when the caller may handle the request.
 * @param req - the HTTP request.
 * @param res - the response the guard writes to on refusal.
 * @returns true for POST, false after answering 405.
 */
function methodIsPost(req, res) {
  if (req.method === 'POST') return true;
  res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', Allow: 'POST' });
  res.end('method not allowed');
  return false;
}

/**
 * Mount the host half: the /jira/api/* routes and the settings-page policy.
 * @param ctx - plugin context.
 * @param config - this entry's live Config (profile entry `jira-tasks`).
 */
function apply(ctx, config) {
    const sendJson = (res, obj) => {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(obj));
    };
    const readBody = (req) => new Promise((resolve) => {
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        try {
          const text = Buffer.concat(chunks).toString('utf-8') || '{}';
          resolve(JSON.parse(text));
        } catch (e) { resolve({}); }
      });
      req.on('error', () => resolve({}));
    });

    const subprocess = ctx.get('subprocess');
    const credentials = ctx.get('credentials');
    const sandboxPolicy = ctx.get('sandboxPolicy');
    const webServer = ctx.get('webServer');
    const workspaceRoot = sandboxPolicy && sandboxPolicy.workspaceRoot ? sandboxPolicy.workspaceRoot : '/tmp';

    async function resolveFirst(names) {
      for (const name of names) {
        try {
          const cred = await credentials.resolve(name);
          if (cred && typeof cred.value === 'string' && cred.value.length > 0) return cred.value;
        } catch (e) { /* try next */ }
      }
      // 兜底：凭据服务通常已经能把「由启动环境提供」的引用解析出来，但插件自有
      // 引用（如 JIRA_TASKS_PASSWORD）在「只有环境变量、没写进凭据存储」的
      // 部署下也可能只存在于进程环境里，这里补一次直读。
      for (const name of names) {
        const value = typeof process !== 'undefined' ? process.env[name] : undefined;
        if (typeof value === 'string' && value.length > 0) return value;
      }
      return undefined;
    }

    // DSH 0.1.5+ ：设置页的表单直接来自本条目自己的 Config，settings 服务不再有
    // register(ns, schema)。这里把本实例的“自动生成页”关掉，改由客户端注册的
    // 自定义卡片（地址 + 令牌 + 连通性测试）接管。
    // 两个易错点：1) configure 的第二个参数必须是**本插件实例**的 fiber——默认值是
    // settings 服务自己的 fiber，而 describe() 是按 entry.fiber 查策略的，传错不生效；
    // 2) 返回值是注销函数，必须交回 effect，否则卸载后策略会一直挂在死 fiber 上。
    ctx.inject(['settings'], (settingsCtx) => {
      settingsCtx.effect(() => {
        try {
          return settingsCtx.settings.configure({ auto: false }, ctx.fiber);
        } catch (e) {
          // 同一实例重复配置等情况下不阻断插件加载，但要留下可诊断的日志。
          if (ctx.logger && typeof ctx.logger.warn === 'function') {
            ctx.logger.warn('jira-tasks: settings page policy not applied: %s', (e && e.message) || e);
          }
          return undefined;
        }
      }, 'jira-tasks: settings page policy');
    });

    /** 本条目 Config 里的 JIRA 地址（volatile 引用），未配置时返回 ''。 */
    function settingsBaseUrl() {
      try {
        const ref = config && config.baseUrl;
        const value = ref && typeof ref.get === 'function' ? ref.get() : ref;
        return typeof value === 'string' ? value.trim() : '';
      } catch (e) {
        return '';
      }
    }

    /** 本条目 Config 里的 JIRA 账号（volatile 引用），未配置时返回 ''。 */
    function settingsUsername() {
      try {
        const ref = config && config.username;
        const value = ref && typeof ref.get === 'function' ? ref.get() : ref;
        return typeof value === 'string' ? value.trim() : '';
      } catch (e) {
        return '';
      }
    }

    /** UTF-8 base64。不能用 btoa：它对非 Latin-1 字符（中文密码等）会抛异常。 */
    function toBase64(text) {
      return Buffer.from(text, 'utf-8').toString('base64');
    }

    /**
     * 构造认证头。三种凭据形态，按优先级：
     *   1) 显式账号 + 密码 → Basic base64(user:pass)
     *   2) 含 “:” 的旧值 → Basic base64(value)
     *   3) 其余 → Bearer value
     *
     * 2) 是为向后兼容保留的：老用户可能早就把 “user:pass” 粘在令牌框里了。
     * 1) 优先级更高，所以显式的账号密码总是压过旧值。
     *
     * Basic 规范只按**第一个**冒号切分用户名与密码，因此密码里带冒号是安全的。
     */
    function buildAuthHeader(token, account) {
      const username = account && typeof account.username === 'string' ? account.username : '';
      const password = account && typeof account.password === 'string' ? account.password : '';
      if (username && password) return 'Basic ' + toBase64(username + ':' + password);
      if (token && token.indexOf(':') !== -1) return 'Basic ' + toBase64(token);
      return 'Bearer ' + (token || '');
    }

    /** 当前凭据实际生效的认证方式，供前端显示（basic / bearer）。 */
    function authModeOf(token, account) {
      const username = account && typeof account.username === 'string' ? account.username : '';
      const password = account && typeof account.password === 'string' ? account.password : '';
      if (username && password) return 'basic';
      if (token && token.indexOf(':') !== -1) return 'basic';
      return 'bearer';
    }

    /**
     * 判断是否为 Jira Cloud（*.atlassian.net）。Cloud 与 Server/DC 的密码策略
     * 完全不同：Atlassian 已废弃 Cloud 的密码认证，只接受「邮箱 + API token」。
     */
    function isCloudHost(baseUrl) {
      try {
        return /\.atlassian\.net$/i.test(new URL(baseUrl).hostname);
      } catch (e) {
        return false;
      }
    }

    /**
     * 401/403 时的可操作提示。同一个状态码在 Cloud 与 Server/DC 上的正确处置
     * 完全不同，只回一句 “Authentication required” 等于把排查成本全推给用户。
     */
    function authErrorHint(baseUrl, mode) {
      if (mode !== 'basic') return '';
      if (isCloudHost(baseUrl)) {
        return 'Jira Cloud 不接受账号密码登录，请改用「邮箱 + API token」（Basic）或 PAT（Bearer）。';
      }
      return '账号或密码不正确；该实例也可能只接受 PAT（Bearer）或 API token。';
    }

    /**
     * 统一的“凭据缺失”文案。账号密码与令牌是两条并列的凭据路径，只说“令牌”
     * 会让用账号密码的用户以为这个插件不支持账号密码。
     */
    function missingCredentialError() {
      return '未配置 JIRA 凭据（设置 → JIRA 配置：账号密码或访问令牌；或环境变量 JIRA_USERNAME / JIRA_PASSWORD / JIRA_API_TOKEN）';
    }

    /**
     * 附件文件名消毒：JIRA 返回的 filename 是不可信输入，直接拼进路径会造成目录穿越。
     * 规则：只取 basename → 去掉控制字符与连续的点 → 只保留安全字符（保留中日韩文字）→ 限长并保留扩展名。
     */
    function sanitizeFilename(raw) {
      const base = String(raw == null ? '' : raw).split(/[\\/]/).pop() || '';
      const cleaned = base
        .replace(/[\u0000-\u001f\u007f]/g, '')
        .replace(/\.{2,}/g, '.')
        .replace(/[^\p{L}\p{N}._\- ]/gu, '_')
        .replace(/\s+/g, ' ')
        .trim();
      const safe = cleaned || 'attachment';
      if (safe.length <= 120) return safe;
      const dot = safe.lastIndexOf('.');
      const ext = dot > 0 && safe.length - dot <= 12 ? safe.slice(dot) : '';
      return safe.slice(0, Math.max(1, 120 - ext.length)) + ext;
    }

    /**
     * 附件落盘目录：<workspaceRoot>/jira-attachments/<工单号>/
     * 放在工作区里，智能体就能直接 read/grep 这些文件来定位问题。
     */
    function attachmentDirFor(issueKey) {
      const safeKey = sanitizeFilename(issueKey).replace(/[. ]/g, '_') || 'issue';
      return path.join(workspaceRoot, 'jira-attachments', safeKey);
    }

    /** 附件大小上限（字节）。Config.maxAttachmentMb 缺省 100MB。 */
    function attachmentMaxBytes() {
      let mb = 100;
      try {
        const ref = config && config.maxAttachmentMb;
        const value = ref && typeof ref.get === 'function' ? ref.get() : ref;
        const n = Number(value);
        if (Number.isFinite(n) && n > 0) mb = n;
      } catch (e) { /* 用默认值 */ }
      return Math.floor(mb * 1048576);
    }

    /**
     * 同源校验：附件 URL 必须与配置的 JIRA 地址同主机，协议只允许 http/https。
     * 客户端只传 attachmentId、URL 由 Host 从 JIRA 响应里取，这里是第二道防线。
     */
    function assertSameOrigin(baseUrl, url) {
      let target;
      let base;
      try {
        target = new URL(String(url));
        base = new URL(String(baseUrl));
      } catch (e) {
        throw new Error('附件地址不是合法 URL');
      }
      if (target.protocol !== 'http:' && target.protocol !== 'https:') {
        throw new Error('附件地址协议不被允许');
      }
      if (target.host.toLowerCase() !== base.host.toLowerCase()) {
        throw new Error('附件地址与 JIRA 地址主机或端口不一致，拒绝下载');
      }
      return target;
    }

    async function resolveCurl() {
      try { return await subprocess.resolveExecutable('curl'); }
      catch (e) { return '/usr/bin/curl'; }
    }

    /** 认证头只经 curl --config - 的 stdin 传入，不进 argv。 */
    function authStdin(auth) {
      return 'header = "Authorization: ' + auth + '"\n';
    }

    /** 跑一次 curl，返回 {exitCode, stdout, stderr}。 */
    async function runCurl(argv, stdinData, stdoutLimit) {
      const handle = subprocess.spawn({
        argv,
        cwd: workspaceRoot,
        stdio: {
          stdin: { data: stdinData },
          stdout: { maxBytes: stdoutLimit || 1024 * 1024, spill: { maxBytes: 8 * 1024 * 1024 } },
          stderr: { maxBytes: 256 * 1024, spill: { maxBytes: 4 * 1024 * 1024 } }
        },
        graceMs: 5000
      });
      const outcome = await handle.done;
      const stdout = (handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : '') || '';
      const stderr = (handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '') || '';
      return { exitCode: outcome.exitCode, stdout, stderr };
    }

    /**
     * 下载一个远程文件到本地路径。
     *
     * 重定向是这里最关键的安全点：curl 用 -H 设的 Authorization 头在跨主机重定向时
     * **仍会被带过去**，等于把凭据泄露给第三方。所以这里不用 -L，而是：
     *   1. GET 一次（不跟随跳转），拿状态码与 Location
     *   2. 跳到同主机 → 带认证头再 GET
     *   3. 跳到不同主机 → **不带认证头** GET（签名 URL 自带鉴权）
     * 最多多取一次 3xx 的空 body，不会重复下载真实内容。
     */
    async function downloadToFile(baseUrl, cred, url, destPath, maxBytes) {
      const target = assertSameOrigin(baseUrl, url);
      const curl = await resolveCurl();
      const auth = buildAuthHeader(cred.token, cred);
      const baseHost = new URL(baseUrl).host.toLowerCase();

      let current = target.href;
      let withAuth = true;
      let attempt = 0;

      while (attempt < 3) {
        attempt += 1;
        const argv = [curl, '-sS', '--fail', '--max-time', '300', '--create-dirs',
          '--max-filesize', String(maxBytes),
          '-o', destPath, '-w', '%{http_code}|%{redirect_url}|%{size_download}|%{content_type}'];
        if (withAuth) argv.push('--config', '-');
        argv.push(current);

        const res = await runCurl(argv, withAuth ? authStdin(auth) : '', 64 * 1024);
        const parts = (res.stdout.trim().split('\n').pop() || '').trim().split('|');
        const code = Number(parts[0]) || 0;
        const redirect = parts[1] || '';
        const bytes = Number(parts[2]) || 0;
        const contentType = parts[3] || '';

        if (code >= 300 && code < 400 && redirect) {
          let next;
          try { next = new URL(redirect, current); }
          catch (e) { throw new Error('附件跳转地址不合法'); }
          if (next.protocol !== 'http:' && next.protocol !== 'https:') {
            throw new Error('附件跳转协议不被允许');
          }
          current = next.href;
          // 跨主机跳转：绝不带认证头，避免把凭据泄露给第三方
          withAuth = next.host.toLowerCase() === baseHost;
          continue;
        }

        if (res.exitCode !== 0) {
          // --fail 时 HTTP >= 400 不写 body，但文件可能已被创建为空文件
          try { fs.unlinkSync(destPath); } catch (e) { /* 可能没建文件 */ }
          throw new Error('附件下载失败（HTTP ' + (code || '?') + '）：'
            + ((res.stderr || '').trim() || ('curl 退出码 ' + res.exitCode)));
        }
        return { bytes, contentType, url: current };
      }
      try { fs.unlinkSync(destPath); } catch (e) { /* 可能没建文件 */ }
      throw new Error('附件下载跳转次数过多');
    }

    /** 找一个没被占用的文件名（同名追加 -1、-2…）。 */
    function uniquePath(dir, filename) {
      const dot = filename.lastIndexOf('.');
      const ext = dot > 0 ? filename.slice(dot) : '';
      const stem = ext ? filename.slice(0, filename.length - ext.length) : filename;
      let candidate = path.join(dir, filename);
      let n = 1;
      while (n < 1000) {
        try { if (!fs.existsSync(candidate)) return candidate; }
        catch (e) { return candidate; }
        candidate = path.join(dir, stem + '-' + n + ext);
        n += 1;
      }
      return candidate;
    }

    /**
     * 取一个工单的全部字段 + 评论 + 附件清单 + 变更历史。
     */
    async function fetchIssueDetail(baseUrl, cred, issueKey) {
      const key = String(issueKey || '').trim();
      if (!key) throw new Error('未提供工单号');
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(key)) throw new Error('工单号格式不合法');

      const issueRaw = await curlJson(baseUrl, cred, '/rest/api/2/issue/' + encodeURIComponent(key), null, { timeout: 30 });
      if (issueRaw.exitCode !== 0) {
        let msg = (issueRaw.stderr || '').trim() || ('curl 退出码 ' + issueRaw.exitCode);
        try {
          const parsed = JSON.parse(issueRaw.stdout);
          if (parsed.errorMessages && parsed.errorMessages.length) msg = parsed.errorMessages.join('；');
          else if (parsed.message) msg = parsed.message;
        } catch (e) { /* 非 JSON，保留 stderr */ }
        throw new Error(msg);
      }
      let issue;
      try { issue = JSON.parse(issueRaw.stdout); }
      catch (e) { throw new Error('无法解析 JIRA 工单响应'); }

      const fields = (issue && issue.fields) || {};

      // 评论：单独一次请求；取不到不影响主流程
      let comments = [];
      try {
        const cRaw = await curlJson(baseUrl, cred, '/rest/api/2/issue/' + encodeURIComponent(key) + '/comment',
          { maxResults: 100, orderBy: 'created' }, { timeout: 30 });
        if (cRaw.exitCode === 0) {
          const parsed = JSON.parse(cRaw.stdout);
          const list = parsed.comments || parsed.values || [];
          comments = list.map((c) => ({
            id: c.id || '',
            author: (c.author && (c.author.displayName || c.author.name)) || '',
            created: c.created || '',
            updated: c.updated || '',
            body: c.body || ''
          }));
        }
      } catch (e) { /* 评论取不到就算了 */ }

      const rawAttachments = Array.isArray(fields.attachment) ? fields.attachment : [];
      const attachments = rawAttachments.map((a) => ({
        id: a.id || '',
        filename: a.filename || '',
        size: typeof a.size === 'number' ? a.size : 0,
        contentType: a.mimeType || a.contentType || '',
        created: a.created || '',
        author: (a.author && (a.author.displayName || a.author.name)) || '',
        url: a.content || ''
      }));

      const customFields = {};
      Object.keys(fields).forEach((k) => {
        if (/^customfield_/i.test(k)) customFields[k] = fields[k];
      });

      let changelog = [];
      if (fields.changelog && Array.isArray(fields.changelog.histories)) {
        changelog = fields.changelog.histories.map((h) => ({
          id: h.id || '',
          author: (h.author && (h.author.displayName || h.author.name)) || '',
          created: h.created || '',
          items: Array.isArray(h.items) ? h.items.map((it) => ({
            field: it.field || '',
            fieldId: it.fieldId || '',
            from: it.fromString == null ? '' : it.fromString,
            to: it.toString == null ? '' : it.toString
          })) : []
        }));
      }

      return {
        ok: true,
        key: issue.key || key,
        summary: fields.summary || '',
        issueType: (fields.issuetype && fields.issuetype.name) || '',
        status: (fields.status && fields.status.name) || '',
        statusCategory: fields.statuscategorykey || '',
        priority: (fields.priority && fields.priority.name) || '',
        assignee: (fields.assignee && (fields.assignee.displayName || fields.assignee.name)) || '',
        reporter: (fields.reporter && (fields.reporter.displayName || fields.reporter.name)) || '',
        created: fields.created || '',
        updated: fields.updated || '',
        resolved: fields.resolved || null,
        description: fields.description || '',
        labels: Array.isArray(fields.labels) ? fields.labels : [],
        components: Array.isArray(fields.components) ? fields.components.map((c) => c && c.name).filter(Boolean) : [],
        fixVersions: Array.isArray(fields.fixVersions) ? fields.fixVersions.map((v) => v && v.name).filter(Boolean) : [],
        customFields: customFields,
        allFields: fields,
        comments: comments,
        attachments: attachments,
        changelog: changelog
      };
    }

    /** 下载一个附件（已知 detail 与附件元数据）到工作区。 */
    async function saveAttachmentFrom(baseUrl, cred, detail, att, dir) {
      if (!att.url) throw new Error('附件没有可下载的内容地址');
      const maxBytes = attachmentMaxBytes();
      if (att.size && att.size > maxBytes) {
        throw new Error('附件超过大小上限（' + Math.round(maxBytes / 1048576) + ' MB）：' + att.filename);
      }
      fs.mkdirSync(dir, { recursive: true });
      const filename = sanitizeFilename(att.filename);
      const dest = uniquePath(dir, filename);
      // 最终路径必须仍在目标目录内
      if (path.resolve(dest).indexOf(path.resolve(dir) + path.sep) !== 0) {
        throw new Error('附件保存路径越界');
      }
      const result = await downloadToFile(baseUrl, cred, att.url, dest, maxBytes);
      return {
        attachmentId: att.id,
        filename: att.filename,
        path: dest,
        bytes: result.bytes || att.size || 0,
        contentType: result.contentType || att.contentType || ''
      };
    }

    /** 按 attachmentId 下载单个附件。 */
    async function saveAttachment(baseUrl, cred, issueKey, attachmentId) {
      const detail = await fetchIssueDetail(baseUrl, cred, issueKey);
      const wanted = String(attachmentId == null ? '' : attachmentId).trim();
      const att = detail.attachments.find((a) => String(a.id) === wanted);
      if (!att) throw new Error('工单里找不到附件 ' + wanted);
      const dir = attachmentDirFor(detail.key);
      const saved = await saveAttachmentFrom(baseUrl, cred, detail, att, dir);
      return {
        ok: true,
        issueKey: detail.key,
        attachmentId: saved.attachmentId,
        filename: saved.filename,
        path: saved.path,
        bytes: saved.bytes,
        contentType: saved.contentType
      };
    }

    async function handleIssue(args) {
      try {
        const { baseUrl, token, username, password } = await resolveConnection();
        if (!baseUrl) return { ok: false, error: '未配置 JIRA 地址（设置 → JIRA 配置，或环境变量 JIRA_BASE_URL）' };
        if (!token && !(username && password)) return { ok: false, error: missingCredentialError() };
        return await fetchIssueDetail(baseUrl, { token, username, password }, args && args.issueKey);
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) };
      }
    }

    async function handleAttachment(args) {
      try {
        const { baseUrl, token, username, password } = await resolveConnection();
        if (!baseUrl) return { ok: false, error: '未配置 JIRA 地址（设置 → JIRA 配置，或环境变量 JIRA_BASE_URL）' };
        if (!token && !(username && password)) return { ok: false, error: missingCredentialError() };
        return await saveAttachment(baseUrl, { token, username, password }, args && args.issueKey, args && args.attachmentId);
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) };
      }
    }

    /**
     * 归一化附件请求里的 attachmentIds。
     *
     * 返回 null 表示「不限定」——请求体没带这个字段（或带的不是数组），按既有
     * 行为下载该工单的**全部**附件；返回数组表示按选择下载，空数组 = 一个都不下。
     * 数组内的 id 统一按字符串比较并去重（保持首次出现的顺序），避免同一个附件
     * 被重复下载成 server.log / server.log-1 两份。
     */
    function normalizeAttachmentIds(raw) {
      if (!Array.isArray(raw)) return null;
      const seen = new Set();
      const ids = [];
      for (const item of raw) {
        if (item === null || item === undefined) continue;
        const id = String(item).trim();
        if (!id) continue;
        if (seen.has(id)) continue;
        seen.add(id);
        ids.push(id);
      }
      return ids;
    }

    async function handleAttachments(args) {
      try {
        const { baseUrl, token, username, password } = await resolveConnection();
        if (!baseUrl) return { ok: false, error: '未配置 JIRA 地址（设置 → JIRA 配置，或环境变量 JIRA_BASE_URL）' };
        if (!token && !(username && password)) return { ok: false, error: missingCredentialError() };
        const cred = { token, username, password };
        const detail = await fetchIssueDetail(baseUrl, cred, args && args.issueKey);
        const dir = attachmentDirFor(detail.key);
        const saved = [];
        const failed = [];

        // 可选的 attachmentIds：只有请求体里出现数组才表示「按选择下载」。
        // 没传（selected === null）时下载全部附件，既有行为逐字不变。
        const selected = normalizeAttachmentIds(args && args.attachmentIds);
        if (selected === null) {
          for (const att of detail.attachments) {
            try {
              saved.push(await saveAttachmentFrom(baseUrl, cred, detail, att, dir));
            } catch (e) {
              failed.push({
                attachmentId: att.id,
                filename: att.filename,
                reason: String((e && e.message) || e)
              });
            }
          }
        } else {
          for (const id of selected) {
            const att = detail.attachments.find((a) => String(a.id) === id);
            if (!att) {
              // 指定的 id 不存在或不属于该工单：单独记进 failed，不中断整批下载。
              failed.push({ attachmentId: id, filename: '', reason: '工单里找不到附件 ' + id });
              continue;
            }
            try {
              saved.push(await saveAttachmentFrom(baseUrl, cred, detail, att, dir));
            } catch (e) {
              failed.push({
                attachmentId: att.id,
                filename: att.filename,
                reason: String((e && e.message) || e)
              });
            }
          }
        }
        return { ok: true, issueKey: detail.key, dir, saved, failed };
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) };
      }
    }

    /** 把值安全地放进 JQL 双引号里（转义反斜杠与引号）。 */
    function escapeJqlValue(value) {
      return String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    function buildJql(template, projectKey) {
      const t = (template || '').trim();
      if (!t) return 'project = "' + projectKey + '" AND status in ("开启", "重新开启") AND assignee = currentUser() ORDER BY updated DESC';
      return t.replace(/\{projectKey\}/g, projectKey).replace(/\{key\}/g, projectKey);
    }

    /**
     * 检索 JIRA 任务。maxResults 由调用方归一化后传入；缺省（undefined）时用
     * SEARCH_MAX_RESULTS_DEFAULT，与改动前硬编码的 50 完全一致。
     */
    async function queryJira(baseUrl, cred, jql, maxResults) {
      const auth = buildAuthHeader(cred.token, cred);
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const limit = (maxResults === undefined || maxResults === null)
        ? SEARCH_MAX_RESULTS_DEFAULT
        : maxResults;
      let curl;
      try {
        curl = await subprocess.resolveExecutable('curl');
      } catch (e) {
        curl = '/usr/bin/curl';
      }
      const handle = subprocess.spawn({
        argv: [
          curl, '-sS', '--fail-with-body', '--max-time', '20', '-G',
          cleanBase + '/rest/api/2/search',
          '--data-urlencode', 'jql=' + jql,
          '--data-urlencode', 'maxResults=' + limit,
          '--data-urlencode', 'fields=summary,status,priority,issuetype,statuscategorykey',
          '-H', 'Accept: application/json',
          '--config', '-'
        ],
        cwd: workspaceRoot,
        stdio: {
          stdin: { data: 'header = "Authorization: ' + auth + '"\n' },
          stdout: { maxBytes: 4 * 1024 * 1024, spill: { maxBytes: 64 * 1024 * 1024 } },
          stderr: { maxBytes: 1024 * 1024, spill: { maxBytes: 16 * 1024 * 1024 } }
        },
        graceMs: 5000
      });
      const outcome = await handle.done;
      const stdout = (handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : '') || '';
      const stderr = (handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '') || '';
      return { exitCode: outcome.exitCode, stdout, stderr };
    }

    /**
     * 通用 JSON GET：路径和查询参数由调用方给出，供项目版本列表和统计页的分页
     * 检索复用。认证头同样经 stdin（curl --config -）传入，不出现在命令行。
     * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
     */
    async function curlJson(baseUrl, cred, path, query, options) {
      const auth = buildAuthHeader(cred.token, cred);
      const cleanBase = baseUrl.replace(/\/+$/, '');
      const timeout = (options && options.timeout) || 30;
      let curl;
      try {
        curl = await subprocess.resolveExecutable('curl');
      } catch (e) {
        curl = '/usr/bin/curl';
      }
      const argv = [curl, '-sS', '--fail-with-body', '--max-time', String(timeout)];
      if (query) argv.push('-G');
      argv.push(cleanBase + path);
      if (query) {
        for (const key of Object.keys(query)) argv.push('--data-urlencode', key + '=' + String(query[key]));
      }
      argv.push('-H', 'Accept: application/json', '--config', '-');
      const handle = subprocess.spawn({
        argv,
        cwd: workspaceRoot,
        stdio: {
          stdin: { data: 'header = "Authorization: ' + auth + '"\n' },
          stdout: { maxBytes: 8 * 1024 * 1024, spill: { maxBytes: 64 * 1024 * 1024 } },
          stderr: { maxBytes: 1024 * 1024, spill: { maxBytes: 16 * 1024 * 1024 } }
        },
        graceMs: 5000
      });
      const outcome = await handle.done;
      const stdout = (handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : '') || '';
      const stderr = (handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '') || '';
      return { exitCode: outcome.exitCode, stdout, stderr };
    }

    /** 解析连接配置：设置页保存的地址/账号优先，其次凭据存储 / 环境变量。 */
    async function resolveConnection() {
      const baseUrl = settingsBaseUrl() || await resolveFirst(['JIRA_BASE_URL', 'JIRA_URL']);
      const token = await resolveFirst(TOKEN_REFS);
      const username = settingsUsername() || await resolveFirst(USERNAME_REFS);
      const password = await resolveFirst(PASSWORD_REFS);
      return { baseUrl, token, username: username || '', password: password || '' };
    }

    function emptyVersionBucket() {
      return { total: 0, done: 0, inProgress: 0, todo: 0 };
    }

    /**
     * 「版本统计」行的分组顺序：未发布(0) → 已发布(1) → 已归档(2) → 只在任务里出现的版本(3)。
     * 客户端表格默认把已归档组折叠，所以实际展示是 未发布 → 已发布 → 仅任务 →（展开后）归档。
     * 同一组内按发布日期（新的在前，无日期在后），extra 组再按任务数倒序。
     */
    function compareVersionRows(a, b) {
      const groupOf = (row) => (row.extra ? 3 : (row.archived ? 2 : (row.released ? 1 : 0)));
      const groupA = groupOf(a);
      const groupB = groupOf(b);
      if (groupA !== groupB) return groupA - groupB;
      if (a.releaseDate !== b.releaseDate) {
        if (!a.releaseDate) return 1;
        if (!b.releaseDate) return -1;
        return a.releaseDate < b.releaseDate ? 1 : -1;
      }
      if (groupA === 3 && a.total !== b.total) return b.total - a.total;
      return a.name.localeCompare(b.name);
    }

    // 从 JIRA 错误响应体/curl stderr 中提取可读信息。
    function errorTextFrom(body, stderr, fallback) {
      let message = (stderr || '').trim() || fallback;
      try {
        const parsed = JSON.parse(body);
        if (parsed.errorMessages && parsed.errorMessages.length) message = parsed.errorMessages.join('；');
        else if (parsed.message) message = parsed.message;
      } catch (e) { /* body 非 JSON */ }
      return message;
    }

    // 连通性/鉴权探测：GET /rest/api/2/myself，stdout 末尾追加 HTTP 状态码。
    async function probeJira(baseUrl, cred) {
      const auth = buildAuthHeader(cred.token, cred);
      const cleanBase = baseUrl.replace(/\/+$/, '');
      let curl;
      try {
        curl = await subprocess.resolveExecutable('curl');
      } catch (e) {
        curl = '/usr/bin/curl';
      }
      const handle = subprocess.spawn({
        argv: [
          curl, '-sS', '--max-time', '15',
          '-H', 'Accept: application/json',
          '--config', '-',
          '-w', '\n%{http_code}',
          cleanBase + '/rest/api/2/myself'
        ],
        cwd: workspaceRoot,
        stdio: {
          stdin: { data: 'header = "Authorization: ' + auth + '"\n' },
          stdout: { maxBytes: 1024 * 1024, spill: { maxBytes: 4 * 1024 * 1024 } },
          stderr: { maxBytes: 256 * 1024, spill: { maxBytes: 1024 * 1024 } }
        },
        graceMs: 5000
      });
      const outcome = await handle.done;
      const stdout = (handle.collected.stdout ? handle.collected.stdout.readFrom(0).text : '') || '';
      const stderr = (handle.collected.stderr ? handle.collected.stderr.readFrom(0).text : '') || '';
      return { exitCode: outcome.exitCode, stdout, stderr };
    }

    /**
     * 归一化搜索请求里的 maxResults：缺省 50、上限 200。
     *
     * 这是一个**可选**字段，所以非法值不能把整条路由弄挂：
     *   - 非数字 / 非整数 / 负数 / 0 → 回落到缺省值 50；
     *   - 超过上限 → 取上限 200（不是回落）。
     * 缺省时发出的请求与改动前逐字节一致（maxResults=50）。
     */
    function normalizeMaxResults(raw) {
      if (raw === undefined || raw === null || raw === '') return SEARCH_MAX_RESULTS_DEFAULT;
      if (typeof raw !== 'number' && typeof raw !== 'string') return SEARCH_MAX_RESULTS_DEFAULT;
      const n = Number(raw);
      if (!Number.isFinite(n)) return SEARCH_MAX_RESULTS_DEFAULT;
      if (!Number.isInteger(n)) return SEARCH_MAX_RESULTS_DEFAULT;
      if (n <= 0) return SEARCH_MAX_RESULTS_DEFAULT;
      return Math.min(n, SEARCH_MAX_RESULTS_LIMIT);
    }

    async function handleSearch(args) {
      const projectKey = String((args && args.projectKey) || '').trim();
      if (!projectKey) return { ok: false, error: '未设置项目 Key' };
      try {
        const baseUrl = settingsBaseUrl() || await resolveFirst(['JIRA_BASE_URL', 'JIRA_URL']);
        if (!baseUrl) return { ok: false, error: '未配置 JIRA 地址（设置 → JIRA 配置，或环境变量 JIRA_BASE_URL）' };
        const token = await resolveFirst(TOKEN_REFS);
        const username = settingsUsername() || await resolveFirst(USERNAME_REFS);
        const password = await resolveFirst(PASSWORD_REFS);
        const cred = { token, username: username || '', password: password || '' };
        if (!cred.token && !(cred.username && cred.password)) return { ok: false, error: missingCredentialError() };

        const jql = buildJql(args && args.jql ? String(args.jql) : '', projectKey);
        // maxResults 可选：不传时按缺省 50 发请求，既有行为不变。
        const maxResults = normalizeMaxResults(args && args.maxResults);
        const raw = await queryJira(baseUrl, cred, jql, maxResults);
        const stdout = raw.stdout;
        const stderr = raw.stderr;

        if (raw.exitCode !== 0) {
          return { ok: false, error: errorTextFrom(stdout, stderr, 'curl 退出码 ' + String(raw.exitCode)) };
        }

        let data;
        try {
          data = JSON.parse(stdout);
        } catch (e) {
          return { ok: false, error: '无法解析 JIRA 响应：' + (stderr.trim() || '空响应') };
        }

        const issues = (data.issues || []).map((issue) => ({
          key: issue.key || '',
          summary: (issue.fields && issue.fields.summary) || '',
          status: (issue.fields && issue.fields.status && issue.fields.status.name) || '',
          statusCategory: (issue.fields && issue.fields.statuscategorykey) || '',
          priority: (issue.fields && issue.fields.priority && issue.fields.priority.name) || '',
          issueType: (issue.fields && issue.fields.issuetype && issue.fields.issuetype.name) || ''
        }));

        return {
          ok: true,
          baseUrl: baseUrl.replace(/\/+$/, ''),
          projectKey,
          total: typeof data.total === 'number' ? data.total : issues.length,
          issues
        };
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) };
      }
    }

    // 设置卡片“测试连接”：用草稿值（未保存也可测）或已保存/环境配置探测 JIRA。
    async function handleTest(args) {
      try {
        const draftBase = args && typeof args.baseUrl === 'string' ? args.baseUrl.trim() : '';
        const draftToken = args && typeof args.token === 'string' ? args.token.trim() : '';
        // 账号与密码允许以草稿形式（未保存）参与本次探测。密码**不 trim**：
        // 首尾空格是密码的一部分，trim 掉会让人以为密码填错了。
        const draftUsername = args && typeof args.username === 'string' ? args.username.trim() : '';
        const draftPassword = args && typeof args.password === 'string' ? args.password : '';
        const baseUrl = draftBase || settingsBaseUrl() || await resolveFirst(['JIRA_BASE_URL', 'JIRA_URL']);
        if (!baseUrl) return { ok: false, code: 'unconfigured', error: '未配置 JIRA 地址' };
        const token = draftToken || await resolveFirst(TOKEN_REFS);
        const username = draftUsername || settingsUsername() || await resolveFirst(USERNAME_REFS);
        const password = draftPassword || await resolveFirst(PASSWORD_REFS);
        const cred = { token, username: username || '', password: password || '' };
        // 实际生效的认证方式：前端用它显示“当前用的是 Basic 还是 Bearer”。
        const mode = authModeOf(cred.token, cred);
        if (!cred.token && !(cred.username && cred.password)) {
          return { ok: false, code: 'unconfigured', error: '未配置 JIRA 凭据（账号密码或访问令牌）', authMode: mode };
        }

        const raw = await probeJira(baseUrl, cred);
        if (raw.exitCode !== 0) {
          return { ok: false, code: 'network', error: (raw.stderr || '').trim() || ('curl 退出码 ' + String(raw.exitCode)), authMode: mode };
        }
        const nl = raw.stdout.lastIndexOf('\n');
        const body = nl === -1 ? raw.stdout : raw.stdout.slice(0, nl);
        const httpCode = Number((nl === -1 ? '' : raw.stdout.slice(nl + 1)).trim()) || 0;

        if (httpCode >= 200 && httpCode < 300) {
          let data = {};
          try { data = JSON.parse(body); } catch (e) { /* 空/非 JSON 也视为连通 */ }
          return {
            ok: true,
            baseUrl: baseUrl.replace(/\/+$/, ''),
            user: data.displayName || data.name || data.key || '',
            authMode: mode
          };
        }
        // 401/403 时补一句“怎么改”的提示：Cloud 与 Server/DC 的正确处置不同。
        const hint = authErrorHint(baseUrl, mode);
        const message = errorTextFrom(body, raw.stderr, 'HTTP ' + String(httpCode));
        return {
          ok: false,
          code: httpCode === 401 || httpCode === 403 ? 'auth' : 'http',
          error: hint ? message + ' ' + hint : message,
          authMode: mode
        };
      } catch (err) {
        return { ok: false, code: 'error', error: String((err && err.message) || err) };
      }
    }

    /**
     * 统计页数据（项目 Key 由客户端输入/下拉提供）：按 STATS_PAGE_SIZE 分页扫描
     * 项目任务（最多 STATS_MAX_ISSUES 条），在 Host 侧聚合概览计数与版本统计，
     * 并合并 GET /rest/api/2/project/{key}/versions 的发布状态、发布日期。
     * 客户端只渲染，不重复计算。
     */
    async function handleStats(args) {
      const projectKey = String((args && args.projectKey) || '').trim();
      if (!projectKey) return { ok: false, error: '未设置项目编号' };
      try {
        const { baseUrl, token, username, password } = await resolveConnection();
        if (!baseUrl) return { ok: false, error: '未配置 JIRA 地址（设置 → JIRA 配置，或环境变量 JIRA_BASE_URL）' };
        if (!token && !(username && password)) return { ok: false, error: missingCredentialError() };
        const cred = { token, username, password };

        // ORDER BY created 让分页在扫描期间保持稳定顺序（不加排序时，扫描途中的
        // 新增/改动可能造成索引漂移，出现少量重复或漏计）。
        const jql = 'project = "' + escapeJqlValue(projectKey) + '" ORDER BY created ASC';
        const versionMap = new Map();
        const summary = { total: 0, done: 0, inProgress: 0, todo: 0 };
        let noVersionCount = 0;

        /** 取一页任务（只带聚合需要的字段）；失败时返回 { error }。 */
        async function fetchPage(pageStartAt) {
          const raw = await curlJson(baseUrl, cred, '/rest/api/2/search', {
            jql,
            fields: STATS_FIELDS,
            startAt: pageStartAt,
            maxResults: STATS_PAGE_SIZE
          });
          if (raw.exitCode !== 0) {
            return { error: errorTextFrom(raw.stdout, raw.stderr, 'curl 退出码 ' + String(raw.exitCode)) };
          }
          let data;
          try {
            data = JSON.parse(raw.stdout);
          } catch (e) {
            return { error: '无法解析 JIRA 响应：' + (raw.stderr.trim() || '空响应') };
          }
          return {
            total: typeof data.total === 'number' ? data.total : 0,
            issues: Array.isArray(data.issues) ? data.issues : []
          };
        }

        /** 把一页任务并入概览计数与版本聚合。 */
        function absorb(page) {
          for (const issue of page) {
            const fields = (issue && issue.fields) || {};
            const status = fields.status || {};
            const category = (status.statusCategory && status.statusCategory.key) || '';
            const bucket = category === 'done' ? 'done' : (category === 'indeterminate' ? 'inProgress' : 'todo');
            summary.total += 1;
            summary[bucket] += 1;

            const fixVersions = Array.isArray(fields.fixVersions) ? fields.fixVersions : [];
            if (fixVersions.length === 0) {
              noVersionCount += 1;
            } else {
              for (const version of fixVersions) {
                const versionName = String((version && version.name) || '').trim();
                if (!versionName) continue;
                const entry = versionMap.get(versionName) || emptyVersionBucket();
                entry.total += 1;
                entry[bucket] += 1;
                versionMap.set(versionName, entry);
              }
            }
          }
        }

        // 逐页扫描：JIRA 会对同一用户的 search 请求串行处理，并发分页并不会更快
        // （实测 4 路并发反而更慢），因此保持顺序分页，按响应实际条数推进。
        // 超过 STATS_MAX_ISSUES 时截断并标记 truncated，客户端会提示“仅统计前 N 条”。
        const startedAt = Date.now();
        let fetched = 0;
        let startAt = 0;
        let total = 0;
        let page = [];
        while (true) {
          if (fetched > 0 && Date.now() - startedAt > STATS_DEADLINE_MS) break;
          const result = await fetchPage(startAt);
          if (result.error) return { ok: false, error: result.error };
          total = result.total;
          page = result.issues;
          absorb(page);
          fetched += page.length;
          startAt += page.length;
          if (page.length === 0 || fetched >= total || fetched >= STATS_MAX_ISSUES) break;
        }
        const truncated = fetched < total;

        // 项目版本接口提供发布状态/发布日期；接口不可用时退化为「任务里出现的版本」。
        let apiVersions = [];
        try {
          const versionsRaw = await curlJson(baseUrl, cred, '/rest/api/2/project/' + encodeURIComponent(projectKey) + '/versions', null, { timeout: 20 });
          if (versionsRaw.exitCode === 0) {
            const parsed = JSON.parse(versionsRaw.stdout);
            if (Array.isArray(parsed)) apiVersions = parsed;
          }
        } catch (e) { /* 版本接口失败不影响任务统计 */ }

        const versionRows = [];
        const seenVersions = new Set();
        for (const version of apiVersions) {
          const versionName = String((version && version.name) || '').trim();
          if (!versionName || seenVersions.has(versionName)) continue;
          seenVersions.add(versionName);
          const bucket = versionMap.get(versionName) || emptyVersionBucket();
          versionRows.push({
            name: versionName,
            id: version && version.id ? String(version.id) : '',
            released: !!(version && version.released),
            archived: !!(version && version.archived),
            releaseDate: version && typeof version.releaseDate === 'string' ? version.releaseDate : '',
            total: bucket.total,
            done: bucket.done,
            inProgress: bucket.inProgress,
            todo: bucket.todo,
            extra: false
          });
        }
        for (const [versionName, bucket] of versionMap) {
          if (seenVersions.has(versionName)) continue;
          versionRows.push({
            name: versionName,
            id: '',
            released: false,
            archived: false,
            releaseDate: '',
            total: bucket.total,
            done: bucket.done,
            inProgress: bucket.inProgress,
            todo: bucket.todo,
            extra: true
          });
        }
        versionRows.sort(compareVersionRows);

        return {
          ok: true,
          baseUrl: baseUrl.replace(/\/+$/, ''),
          projectKey,
          fetchedAt: new Date().toISOString(),
          total,
          fetched,
          truncated,
          summary,
          versions: versionRows,
          noVersionCount,
          versionTotal: versionRows.length
        };
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) };
      }
    }

    /** 版本任务列表的一行：只返回列表展示与排序需要的字段。 */
    function mapVersionIssue(issue) {
      const fields = (issue && issue.fields) || {};
      const status = fields.status || {};
      const assignee = fields.assignee || null;
      return {
        key: (issue && issue.key) || '',
        summary: fields.summary || '',
        status: status.name || '',
        statusCategory: (status.statusCategory && status.statusCategory.key) || '',
        priority: (fields.priority && fields.priority.name) || '',
        issueType: (fields.issuetype && fields.issuetype.name) || '',
        assignee: assignee ? String(assignee.displayName || assignee.name || '') : '',
        assigneeKey: assignee ? String(assignee.name || assignee.key || assignee.accountId || '') : '',
        updated: typeof fields.updated === 'string' ? fields.updated : ''
      };
    }

    /**
     * 版本任务列表：`project = KEY AND fixVersion = NAME`，返回任务行与「当前用户」
     * （客户端用它把本人的任务默认排在最前面）。最多扫描 VERSION_ISSUE_MAX 条。
     */
    async function handleVersionIssues(args) {
      const projectKey = String((args && args.projectKey) || '').trim();
      const versionName = String((args && args.versionName) || '').trim();
      if (!projectKey) return { ok: false, error: '未设置项目编号' };
      if (!versionName) return { ok: false, error: '未指定版本' };
      try {
        const { baseUrl, token, username, password } = await resolveConnection();
        if (!baseUrl) return { ok: false, error: '未配置 JIRA 地址（设置 → JIRA 配置，或环境变量 JIRA_BASE_URL）' };
        if (!token && !(username && password)) return { ok: false, error: missingCredentialError() };
        const cred = { token, username, password };

        const jql = 'project = "' + escapeJqlValue(projectKey) + '" AND fixVersion = "' + escapeJqlValue(versionName) + '" ORDER BY updated DESC';

        /** 取一页版本任务；失败时返回 { error }。 */
        async function fetchPage(startAt) {
          const raw = await curlJson(baseUrl, cred, '/rest/api/2/search', {
            jql,
            fields: VERSION_ISSUE_FIELDS,
            startAt,
            maxResults: VERSION_ISSUE_PAGE_SIZE
          });
          if (raw.exitCode !== 0) {
            return { error: errorTextFrom(raw.stdout, raw.stderr, 'curl 退出码 ' + String(raw.exitCode)) };
          }
          let data;
          try {
            data = JSON.parse(raw.stdout);
          } catch (e) {
            return { error: '无法解析 JIRA 响应：' + (raw.stderr.trim() || '空响应') };
          }
          return {
            total: typeof data.total === 'number' ? data.total : 0,
            issues: Array.isArray(data.issues) ? data.issues : []
          };
        }

        // 首页与 /myself 并行：myself 只用于让客户端把「本人」排前面，失败不阻断列表。
        const [firstPage, myselfRaw] = await Promise.all([
          fetchPage(0),
          curlJson(baseUrl, cred, '/rest/api/2/myself', null, { timeout: 15 })
        ]);
        if (firstPage.error) return { ok: false, error: firstPage.error };

        let me = { name: '', displayName: '' };
        if (myselfRaw.exitCode === 0) {
          try {
            const data = JSON.parse(myselfRaw.stdout);
            me = { name: String(data.name || ''), displayName: String(data.displayName || '') };
          } catch (e) { /* 忽略：没有本人信息时客户端按更新时间排序 */ }
        }

        const limit = Math.min(firstPage.total, VERSION_ISSUE_MAX);
        const collected = firstPage.issues.slice(0, VERSION_ISSUE_MAX);
        let startAt = firstPage.issues.length;
        let page = firstPage.issues;
        const startedAt = Date.now();
        while (collected.length < limit && page.length > 0) {
          if (Date.now() - startedAt > VERSION_ISSUE_DEADLINE_MS) break;
          const next = await fetchPage(startAt);
          if (next.error) return { ok: false, error: next.error };
          if (next.issues.length === 0) break;
          collected.push.apply(collected, next.issues);
          startAt += next.issues.length;
          page = next.issues;
        }
        const issues = collected.slice(0, VERSION_ISSUE_MAX);

        return {
          ok: true,
          baseUrl: baseUrl.replace(/\/+$/, ''),
          projectKey,
          versionName,
          total: firstPage.total,
          fetched: issues.length,
          truncated: issues.length < firstPage.total,
          me,
          issues: issues.map(mapVersionIssue)
        };
      } catch (err) {
        return { ok: false, error: String((err && err.message) || err) };
      }
    }

    if (webServer && typeof webServer.register === 'function') {
      // 每条路由都必须挂在自己的 effect 上：register 返回注销函数，卸载/重载时先释放，
      // 否则重挂载会因为“同一 (kind, path) 只允许一条路由”直接抛错，整个插件激活失败。
      ctx.effect(() => webServer.register({
        kind: 'exact',
        path: '/jira/api/search',
        handler: async (req, res) => {
          if (!methodIsPost(req, res)) return;
          try {
            sendJson(res, await handleSearch(await readBody(req)));
          } catch (e) {
            sendJson(res, { ok: false, error: String((e && e.message) || e) });
          }
        }
      }), 'jira-tasks: /jira/api/search');
      ctx.effect(() => webServer.register({
        kind: 'exact',
        path: '/jira/api/test',
        handler: async (req, res) => {
          if (!methodIsPost(req, res)) return;
          try {
            sendJson(res, await handleTest(await readBody(req)));
          } catch (e) {
            sendJson(res, { ok: false, code: 'error', error: String((e && e.message) || e) });
          }
        }
      }), 'jira-tasks: /jira/api/test');
      // 任务统计页（左侧栏入口）：返回聚合结果与版本统计列表。
      ctx.effect(() => webServer.register({
        kind: 'exact',
        path: '/jira/api/stats',
        handler: async (req, res) => {
          if (!methodIsPost(req, res)) return;
          try {
            sendJson(res, await handleStats(await readBody(req)));
          } catch (e) {
            sendJson(res, { ok: false, error: String((e && e.message) || e) });
          }
        }
      }), 'jira-tasks: /jira/api/stats');
      // 版本任务列表（点版本名后加载）：project + fixVersion 的任务行，含本人信息。
      ctx.effect(() => webServer.register({
        kind: 'exact',
        path: '/jira/api/version-issues',
        handler: async (req, res) => {
          if (!methodIsPost(req, res)) return;
          try {
            sendJson(res, await handleVersionIssues(await readBody(req)));
          } catch (e) {
            sendJson(res, { ok: false, error: String((e && e.message) || e) });
          }
        }
      }), 'jira-tasks: /jira/api/version-issues');

      // 工单完整详情：全部字段 + 评论 + 附件清单 + 变更历史。
      ctx.effect(() => webServer.register({
        kind: 'exact',
        path: '/jira/api/issue',
        handler: async (req, res) => {
          if (!methodIsPost(req, res)) return;
          try {
            sendJson(res, await handleIssue(await readBody(req)));
          } catch (e) {
            sendJson(res, { ok: false, error: String((e && e.message) || e) });
          }
        }
      }), 'jira-tasks: /jira/api/issue');
      // 下载单个附件到工作区（前端只传 attachmentId，URL 由 Host 从 JIRA 响应里取）。
      ctx.effect(() => webServer.register({
        kind: 'exact',
        path: '/jira/api/attachment',
        handler: async (req, res) => {
          if (!methodIsPost(req, res)) return;
          try {
            sendJson(res, await handleAttachment(await readBody(req)));
          } catch (e) {
            sendJson(res, { ok: false, error: String((e && e.message) || e) });
          }
        }
      }), 'jira-tasks: /jira/api/attachment');
      // 批量下载该工单的全部附件。
      ctx.effect(() => webServer.register({
        kind: 'exact',
        path: '/jira/api/attachments',
        handler: async (req, res) => {
          if (!methodIsPost(req, res)) return;
          try {
            sendJson(res, await handleAttachments(await readBody(req)));
          } catch (e) {
            sendJson(res, { ok: false, error: String((e && e.message) || e) });
          }
        }
      }), 'jira-tasks: /jira/api/attachments');
    }
}

export { Config, apply, inject, name };
