/**
 * Harness for the new POST /jira/api/fields route (字段定义清单).
 *
 * Loads the REAL lib/index.js with a stubbed Cordis context and drives the
 * plugin's own route against local mock JIRA servers — same style as
 * run-harness-detail.mjs.
 *
 * Covered:
 *   1. 正常返回：fields 是数组，每项有 id/name/custom/type
 *   2. type 来自 schema.type；schema 缺失时 type === ''
 *   3. 数组顺序与 JIRA 返回一致（没被排过序）
 *   4. v2 返回 404 → 自动改用 v3 并成功
 *   5. v2 和 v3 都失败 → { ok:false, error:... }，不抛异常
 *   6. 缓存生效：连续调两次，第二次不再打 JIRA（请求计数只 +1）
 *   7. 认证头仍走 stdin（argv 里不含 token）
 *
 * 每个场景用**各自的 mock 服务器**（随机端口）：Host 侧的字段缓存按 JIRA 地址
 * 分桶，不同端口 = 不同实例 = 互不干扰。
 *
 * Run: node research/jira-src/harness/run-harness-fields.mjs
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

const WS = fs.mkdtempSync(path.join(os.tmpdir(), 'jira-fields-'));
const TOKEN = 'tok-SECRET-9f3a2b-do-not-leak';

/** 所有 spawn 过的 argv —— 用来断言 token 没进命令行。 */
const spawnArgvs = [];

/**
 * 字段定义样本。顺序是**刻意非字典序**的：只要实现偷偷排了序，测试就会红。
 * 最后一项故意不带 schema，用来验证 type === ''；第二项故意不带 description，
 * 用来验证 description === ''。
 */
const FIELD_DEFS = [
  { id: 'customfield_10870', name: '说明功能实现差异', custom: true, description: '请说明与设计稿的差异', schema: { type: 'string', items: 'string', custom: 'textfield' } },
  { id: 'zzz_status', name: '状态', custom: false, schema: { type: 'status', custom: 'status' } },
  { id: 'aaa_summary', name: '摘要', custom: false, schema: { type: 'string', custom: 'input' } },
  { id: 'customfield_10900', name: '优先级', custom: true, description: '请选择优先级', schema: { type: 'option', custom: 'select' } },
  { id: 'no_schema_field', name: '没有 schema 的字段', custom: true },
];

/**
 * 工单响应（带 expand=names,schema 的效果）：顶层多出 names / schema 两个对象。
 * names 的键顺序即 JIRA 给这个工单的字段顺序。
 */
const ISSUE_WITH_EXPAND = {
  key: 'PROJ-1',
  names: {
    customfield_10870: '说明功能实现差异',
    customfield_10900: '优先级',
    summary: '摘要'
  },
  schema: {
    customfield_10870: { type: 'string', items: 'string', custom: 'textfield' },
    customfield_10900: { type: 'option', custom: 'select' },
    summary: { type: 'string', custom: 'input' }
  },
  fields: {
    summary: '登录后 500',
    description: '复现步骤…',
    customfield_10870: '与设计稿略有差异',
    customfield_10900: { value: 'P1' }
  }
};

// ---------------------------------------------------------------------------
// Mock server
// ---------------------------------------------------------------------------

