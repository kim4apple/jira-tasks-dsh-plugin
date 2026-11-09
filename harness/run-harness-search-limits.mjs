/**
 * Harness for the two incremental Host-side changes of v1.7.0:
 *
 *   1) POST /jira/api/search        → optional `maxResults` (default 50, cap 200)
 *   2) POST /jira/api/attachments   → optional `attachmentIds` (subset download)
 *
 * Loads the REAL patched lib/index.js with a stubbed Cordis context and drives
 * the plugin's own routes against a local mock JIRA server.
 *
 * The mock search endpoint honours the `maxResults` query parameter and can
 * expose a configurable pool of issues, so the 200-item clamp is observable:
 * a pool of 250 issues + `maxResults=99999` must yield exactly 200 issues.
 *
 * Run: node research/jira-src/harness/run-harness-search-limits.mjs
 */
import http from 'node:http';
import cp from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const { apply } = await import(path.join(REPO, 'lib', 'index.js'));

const PORT = 8794;
const JIRA = `http://127.0.0.1:${PORT}`;
const WS = fs.mkdtempSync(path.join(os.tmpdir(), 'jira-ws-limits-'));

// ---------------------------------------------------------------------------
// Mock JIRA
// ---------------------------------------------------------------------------

/** Mock 里「存在多少条任务」——测试用例按需调整。 */
let SEARCH_POOL = 3;
/** 每次 search 请求收到的查询参数（用于断言真正发给 JIRA 的 maxResults）。 */
const searchCalls = [];

function makeIssue(index) {
  return {
    key: 'PROJ-' + (index + 1),
    fields: {
      summary: '任务 ' + (index + 1),
      status: { name: '开启' },
      statuscategorykey: 'new',
      priority: { name: 'High' },
      issuetype: { name: 'Bug' },
    },
  };
}

const ATT_BODY = {
  '10001': Buffer.from('server-log-content\n', 'utf-8'),
  '10002': Buffer.from('app-log-content\n', 'utf-8'),
  '10003': Buffer.from('trace-log-content\n', 'utf-8'),
};

