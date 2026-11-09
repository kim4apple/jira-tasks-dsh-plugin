// DOM/样式契约 harness：真正加载插件、注入样式、渲染页面，断言结构与样式契约。
// 用途：布局类 bug 光看代码看不出来（前面连错两版），这个 harness 能把
//   ① 实际注入的 CSS 内容  ② 实际渲染出的 HTML 结构  固化成可回归的断言。
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..");
const PROFILE_NM = "/Users/kim/.dsh/profiles/desktop/node_modules";
const req = createRequire(path.join(PROFILE_NM, "index.js"));
const React = req("react");
const ReactDOMServer = req("react-dom/server");

let pass = 0;
const failures = [];
function ok(cond, label, extra) {
  if (cond) { pass += 1; console.log("  ✓ " + label); }
  else { failures.push(label + (extra ? "  → " + extra : "")); console.log("  ✗ " + label + (extra ? "  → " + extra : "")); }
}

// ---------- 桩：window / document ----------
let capturedModule = null;
const injectedStyles = [];
globalThis.window = {
  __ModuleLoader__: { load: (spec) => { capturedModule = spec; } },
  addEventListener() {}, removeEventListener() {}, innerWidth: 1532, innerHeight: 2098,
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} })
};
globalThis.localStorage = globalThis.window.localStorage;
// Node 22 的 navigator 是只读 getter，不能直接赋值；插件只在复制按钮的 onClick 里用它，渲染期不需要。
globalThis.document = {
  createElement(tag) {
    const el = { tagName: String(tag).toUpperCase(), _text: "", remove() {}, set textContent(v) { this._text = v; }, get textContent() { return this._text; } };
    if (String(tag).toLowerCase() === "style") injectedStyles.push(el);
    return el;
  },
  head: { appendChild() {} },
  body: { appendChild() {}, style: {} },
  addEventListener() {}, removeEventListener() {},
  querySelectorAll: () => [], getElementById: () => null
};

// ---------- 加载插件 ----------
const src = fs.readFileSync(path.join(REPO, "lib/client.js"), "utf8");
(0, eval)(src);
if (!capturedModule) { console.error("!! 插件没注册到 __ModuleLoader__"); process.exit(1); }

const factoryRequire = (spec) => {
  if (spec === "react") return React;
  if (spec === "react-dom") return req("react-dom");
  throw new Error("harness: 未知模块 " + spec);
};
const exported = capturedModule.factory(factoryRequire);

// ---------- 桩 ctx：捕获槽位注册 ----------
const registered = [];
const slots = {
  inject(name, fn) { try { return fn(); } catch (e) { return () => {}; } },
  register(spec, Comp) { registered.push({ spec, Comp }); return () => {}; }
};
const remote = {
  async call(url, body) {
    if (url === "/jira/api/issue") {
      return { ok: true, key: "ENDEV-26542", summary: "【EnSASE】【私有化】macOS 客户端切换企业出现异常现象",
        status: "开启", issueType: "故障", priority: "高", assignee: "黄鑫", reporter: "张三",
        components: ["macOS"], fixVersions: [], labels: ["macOS"],
        description: "两个私有化环境。\n1、配置两个私有化环境（192.168.104.30/192.168.201.54）；",
        comments: [{ id: "c1", author: "李四", created: "2026-11-08T10:00:00.000+0800", body: "我也复现了" }],
        attachments: [{ id: "10001", filename: "server.log.gz", size: 2411724, contentType: "application/gzip", author: "黄鑫", created: "2026-11-08T10:00:00.000+0800" }],
        customFields: { customfield_10871: "说明功能实现差异", customfield_10864: "【与会人】：参与问题单决" },
        changelog: [] };
    }
    if (url === "/jira/api/search") return { ok: true, issues: [] };
    return { ok: true };
  }
};
const ctx = {
  effect(cb) { try { const d = cb(); return typeof d === "function" ? d : () => {}; } catch (e) { return () => {}; } },
  get(name) {
    if (name === "slots") return slots;
    if (name === "remote") return remote;
    if (name === "layout") return { selectPanel() {} };
    if (name === "configForms") return { get: () => ({ getSnapshot: () => ({ value: {} }) }) };
    if (name === "sessions") return { scope: () => null };
    return undefined;
  }
};
exported.apply(ctx);