/**
 * 起一个只按 handler 派发的 mock JIRA（随机端口）。
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

/** 字段接口的标准应答：v2 可用、v3 也可用。 */
function serveFields(res, status, body) {
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

/**
 * 调一次 /jira/api/fields。
 * **每次都用全新的 ctx + 全新 apply()**：这样「缓存生效」的断言才能证明缓存放在
 * 模块作用域（apply 之外），而不是被每次 apply 重建。
 */
async function callFields(baseUrl, { method = 'POST' } = {}) {
  const creds = { JIRA_TASKS_TOKEN: TOKEN };
  const config = { baseUrl };
  const { ctx, routes } = makeCtx(creds, config);
  apply(ctx, config);
  const handler = routes['/jira/api/fields'];
  if (!handler) throw new Error('route not registered: /jira/api/fields');
  const res = await callRoute(handler, {});
  let json = null;
  try { json = JSON.parse(res.body); } catch (e) { /* keep null */ }
  return { res, json };
}

/** 调一次 /jira/api/issue（同样每次全新 ctx + 全新 apply）。 */
async function callIssue(baseUrl, issueKey) {
  const creds = { JIRA_TASKS_TOKEN: TOKEN };
  const config = { baseUrl };
  const { ctx, routes } = makeCtx(creds, config);
  apply(ctx, config);
  const handler = routes['/jira/api/issue'];
  if (!handler) throw new Error('route not registered: /jira/api/issue');
  const res = await callRoute(handler, { issueKey });
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

console.log('\n=== 1. 正常返回：fields 是数组，每项含 id/name/custom/type ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') { serveFields(res, 200, FIELD_DEFS); return; }
    res.statusCode = 404; res.end(JSON.stringify({ errorMessages: ['not found'] }));
  });
  servers.push(mock.server);
  const { res, json } = await callFields(mock.baseUrl);
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('HTTP 200', res.statusCode === 200, String(res.statusCode));
  check('fields 是数组', json && Array.isArray(json.fields), JSON.stringify(json && json.fields));
  check('字段条数与 JIRA 一致', json && json.fields.length === FIELD_DEFS.length,
    String(json && json.fields && json.fields.length));
  check('每项都有 id/name/custom/type/description',
    json && json.fields.every((f) =>
      typeof f.id === 'string' && typeof f.name === 'string'
      && typeof f.custom === 'boolean' && typeof f.type === 'string'
      && typeof f.description === 'string'),
    JSON.stringify(json && json.fields));
  check('id 正确', json && json.fields[0].id === 'customfield_10870', JSON.stringify(json && json.fields[0]));
  check('name 是可读名称', json && json.fields[0].name === '说明功能实现差异', JSON.stringify(json && json.fields[0]));
  check('custom 正确（true）', json && json.fields[0].custom === true, JSON.stringify(json && json.fields[0]));
  check('custom 正确（false，系统字段）', json && json.fields[1].custom === false, JSON.stringify(json && json.fields[1]));
  check('命中 v2 端点', mock.requests.some((r) => r.path === '/rest/api/2/field'),
    JSON.stringify(mock.requests.map((r) => r.path)));
}

console.log('\n=== 2. type 来自 schema.type；schema 缺失时 type === "" ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') { serveFields(res, 200, FIELD_DEFS); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const { json } = await callFields(mock.baseUrl);
  check('customfield_10870 → string', json.fields[0].type === 'string', json.fields[0].type);
  check('状态 → status', json.fields[1].type === 'status', json.fields[1].type);
  check('摘要 → string', json.fields[2].type === 'string', json.fields[2].type);
  check('优先级 → option', json.fields[3].type === 'option', json.fields[3].type);
  check('schema 缺失 → type === ""', json.fields[4].type === '', JSON.stringify(json.fields[4]));
  check('schema 缺失项其余字段照常', json.fields[4].id === 'no_schema_field' && json.fields[4].name === '没有 schema 的字段'
    && json.fields[4].custom === true, JSON.stringify(json.fields[4]));
}

