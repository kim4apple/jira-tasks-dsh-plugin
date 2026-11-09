/**
 * End-to-end harness for the patched dsh-jira-tasks Host half.
 *
 * It loads the REAL patched `lib/index.js`, mounts it with a stubbed Cordis
 * context (subprocess / credentials / sandboxPolicy / webServer), and drives the
 * plugin's own `/jira/api/test` route against a local mock Jira that records
 * every Authorization header it receives.
 *
 * This exercises the actual shipped code path — the same buildAuthHeader /
 * resolveConnection / handleTest functions the running plugin uses — instead of
 * re-implementing the logic in a test.
 *
 * Run: node research/jira-src/harness/run-harness.mjs
 */
import http from 'node:http';
import cp from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..');
const { apply } = await import(path.join(REPO, 'lib', 'index.js'));

const PORT = 8791;
const MOCK = `http://127.0.0.1:${PORT}`;
const CLOUD_BASE = 'http://jira-fake.atlassian.net';

// ---------------------------------------------------------------------------
// Mock Jira
// ---------------------------------------------------------------------------
const VALID = new Map([
  ['alice:s3cr3t', 'Alice'],
  ['bob@corp.com:tok42', 'Bob'],
  ['goodtoken', 'Token User'],
  ['alice:pa:ss', 'ColonPass'],
]);

const seen = [];

const mock = http.createServer((req, res) => {
  const header = req.headers.authorization || '';
  seen.push({ url: req.url, authorization: header });

  const m = /^(\w+)\s+(.+)$/.exec(header.trim());
  let identity = null;
  if (m) {
    const raw = m[1].toLowerCase() === 'basic'
      ? Buffer.from(m[2], 'base64').toString('utf-8')
      : m[2];
    if (VALID.has(raw)) identity = VALID.get(raw);
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (!identity) {
    res.statusCode = 401;
    res.end(JSON.stringify({ errorMessages: ['Authentication required'] }));
    return;
  }
  res.statusCode = 200;
  res.end(JSON.stringify({ name: identity.toLowerCase(), displayName: identity }));
});

await new Promise((r) => mock.listen(PORT, '127.0.0.1', r));

// ---------------------------------------------------------------------------
// Cordis stubs
// ---------------------------------------------------------------------------
const spawnLog = [];

function makeSubprocess() {
  return {
    async resolveExecutable(name) {
      return name === 'curl' ? '/usr/bin/curl' : name;
    },
    spawn({ argv, cwd, stdio }) {
      spawnLog.push(argv.slice());

      // Rewrite a *.atlassian.net destination to the local mock, exactly like a
      // /etc/hosts entry would. The plugin still sees the ORIGINAL baseUrl, so
      // its Cloud-vs-Server detection is exercised for real.
      const rewritten = argv.map((a) =>
        typeof a === 'string' && a.includes('jira-fake.atlassian.net')
          ? a.replace('jira-fake.atlassian.net', `127.0.0.1:${PORT}`)
          : a);

      const child = cp.spawn(rewritten[0], rewritten.slice(1), { cwd, stdio: ['pipe', 'pipe', 'pipe'] });
      let out = '';
      let err = '';
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
      if (name === 'sandboxPolicy') return { workspaceRoot: '/tmp' };
      if (name === 'webServer') {
        return {
          register({ path: p, handler }) { routes[p] = handler; return () => {}; },
        };
      }
      throw new Error('unknown service: ' + name);
    },
    inject(_names, fn) {
      fn({
        effect(f) { const d = f(); if (typeof d === 'function') d(); },
        settings: { configure() { return () => {}; } },
      });
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
      writeHead(code, headers) { this.statusCode = code; this.headers = headers; },
      end(text) { this.body = text == null ? '' : String(text); resolve(this); },
    };
    Promise.resolve(handler(req, res)).catch(reject);
    setImmediate(() => {
      const data = Buffer.from(JSON.stringify(bodyObj));
      for (const cb of (listeners.data || [])) cb(data);
      for (const cb of (listeners.end || [])) cb();
    });
  });
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------
let passed = 0;
let failed = 0;

function check(name, condition, detail) {
  if (condition) { passed++; console.log('  ✓ ' + name); }
  else { failed++; console.log('  ✗ ' + name + (detail ? '\n      → ' + detail : '')); }
}

function lastHeader() {
  const h = seen[seen.length - 1];
  return h ? h.authorization : '';
}

function decodeBasic(header) {
  const m = /^Basic\s+(.+)$/i.exec(header || '');
  return m ? Buffer.from(m[1], 'base64').toString('utf-8') : null;
}

async function probe({ creds = {}, config = {}, body = {} }) {
  seen.length = 0;
  spawnLog.length = 0;
  const { ctx, routes } = makeCtx(creds);
  apply(ctx, config);
  const handler = routes['/jira/api/test'];
  if (!handler) throw new Error('route /jira/api/test was not registered');
  const res = await callRoute(handler, body);
  let json = null;
  try { json = JSON.parse(res.body); } catch (e) { /* keep null */ }
  return { res, json, header: lastHeader(), argv: spawnLog.slice() };
}

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------
console.log('\n=== 1. 账号 + 密码（Config 账号 + 凭据存储密码）→ Basic ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_PASSWORD: 's3cr3t' },
    config: { baseUrl: MOCK, username: 'alice' },
  });
  check('header 是 Basic', /^Basic /.test(r.header), r.header);
  check('载荷为 alice:s3cr3t', decodeBasic(r.header) === 'alice:s3cr3t', decodeBasic(r.header));
  check('响应 ok:true', r.json && r.json.ok === true, JSON.stringify(r.json));
  check('authMode 为 basic', r.json && r.json.authMode === 'basic', JSON.stringify(r.json));
  check('响应不含密码', !r.res.body.includes('s3cr3t'), r.res.body);
}

