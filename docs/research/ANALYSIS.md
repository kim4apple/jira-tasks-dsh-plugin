# dsh-jira-tasks v1.4.0 — 认证面完整分析

> 分析对象：`dsh-jira-tasks` v1.4.0（npm / GitHub `liu3734/jira-tasks-dsh-plugin`）
> 源码位置：`research/jira-src/repo`（git clone，`origin/main` @ `db3a1af`，tag `v1.4.0` @ `3b6a7d8`）
> 分析日期：2026-11-08
> 结论一句话：**插件已经存在一条可用的 Basic auth 代码路径**（令牌串里含 `:` 即走 Basic），但**没有任何专门的「用户名 + 密码」字段**，唯一输入框仍叫「访问令牌 / PAT」。

---

## 0. 分析来源与可信度

| 项 | 结论 |
|---|---|
| 仓库 clone | ✅ 成功（`git clone https://github.com/liu3734/jira-tasks-dsh-plugin.git`），网络可用 |
| 安装包一致性 | ✅ `~/.dsh/profiles/desktop/node_modules/dsh-jira-tasks/lib/{index,client}.js` 与仓库 `lib/{index,client}.js` **逐字节相同**（`diff -q` 无输出） |
| 仓库文件 | `lib/index.js`（732 行，Host 侧）、`lib/client.js`（1665 行，Web 客户端侧）、`plugin/host.js`（151 行，动态插件 Host）、`plugin/client.js`（301 行，动态插件客户端）、`manifest.json`、`cordis.patch.yml`、`package.json`、双语 README |
| 本机安装状态 | `dsh-jira-tasks@1.4.0` 已登记在 `~/.dsh/profiles/desktop/package.json` 的 `dsh.profile.bundles` 中；`~/.dsh/.credentials.yaml` 的 `refs:` 段**当前没有任何 `JIRA_*` 引用**（只有 `CC_SWITCH_DSH_CC_SWITCH_MINI_MAX`），即本机已装未配 |
| DSH 契约来源 | 通过 `cordis_inspect_query(platform=host, provider=Service, service="credentials")` 读取**运行中 Host 的真实 `credentials` 服务契约**（非推测） |

---

## (a) 功能清单

### A1. 四种代码形态（同一仓库两套实现，必须成对修改）

| 形态 | 文件 | 说明 |
|---|---|---|
| **profile bundle / Host** | `lib/index.js` | 正式安装形态，注册 4 条 HTTP 路由 |
| **profile bundle / Client** | `lib/client.js` | 正式安装形态，`window.__ModuleLoader__.load(...)` 包装的 Web 客户端 |
| **动态插件 / Host** | `plugin/host.js` | `cordis_define` 的 `code.host` 函数体，只实现 `jira/list` 一个 handler |
| **动态插件 / Client** | `plugin/client.js` | `cordis_define` 的 `code.client` 函数体，只实现输入框下方面板 |

> `plugin/host.js:3-5` 与 `plugin/client.js:3-5` 各自注明：统计页路由只在 `lib/` 正式 bundle 里实现。

### A2. Host 侧 HTTP 路由（`lib/index.js:676-729`）

| 路由 | 处理函数 | 行 | 用途 |
|---|---|---|---|
| `POST /jira/api/search` | `handleSearch` | `lib/index.js:333-377`（注册于 679-690） | 会话面板：当前用户「开启/重新开启」任务 |
| `POST /jira/api/test` | `handleTest` | `lib/index.js:380-414`（注册于 691-702） | 设置卡片「测试连接」探测 |
| `POST /jira/api/stats` | `handleStats` | `lib/index.js:422-570`（注册于 704-715） | 统计页聚合（概览 + 版本统计） |
| `POST /jira/api/version-issues` | `handleVersionIssues` | `lib/index.js:594-674`（注册于 717-728） | 版本任务列表（含当前用户） |

非 POST 一律 405（`methodIsPost`，`lib/index.js:97-102`）。

### A3. 调用的 JIRA REST API 端点

| JIRA 端点 | 出现位置 | 字段 / 参数 |
|---|---|---|
| `GET /rest/api/2/search` | `lib/index.js:201`（`queryJira`）、`lib/index.js:239`+`439`（`curlJson`/`handleStats`）、`lib/index.js:608`（`handleVersionIssues`） | `jql`, `maxResults=50`, `fields=summary,status,priority,issuetype,statuscategorykey`（`lib/index.js:204`）；统计用 `fields=status,fixVersions`（`lib/index.js:55`）；版本任务用 `fields=summary,status,priority,issuetype,assignee,updated`（`lib/index.js:58`） |
| `GET /rest/api/2/project/{key}/versions` | `lib/index.js:510` | 版本发布状态 / 发布日期 / archived |
| `GET /rest/api/2/myself` | `lib/index.js:317`（`probeJira`）、`lib/index.js:632`（`handleVersionIssues`） | **当前用户解析**：测试连接返回 `displayName/name/key`（`lib/index.js:403`）；版本列表返回 `me = { name, displayName }`（`lib/index.js:636-641`） |

### A4. Client 侧功能面（`lib/client.js`）