console.log('\n=== 3. 数组顺序与 JIRA 返回一致（没被排过序） ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') { serveFields(res, 200, FIELD_DEFS); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const { json } = await callFields(mock.baseUrl);
  const got = json.fields.map((f) => f.id);
  const want = FIELD_DEFS.map((f) => f.id);
  check('顺序与 JIRA 返回逐项一致', JSON.stringify(got) === JSON.stringify(want),
    'got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want));
  // 反证：按 id 排序后的顺序与返回顺序不同，说明这条断言确实能抓到「偷偷排序」。
  const sorted = want.slice().sort();
  check('（反证）样本本身不是字典序，排序会被测出来', JSON.stringify(sorted) !== JSON.stringify(want),
    'sorted=' + JSON.stringify(sorted));
  check('（反证）按 name 排序也不同',
    JSON.stringify(want.slice().sort((a, b) => a.localeCompare(b))) !== JSON.stringify(want));
}

console.log('\n=== 4. v2 返回 404 → 自动改用 v3 并成功 ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ errorMessages: ['The requested URL does not exist'], errors: {} }));
      return;
    }
    if (url === '/rest/api/3/field') { serveFields(res, 200, FIELD_DEFS); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const { json } = await callFields(mock.baseUrl);
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('字段来自 v3', json && Array.isArray(json.fields) && json.fields.length === FIELD_DEFS.length, JSON.stringify(json));
  check('确实先打了 v2', mock.requests.some((r) => r.path === '/rest/api/2/field'),
    JSON.stringify(mock.requests.map((r) => r.path)));
  check('确实回退打了 v3', mock.requests.some((r) => r.path === '/rest/api/3/field'),
    JSON.stringify(mock.requests.map((r) => r.path)));
  check('v2 在 v3 之前', mock.requests.map((r) => r.path).indexOf('/rest/api/2/field')
    < mock.requests.map((r) => r.path).indexOf('/rest/api/3/field'),
    JSON.stringify(mock.requests.map((r) => r.path)));
}

console.log('\n=== 5. v2 和 v3 都失败 → { ok:false, error:... }，不抛异常 ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ errorMessages: ['v2 gone'], errors: {} }));
      return;
    }
    if (url === '/rest/api/3/field') {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify({ errorMessages: ['v3 exploded'], errors: {} }));
      return;
    }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  let json = null; let threw = null; let res = null;
  try {
    const r = await callFields(mock.baseUrl);
    json = r.json; res = r.res;
  } catch (e) { threw = e; }
  check('没有抛异常', threw === null, threw && String(threw && threw.message));
  check('ok:false', json && json.ok === false, JSON.stringify(json));
  check('error 是非空字符串', json && typeof json.error === 'string' && json.error.length > 0, JSON.stringify(json));
  check('返回的是最后一个错误（v3）', json && /rest\/api\/3\/field/.test(json.error), JSON.stringify(json));
  check('错误里带了 JIRA 的原文', json && /v3 exploded/.test(json.error), JSON.stringify(json));
  check('HTTP 仍是 200（JSON 错误信封，不是 500 崩溃）', res && res.statusCode === 200, res && String(res.statusCode));
  check('没有 fields 字段', json && json.fields === undefined, JSON.stringify(json));
}

console.log('\n=== 6. 缓存生效：连续调两次，第二次不再打 JIRA ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') { serveFields(res, 200, FIELD_DEFS); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);

  const first = await callFields(mock.baseUrl);
  const countAfterFirst = mock.requests.length;
  const second = await callFields(mock.baseUrl);   // 新的 ctx + 新的 apply()
  const countAfterSecond = mock.requests.length;

  check('第一次 ok:true', first.json && first.json.ok === true, JSON.stringify(first.json));
  check('第一次打了 JIRA（计数 1）', countAfterFirst === 1, String(countAfterFirst));
  check('第二次 ok:true', second.json && second.json.ok === true, JSON.stringify(second.json));
  check('第二次没有再打 JIRA（计数仍为 1）', countAfterSecond === 1,
    `after1=${countAfterFirst} after2=${countAfterSecond}`);
  check('两次返回的字段一致', JSON.stringify(first.json.fields) === JSON.stringify(second.json.fields),
    JSON.stringify(first.json.fields) + ' vs ' + JSON.stringify(second.json.fields));

  // 换个实例（不同端口）→ 缓存必须失效，重新打 JIRA。
  const other = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') { serveFields(res, 200, FIELD_DEFS); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(other.server);
  await callFields(other.baseUrl);
  check('换实例后缓存失效（重新打了 JIRA）', other.requests.length === 1, String(other.requests.length));
}

console.log('\n=== 7. 认证头仍然走 stdin（argv 里不含 token） ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') { serveFields(res, 200, FIELD_DEFS); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const argvBefore = spawnArgvs.length;
  const { json } = await callFields(mock.baseUrl);
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

console.log('\n=== 8. 字段定义项带 description（缺省时为 ""） ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') { serveFields(res, 200, FIELD_DEFS); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const { json } = await callFields(mock.baseUrl);
  check('description 取字段的帮助文本', json.fields[0].description === '请说明与设计稿的差异',
    JSON.stringify(json.fields[0]));
  check('第二个自定义字段也有 description', json.fields[3].description === '请选择优先级',
    JSON.stringify(json.fields[3]));
  check('没有 description 的字段 → ""', json.fields[1].description === '',
    JSON.stringify(json.fields[1]));
}

console.log('\n=== 9. JIRA 返回 description:null → 归一化成 "" ===');
{
  const withNull = [{ id: 'f1', name: 'N', custom: true, description: null, schema: { type: 'string' } }];
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/field') { serveFields(res, 200, withNull); return; }
    res.statusCode = 404; res.end('{}');
  });
  servers.push(mock.server);
  const { json } = await callFields(mock.baseUrl);
  check('ok:true', json && json.ok === true, JSON.stringify(json));
  check('description === ""', json && json.fields[0].description === '', JSON.stringify(json && json.fields[0]));
}