console.log('\n=== 2. 账号 + 密码（草稿值，未保存）→ Basic ===');
{
  const r = await probe({
    creds: {},
    config: { baseUrl: MOCK },
    body: { baseUrl: MOCK, username: 'alice', password: 's3cr3t' },
  });
  check('header 是 Basic', /^Basic /.test(r.header), r.header);
  check('载荷为 alice:s3cr3t', decodeBasic(r.header) === 'alice:s3cr3t', decodeBasic(r.header));
  check('authMode 为 basic', r.json && r.json.authMode === 'basic', JSON.stringify(r.json));
}

console.log('\n=== 3. 只有令牌（无冒号）→ Bearer ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_TOKEN: 'goodtoken' },
    config: { baseUrl: MOCK },
  });
  check('header 是 Bearer', r.header === 'Bearer goodtoken', r.header);
  check('authMode 为 bearer', r.json && r.json.authMode === 'bearer', JSON.stringify(r.json));
}

console.log('\n=== 4. 旧值向后兼容：令牌含冒号 → 仍走 Basic ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_TOKEN: 'alice:s3cr3t' },
    config: { baseUrl: MOCK },
  });
  check('header 是 Basic', /^Basic /.test(r.header), r.header);
  check('载荷为 alice:s3cr3t', decodeBasic(r.header) === 'alice:s3cr3t', decodeBasic(r.header));
}

console.log('\n=== 5. 优先级：显式账号密码压过旧值 ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_TOKEN: 'alice:s3cr3t', JIRA_TASKS_PASSWORD: 's3cr3t' },
    config: { baseUrl: MOCK, username: 'alice' },
  });
  check('载荷为 alice:s3cr3t', decodeBasic(r.header) === 'alice:s3cr3t', decodeBasic(r.header));
  check('authMode 为 basic', r.json && r.json.authMode === 'basic', JSON.stringify(r.json));
}

