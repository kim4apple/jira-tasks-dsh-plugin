/**
 * Harness for the new POST /jira/api/issue-screen route (字段屏幕清单).
 *
 * Loads the REAL lib/index.js with a stubbed Cordis context and drives the
 * plugin's own route against a local mock JIRA — same style as
 * run-harness-detail.mjs / run-harness-fields.mjs.
 *
 * Covered:
 *   1. 正常返回：screenFields 是数组，顺序与 mock 的 editmeta `fields` 键顺序一致
 *   2. editmeta 404 → { ok:true, screenFields: [] }，不抛异常
 *   3. editmeta 返回非 JSON → 同样降级成空数组，不抛异常
 *   4. 认证头走 stdin（argv 里不含 token）
 *   5. 请求体带 issueKey 时 URL 正确拼接
 *
 * Run: node research/jira-src/harness/run-harness-screen.mjs
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

// 环境变量兜底会污染凭据解析（resolveFirst 会退回 process.env），这里先清干净。
for (const k of Object.keys(process.env)) {
  if (/^JIRA_/i.test(k)) delete process.env[k];
}

const WS = fs.mkdtempSync(path.join(os.tmpdir(), 'jira-screen-'));
const TOKEN = 'tok-SECRET-9f3a2b-do-not-leak';
const ISSUE_KEY = 'ENDEV-26542';

/** 所有 spawn 过的 argv —— 用来断言 token 没进命令行。 */
const spawnArgvs = [];

/**
 * editmeta 响应。`fields` 的键顺序是**刻意非字典序**的：只要实现偷偷排了序，
 * 测试就会红。
 */
const EDITMETA = {
  expand: 'projects,issuetypes,operations,editmeta,security',
  fields: {
    summary: { required: true, name: '摘要', schema: { type: 'string', custom: 'input' } },
    status: { required: false, name: '状态', schema: { type: 'status', custom: 'status' } },
    customfield_10871: { required: false, name: '故障影响性', schema: { type: 'string', custom: 'textfield' } },
    description: { required: false, name: '描述', schema: { type: 'string', custom: 'textarea' } },
    customfield_10900: { required: false, name: '优先级', schema: { type: 'option', custom: 'select' } },
  },
};

// ---------------------------------------------------------------------------
// Mock server
// ---------------------------------------------------------------------------

/**
 * 起一个 mock JIRA（随机端口）。
 * @param {(req, res, url: string) => void} handler
 */
async function startMock(handler) {
  const requests = [];
  const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];
    requests.push({ url: req.url, path: url, authorization: req.headers.authorization || null });
    handler(req, res, url);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  return { server, requests, baseUrl: `http://127.0.0.1:${port}` };
}

function serveJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