// ---------- 1) 注入的 CSS ----------
console.log("\n[1] 样式注入");
const css = injectedStyles.map((s) => s.textContent).join("\n");
ok(injectedStyles.length > 0, "至少注入了一个 <style>", "数量 " + injectedStyles.length);
ok(css.length > 1000, "注入的 CSS 长度正常", "长度 " + css.length);
const rules = {
  ".jtd-page{": "页面外壳",
  ".jtd-inner{": "内容容器",
  ".jtd-summary{": "摘要标题",
  ".jtd-keybig{": "工单号",
  ".jtd-navbar{": "导航条",
  ".jtd-root-page{": "面板根",
  ".jtd-cols{": "两栏布局",
  ".jtd-maincol{": "左正文栏",
  ".jtd-rail{": "右侧元数据栏",
  ".jtd-prose{": "正文块",
  ".jtd-wiki-p{": "正文段落",
  ".jtd-fields{": "自定义字段对照表",
  ".jtd-comment-avatar{": "评论头像",
  ".jtd-attlist{": "附件紧凑列表",
  ".jtd-tabs{": "页签条"
};
for (const [sel, label] of Object.entries(rules)) {
  ok(css.includes(sel), "CSS 含 " + sel + "（" + label + "）");
}
// 关键契约：页面必须有滚动与内边距
const pageRule = (css.match(/\.jtd-page\{[^}]*\}/) || [""])[0];
ok(/overflow-y:auto/.test(pageRule), ".jtd-page 有 overflow-y:auto（能滚动）", pageRule.slice(0, 120));
ok(/padding:/.test(pageRule), ".jtd-page 有 padding", pageRule.slice(0, 120));
ok(/height:100%/.test(pageRule), ".jtd-page 有 height:100%", pageRule.slice(0, 120));
const innerRule = (css.match(/\.jtd-inner\{[^}]*\}/) || [""])[0];
ok(/max-width:\d/.test(innerRule), ".jtd-inner 有 max-width（内容不会拉满全屏）", innerRule.slice(0, 120));
const titleRule = (css.match(/\.jtd-ptitle\{[^}]*\}/) || [""])[0];
ok(/font-size:\d/.test(titleRule), ".jtd-ptitle 有 font-size", titleRule.slice(0, 120));
// 括号平衡
{
  let d = 0; for (const ch of css) { if (ch === "{") d++; else if (ch === "}") d--; }
  ok(d === 0, "注入的 CSS 花括号平衡", "净值 " + d);
}

// ---------- 2) 渲染页面 ----------
console.log("\n[2] 页面渲染");
const issueEntry = registered.find((r) => r.spec.name === "main" && r.spec.key === "jira-issue");
ok(!!issueEntry, "main 槽位注册了 key=jira-issue 的面板");
const statsEntry = registered.find((r) => r.spec.name === "main" && r.spec.key === "jira-stats");
ok(!!statsEntry, "main 槽位注册了 key=jira-stats 的面板（统计页仍在）");
const dockEntry = registered.find((r) => r.spec.name === "conversation.input.dock");
ok(!!dockEntry, "会话输入框槽位仍然注册");