console.log('\n=== 6. 密码含冒号 → Basic 只按第一个冒号切分 ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_PASSWORD: 'pa:ss' },
    config: { baseUrl: MOCK, username: 'alice' },
  });
  check('载荷保留完整密码 alice:pa:ss', decodeBasic(r.header) === 'alice:pa:ss', decodeBasic(r.header));
}

console.log('\n=== 7. 非 Latin-1 密码不得抛异常（旧 btoa 会炸） ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_PASSWORD: '密码🔒' },
    config: { baseUrl: MOCK, username: '张三' },
  });
  check('header 是 Basic', /^Basic /.test(r.header), r.header);
  check('载荷为 UTF-8 正确编码', decodeBasic(r.header) === '张三:密码🔒', decodeBasic(r.header));
}

console.log('\n=== 8. 密码错误 → 401 + 非 Cloud 提示 ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_PASSWORD: 'wrong' },
    config: { baseUrl: MOCK, username: 'alice' },
  });
  check('code 为 auth', r.json && r.json.code === 'auth', JSON.stringify(r.json));
  check('提示提到 PAT/API token', r.json && /PAT|API token/.test(r.json.error), JSON.stringify(r.json));
  check('提示不误报 Cloud', r.json && !/Cloud 不接受/.test(r.json.error), JSON.stringify(r.json));
  check('authMode 仍返回 basic', r.json && r.json.authMode === 'basic', JSON.stringify(r.json));
}

console.log('\n=== 9. Cloud 域 + 账号密码 → 401 + Cloud 专属提示 ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_PASSWORD: 'wrong' },
    config: { baseUrl: CLOUD_BASE, username: 'alice' },
  });
  check('code 为 auth', r.json && r.json.code === 'auth', JSON.stringify(r.json));
  check('提示明确说 Cloud 不接受账号密码', r.json && /Cloud 不接受账号密码/.test(r.json.error), JSON.stringify(r.json));
  check('提示给出替代方案', r.json && /API token|PAT/.test(r.json.error), JSON.stringify(r.json));
}

console.log('\n=== 10. 未配置任何凭据 → unconfigured ===');
{
  const r = await probe({ creds: {}, config: { baseUrl: MOCK } });
  check('code 为 unconfigured', r.json && r.json.code === 'unconfigured', JSON.stringify(r.json));
  check('文案提到账号密码或令牌', r.json && /账号密码或访问令牌/.test(r.json.error), JSON.stringify(r.json));
}

console.log('\n=== 11. 安全不变量：认证头不得出现在 argv ===');
{
  const r = await probe({
    creds: { JIRA_TASKS_PASSWORD: 's3cr3t' },
    config: { baseUrl: MOCK, username: 'alice' },
  });
  const leaked = r.argv.some((argv) => argv.some((a) => typeof a === 'string' && (a.includes('Basic ') || a.includes('s3cr3t') || a.includes('YWxpY2U6'))));
  check('argv 中没有认证头material', !leaked, JSON.stringify(r.argv));
  const hasStdinConfig = r.argv.some((argv) => argv.includes('--config') && argv.includes('-'));
  check('仍通过 curl --config - 走 stdin', hasStdinConfig, JSON.stringify(r.argv));
}

console.log('\n=== 12. 凭据存储回退：环境变量兜底 ===');
{
  process.env.JIRA_USERNAME = 'bob@corp.com';
  process.env.JIRA_PASSWORD = 'tok42';
  const r = await probe({ creds: {}, config: { baseUrl: MOCK } });
  check('载荷为 bob@corp.com:tok42', decodeBasic(r.header) === 'bob@corp.com:tok42', decodeBasic(r.header));
  delete process.env.JIRA_USERNAME;
  delete process.env.JIRA_PASSWORD;
}

mock.close();

console.log(`\n${'='.repeat(60)}`);
console.log(`结果：${passed} 通过，${failed} 失败`);
process.exit(failed === 0 ? 0 : 1);
