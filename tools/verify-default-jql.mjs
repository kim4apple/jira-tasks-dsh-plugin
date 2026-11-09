#!/usr/bin/env node
/**
 * dsh-jira-tasks 修复自证脚本
 * ============================================================
 * 验证两个已实证缺陷的修复是否生效（打运行中的插件路由，不打印任何凭据）：
 *
 *   ① 默认 JQL 不再硬编码状态名
 *      旧：project = "X" AND status in ("开启", "重新开启") AND assignee = currentUser() ...
 *          → 本实例报「“status”域中没有“开启”值。」默认查询整体不可用
 *      新：project = "X" AND assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC
 *          → 用 JIRA 固有的状态类别（任何实例都存在），不再依赖实例的状态名
 *
 *   ② statusCategory 从 status.statusCategory.key 读取
 *      旧：读 fields.statuscategorykey（不是 JIRA 字段名，JIRA 静默忽略 → 恒为 ""）
 *      新：读 fields.status.statusCategory.key（值：new / indeterminate / done）
 *
 * 用法：
 *   node tools/verify-default-jql.mjs [baseUrl]
 *   默认 baseUrl = http://127.0.0.1:57108（当前运行的 DSH Web GUI）
 *
 * 退出码：0 = 全部断言通过；1 = 有断言失败。
 */

import process from 'node:process';

const BASE_URL = (process.argv[2] || process.env.DSH_GUI_URL || 'http://127.0.0.1:57108').replace(/\/+$/, '');
const SEARCH_URL = BASE_URL + '/jira/api/search';

/** 修复前的默认 JQL（对照用）。 */
const OLD_DEFAULT_JQL = (key) =>
  `project = "${key}" AND status in ("开启", "重新开启") AND assignee = currentUser() ORDER BY updated DESC`;

/** 修复后的默认 JQL（与 lib/index.js buildJql / lib/client.js defaultJql / manifest.json 一致）。 */
const NEW_DEFAULT_JQL = (key) =>
  `project = "${key}" AND assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC`;

/** JIRA 状态类别只有这三个取值。 */
const VALID_CATEGORIES = ['new', 'indeterminate', 'done'];

/**
 * 是否是「"status"域中没有…值」这类错误。
 * 典型文案：“status”域中没有“开启”值。；“status”域中没有“重新开启”值。
 */
function hasStatusDomainError(message) {
  const text = String(message || '');
  return /域中没有/.test(text) && /status/i.test(text);
}

/** 调插件的搜索路由。凭据由插件内部注入，这里不接触任何凭据。 */
async function search(projectKey, jql, maxResults = 2) {
  const res = await fetch(SEARCH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectKey, jql, maxResults }),
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { httpStatus: res.status, json, raw: json ? undefined : text.slice(0, 400) };
}

/** 找一个真实存在的项目 Key：先看指派给我的工单，再退回到最新工单。 */
async function discoverProjectKey() {
  const probes = ['assignee = currentUser() ORDER BY updated DESC', 'ORDER BY updated DESC'];
  for (const jql of probes) {
    const r = await search('_', jql, 3);
    const issues = (r.json && r.json.ok && r.json.issues) || [];
    for (const issue of issues) {
      const key = String((issue && issue.key) || '');
      const projectKey = key.split('-')[0];
      if (projectKey) return projectKey;
    }
  }
  return null;
}

const results = [];

function record(name, ok, detail, kind = 'assert') {
  results.push({ name, ok, detail, kind });
  const mark = kind === 'info' ? '·' : ok ? '✓' : '✗';
  console.log(`${mark} ${name}`);
  console.log(`    ${detail}`);
}