| 功能 | 位置 | 说明 |
|---|---|---|
| **会话任务面板** | `JiraTasksDock` `lib/client.js:1132-1289`；注册于 `1607-1609`（槽位 `conversation.input.dock`，`order:10`） | 默认折叠（`collapsed` 初值 `true`，`lib/client.js:126`）；标题 + 任务数徽章 + ⟳ 刷新 + ⚙ 编辑 |
| 面板编辑表单（项目 Key / JQL） | `lib/client.js`（`openEditor`/`saveEditor`） | 项目 Key 变更时若 JQL 仍是旧默认模板则联动更新 |
| **按工作区持久化** | `STORAGE_KEY = "dsh.jiraTasks.config.v1"`（`lib/client.js:160`）；`loadConfigFor` `182-193`；`saveConfigFor` `194-199`；工作区 key = 会话→工作区→`path \|\| workspaceId` | localStorage `{ [workspaceKey]: { projectKey, jql } }`；旧版全局格式自动迁移（`isLegacy` `179-181`） |
| **左侧栏「JIRA 统计」入口** | `JiraStatsIcon` `lib/client.js:475-487`；注册 `sidebar.panellist` `1615-1624` | SVG 柱状图图标，`id = STATS_PANEL_ID = "jira-stats"`（`lib/client.js:155`），`order:30` |
| **统计主面板** | `JiraStatsPanel` `lib/client.js:491-1130`；注册 `main` 槽位 `1625-1629` | root 级整页，与会话无关 |
| 项目下拉（已配置 Key 列表） | `configuredProjectOptions` `lib/client.js:292-315` | 选项 = 本浏览器已配置的 Key + 最近查看的 Key，**不是** JIRA 全量项目列表 |
| 概览卡片 | `lib/client.js:954-971` | 任务总数 / 已完成 / 进行中 / 待办 / 完成率；截断时提示「仅统计前 N 条」 |
| **版本统计表** | `renderVersions` `lib/client.js:729-789`；`versionRow` `706-727` | 按发布日期倒序，**每页 10 个**（`VERSION_PAGE_SIZE = 10`，`lib/client.js:158`），底部「上一页/下一页」；列：版本 / 状态 / 发布日期 / 任务 / 待办 / 进行中 / 已完成 / 完成率 |
| **版本任务列表** | `renderVersionIssueTable` `lib/client.js:848-...`；`openVersion` `792-818` | 点版本名进入，7 列可排序（编号/摘要/状态/优先级/类型/负责人/更新），`sortIssues` `828-835` |
| 本人任务优先 | `isMyIssue` `lib/client.js:398-400`；`compareIssuesDefault` `440-448` | 比对 `assigneeKey` 与 `me.name`（`me` 来自 `/myself`） |
| 排序键细节 | `PRIORITY_RANK` `379-385`（含中英文别名）、`compareIssueKeys` `403-412`（`HCPFYH1-9` 排在 `-10` 前） | |
| 统计结果缓存 | `STATS_CACHE_LIMIT = 6`（`lib/client.js:339`）、`readStatsCache`/`writeStatsCache` `343-355` | 先渲染缓存再静默刷新，避免整页 loading 闪烁 |
| 统计页上次查看的项目 | `STATS_STORAGE_KEY = "dsh.jiraTasks.stats.v1"`（`lib/client.js:156`）、`readStatsProjectKey` `249-259` | localStorage |
| **设置卡片（JIRA 地址 + 令牌 + 连接测试）** | `createJiraSettingsSurfaces` `lib/client.js:1328-1584` | 同一表单渲染两处：`plugins.item` 卡片（`1646-1648`，`order:41`）与 `settings.section` 整页（`1651-1655`，`order:30`）；字段数组 `1506-1554` 两处共用 |
| 连接状态灯 | `lib/client.js:1500-1502`（`jt-dot` / `-ok` / `-fail` / `-testing`）、`1538-1541` | 🟢 可用（带用户名）/ 🔴 失败（带 JIRA 原因）/ ⚪ 未配置 |
| **测试连接探测** | `runProbe` `lib/client.js:1479-1491`；按钮 `1544-1550` | 可用**未保存的草稿值**探测；`POST /jira/api/test` |

### A5. 动态插件形态的功能缺口

- `plugin/host.js` 只有 `jira/list`（`plugin/host.js:130`），**没有** test/stats/version-issues。
- `plugin/client.js` **没有设置卡片**，也没有统计页；`plugin/client.js:145` 用 `host.call('jira/list', ...)` 而不是 fetch 路由。
- `plugin/host.js:133-149` 还有一个调试工具 `jira_debug`（硬编码项目 `HCPFYH1`）。

---

## (b) 认证流程逐行走查

### B1. 凭据声明处（schemastery Config schema）

```js
// lib/index.js:83-85
const Config = z.object({
  baseUrl: z.string().default('').volatile().description('JIRA 地址，例如 http://jira.example.com/')
});
```

- **只有 `baseUrl` 一个字段**。`lib/index.js:74-82` 的注释明确说明令牌**故意不在 Config 里**，因为 Config 会明文落到 profile 配置文档，而令牌必须留在凭据存储。
- `lib/index.js:87`：`const inject = ['subprocess', 'credentials', 'sandboxPolicy', 'webServer']`。
- `lib/index.js:30`：`const name = SETTINGS_NS`（`'jira-tasks'`，`lib/index.js:21`）——**没有 email / username / password / authMode 任何字段**。