if (issueEntry) {
  let html = "";
  try {
    html = ReactDOMServer.renderToStaticMarkup(React.createElement(issueEntry.Comp, {}));
  } catch (e) {
    ok(false, "渲染工单详情页不抛错", String(e && e.message));
  }
  ok(html.includes('class="jtd-page"'), "根元素带 jtd-page（页面外壳生效）");
  ok(html.includes('class="jtd-inner"'), "内容容器带 jtd-inner");
  ok(html.includes("jtd-keybig"), "工单号带 jtd-keybig");
  ok(html.includes("jtd-summary"), "摘要带 jtd-summary");
  ok(html.includes("jtd-navbar"), "顶部有导航条 jtd-navbar");
  ok(html.includes("返回"), "有「返回」按钮");
  ok(html.includes("jtd-back"), "返回按钮带 jtd-back 样式类");
  // 关键：不能出现「全屏铺开」的结构——内容必须有 max-width 容器
  ok(!/^<div class="jtd-root">/.test(html), "不是旧的裸根节点");
  ok(html.includes("jtd-cols"), "有两栏容器 jtd-cols");
  ok(html.includes("jtd-rail"), "有右侧元数据栏 jtd-rail");
  ok(html.includes("jtd-tabs"), "有页签条 jtd-tabs");
  if (html) {
    fs.writeFileSync("/tmp/jira-issue-page.html", html);
    console.log("  · HTML 已写入 /tmp/jira-issue-page.html（" + html.length + " 字节）");
  }
}

// ---------- 3) 页面内容组件（注册进 main 的详情面板）----------
const dockComp = dockEntry && dockEntry.Comp;
ok(!!dockComp, "会话面板组件存在");


// ---------- 4) wiki 渲染单元测试 ----------
console.log("\n[3] JIRA wiki 渲染");
{
  const clientSrc = fs.readFileSync(path.join(REPO, "lib/client.js"), "utf8");
  const a = clientSrc.indexOf("    function safeUrl(url) {");
  const b = clientSrc.indexOf("    /** 概要里的一格「键：值」。空值返回 null（不占位）。 */");
  if (a < 0 || b < 0) {
    ok(false, "能在源码里定位 wiki 渲染函数");
  } else {
    const snippet = clientSrc.slice(a, b);
    const h = React.createElement;
    // eslint-disable-next-line no-new-func
    const fns = new Function("h", "React", snippet + "; return { renderWiki, safeUrl, cleanWiki };")(h, React);
    const sample = [
      "两个私有化环境。",
      "",
      "操作步骤：",
      "* 配置两个私有化环境（192.168.104.30/192.168.201.54）；",
      "* 进入 104.30 环境，登录用户 a1；",
      "",
      "详见 [部署文档|https://example.com/doc]",
      "!https://static.dingtalk.com/media/xxx.png|width=947,height=651!",
      "**重要**：先看隧道连通后再退出登录。"
    ].join("\n");
    const out = ReactDOMServer.renderToStaticMarkup(React.createElement("div", null, fns.renderWiki(sample)));
    ok(!out.includes("<img"), "不自动加载远程图片（没有 <img>）", out.slice(0, 80));
    ok(out.includes('class="jtd-imglink"'), "图片语法变成「图片链接」");
    ok(out.includes('class="jtd-link"'), "[文字|链接] 变成可点链接");
    ok(out.includes("href=\"https://example.com/doc\""), "链接 href 正确");
    ok(out.includes("<strong>重要</strong>"), "**粗体** 变成加粗");
    ok(out.includes("jtd-bullets"), "* 列表变成列表");
    ok(out.includes("操作步骤："), "普通段落保留");
    // 安全：javascript: 必须被拒
    const evil = fns.safeUrl("javascript:alert(1)");
    ok(evil === null, "javascript: 链接被拒绝", String(evil));
    const js2 = fns.safeUrl(" javascript:alert(1) ");
    ok(js2 === null, "带空格的 javascript: 也被拒绝", String(js2));
    ok(fns.safeUrl("https://x.test/a") === "https://x.test/a", "http(s) 链接放行");
    ok(fns.safeUrl("/browse/X-1") === "/browse/X-1", "站内相对路径放行");
    const evilHtml = ReactDOMServer.renderToStaticMarkup(React.createElement("div", null, fns.renderWiki("[点我|javascript:alert(1)]")));
    ok(!evilHtml.includes("javascript:"), "渲染结果里不含 javascript: URL");
  }
}

