# 回归测试套件

离线跑，不连真实 JIRA（用 mock JIRA + 桩 Cordis ctx）。**不发布到 npm**
（`package.json` 的 `files` 只含 `lib` 等发布物）。

```bash
npm test          # 跑完所有，输出汇总
node harness/run-harness-detail.mjs   # 单独跑某一个
```

| 脚本 | 覆盖 |
|---|---|
| `run-harness.mjs` (29) | 认证：账号密码 Basic / 令牌 / 凭证优先级 / 错误文案 |
| `run-harness-detail.mjs` (43) | 工单详情、评论、附件下载；**安全边界**：同源校验（含端口）、跨主机重定向不带认证头、文件名净化与路径包含、大小上限 |
| `run-harness-search-limits.mjs` (50) | `search` 的 `maxResults`（缺省 50 / 上限 200 / 非法值回落）、`attachments` 的 `attachmentIds`（全下 / 选下 / 不存在 / 空数组） |
| `run-harness-fields.mjs` (60) | `/jira/api/fields`：字段定义、schema.type、**顺序不排序**、v2→v3 回退、10 分钟缓存（按实例分桶）、认证头走 stdin、`?expand=names,schema` |
| `run-harness-screen.mjs` (36) | `/jira/api/issue-screen`：editmeta 字段清单与顺序、404/403/非 JSON 降级成空数组、工单号防注入 |
| `run-harness-dom.mjs` (83) | **渲染层**：真正加载插件、捕获注入的 `<style>`、用 `react-dom/server` 渲染页面，断言 DOM 结构与样式契约；wiki 标记渲染（链接/粗体/列表/图片不自动加载/`javascript:` 拒绝）；字段名解析与模板噪声过滤；展开/收起状态接线 |

## 为什么要有渲染层那一条

2026-11-09 踩过一次大坑：详情页的 CSS 因为一处多余的分号变成了一句**被丢弃的表达式**，
`node --check` 照样通过，但样式从未注入 —— 表现为「HTML 结构完全正确却一点样式都没有」，
连着两版布局排查方向全错。所以 `run-harness-dom.mjs` 会**真的加载模块并捕获注入的
`<style>`**，而不是只做语法检查。

## 加新 harness 时

放在本目录，文件名以 `run-harness` 开头即会被 `npm test` 自动收录。
mock JIRA 与桩 ctx 可直接抄 `run-harness-detail.mjs`。