### B2. 令牌引用优先级

```js
// lib/index.js:39
const TOKEN_REFS = ['JIRA_TASKS_TOKEN', 'JIRA_API_TOKEN', 'JIRA_TOKEN'];
```

客户端同款：

```js
// lib/client.js:1298-1300
var TOKEN_REF = "JIRA_TASKS_TOKEN";
var ENV_TOKEN_REFS = ["JIRA_API_TOKEN", "JIRA_TOKEN"];
var TOKEN_REFS = [TOKEN_REF].concat(ENV_TOKEN_REFS);
```

`JIRA_TASKS_TOKEN` 是插件自有引用（设置页写入），排在环境变量之前，因此**设置页保存的值可覆盖环境变量**（`lib/client.js:1294-1297`）。

### B3. 凭据解析（Host 侧）

```js
// lib/index.js:132-140
async function resolveFirst(names) {
  for (const name of names) {
    try {
      const cred = await credentials.resolve(name);
      if (cred && typeof cred.value === 'string' && cred.value.length > 0) return cred.value;
    } catch (e) { /* try next */ }
  }
  return undefined;
}
```

连接解析：

```js
// lib/index.js:261-265
async function resolveConnection() {
  const baseUrl = settingsBaseUrl() || await resolveFirst(['JIRA_BASE_URL', 'JIRA_URL']);
  const token = await resolveFirst(TOKEN_REFS);
  return { baseUrl, token };
}
```

`settingsBaseUrl()` 读 Config 的 volatile 引用（`lib/index.js:163-171`）。

### B4. ⭐ 认证头构造（**核心**）

```js
// lib/index.js:173-176
function buildAuthHeader(token) {
  if (token.indexOf(':') !== -1) return 'Basic ' + Buffer.from(token, 'utf-8').toString('base64');
  return 'Bearer ' + token;
}
```

动态插件变体（仅 base64 编码器不同）：

```js
// plugin/host.js:27-30
function buildAuthHeader(token) {
  if (token.indexOf(':') !== -1) return 'Basic ' + btoa(token);
  return 'Bearer ' + token;
}
```

**这是整个插件唯一的认证头构造点**，被 3 个 Host 函数调用：

| 调用点 | 行 | 用途 |
|---|---|---|
| `queryJira` | `lib/index.js:190`（头写 stdin 于 `210`） | `/rest/api/2/search`（会话面板） |
| `curlJson` | `lib/index.js:228`（头写 stdin 于 `248`） | `/rest/api/2/search`、`/project/{key}/versions`、`/myself` |
| `probeJira` | `lib/index.js:303`（头写 stdin 于 `321`） | `/rest/api/2/myself`（测试连接） |

### B5. 认证头如何送到 JIRA（不经过进程 argv）

三处都用同一个手法：`curl --config -` + **stdin** 传 header，避免令牌出现在命令行参数里。

```js
// lib/index.js:206, 210
'-H', 'Accept: application/json',
'--config', '-'
...
stdin: { data: 'header = "Authorization: ' + auth + '"\n' },
```

同样的三行出现在 `lib/index.js:243,248`（`curlJson`）和 `lib/index.js:315,321`（`probeJira`）。
动态变体：`plugin/host.js:58, 62`。

### B6. 当前用户如何解析

**没有任何单独的「用户名」字段**。当前用户是从 JIRA 的 `/rest/api/2/myself` 响应里取出来的：

- 测试连接：`lib/index.js:400-404` → `user: data.displayName || data.name || data.key || ''`
- 版本任务列表：`lib/index.js:630-642` → `me = { name: data.name, displayName: data.displayName }`，`myselfRaw` 失败不阻断列表
- 会话面板**不使用** `/myself`：默认 JQL 用 JQL 端子的 `assignee = currentUser()`（`lib/index.js:185`），由 JIRA 服务端解析当前用户

### B7. 凭据如何存储（DSH credentials 服务）

**Host 侧**（`lib/index.js:127`）：`const credentials = ctx.get('credentials')`，调用 `credentials.resolve(ref)`。

运行中 Host 的真实契约（`cordis_inspect_query` 读取）：

```
abstract resolve(ref: CredentialRef): Promise<ResolvedCredential | undefined>
    → { value: string; source: string } | undefined
abstract describe(ref: CredentialRef): Promise<CredentialInfo>
    → { configured: boolean; source?: string; writable: boolean }
abstract set(ref: CredentialRef, value: string): Promise<void>
abstract unset(ref: CredentialRef): Promise<void>
```

契约原文关键约束（逐字）：

- 「An empty stored value is absent everywhere — `resolve` skips it, `describe` reports it unconfigured — so a blank never masquerades as a configured secret.」
- 「The stored value takes precedence over ambient fallbacks, and empty values are rejected (use unset).」
- `CredentialRef` 是 branded string，按环境变量名形状。

**客户端侧**（`lib/client.js:1640-1643`）：