// ---------- 5) 字段解析逻辑单元测试 ----------
console.log("\n[4] 自定义字段解析");
{
  const clientSrc = fs.readFileSync(path.join(REPO, "lib/client.js"), "utf8");
  const a = clientSrc.indexOf("    function orderCustomFieldKeys(keys, defs) {");
  const b = clientSrc.indexOf("    /** 只允许 http/https 与站内相对路径");
  if (a < 0 || b < 0) {
    ok(false, "能在源码里定位字段解析函数");
  } else {
    const snippet = clientSrc.slice(a, b);
    const h = React.createElement;
    // eslint-disable-next-line no-new-func
    const fns = new Function("h", snippet + "; return { orderCustomFieldKeys, looksUnfilled, looksLikeJavaDump, fieldLabelOf };")(h);

    // 未填写模板的识别
    const tpl = "请详细说明故障影响性和紧急程度，用于决策补丁发布节奏，如：故障影响的人数/总比率";
    ok(fns.looksUnfilled(tpl, tpl) === true, "值 == 字段说明 → 判为未填写");
    ok(fns.looksUnfilled(tpl, "") === true, "典型「请…」模板 → 判为未填写");
    ok(fns.looksUnfilled("已经写好的真实结论内容", "请详细说明故障影响性") === false, "真实填写内容不被误判");
    ok(fns.looksUnfilled("", "") === true, "空值判为未填写");

    // Java dump 的识别
    ok(fns.looksLikeJavaDump("{summaryBean=com.atlassian.jira.plugin.devstatus.rest.SummaryBean@6e1ebd70[summary=") === true, "开发状态插件的 Java dump 被识别");
    ok(fns.looksLikeJavaDump("正常的字段值") === false, "正常值不误判");

    // 字段名解析
    const defs = { map: { customfield_10871: { name: "说明功能实现差异", type: "string", description: "" } }, order: ["customfield_10871"] };
    const l1 = fns.fieldLabelOf("customfield_10871", defs, null);
    ok(l1.text === "说明功能实现差异" && l1.resolved === true, "从字段定义表取到名称");
    const l2 = fns.fieldLabelOf("customfield_99999", defs, null);
    ok(l2.text === "customfield_99999" && l2.resolved === false, "查不到时退回原始 id");
    const l3 = fns.fieldLabelOf("customfield_99999", defs, { customfield_99999: "来自 issue 的名字" });
    ok(l3.text === "来自 issue 的名字" && l3.resolved === true, "优先用 issue 自带的 names");

    // 按 JIRA 字段顺序排序
    const ordered = fns.orderCustomFieldKeys(["a", "b", "z"], { map: {}, order: ["b", "a"] });
    ok(JSON.stringify(ordered) === JSON.stringify(["b", "a", "z"]), "按 JIRA 字段顺序排，未知的排最后", JSON.stringify(ordered));
  }
}