console.log('\n=== 10. /jira/api/issue 用 expand=names,schema 单次取数 ===');
{
  const mock = await startMock((req, res, url) => {
    if (url === '/rest/api/2/issue/PROJ-1') { serveFields(res, 200, ISSUE_WITH_EXPAND); return; }
    if (url === '/rest/api/2/issue/PROJ-1/comment') {
      serveFields(res, 200, { startAt: 0, total: 0, comments: [] }); return;
    }
    res.statusCode = 404; res.end(JSON.stringify({ errorMessages: ['not found'] }));
  });
  servers.push(mock.server);
  const { json } = await callIssue(mock.baseUrl, 'PROJ-1');
  check('ok:true', json && json.ok === true, JSON.stringify(json));

  // 请求 URL 必须带上 expand=names,schema
  const issueReq = mock.requests.find((r) => r.path === '/rest/api/2/issue/PROJ-1');
  check('请求了工单接口', !!issueReq, JSON.stringify(mock.requests.map((r) => r.url)));
  check('URL 带上了 ?expand=names,schema',
    issueReq && /[?&]expand=names,schema(?:&|$)/.test(issueReq.url),
    issueReq && issueReq.url);
  check('expand 同时含 names 与 schema',
    issueReq && /names/.test(issueReq.url) && /schema/.test(issueReq.url),
    issueReq && issueReq.url);

  // 响应里多出 fieldNames / fieldSchemas
  check('响应含 fieldNames', json && json.fieldNames && typeof json.fieldNames === 'object',
    JSON.stringify(json && json.fieldNames));
  check('响应含 fieldSchemas', json && json.fieldSchemas && typeof json.fieldSchemas === 'object',
    JSON.stringify(json && json.fieldSchemas));
  check('fieldNames 能拿到字段名', json && json.fieldNames['customfield_10870'] === '说明功能实现差异',
    JSON.stringify(json && json.fieldNames));
  check('fieldSchemas 能拿到字段类型',
    json && json.fieldSchemas['customfield_10870'] && json.fieldSchemas['customfield_10870'].type === 'string',
    JSON.stringify(json && json.fieldSchemas));
  check('fieldSchemas 也覆盖 option 类型',
    json && json.fieldSchemas['customfield_10900'] && json.fieldSchemas['customfield_10900'].type === 'option',
    JSON.stringify(json && json.fieldSchemas));
  check('fieldNames 的键顺序 = JIRA 的字段顺序（未排序）',
    json && JSON.stringify(Object.keys(json.fieldNames)) === JSON.stringify(Object.keys(ISSUE_WITH_EXPAND.names)),
    JSON.stringify(json && Object.keys(json.fieldNames)));

  // 既有键没被动过
  check('既有键仍在（summary/customFields/allFields）',
    json && json.summary === '登录后 500'
    && json.customFields && json.customFields.customfield_10870 === '与设计稿略有差异'
    && json.allFields && json.allFields.description === '复现步骤…',
    JSON.stringify(json && { summary: json.summary, customFields: json.customFields }));
}

console.log('\n=== 11. 非 POST 请求被拒（405） ===');{
  const mock = await startMock((req, res) => { res.statusCode = 200; res.end('[]'); });
  servers.push(mock.server);
  const creds = { JIRA_TASKS_TOKEN: TOKEN };
  const config = { baseUrl: mock.baseUrl };
  const { ctx, routes } = makeCtx(creds, config);
  apply(ctx, config);
  const handler = routes['/jira/api/fields'];
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