```js
var configForms = ctx.get("configForms");
var remote = ctx.get("remote");
if (configForms && remote && remote.credentials) {
  var surfaces = createJiraSettingsSurfaces(configForms.get(SETTINGS_NS), remote.credentials);
```

客户端 remote API 的形状与 Host 服务不同：返回 `{ ok, error }` 信封，且 `describe` 接受**数组**：

```js
// lib/client.js:1330
return credentials.describe(TOKEN_REFS).then(function (res) {
  if (!res || !res.ok || !res.value) return { configured: false, writable: true };
```

写入 / 清除：

```js
// lib/client.js:1426
tasks.push(credentials.set(TOKEN_REF, tokenDraftText).then(function (res) {
  if (res && res.ok === false) { var err = res.error; throw new Error((err && (err.message || err.code)) || "令牌保存失败"); }
}));

// lib/client.js:1454
credentials.unset(TOKEN_REF).then(function (res) { ... });
```

落地文件：`manifest.json` 的 `credentialFile: "$DSH_HOME/.credentials.yaml"`。本机实测该文件存在（`-rw-------`，329 字节），结构为 `version / refs: / records:`。**`refs:` 段当前没有任何 JIRA 相关键**，即本机已装未配。

### B8. 令牌如何到达前端 vs 后端

| 方向 | 令牌是否过前端 |
|---|---|
| **已保存的令牌 → 前端** | ❌ **永不**。前端只调 `credentials.describe(refs)` 拿 `{configured, source, writable}`（`lib/client.js:1330-1356`），拿不到明文。前端只显示「已配置 / 已保存，留空保持不变」（`lib/client.js:1526`） |
| **前端 → 后端（草稿）** | ✅ 仅在用户点「测试连接」时，作为 POST body 的一部分发到**本机 Host**（`lib/client.js:1549` → `210-216`），Host 再转给 JIRA |
| **前端 → 后端（保存）** | ✅ 通过 `remote.credentials.set()` 写进凭据存储（`lib/client.js:1426`），**不经过** profile 配置文档 |
| **前端 → 后端（业务查询）** | ❌ 前端只发 `projectKey` / `jql` / `versionName`（`lib/client.js:201-207, 241-247`），Host 自己去 `credentials.resolve` 取令牌 |

DSH 侧「被启动环境遮蔽的引用只读」错误的处理：`lib/client.js:1303-1312`

```js
function shadowedTokenRef(message) {
  var m = /"([^"]+)" is supplied read-only by the launching environment/.exec(String(message || ""));
  return m ? m[1] : "";
}
function tokenReadOnlyHint(ref) { ... }
```

### B9. ⭐ 是否存在接受「用户名 + 密码」的代码路径

**有，但是「隐式」的，且没有对应的 UI 字段。**

| 问题 | 答案 |
|---|---|
| 有没有构造 `Basic` 头的代码？ | **有**，`lib/index.js:173-176` 与 `plugin/host.js:27-30` |
| 有没有独立的 username / email / password 输入框？ | **没有**。整个插件只有两个输入：`baseUrl` 和 `token`（`lib/index.js:83-85`、`lib/client.js:1507-1532`） |
| 用户今天能不能用账号密码登录？ | **能**，但只能把 `username:password`（或 `email:password`）**拼成一个字符串**粘进「访问令牌 / PAT」输入框。含 `:` → 自动走 Basic |
| 用户知道这件事吗？ | 仅靠一行提示（`lib/client.js:1499`）：`"令牌未配置。含 ":" 时用 Basic，否则用 Bearer。"`；README 也只有一句 `README.md:87`「认证方式自动识别：令牌含 `:` 用 Basic，否则用 Bearer」和 `README.md:120` 的 `JIRA_API_TOKEN: "<PAT 或 user:token>"` |
| 有没有 Basic 专属的测试路径？ | 没有。`handleTest`（`lib/index.js:380-414`）只接受 `{ baseUrl, token }` 两个草稿字段 |

**两个隐性缺陷（读代码得出，非推测）：**

1. **PAT 里含 `:` 会被误判为 Basic**。JIRA Cloud 的 PAT 是不含 `:` 的，但 JIRA Server 的 API token、自签 token、或某些代理网关的 token 格式可能含冒号 —— 此时会静默构造出错误的 `Basic` 头并得到 401，没有任何提示。
2. **`btoa` 与 `Buffer.from(...,'utf-8')` 的行为差异**：动态变体 `plugin/host.js:28` 的 `btoa()` 对非 Latin-1 字符（密码含中文/emoji）会抛 `InvalidCharacterError`；bundle 变体 `lib/index.js:174` 不会。两者对 RFC 7617 的默认 `ISO-8859-1` 约定也都不严格。

---

## (c) 配置 Schema 形状

### C1. 插件 Config（profile entry `jira-tasks`）

```js
// lib/index.js:83-85
const Config = z.object({
  baseUrl: z.string().default('').volatile().description('JIRA 地址，例如 http://jira.example.com/')
});
```

| 字段 | 类型 | 默认 | volatile | 存储位置 | 前端可读 |
|---|---|---|---|---|---|
| `baseUrl` | `z.string()` | `''` | ✅ | profile 配置文档 | ✅（前端通过 `configForms.get('jira-tasks')` 读写，`lib/client.js:1394-1396, 1421`） |