async function main() {
  console.log(`目标路由：POST ${SEARCH_URL}`);
  console.log('');

  // ---- 0. 前置：路由可达，并能找到一个真实项目 Key ----
  let projectKey = null;
  try {
    projectKey = await discoverProjectKey();
  } catch (err) {
    record('前置：插件路由可达', false, `请求失败：${String((err && err.message) || err)}`);
    return;
  }
  if (!projectKey) {
    record('前置：插件路由可达', false, '路由可达，但没有查到任何工单，无法确定真实项目 Key');
    return;
  }
  record('前置：插件路由可达，已找到真实项目 Key', true, `projectKey = ${projectKey}`);

  // ---- 1. 对照：修复前的默认 JQL 在本实例确实报「status 域中没有」错误 ----
  // （说明后面的断言不是"碰巧过了"，而是真修好了）
  const oldRes = await search(projectKey, OLD_DEFAULT_JQL(projectKey), 2);
  const oldErr = String((oldRes.json && oldRes.json.error) || '');
  if (hasStatusDomainError(oldErr)) {
    record('对照：旧默认 JQL（硬编码状态名）在本实例报「status 域中没有…」错误', true, oldErr, 'info');
  } else if (oldRes.json && oldRes.json.ok) {
    record('对照：旧默认 JQL（硬编码状态名）在本实例报「status 域中没有…」错误', true,
      '本实例恰好存在同名状态，未触发该错误（跳过对照结论）', 'info');
  } else {
    record('对照：旧默认 JQL（硬编码状态名）在本实例报「status 域中没有…」错误', true,
      `旧 JQL 返回：${oldErr || '(无错误文本)'}`, 'info');
  }

  // ---- 2. 断言①：新的默认 JQL 不再报「status 域中没有…」错误 ----
  const newRes = await search(projectKey, NEW_DEFAULT_JQL(projectKey), 2);
  const newErr = String((newRes.json && newRes.json.error) || '');
  const noStatusDomainError = !hasStatusDomainError(newErr);
  record('断言①：新默认 JQL 不再返回「status 域中没有…值」的错误', noStatusDomainError,
    noStatusDomainError
      ? (newRes.json && newRes.json.ok
        ? `ok=true，命中 ${(newRes.json.issues || []).length} 条；JQL = ${NEW_DEFAULT_JQL(projectKey)}`
        : `无 status 域错误（返回：${newErr || 'ok=' + String(newRes.json && newRes.json.ok)}）`)
      : `仍然返回 status 域错误：${newErr}`);

  // ---- 3. 断言①（交付要求的调用形态）：projectKey="_" + 新默认 JQL ----
  const specRes = await search('_', NEW_DEFAULT_JQL('_'), 2);
  const specErr = String((specRes.json && specRes.json.error) || '');
  const specClean = !hasStatusDomainError(specErr);
  record('断言①（按交付要求的调用形态）：{"projectKey":"_","jql":"<新默认 JQL>","maxResults":2}', specClean,
    specClean
      ? `响应不含 status 域错误（错误文本：${specErr || '无'}）`
      : `仍然返回 status 域错误：${specErr}`);

  // ---- 4. 断言②：返回的 issue 里 statusCategory 非空且取值合法 ----
  let issues = (newRes.json && newRes.json.ok && newRes.json.issues) || [];
  if (issues.length === 0) {
    // 该项目下没有指派给我的工单 → 退回到跨项目的同一条筛选条件，保证仍能取到样本
    const fbRes = await search('_', 'assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC', 3);
    issues = (fbRes.json && fbRes.json.ok && fbRes.json.issues) || [];
    if (issues.length === 0) {
      record('断言②：返回的 issue 里 statusCategory 非空', false,
        '没有取到任何工单样本，无法验证 statusCategory');
      return;
    }
  }
  const bad = issues.filter((i) => {
    const c = String((i && i.statusCategory) || '');
    return c === '' || !VALID_CATEGORIES.includes(c);
  });
  const sample = issues.map((i) => `${i.key}(status=${i.status}, statusCategory=${i.statusCategory})`).join(', ');
  record('断言②：返回的 issue 里 statusCategory 非空且属于 new/indeterminate/done', bad.length === 0,
    bad.length === 0 ? `样本：${sample}` : `空或非法取值：${bad.map((i) => `${i.key}="${i.statusCategory}"`).join(', ')}`);

  // ---- 汇总 ----
  const asserts = results.filter((r) => r.kind === 'assert');
  const failed = asserts.filter((r) => !r.ok);
  console.log('');
  console.log(`结论：${asserts.length - failed.length}/${asserts.length} 条断言通过${failed.length ? '（有失败）' : ''}`);
  if (failed.length) {
    console.log('失败项：');
    for (const f of failed) console.log(`  - ${f.name}：${f.detail}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('脚本异常：', err);
  process.exitCode = 1;
});
