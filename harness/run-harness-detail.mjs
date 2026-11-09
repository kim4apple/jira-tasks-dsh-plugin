/**
 * Harness for the new issue-detail / attachment-download routes.
 *
 * Loads the REAL patched lib/index.js with a stubbed Cordis context and drives
 * the plugin's own routes against local mock Jira servers. Two mock servers are
 * used so that cross-host redirect behaviour can be observed exactly:
 *
 *   A (8792) = the configured JIRA
 *   B (8793) = a *different* host, used for the redirect + SSRF cases
 *
 * Run: node research/jira-src/harness/run-harness-detail.mjs
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

const PORT_A = 8792;
const PORT_B = 8793;
const A = `http://127.0.0.1:${PORT_A}`;
const B = `http://127.0.0.1:${PORT_B}`;
const LOG_DATA = Buffer.from('2026-11-08 ERROR stack trace here\nline2\n', 'utf-8');
const WS = fs.mkdtempSync(path.join(os.tmpdir(), 'jira-ws-'));

// ---------------------------------------------------------------------------
// Mock servers
// ---------------------------------------------------------------------------
const bHeaders = [];
const aHeaders = [];

const serverB = http.createServer((req, res) => {
  bHeaders.push({ url: req.url, authorization: req.headers.authorization || null });
  res.setHeader('Content-Type', 'text/plain');
  res.end('from-B');
});

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
    labels: ['backend', 'auth'],
    components: [{ name: 'web' }],
    fixVersions: [{ name: 'v1.2' }],
    customfield_10001: '严重程度高',
    customfield_10002: { value: 'P1' },
    changelog: {
      histories: [{ id: '1', author: { displayName: 'Bob' }, created: '2026-11-02T00:00:00.000+0800',
        items: [{ field: 'status', fromString: '新建', toString: '开启' }] }],
    },
    attachment: [
      { id: '10001', filename: 'server.log', size: LOG_DATA.length, mimeType: 'text/plain',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${A}/rest/api/2/attachment/content/10001` },
      { id: '10002', filename: 'missing.zip', size: 10, mimeType: 'application/zip',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${A}/rest/api/2/attachment/content/10002` },
      { id: '10003', filename: 'redirected.log', size: 7, mimeType: 'text/plain',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${A}/rest/api/2/attachment/content/10003` },
      { id: '10004', filename: 'crosshost.log', size: 7, mimeType: 'text/plain',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${A}/rest/api/2/attachment/content/10004` },
      { id: '10005', filename: '../../../../etc/passwd', size: 5, mimeType: 'text/plain',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${A}/rest/api/2/attachment/content/10001` },
      { id: '10006', filename: 'ssrf.txt', size: 5, mimeType: 'text/plain',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${B}/other` },
      { id: '10007', filename: 'huge.bin', size: 999999999, mimeType: 'application/octet-stream',
        created: '2026-11-02T12:00:00.000+0800', author: { displayName: 'Alice' },
        content: `${A}/rest/api/2/attachment/content/10001` },
    ],
  },
};

const COMMENTS = {
  startAt: 0, total: 2,
  comments: [
    { id: 'c1', author: { displayName: 'Bob' }, created: '2026-11-02T09:00:00.000+0800',
      updated: '2026-11-02T09:00:00.000+0800', body: '我这边也复现了' },
    { id: 'c2', author: { displayName: 'Alice' }, created: '2026-11-02T10:00:00.000+0800',
      updated: '2026-11-02T10:00:00.000+0800', body: '日志已上传' },
  ],
};

const serverA = http.createServer((req, res) => {
  aHeaders.push({ url: req.url, authorization: req.headers.authorization || null });
  const url = req.url.split('?')[0];
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (url === '/rest/api/2/issue/PROJ-1') { res.end(JSON.stringify(ISSUE)); return; }
  if (url === '/rest/api/2/issue/PROJ-1/comment') { res.end(JSON.stringify(COMMENTS)); return; }
  if (url === '/rest/api/2/issue/NOPE') {
    res.statusCode = 404;
    res.end(JSON.stringify({ errorMessages: ['Issue does not exist'], message: 'Issue does not exist' }));
    return;
  }
  if (url === '/rest/api/2/attachment/content/10001') {
    res.setHeader('Content-Type', 'text/plain');
    res.end(LOG_DATA);
    return;
  }
  if (url === '/rest/api/2/attachment/content/10002') {
    res.statusCode = 404;
    res.end(JSON.stringify({ errorMessages: ['gone'] }));
    return;
  }
  if (url === '/rest/api/2/attachment/content/10003') {
    res.statusCode = 302;
    res.setHeader('Location', `${A}/rest/api/2/attachment/content/10003-final`);
    res.end();
    return;
  }
  if (url === '/rest/api/2/attachment/content/10003-final') {
    res.setHeader('Content-Type', 'text/plain');
    res.end('same-host-redirect-body');
    return;
  }
  if (url === '/rest/api/2/attachment/content/10004') {
    res.statusCode = 302;
    res.setHeader('Location', `${B}/other`);
    res.end();
    return;
  }
  res.statusCode = 404;
  res.end(JSON.stringify({ errorMessages: ['not found: ' + url] }));
});

await new Promise((r) => serverA.listen(PORT_A, '127.0.0.1', r));
await new Promise((r) => serverB.listen(PORT_B, '127.0.0.1', r));

// ---------------------------------------------------------------------------
// Cordis stubs
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

function makeCtx(creds, config) {
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

async function call(path, body, { creds = { JIRA_TASKS_PASSWORD: 's3cr3t' }, config } = {}) {
  const { ctx, routes } = makeCtx(creds, config || { baseUrl: A, username: 'alice', maxAttachmentMb: 1 });
  apply(ctx, config || { baseUrl: A, username: 'alice', maxAttachmentMb: 1 });
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

console.log('\n=== 1. /jira/api/issue 返回完整字段 + 评论 + 附件 ===');
{
  const { json } = await call('/jira/api/issue', { issueKey: 'PROJ-1' });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('summary', json && json.summary === '登录后 500', JSON.stringify(json && json.summary));
  check('issueType/status/priority', json && json.issueType === 'Bug' && json.status === '开启' && json.priority === 'High');
  check('assignee/reporter', json && json.assignee === 'Alice' && json.reporter === 'Bob');
  check('labels/components/fixVersions', json && json.labels.length === 2 && json.components[0] === 'web' && json.fixVersions[0] === 'v1.2');
  check('自定义字段被单独抽出', json && json.customFields && json.customFields.customfield_10001 === '严重程度高', JSON.stringify(json && json.customFields));
  check('allFields 含原始全量', json && json.allFields && json.allFields.description === '复现步骤…');
  check('评论 2 条', json && json.comments && json.comments.length === 2, JSON.stringify(json && json.comments));
  check('评论正文与作者', json && json.comments[0].body === '我这边也复现了' && json.comments[0].author === 'Bob');
  check('附件 7 个', json && json.attachments && json.attachments.length === 7, String(json && json.attachments && json.attachments.length));
  check('附件带 url/size/contentType', json && json.attachments[0].url.includes('/attachment/content/10001') && json.attachments[0].size === LOG_DATA.length);
  check('变更历史', json && json.changelog && json.changelog.length === 1 && json.changelog[0].items[0].to === '开启');
}

console.log('\n=== 2. /jira/api/issue 工单不存在 → 错误可读 ===');
{
  const { json } = await call('/jira/api/issue', { issueKey: 'NOPE' });
  check('ok:false', json && json.ok === false);
  check('错误含 JIRA 原文', json && /Issue does not exist/.test(json.error), JSON.stringify(json));
}

console.log('\n=== 3. /jira/api/attachment 下载到工作区 ===');
{
  const { json } = await call('/jira/api/attachment', { issueKey: 'PROJ-1', attachmentId: '10001' });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('path 在工作区的 jira-attachments/PROJ-1 下', json && json.path.startsWith(path.join(WS, 'jira-attachments', 'PROJ-1')), json && json.path);
  check('文件确实落盘', json && fs.existsSync(json.path));
  check('内容字节完全一致', json && fs.readFileSync(json.path).equals(LOG_DATA));
  check('bytes 正确', json && json.bytes === LOG_DATA.length, String(json && json.bytes));
}

console.log('\n=== 4. 文件名穿越（../../../../etc/passwd）必须被消毒 ===');
{
  const { json } = await call('/jira/api/attachment', { issueKey: 'PROJ-1', attachmentId: '10005' });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  const dir = path.join(WS, 'jira-attachments', 'PROJ-1');
  check('落盘路径仍在目标目录内', json && path.resolve(json.path).startsWith(path.resolve(dir) + path.sep), json && json.path);
  check('文件名不含 ..', json && !path.basename(json.path).includes('..'), json && path.basename(json.path));
  check('没有写到 /etc/passwd', !fs.existsSync('/etc/passwd.proj1'));
}

console.log('\n=== 5. 同主机重定向：认证头必须带过去 ===');
{
  const before = aHeaders.length;
  const { json } = await call('/jira/api/attachment', { issueKey: 'PROJ-1', attachmentId: '10003' });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('内容是重定向后的 body', json && fs.readFileSync(json.path).toString() === 'same-host-redirect-body');
  const hits = aHeaders.slice(before).filter((h) => h.url.includes('10003'));
  check('重定向请求带上了 Authorization', hits.some((h) => /^Basic /.test(h.authorization || '')), JSON.stringify(hits.map((h) => h.authorization)));
}

console.log('\n=== 6. 跨主机重定向：认证头必须【不】带过去 ===');
{
  const before = bHeaders.length;
  const { json } = await call('/jira/api/attachment', { issueKey: 'PROJ-1', attachmentId: '10004' });
  check('ok:true（跨主机仍可下载）', json && json.ok === true, JSON.stringify(json));
  const hits = bHeaders.slice(before);
  check('异主机确实收到了请求', hits.length > 0, JSON.stringify(hits));
  check('异主机没有收到 Authorization', hits.every((h) => !h.authorization), JSON.stringify(hits.map((h) => h.authorization)));
}

console.log('\n=== 7. SSRF：附件 URL 指向别的主机必须被拒 ===');
{
  const { json } = await call('/jira/api/attachment', { issueKey: 'PROJ-1', attachmentId: '10006' });
  check('ok:false', json && json.ok === false, JSON.stringify(json));
  check('错误说明主机不一致', json && /主机或端口不一致/.test(json.error), JSON.stringify(json));
}

console.log('\n=== 8. 大小上限必须生效（上限 1MB，附件 999999999） ===');
{
  const { json } = await call('/jira/api/attachment', { issueKey: 'PROJ-1', attachmentId: '10007' });
  check('ok:false', json && json.ok === false, JSON.stringify(json));
  check('错误说明超过上限', json && /超过大小上限/.test(json.error), JSON.stringify(json));
}

console.log('\n=== 9. 附件 404 → 失败信息可读，不留空文件 ===');
{
  const { json } = await call('/jira/api/attachment', { issueKey: 'PROJ-1', attachmentId: '10002' });
  check('ok:false', json && json.ok === false, JSON.stringify(json));
  const dir = path.join(WS, 'jira-attachments', 'PROJ-1');
  const leftovers = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f === 'missing.zip') : [];
  check('失败没有留下空文件', leftovers.length === 0, JSON.stringify(leftovers));
}

console.log('\n=== 10. /jira/api/attachments 批量：成功与失败分离 ===');
{
  const { json } = await call('/jira/api/attachments', { issueKey: 'PROJ-1' });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('成功 4 个（10001/10003 同主机跳转/10004 跨主机跳转/10005 穿越名）', json && json.saved.length === 4, JSON.stringify(json && json.saved.map((s) => s.attachmentId)));
  check('失败 3 个（404/SSRF/超限）', json && json.failed.length === 3, JSON.stringify(json && json.failed.map((f) => f.attachmentId)));
  check('失败原因分类正确', json && json.failed.some((f) => /主机或端口不一致/.test(f.reason)) && json.failed.some((f) => /超过大小上限/.test(f.reason)),
    JSON.stringify(json && json.failed.map((f) => f.reason)));
  check('每个失败项都带 filename', json && json.failed.every((f) => typeof f.filename === 'string'));
  check('返回了目录', json && typeof json.dir === 'string' && json.dir.includes('jira-attachments'));
}

console.log('\n=== 11. 工单号格式校验（防注入） ===');
{
  const { json } = await call('/jira/api/issue', { issueKey: '../../secret' });
  check('ok:false', json && json.ok === false, JSON.stringify(json));
  check('错误说明格式不合法', json && /格式不合法/.test(json.error), JSON.stringify(json));
}

serverA.close();
serverB.close();
fs.rmSync(WS, { recursive: true, force: true });

console.log(`\n${'='.repeat(60)}`);
console.log(`结果：${passed} 通过，${failed} 失败`);
process.exit(failed === 0 ? 0 : 1);