**没有 `username`、`email`、`password`、`authMode` 字段。**

`volatile` 的作用（`lib/index.js:76-79` 注释）：保存后无需重挂载插件即可生效。

### C2. 设置服务策略

```js
// lib/index.js:148-160
ctx.inject(['settings'], (settingsCtx) => {
  settingsCtx.effect(() => {
    try {
      return settingsCtx.settings.configure({ auto: false }, ctx.fiber);
    } catch (e) { ... }
  }, 'jira-tasks: settings page policy');
});
```

关闭自动生成页，改由客户端注册的自定义卡片接管。两个易错点（`lib/index.js:145-147` 注释）：`configure` 第二个参数必须是**本插件实例**的 fiber；返回值（注销函数）必须交回 effect。

### C3. 凭据引用（不在 Config 里）

| 引用名 | 来源 | 可写性 | 优先级 |
|---|---|---|---|
| `JIRA_TASKS_TOKEN` | 设置页写入（插件自有） | 通常可写；被启动环境导出时只读 | 1（最高） |
| `JIRA_API_TOKEN` | 环境变量 / 凭据文件 | 只读（若来自环境） | 2 |
| `JIRA_TOKEN` | 环境变量 / 凭据文件 | 只读 | 3 |
| `JIRA_BASE_URL` | 环境变量 / 凭据文件 | — | 地址回退 1 |
| `JIRA_URL` | 环境变量 / 凭据文件 | — | 地址回退 2 |

`manifest.json` 声明：`settingsNamespace: "jira-tasks"`、`credentialFile: "$DSH_HOME/.credentials.yaml"`、`storageKey: "dsh.jiraTasks.config.v1"`、`envVars` 两项、`credentialRefs` 一项。

### C4. 本地（浏览器）存储

| Key | 内容 | 位置 |
|---|---|---|
| `dsh.jiraTasks.config.v1` | `{ [workspaceKey]: { projectKey, jql } }` | `lib/client.js:160, 182-199` |
| `dsh.jiraTasks.stats.v1` | `{ projectKey }` | `lib/client.js:156, 249-267` |

桌面端 `dsh-app://app` 与浏览器 `127.0.0.1:<port>` 两个 origin **互不相通**（`manifest.json` 的 `desktop.localStorage`）。

---

## (d) 变更面清单（新增 username+password / Basic auth）

### D0. 先说结论：三种方案，工作量差一个数量级

| 方案 | 做法 | 需要改的代码 | 体验 |
|---|---|---|---|
| **A. 零改码（已可用）** | 让用户把 `user:password` 粘进现有「访问令牌 / PAT」框 | **仅 UI 文案**（`lib/client.js:1519-1532` 标签/placeholder、`1499` 提示、`README.md:80-90`） | 现状已支持，但用户要手工拼串，密码与用户名混在一个框里 |
| **B. 最小改动（推荐）** | 保留单凭据通道，在设置卡片加「用户名/邮箱」文本框 +「密码」密码框，写进**两个凭据引用**，Host 拼 `Basic base64(user:pass)` | Host 3 个函数 + Client 设置表单 + 动态变体镜像 | 密码与令牌分离，符合直觉 |
| **C. 完整（authMode 选择器）** | 加 `authMode: auto \| bearer \| basic` 到 Config，显式选择认证方式 | B 的全部 + Config schema + 全部读取点分支 | 最清晰，但改动面最大 |

### D1. 方案 B/C 逐文件变更表