const ISSUE = {
  key: 'PROJ-1',
  fields: {
    summary: '登录后 500',
    description: '复现步骤…',
    status: { name: '开启' },
    statuscategorykey: 'new',
    priority: { name: 'High' },
    issuetype: { name: 'Bug' },
    assignee: { displayName: 'Alice' },
    reporter: { displayName: 'Bob' },
    created: '2026-11-01T10:00:00.000+0800',
    updated: '2026-11-02T11:00:00.000+0800',
    labels: ['backend'],
    components: [{ name: 'web' }],
    fixVersions: [{ name: 'v1.2' }],
    attachment: [
      { id: '10001', filename: 'server.log', size: 18, mimeType: 'text/plain',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${JIRA}/rest/api/2/attachment/content/10001` },
      { id: '10002', filename: 'app.log', size: 15, mimeType: 'text/plain',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${JIRA}/rest/api/2/attachment/content/10002` },
      { id: '10003', filename: 'trace.log', size: 17, mimeType: 'text/plain',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${JIRA}/rest/api/2/attachment/content/10003` },
    ],
  },
};

const COMMENTS = { startAt: 0, total: 0, comments: [] };

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  if (url === '/rest/api/2/search') {
    const q = new URL(req.url, 'http://127.0.0.1').searchParams;
    const rawLimit = q.get('maxResults');
    const limit = Number(rawLimit);
    searchCalls.push({ maxResults: rawLimit, jql: q.get('jql'), fields: q.get('fields') });
    const n = Number.isFinite(limit) && limit > 0 ? Math.min(limit, SEARCH_POOL) : 0;
    const issues = [];
    for (let i = 0; i < n; i++) issues.push(makeIssue(i));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ startAt: 0, maxResults: limit, total: SEARCH_POOL, issues }));
    return;
  }

  if (url === '/rest/api/2/issue/PROJ-1') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(ISSUE));
    return;
  }
  if (url === '/rest/api/2/issue/PROJ-1/comment') {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(COMMENTS));
    return;
  }
  if (url.startsWith('/rest/api/2/attachment/content/')) {
    const id = url.slice('/rest/api/2/attachment/content/'.length);
    const body = ATT_BODY[id];
    if (!body) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ errorMessages: ['not found: ' + id] }));
      return;
    }
    res.setHeader('Content-Type', 'text/plain');
    res.end(body);
    return;
  }

  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ errorMessages: ['not found: ' + url] }));
});

await new Promise((r) => server.listen(PORT, '127.0.0.1', r));

// ---------------------------------------------------------------------------
// Cordis stubs（沿用 run-harness-detail.mjs 的写法）
// ---------------------------------------------------------------------------
function makeSubprocess() {
  return {
    async resolveExecutable(name) { return name === 'curl' ? '/usr/bin/curl' : name; },
    spawn({ argv, cwd, stdio }) {
      const child = cp.spawn(argv[0], argv.slice(1), { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
      let out = ''; let err = '';
      child.stdout.on('data', (d) => { out += d; });
      child.stderr.on('data', (d) => { err += d; });
      const done = new Promise((resolve) => {
        child.on('close', (code) => resolve({ exitCode: code === null ? 1 : code }));
      });
      if (stdio && stdio.stdin && typeof stdio.stdin.data === 'string') {
        child.stdin.write(stdio.stdin.data);
        child.stdin.end();
      }
      return {
        done,
        collected: {
          stdout: { readFrom: () => ({ text: out }) },
          stderr: { readFrom: () => ({ text: err }) },
        },
      };
    },
  };
}

function makeCtx(creds) {
  const routes = {};
  const ctx = {
    fiber: {},
    logger: { warn() {}, info() {}, error() {} },
    get(name) {
      if (name === 'subprocess') return makeSubprocess();
      if (name === 'credentials') {
        return {
          async resolve(ref) {
            if (!Object.prototype.hasOwnProperty.call(creds, ref)) throw new Error('not configured: ' + ref);
            return { value: creds[ref], source: 'store' };
          },
        };
      }
      if (name === 'sandboxPolicy') return { workspaceRoot: WS };
      if (name === 'webServer') {
        return { register({ path: p, handler }) { routes[p] = handler; return () => {}; } };
      }
      throw new Error('unknown service: ' + name);
    },
    inject(_n, fn) {
      fn({ effect(f) { const d = f(); if (typeof d === 'function') d(); }, settings: { configure() { return () => {}; } } });
    },
    effect(f) { const d = f(); if (typeof d === 'function') d(); },
  };
  return { ctx, routes };
}

function callRoute(handler, bodyObj) {
  return new Promise((resolve, reject) => {
    const listeners = {};
    const req = { method: 'POST', on(ev, cb) { (listeners[ev] = listeners[ev] || []).push(cb); } };
    const res = {
      statusCode: 200, headers: null, body: '',
      writeHead(c, h) { this.statusCode = c; this.headers = h; },
      end(t) { this.body = t == null ? '' : String(t); resolve(this); },
    };
    Promise.resolve(handler(req, res)).catch(reject);
    setImmediate(() => {
      const data = Buffer.from(JSON.stringify(bodyObj));
      for (const cb of (listeners.data || [])) cb(data);
      for (const cb of (listeners.end || [])) cb();
    });
  });
}

async function call(path, body, { creds = { JIRA_TASKS_PASSWORD: 's3cr3t' } } = {}) {
  const config = { baseUrl: JIRA, username: 'alice', maxAttachmentMb: 1 };
  const { ctx, routes } = makeCtx(creds);
  apply(ctx, config);
  const handler = routes[path];
  if (!handler) throw new Error('route not registered: ' + path);
  const res = await callRoute(handler, body);
  let json = null;
  try { json = JSON.parse(res.body); } catch (e) { /* keep null */ }
  return { res, json };
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------
let passed = 0; let failed = 0;
function check(name, cond, detail) {
  if (cond) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail ? '\n      → ' + detail : '')); }
}

/** 最后一次 search 请求实际发出的 maxResults。 */
function lastMaxResults() {
  return searchCalls.length ? searchCalls[searchCalls.length - 1].maxResults : null;
}

console.log('\n=== 1. search 不传 maxResults → 缺省 50，行为与改动前一致 ===');
{
  SEARCH_POOL = 3;
  searchCalls.length = 0;
  const { json } = await call('/jira/api/search', { projectKey: 'PROJ' });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('拿到 3 条（mock 只有 3 条）', json && json.issues.length === 3, String(json && json.issues && json.issues.length));
  check('发出去的 maxResults 仍是 50', lastMaxResults() === '50', String(lastMaxResults()));
  check('jql 仍按 projectKey 生成', searchCalls[0].jql.includes('project = "PROJ"'), searchCalls[0].jql);
  // statuscategorykey 不是 JIRA 的真实字段名（7.8 会静默忽略），已从 fields 里去掉；
  // statusCategory 改从 fields.status.statusCategory.key 读（见 739f7ce）。
  check('fields 参数未变', searchCalls[0].fields === 'summary,status,priority,issuetype', searchCalls[0].fields);
}

console.log('\n=== 2. search maxResults=1 → 只拿 1 条 ===');
{
  SEARCH_POOL = 250;
  searchCalls.length = 0;
  const { json } = await call('/jira/api/search', { projectKey: 'PROJ', maxResults: 1 });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('只拿到 1 条', json && json.issues.length === 1, String(json && json.issues && json.issues.length));
  check('发出去的 maxResults=1', lastMaxResults() === '1', String(lastMaxResults()));
}

console.log('\n=== 3. search maxResults=99999 → 钳到 200 ===');
{
  SEARCH_POOL = 250;
  searchCalls.length = 0;
  const { json } = await call('/jira/api/search', { projectKey: 'PROJ', maxResults: 99999 });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('拿到 200 条（上限）', json && json.issues.length === 200, String(json && json.issues && json.issues.length));
  check('发出去的 maxResults=200', lastMaxResults() === '200', String(lastMaxResults()));
}

console.log('\n=== 4. search maxResults="abc" → 回落 50，不报错 ===');
{
  SEARCH_POOL = 250;
  searchCalls.length = 0;
  const { json } = await call('/jira/api/search', { projectKey: 'PROJ', maxResults: 'abc' });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('拿到 50 条（回落缺省）', json && json.issues.length === 50, String(json && json.issues && json.issues.length));
  check('发出去的 maxResults=50', lastMaxResults() === '50', String(lastMaxResults()));
}

console.log('\n=== 5. search maxResults=-5 → 回落 50，不报错 ===');
{
  SEARCH_POOL = 250;
  searchCalls.length = 0;
  const { json } = await call('/jira/api/search', { projectKey: 'PROJ', maxResults: -5 });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('拿到 50 条（回落缺省）', json && json.issues.length === 50, String(json && json.issues && json.issues.length));
  check('发出去的 maxResults=50', lastMaxResults() === '50', String(lastMaxResults()));
}

console.log('\n=== 5b. 其他非法值（非整数 / 0 / null）→ 回落 50 ===');
{
  SEARCH_POOL = 250;
  for (const bad of [1.5, 0, null]) {
    searchCalls.length = 0;
    const { json } = await call('/jira/api/search', { projectKey: 'PROJ', maxResults: bad });
    check('maxResults=' + JSON.stringify(bad) + ' → ok:true 且 50 条',
      json && json.ok === true && json.issues.length === 50, JSON.stringify(json && json.issues && json.issues.length));
    check('maxResults=' + JSON.stringify(bad) + ' → 发出 50', lastMaxResults() === '50', String(lastMaxResults()));
  }
}

console.log('\n=== 6. attachments 不传 attachmentIds → 下载全部（既有行为） ===');
{
  const { json } = await call('/jira/api/attachments', { issueKey: 'PROJ-1' });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('saved 3 个', json && json.saved.length === 3, JSON.stringify(json && json.saved.map((s) => s.attachmentId)));
  check('failed 0 个', json && json.failed.length === 0, JSON.stringify(json && json.failed));
  check('三个 id 都在', json && json.saved.map((s) => s.attachmentId).join(',') === '10001,10002,10003',
    JSON.stringify(json && json.saved.map((s) => s.attachmentId)));
  check('dir 字段不变（jira-attachments/PROJ-1）',
    json && json.dir === path.join(WS, 'jira-attachments', 'PROJ-1'), json && json.dir);
  check('saved 条目字段结构不变',
    json && json.saved.every((s) => 'attachmentId' in s && 'filename' in s && 'path' in s && 'bytes' in s && 'contentType' in s),
    JSON.stringify(json && json.saved[0]));
}

console.log('\n=== 7. attachments attachmentIds=["10001"] → 只下 10001 ===');
{
  const { json } = await call('/jira/api/attachments', { issueKey: 'PROJ-1', attachmentIds: ['10001'] });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('saved 只有 1 个', json && json.saved.length === 1, JSON.stringify(json && json.saved.map((s) => s.attachmentId)));
  check('saved[0].attachmentId=10001', json && json.saved[0].attachmentId === '10001', JSON.stringify(json && json.saved[0]));
  check('10002/10003 不在 saved 里', json && !json.saved.some((s) => s.attachmentId === '10002' || s.attachmentId === '10003'),
    JSON.stringify(json && json.saved.map((s) => s.attachmentId)));
  check('failed 0 个', json && json.failed.length === 0, JSON.stringify(json && json.failed));
  check('文件确实落盘', json && fs.existsSync(json.saved[0].path), json && json.saved[0] && json.saved[0].path);
}

console.log('\n=== 8. attachments 传不存在的 id → 进 failed[]，其余照常下 ===');
{
  const { json } = await call('/jira/api/attachments', { issueKey: 'PROJ-1', attachmentIds: ['10001', '99999', '10003'] });
  check('ok:true（不报错中断）', json && json.ok === true, JSON.stringify(json));
  check('saved 2 个（10001/10003）', json && json.saved.length === 2, JSON.stringify(json && json.saved.map((s) => s.attachmentId)));
  check('failed 1 个（99999）', json && json.failed.length === 1, JSON.stringify(json && json.failed));
  check('failed[0].attachmentId=99999', json && json.failed[0].attachmentId === '99999', JSON.stringify(json && json.failed[0]));
  check('failed[0].reason 非空且说明找不到', json && typeof json.failed[0].reason === 'string' && /找不到附件/.test(json.failed[0].reason),
    JSON.stringify(json && json.failed[0]));
  check('failed[0] 字段结构不变（attachmentId/filename/reason）',
    json && 'attachmentId' in json.failed[0] && 'filename' in json.failed[0] && 'reason' in json.failed[0],
    JSON.stringify(json && json.failed[0]));
  check('10003 仍然下到了', json && json.saved.some((s) => s.attachmentId === '10003'),
    JSON.stringify(json && json.saved.map((s) => s.attachmentId)));
}

console.log('\n=== 9. attachments attachmentIds=[] → 一个都不下，不报错 ===');
{
  const { json } = await call('/jira/api/attachments', { issueKey: 'PROJ-1', attachmentIds: [] });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('saved 为空', json && json.saved.length === 0, JSON.stringify(json && json.saved));
  check('failed 为空', json && json.failed.length === 0, JSON.stringify(json && json.failed));
  check('issueKey / dir 字段不变',
    json && json.issueKey === 'PROJ-1' && json.dir === path.join(WS, 'jira-attachments', 'PROJ-1'), JSON.stringify(json));
}

console.log('\n=== 10. 回归：既有 /jira/api/issue 与 /jira/api/attachment 不受影响 ===');
{
  const { json } = await call('/jira/api/issue', { issueKey: 'PROJ-1' });
  check('issue 路由 ok:true', json && json.ok === true, JSON.stringify(json));
  check('附件清单 3 个', json && json.attachments.length === 3, String(json && json.attachments && json.attachments.length));
  const { json: one } = await call('/jira/api/attachment', { issueKey: 'PROJ-1', attachmentId: '10002' });
  check('单附件下载 ok:true', one && one.ok === true, JSON.stringify(one));
  check('单附件路径在 PROJ-1 目录', one && one.path.startsWith(path.join(WS, 'jira-attachments', 'PROJ-1')), one && one.path);
}

server.close();
fs.rmSync(WS, { recursive: true, force: true });

console.log(`\n${'='.repeat(60)}`);
console.log(`结果：${passed} 通过，${failed} 失败`);
process.exit(failed === 0 ? 0 : 1);