// ---------- 6) 展开/收起 + 图片点击显示 ----------
console.log("\n[5] 展开与图片");
{
  const clientSrc = fs.readFileSync(path.join(REPO, "lib/client.js"), "utf8");
  const a = clientSrc.indexOf("    function safeUrl(url) {");
  const b = clientSrc.indexOf("    /** 概要里的一格「键：值」。空值返回 null（不占位）。 */");
  if (a < 0 || b < 0) { ok(false, "能定位 JtdImageChip/clampText/JtdDescription"); }
  else {
    const snippet = clientSrc.slice(a, b);
    const h = React.createElement;
    // eslint-disable-next-line no-new-func
    const fns = new Function("h", "React", snippet + "; return { JtdImageChip, clampText, JtdDescription };")(h, React);

    // clampText：按行截断
    const short = "短文本";
    ok(fns.clampText(short, 400).clamped === false, "短文本不截断");
    const long = Array.from({ length: 60 }, (_, i) => "第" + i + "行内容").join("\n");
    const cut = fns.clampText(long, 400);
    ok(cut.clamped === true, "长文本被截断");
    ok(cut.text.length <= 400, "截断后不超过上限", String(cut.text.length));
    ok(cut.text.indexOf("第0行") === 0, "保留开头");

    // 描述组件：折叠态有「展开全文」按钮，展开态有「收起」按钮
    const closed = ReactDOMServer.renderToStaticMarkup(React.createElement(fns.JtdDescription, { text: long }));
    ok(closed.includes("展开全文"), "折叠态显示「展开全文」");
    ok(!closed.includes("第59行"), "折叠态不含末尾内容");
    const opened = ReactDOMServer.renderToStaticMarkup(React.createElement(fns.JtdDescription, { text: long, defaultOpen: true }));
    ok(opened.includes("收起"), "展开态显示「收起」");
    ok(opened.includes("第59行"), "展开态含完整内容");
    const tiny = ReactDOMServer.renderToStaticMarkup(React.createElement(fns.JtdDescription, { text: "很短" }));
    ok(!tiny.includes("展开全文"), "短描述没有展开按钮");

    // 图片：默认不加载，点击后才出现 <img>
    const chipClosed = ReactDOMServer.renderToStaticMarkup(React.createElement(fns.JtdImageChip, { url: "https://x.test/a.png" }));
    ok(chipClosed.includes("图片"), "图片默认显示为按钮");
    ok(!chipClosed.includes("<img"), "默认不加载 <img>（不自动向第三方发请求）");
    const chipOpen = ReactDOMServer.renderToStaticMarkup(React.createElement(fns.JtdImageChip, { url: "https://x.test/a.png", defaultOpen: true }));
    ok(chipOpen.includes('src="https://x.test/a.png"'), "点击后渲染 <img src>");
    ok(chipOpen.includes("新标签打开"), "展开后有「新标签打开」");
  }
}

// ---------- 7) 展开按钮的 id 绑定（闭包捕获循环变量的回归测试）----------
console.log("\n[6] 字段展开按钮");
{
  const clientSrc = fs.readFileSync(path.join(REPO, "lib/client.js"), "utf8");
  const a = clientSrc.indexOf("    function safeUrl(url) {");
  const b = clientSrc.indexOf("    /** 概要里的一格「键：值」。空值返回 null（不占位）。 */");
  const snippet = clientSrc.slice(a, b);
  const h = React.createElement;
  // eslint-disable-next-line no-new-func
  const fns = new Function("h", "React", snippet + "; return { toggleFieldOpen, JtdNarrativeField, clampText };")(h, React);

  // 纯函数：只翻转指定 id，其它字段不受影响
  let st = { "customfield_1": true };
  const t1 = fns.toggleFieldOpen(st, "customfield_2");
  ok(t1["customfield_1"] === true, "翻转 A 不影响 B");
  ok(t1["customfield_2"] === true, "翻转 A 后 A 为 true");
  const t2 = fns.toggleFieldOpen(t1, "customfield_2");
  ok(t2["customfield_2"] === false, "再翻一次 A 变回 false");

  // 组件：折叠态/展开态
  const long = Array.from({ length: 80 }, (_, i) => "内容行" + i).join("\n");
  const closed = ReactDOMServer.renderToStaticMarkup(React.createElement(fns.JtdNarrativeField, { id: "f1", name: "技术根因", text: long }));
  ok(closed.includes("展开全文"), "折叠态有「展开全文」");
  ok(closed.includes("内容行0"), "折叠态保留开头");
  ok(!closed.includes("内容行79"), "折叠态截断了结尾");
  const opened = ReactDOMServer.renderToStaticMarkup(React.createElement(fns.JtdNarrativeField, { id: "f1", name: "技术根因", text: long, open: true }));
  ok(opened.includes("收起"), "展开态有「收起」");
  ok(opened.includes("内容行79"), "展开态内容完整");
  ok(opened.includes("收起"), "**展开后按钮不消失**（之前的 bug）");

  // 组件：短文本没有按钮
  const tiny = ReactDOMServer.renderToStaticMarkup(React.createElement(fns.JtdNarrativeField, { id: "f2", name: "短", text: "很短" }));
  ok(!tiny.includes("展开全文"), "短字段没有展开按钮");
}

console.log("\n结果：" + pass + " 通过，" + failures.length + " 失败");
if (failures.length) { console.log("\n失败项："); failures.forEach((f) => console.log("  - " + f)); process.exit(1); }