| # | 文件 | 函数 / 区域 | 行 | 必改内容 |
|---|---|---|---|---|
| 1 | `lib/index.js` | `Config`（schemastery） | `83-85` | 加 `username`（`z.string().default('').volatile()`）。**密码绝不能放这里**（Config 明文落盘）。若要 `authMode` 也放这里 |
| 2 | `lib/index.js` | `TOKEN_REFS` | `39` | 加 `JIRA_TASKS_USERNAME` / `JIRA_TASKS_PASSWORD`（或仅 password） |
| 3 | `lib/index.js` | `resolveConnection` | `261-265` | 返回值扩成 `{ baseUrl, token, username, password }`，新增对 username/password 引用（及 `JIRA_USERNAME`/`JIRA_PASSWORD` 回退）的解析 |
| 4 | `lib/index.js` | ⭐ **`buildAuthHeader`** | **`173-176`** | **签名改为 `buildAuthHeader({ token, username, password })`**；命中 basic 时 `Basic ` + base64(`${username}:${password}`)；建议显式 `authMode` 覆盖，去掉「含 `:` 即 Basic」的隐式推断 |
| 5 | `lib/index.js` | `queryJira` | `189-220`（auth `190`，stdin `210`） | 传入新的凭据对象 |
| 6 | `lib/index.js` | `curlJson` | `227-258`（auth `228`，stdin `248`） | 同上 |
| 7 | `lib/index.js` | `probeJira` | `302-331`（auth `303`，stdin `321`） | 同上；`-w '\n%{http_code}'` 输出解析不变 |
| 8 | `lib/index.js` | `handleSearch` | `333-377`（token 解析 `339`，错误文案 `340`） | 解析 username/password；错误文案区分「未配置令牌」/「未配置账号密码」 |
| 9 | `lib/index.js` | `handleTest` | `380-414`（草稿读取 `382-383`，解析 `384-387`，探测 `389`） | POST body 新增 `username`/`password` 草稿字段，`probeJira` 用草稿值 |
| 10 | `lib/index.js` | `handleStats` / `handleVersionIssues` | `422-570` / `594-674` | 通过 `resolveConnection` 自动继承，通常无需逐行改 |
| 11 | `lib/index.js` | 错误文案 | `338, 340, 427-428, 601-602` | 新增「未配置 JIRA 用户名/密码」分支 |
| 12 | `plugin/host.js` | ⭐ `buildAuthHeader` | **`27-30`** | 镜像 #4。**注意** `btoa()` 对非 Latin-1 密码会抛异常，建议改用 `Buffer.from(...,'utf-8')` |
| 13 | `plugin/host.js` | `TOKEN_REFS` | `15` | 镜像 #2 |
| 14 | `plugin/host.js` | `queryJira` | `41-72`（auth `42`，stdin `62`） | 镜像 #5 |
| 15 | `plugin/host.js` | `handler` | `78-128`（解析 `82-85`） | 镜像 #8 |
| 16 | `lib/client.js` | `TOKEN_REF` / `ENV_TOKEN_REFS` / `TOKEN_REFS` | `1298-1300` | 增 `JIRA_TASKS_USERNAME` / `JIRA_TASKS_PASSWORD` 与环境回退名 |
| 17 | `lib/client.js` | `readTokenInfo` | `1329-1356` | `credentials.describe` 传入新 refs；返回体拆成 token / username / password 三份状态 |
| 18 | `lib/client.js` | `JiraSettingsPage` state | `1368-1380` | 新增 `userDraft` / `passDraft` / `authMode` state |
| 19 | `lib/client.js` | 派生状态 | `1394-1404` | 新增 `userDirty` / `passDirty` / `userWritable` / `userOverridden` 等 |
| 20 | `lib/client.js` | `save` | `1409-1447` | `credentials.set(USER_REF, ...)`、`credentials.set(PASS_REF, ...)`；用户名若放 Config 则走 `scope.set('username', ...)` |
| 21 | `lib/client.js` | `clearOverride` | `1450-1470` | 同时 `unset` 用户名/密码引用 |
| 22 | `lib/client.js` | `discard` | `1472-1476` | 清空新草稿 |
| 23 | `lib/client.js` | `runProbe` | `1479-1491` | payload 透传 username/password |
| 24 | `lib/client.js` | `tokenHint` | `1493-1499` | 新提示文案（当前 `1499` 那句「含 ":" 时用 Basic」要改） |
| 25 | `lib/client.js` | ⭐ `fields` 数组 | **`1506-1554`** | **加「用户名 / 邮箱」文本框 +「密码」密码框（`type:"password"`）；改「访问令牌 / PAT」标签；** |
| 26 | `lib/client.js` | 令牌输入框 | `1519-1532` | 标签改「访问令牌 / PAT（Bearer）」，placeholder 与 authMode 联动 |
| 27 | `lib/client.js` | 测试连接按钮 | `1544-1550` | `runProbe({ baseUrl, token, username, password })` |
| 28 | `lib/client.js` | `shadowedTokenRef` / `tokenReadOnlyHint` | `1303-1312` | 泛化为按引用名给提示（现在硬编码 `TOKEN_REF`） |
| 29 | `plugin/client.js` | `JiraTasksDock` | `103-289` | 动态客户端**没有设置卡片**，Basic auth 的 UI 在此形态下无处安放（需另加，或明确声明动态形态不支持） |
| 30 | `manifest.json` | `envVars` / `credentialRefs` / `defaultJql` | 全文 | 声明新环境变量与凭据引用；`hostRoutes` 不变 |
| 31 | `package.json` | `version` | `4` | 版本号 +1 |
| 32 | `README.md` / `README.en.md` | 配置章节 | `README.md:80-100, 116-128, 219` | 补充账号密码登录说明；`README.md:219` 兼容性表已写「PAT（Bearer）或 Basic 认证」 |
| 33 | `cordis.patch.yml` | — | 全文 | **不需要改**（inject 列表不变） |

### D2. UI / 设置表单的连带影响