// ---------------------------------------------------------------------------
// Cordis stubs（与 run-harness-detail.mjs 同构）
// ---------------------------------------------------------------------------
function makeSubprocess() {
  return {
    async resolveExecutable(name) { return name === 'curl' ? '/usr/bin/curl' : name; },
    spawn({ argv, cwd, stdio }) {
      spawnArgvs.push(argv.slice());
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

/** 调一次 /jira/api/issue-screen。 */
async function callScreen(baseUrl, body) {
  const creds = { JIRA_TASKS_TOKEN: TOKEN };
  const config = { baseUrl };
  const { ctx, routes } = makeCtx(creds, config);
  apply(ctx, config);
  const handler = routes['/jira/api/issue-screen'];
  if (!handler) throw new Error('route not registered: /jira/api/issue-screen');
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

const servers = [];

console.log('\n=== 1. 正常返回：screenFields 是数组，顺序与 editmeta 字段键顺序一致 ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === `/rest/api/2/issue/${ISSUE_KEY}/editmeta`) { serveJson(res, 200, EDITMETA); return; }
    res.statusCode = 404; res.end(JSON.stringify({ errorMessages: ['not found'] }));
  });
  servers.push(mock.server);
  const { res, json } = await callScreen(mock.baseUrl, { issueKey: ISSUE_KEY });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('issueKey 原样回显', json && json.issueKey === ISSUE_KEY, JSON.stringify(json && json.issueKey));
  check('screenFields 是数组', json && Array.isArray(json.screenFields), JSON.stringify(json && json.screenFields));
  check('screenFields 只含字段 id（字符串）',
    json && json.screenFields.every((f) => typeof f === 'string'),
    JSON.stringify(json && json.screenFields));
  const want = Object.keys(EDITMETA.fields);
  check('顺序与 mock 的 editmeta 字段键顺序逐项一致',
    json && JSON.stringify(json.screenFields) === JSON.stringify(want),
    'got=' + JSON.stringify(json && json.screenFields) + ' want=' + JSON.stringify(want));
  // 反证：样本刻意非字典序，排序会被测出来。
  check('（反证）样本本身不是字典序', JSON.stringify(want.slice().sort()) !== JSON.stringify(want),
    'sorted=' + JSON.stringify(want.slice().sort()));
  check('包含自定义字段 id', json && json.screenFields.includes('customfield_10871'),
    JSON.stringify(json && json.screenFields));
  check('HTTP 200', res.statusCode === 200, String(res.statusCode));
}

console.log('\n=== 2. 请求体带 issueKey → URL 正确拼接 ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === `/rest/api/2/issue/${ISSUE_KEY}/editmeta`) { serveJson(res, 200, EDITMETA); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  await callScreen(mock.baseUrl, { issueKey: ISSUE_KEY });
  check('请求了 /rest/api/2/issue/<issueKey>/editmeta',
    mock.requests.some((r) => r.path === `/rest/api/2/issue/${ISSUE_KEY}/editmeta`),
    JSON.stringify(mock.requests.map((r) => r.path)));
  check('URL 里带上了工单号',
    mock.requests.some((r) => r.url.includes(ISSUE_KEY)),
    JSON.stringify(mock.requests.map((r) => r.url)));
  check('只请求了 editmeta（没顺手打别的接口）',
    mock.requests.every((r) => r.path.endsWith('/editmeta')),
    JSON.stringify(mock.requests.map((r) => r.path)));
}

console.log('\n=== 3. editmeta 404 → { ok:true, screenFields: [] }，不抛异常 ===');
{
  const mock = await startMock((req, res) => {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ errorMessages: ['Issue does not exist'], errors: {} }));
  });
  servers.push(mock.server);
  let json = null; let threw = null; let res = null;
  try {
    const r = await callScreen(mock.baseUrl, { issueKey: ISSUE_KEY });
    json = r.json; res = r.res;
  } catch (e) { threw = e; }
  check('没有抛异常', threw === null, threw && String(threw && threw.message));
  check('ok 仍为 true（降级不是报错）', json && json.ok === true, JSON.stringify(json));
  check('screenFields 是空数组', json && Array.isArray(json.screenFields) && json.screenFields.length === 0,
    JSON.stringify(json && json.screenFields));
  check('issueKey 仍然回显', json && json.issueKey === ISSUE_KEY, JSON.stringify(json));
  check('HTTP 200', res && res.statusCode === 200, res && String(res.statusCode));
}

console.log('\n=== 4. editmeta 返回非 JSON（登录页/网关错误页）→ 同样降级成空数组 ===');
{
  const mock = await startMock((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<html><body>Login page</body></html>');
  });
  servers.push(mock.server);
  let json = null; let threw = null;
  try {
    const r = await callScreen(mock.baseUrl, { issueKey: ISSUE_KEY });
    json = r.json;
  } catch (e) { threw = e; }
  check('没有抛异常', threw === null, threw && String(threw && threw.message));
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('screenFields 是空数组', json && Array.isArray(json.screenFields) && json.screenFields.length === 0,
    JSON.stringify(json && json.screenFields));
}

console.log('\n=== 5. editmeta 403（权限不足）→ 同样降级成空数组 ===');
{
  const mock = await startMock((req, res) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ errorMessages: ['You do not have permission to edit it'] }));
  });
  servers.push(mock.server);
  const { json } = await callScreen(mock.baseUrl, { issueKey: ISSUE_KEY });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('screenFields 是空数组', json && Array.isArray(json.screenFields) && json.screenFields.length === 0,
    JSON.stringify(json && json.screenFields));
}