- **一处改动覆盖两处渲染**：`fields` 数组（`lib/client.js:1506-1554`）同时被 `plugins.item` 卡片（`1564-1569`）和 `settings.section` 整页（`1556-1561`）复用，所以加字段只需改数组一处。
- **组件不能提前 return hook**：`lib/client.js:1358-1363` 注释记录了一个历史坑 —— `view === "summary"` 的分支（`1573-1576`）不能提前 return，否则违反 React hook 规则。新增输入框时不要破坏这个结构。
- **凭据写入的只读语义**：`credentials.set` 对「被启动环境提供」的引用会被拒绝（`lib/client.js:1444` 的 `shadowedTokenRef` 解析英文错误串）。新增引用必须各自处理「被环境遮蔽 → 只读 → 给出可操作提示」。
- **空值语义**：DSH 契约规定「empty values are rejected (use unset)」。用户名/密码输入框必须保持「留空 = 不改动」语义（现有令牌框已如此，`lib/client.js:1397-1398, 1399`），不能把空串写进去。
- **密码绝不能进 Config**：Config 会明文落到 profile 配置文档（`lib/index.js:74-82` 注释明确说明令牌就是因为这个才被排除）。用户名不是机密，可以放 Config（前端可回读，方便回显）；**密码必须只进 credentials 存储**。
- **前端永远拿不到已保存的密码**：`credentials.describe` 只返回 `{configured, source, writable}`，密码框只能显示「已配置，留空保持不变」。
- **测试连接要把草稿密码发到本机 Host**（`lib/client.js:1549` → POST body）。这与现有令牌草稿走同一条路，风险等级相同（本机 localhost）。

### D3. 建议的最小可行实现（方案 B）

```
设置卡片增加两个输入：
  [用户名 / 邮箱]  → credentials.set('JIRA_TASKS_USERNAME', v)
  [密码]           → credentials.set('JIRA_TASKS_PASSWORD', v)   // type=password
  [访问令牌 / PAT] → credentials.set('JIRA_TASKS_TOKEN', v)      // 保留，二选一

Host 侧 buildAuthHeader 改为：
  buildAuthHeader({ token, username, password }) {
    if (username && password) return 'Basic ' + base64(username + ':' + password);
    if (token && token.includes(':')) return 'Basic ' + base64(token);   // 兼容旧行为
    if (token) return 'Bearer ' + token;
    return '';
  }
```
优先级：**显式账号密码 > 含冒号令牌 > 纯令牌**。这样既保留向后兼容（老用户存了 `user:token` 仍可用），又给新用户正规的账号密码入口。

---

## (e) 上游仓库信号

### E1. Issues / PR：零

| 查询 | 结果 |
|---|---|
| `GET /repos/liu3734/jira-tasks-dsh-plugin/issues?state=all&per_page=100` | `[]`（**空数组**） |
| `GET /repos/liu3734/jira-tasks-dsh-plugin/pulls?state=all&per_page=100` | `[]`（**空数组**） |
| repo meta | `has_issues: true`、`open_issues_count: 0`、`has_discussions: false`、`stargazers_count: 1`、`forks_count: 0`、`archived: false` |
| GitHub 网页 issues 页 | 抓取成功，但返回的是 GitHub 通用导航 HTML，无 issue 条目 |

**结论：仓库从未开过 issue，也没有 PR。** 因此**不存在**任何提到「账号密码 / password / basic auth」的上游讨论 —— 这不是「有 issue 但被忽略」，而是**根本没有任何 issue**。

### E2. 提交历史中的认证信号

`git log -S` 追踪 `buildAuthHeader` / `Basic` / `btoa` / `base64`：

| Commit | 日期 | 与认证的关系 |
|---|---|---|
| `accd556` | 2026-08-17 | **首个提交**，`plugin/host.js` 里已带 `if (token.indexOf(':') !== -1) return 'Basic ' + btoa(token);` |
| `244035d` | 2026-08-17 | 包上移到 profile bundle，`lib/index.js` 继承同一逻辑 |
| `e719475` | 2026-09-10 | v1.0.5「JIRA 地址与令牌迁移至设置页」—— base64 编码器从 `btoa` 换成 `Buffer.from(token,'utf-8').toString('base64')`（因为搬进 Node 侧 Host，`btoa` 在 Node 不一定有） |
| `eeaafcb` | 2026-09-14 | v1.0.6「设置卡片新增连接测试与状态灯」—— `buildAuthHeader` 引入 `lib/index.js` |

逐 tag 核对 `buildAuthHeader` 的**行为逻辑完全未变**（只换了行号和 base64 编码器）：

| Tag | 位置 | 代码 |
|---|---|---|
| v1.0.5 | `profile-package/lib/index.js:76-79` | `indexOf(':')` → `Basic` + `Buffer.from(...,'base64')`；否则 `Bearer` |
| v1.0.6 | `profile-package/lib/index.js:76-79` | 同上 |
| v1.0.7 | `lib/index.js:76-79` | 同上 |
| v1.1.0 | `lib/index.js:132-135` | 同上 |
| v1.2.0 | `lib/index.js:132-135` | 同上 |
| v1.3.0 | `lib/index.js:132-135` | 同上 |
| v1.3.1 | `lib/index.js:132-135` | 同上 |
| **v1.4.0** | **`lib/index.js:173-176`** | 同上 |

### E3. README 中已存在的 Basic 表述

| 行 | 原文 |
|---|---|
| `README.md:87` | 「认证方式自动识别：令牌含 `:` 用 Basic，否则用 Bearer」 |
| `README.md:120` | `JIRA_API_TOKEN: "<PAT 或 user:token>"` |
| `README.md:219` | 「JIRA \| Server / Data Center REST API v2，PAT（Bearer）或 Basic 认证」 |
| `README.md:184` | 「401 … \| 令牌无效或认证方式不对，重填令牌并用「测试连接」验证」 |
| `lib/client.js:1499` | 「令牌未配置。含 ":" 时用 Basic，否则用 Bearer。」 |

即：**上游作者早在 v1.0.0 就知道并实现了 Basic 认证，只是把它设计成「令牌串里带冒号」的隐式约定，而没有做成独立的账号密码表单。**

### E4. 其它上游信号

- `manifest.json` 的 `credentialRefs` 只声明 `JIRA_TASKS_TOKEN` 一项；`envVars` 只声明 `JIRA_BASE_URL` / `JIRA_API_TOKEN` 两项 —— 官方文档口径里**没有账号密码**。
- 仓库 `docs/images/` 只有两张图：`stats-overview.webp`、`version-tasks.webp`；README 里另有 3 张 GitHub user-attachments 图（面板、设置卡片、统计页）。
- 无 CI 测试用例目录（无 `test/`、无 `*.test.*`）；唯一 CI 是 `.github/workflows/npm-publish-github-packages.yml`（发版）。

---

## 附录 A：关键代码速查表

```
lib/index.js
  21        SETTINGS_NS = 'jira-tasks'
  39        TOKEN_REFS = ['JIRA_TASKS_TOKEN','JIRA_API_TOKEN','JIRA_TOKEN']
  83-85     Config = z.object({ baseUrl: z.string().default('').volatile() })
  87        inject = ['subprocess','credentials','sandboxPolicy','webServer']
  97-102    methodIsPost（405 守卫）
  132-140   resolveFirst(names) → credentials.resolve
  148-160   settings.configure({auto:false}, ctx.fiber)
  163-171   settingsBaseUrl()
  173-176   ★ buildAuthHeader(token)  ← 唯一认证头构造点
  189-220   queryJira   (auth 190 / stdin 210)
  227-258   curlJson   (auth 228 / stdin 248)
  261-265   resolveConnection() → {baseUrl, token}
  302-331   probeJira  (auth 303 / stdin 321)  GET /myself
  333-377   handleSearch
  380-414   handleTest
  422-570   handleStats
  594-674   handleVersionIssues
  676-729   4 条 webServer.register 路由
  732       export { Config, apply, inject, name }

plugin/host.js
  15        TOKEN_REFS
  27-30     ★ buildAuthHeader(token)（btoa 版本）
  41-72     queryJira
  78-128    handler (jira/list)
  130       harness.handle('jira/list', handler)
  133-149   jira_debug 工具

lib/client.js
  155-158   STATS_PANEL_ID / STATS_STORAGE_KEY / VERSION_PAGE_SIZE=10
  160       STORAGE_KEY = 'dsh.jiraTasks.config.v1'
  201-207   query()        POST /jira/api/search
  210-216   testConnection() POST /jira/api/test
  221-247   postJson / queryStats / queryVersionIssues
  249-267   统计页上次项目键
  292-315   configuredProjectOptions
  339-355   统计缓存（上限 6）
  398-448   isMyIssue / compareIssueKeys / compareIssueValues / compareIssuesDefault
  475-487   JiraStatsIcon
  491-1130  JiraStatsPanel
  706-789   versionRow / renderVersions（分页 10/页）
  792-846   openVersion / sortIssues / sortedVersionIssueList
  848-...   renderVersionIssueTable
  954-971   概览卡片
  1132-1289 JiraTasksDock
  1293-1300 SETTINGS_NS / TOKEN_REF / ENV_TOKEN_REFS / TOKEN_REFS
  1303-1312 shadowedTokenRef / tokenReadOnlyHint
  1328-1584 createJiraSettingsSurfaces（设置表单）
  1329-1356 readTokenInfo()
  1364-1570 JiraSettingsPage（fields 数组在 1506-1554）
  1573-1581 JiraSettingsCard / JiraSettingsSection
  1586-1659 apply()：slots / sidebar.panellist / main / configForms 注册
  1661      exports.inject = ['slots','configForms','remote','remote.credentials']

plugin/client.js
  10        STORAGE_KEY
  58-99     按工作区存储
  103-289   JiraTasksDock
  145       host.call('jira/list', ...)
  295-299   slots.inject('conversation.input.dock', ...)
```

## 附录 B：本次分析未做的事（避免过度声明）

- 未运行插件、未发起真实 JIRA 请求 —— 所有 HTTP 行为均由**读代码**得出。
- 未修改 `~/.dsh/` 下任何文件；仅读取了 `~/.dsh/profiles/desktop/package.json` 与 `~/.dsh/.credentials.yaml` 的**键名**（未打印任何值）。
- 未修改仓库任何文件（`research/jira-src/repo` 为只读分析对象）。
- 仓库 issue/PR 结论基于 GitHub REST API（`issues?state=all` 与 `pulls?state=all` 均返回 `[]`），非仅网页抓取。
- `cordis_inspect_query` 的 **client 平台** `remote.credentials` 查询超时（未取得客户端 remote API 的正式契约）；客户端 remote 形状是**从插件代码反推**的（`describe` 接受数组、`set`/`unset` 返回 `{ok, error}` 信封）。Host 侧 `credentials` 服务契约则是直接读到的运行时真值。