console.log('\n=== 6. v2 的 editmeta 404 → 自动改用 v3 ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === `/rest/api/2/issue/${ISSUE_KEY}/editmeta`) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ errorMessages: ['gone'] }));
      return;
    }
    if (url === `/rest/api/3/issue/${ISSUE_KEY}/editmeta`) { serveJson(res, 200, EDITMETA); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const { json } = await callScreen(mock.baseUrl, { issueKey: ISSUE_KEY });
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('字段来自 v3', json && json.screenFields && json.screenFields.length === Object.keys(EDITMETA.fields).length,
    JSON.stringify(json && json.screenFields));
  check('先打 v2 再打 v3',
    mock.requests.map((r) => r.path).join(',').includes(
      `/rest/api/2/issue/${ISSUE_KEY}/editmeta,/rest/api/3/issue/${ISSUE_KEY}/editmeta`),
    JSON.stringify(mock.requests.map((r) => r.path)));
}

console.log('\n=== 7. 认证头走 stdin（argv 里不含 token） ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === `/rest/api/2/issue/${ISSUE_KEY}/editmeta`) { serveJson(res, 200, EDITMETA); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const argvBefore = spawnArgvs.length;
  const { json } = await callScreen(mock.baseUrl, { issueKey: ISSUE_KEY });
  const argvUsed = spawnArgvs.slice(argvBefore);
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('JIRA 收到了 Authorization 头', mock.requests.length > 0
    && mock.requests[0].authorization === 'Bearer ' + TOKEN,
    JSON.stringify(mock.requests.map((r) => r.authorization)));
  check('argv 里不含 token', argvUsed.length > 0
    && argvUsed.every((argv) => !argv.join(' ').includes(TOKEN)),
    JSON.stringify(argvUsed));
  check('用的是 curl --config - （stdin 通道）', argvUsed.length > 0
    && argvUsed.some((argv) => argv.includes('--config') && argv[argv.indexOf('--config') + 1] === '-'),
    JSON.stringify(argvUsed));
  check('argv 里不含 Authorization 字样', argvUsed.length > 0
    && argvUsed.every((argv) => !argv.join(' ').toLowerCase().includes('authorization')),
    JSON.stringify(argvUsed));
}

console.log('\n=== 8. 工单号校验（防注入）与缺参 ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === `/rest/api/2/issue/${ISSUE_KEY}/editmeta`) { serveJson(res, 200, EDITMETA); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const bad = await callScreen(mock.baseUrl, { issueKey: '../../secret' });
  check('非法工单号 → ok:false', bad.json && bad.json.ok === false, JSON.stringify(bad.json));
  check('错误说明格式不合法', bad.json && /格式不合法/.test(bad.json.error), JSON.stringify(bad.json));
  const missing = await callScreen(mock.baseUrl, {});
  check('缺工单号 → ok:false', missing.json && missing.json.ok === false, JSON.stringify(missing.json));
  check('错误说明未提供工单号', missing.json && /未提供工单号/.test(missing.json.error), JSON.stringify(missing.json));
  check('非法工单号没有发出请求', mock.requests.length === 0, JSON.stringify(mock.requests.map((r) => r.path)));
}

console.log('\n=== 9. 非 POST 请求被拒（405） ===');
{
  const mock = await startMock((req, res) => { res.statusCode = 200; res.end('{}'); });
  servers.push(mock.server);
  const creds = { JIRA_TASKS_TOKEN: TOKEN };
  const config = { baseUrl: mock.baseUrl };
  const { ctx, routes } = makeCtx(creds, config);
  apply(ctx, config);
  const handler = routes['/jira/api/issue-screen'];
  const res = await new Promise((resolve) => {
    const req = { method: 'GET', on() {} };
    const r = {
      statusCode: 200, headers: null, body: '',
      writeHead(c, h) { this.statusCode = c; this.headers = h; },
      end(t) { this.body = t == null ? '' : String(t); resolve(this); },
    };
    handler(req, r);
  });
  check('GET 返回 405', res.statusCode === 405, String(res.statusCode));
  check('Allow: POST', res.headers && res.headers.Allow === 'POST', JSON.stringify(res.headers));
}

for (const s of servers) s.close();
fs.rmSync(WS, { recursive: true, force: true });

console.log(`\n${'='.repeat(60)}`);
console.log(`结果：${passed} 通过，${failed} 失败`);
process.exit(failed === 0 ? 0 : 1);
