# 实施契约 v1.7.0（工单详情双形态 + 加入对话）

设计稿：[../DESIGN.md](../DESIGN.md)
分支：`feature/issue-detail-and-attachment-download`（继续在此分支上做，**本轮不 bump 版本、不打 tag**）

## 0. 已验证的 DSH API（不用再调研，直接用）

插件的 client 侧 **已经 inject 了 `@deepseek-ai/dsh-client-ui-session`**，所以 `ctx.get("sessions")` 可用。

向当前会话的输入框写入内容，路径是：

```js
// 1) 拿到当前 session 的 scope
const actx = ctx.sessions.scope(sessionId);
// 2) 拿到 scoped 的 conversation 服务
const conversation = actx.get("conversation");
// 3) 拿到该 session 的输入外壳
const shell = conversation.input.for(actx);
// 4) 写草稿 / 插文件引用 chip
shell.setDraft(text);                    // 整体替换草稿，光标落在末尾
shell.appendDraft(text);                // 追加段落（保留已有文本与引用）
shell.insertFileReferences(refs);       // 批量插入文件引用 chip
```

**不要**用 `shell.actions.submit()` —— 本方案只填草稿，不自动发送。

文件引用 chip 的字段（`referenceSchema`）：

```js
{ source: string, ref: string, offset: number, length: number,
  label: string, appearance: 'session'|'file'|'folder', clipboardText: string }
```
- `appearance: 'file'` 用于工作区里的日志文件
- `offset` / `length`：在草稿文本里的位置。**用 `insertFileReferences` 时传 0/0 即可**（它按"当前选区末尾"插入）
- `clipboardText`：chip 被粘贴时的文本，建议填绝对路径

**降级路径（必须实现）**：如果上面任何一步拿不到（`ctx.get("sessions")` 为空、`scope` 抛错、
`input.for` 抛错、shell 没有 `setDraft`），**不要报错** —— 改为：
1. 把组装好的文本显示在一个可复制的 `<textarea>` 里，配「复制」按钮
2. 提示用户手动粘贴到输入框
3. 文件路径照样写进文本里（智能体可以直接按路径读工作区文件）

**sessionId 从哪来**：`conversation.input.dock` 槽位的 inject 第一个参数就是 `sessionId`。
插件现有的 `JiraTasksDock` 就是注册在这个槽位的。实现时：
- 优先从槽位 inject / 组件 props 里拿 sessionId
- 拿不到就用 `ctx.sessions` 上的"当前会话"（若有）；再拿不到 → 走降级路径

## 1. 组件 API（Lead 实现 client 部分，队友不要改这些组件）

```js
// 详情面板：compact = 紧凑版（popover 内），full = 完整版（整页）
IssueDetailPanel({
  issueKey,            // string，必填
  variant,             // 'compact' | 'full'
  baseUrl,             // JIRA 根地址，用于「在 JIRA 打开」
  onOpenFull,          // 可选：() => void，切到整页
  onClose,             // 可选：() => void
  onAddToConversation  // 可选：(payload) => void，见 §3
})

// 「加入对话」附件选择面板
AddToConversationPanel({
  issueKey,
  detail,              // /jira/api/issue 的响应对象（含 attachments）
  onClose,
  onDone               // (result) => void
})
```

## 2. 布局规格

### 紧凑版（compact）
- 单栏，宽 ~560px
- 顶部：`PROJ-123`（mono 14px/600）+ 摘要（13px，最多 2 行）+ 右侧「⤢ 在整页打开」「✕」
- 概要：两列字段网格（`repeat(2, minmax(0,1fr))`），字段 = 状态/类型/优先级/经办人/报告人/组件/修复版本/创建/更新
- 附件：紧凑表（文件名 / 大小 / 状态 / 操作）
- 底部操作条：「加入对话 ▾」「写评论（v1.8.0 才有，先留位不显示）」

### 完整版（full）
- 双栏：`minmax(0,1fr) minmax(320px,380px)`，整体 `max-width:1180px` 居中
- sticky 顶栏：`PROJ-123`（mono 18px/600）+ 摘要（20px/600）+ 状态 chips + 「加入对话 ▾」
- 标签页：`概览 / 评论(N) / 附件(N) / 历史(N)`，页签写进 `location.hash`（`#jira/issue/<KEY>/<tab>`），刷新不丢
- 左栏（按标签页切）：概览 = 描述 + 自定义字段 + 标签；评论 = 时间线；附件 = 宽表格（带复选框）；历史 = 变更列表
- 右栏（sticky）：元数据 + 附件列表 + 「下载全部到工作区」

### 视觉令牌
沿用现有 `--dsw-alias-*` 变量与 `jt-` / `jtst-` / `jtd-` 前缀，**不新增设计语言**。
现有 `DETAIL_CSS`（`jtd-` 前缀）可复用，但紧凑版需要新增 `jtd-c-` 前缀的紧凑样式。

## 3. 「加入对话」的数据组装

组装顺序（写入 `shell.setDraft(text)` 的内容）：

```
排查 PROJ-123（登录后 500）
项目：PROJ（本工作区）  状态：开启  类型：Bug  优先级：High
经办人：Alice  报告人：Bob  组件：web  修复版本：v1.2
描述：<原始描述，纯文本>
最近评论：
- Bob 11-02 09:00 我这边也复现了
附件：server.log.gz、app.log（已下载，路径见下方引用）
相关工单（同项目近 30 天）：
- PROJ-118  登录偶发超时   开启
- PROJ-102  token 刷新失败  进行中
```

- **描述与评论只做纯文本**：去掉 wiki 标记里的 HTML 标签（JIRA 描述可能是 wiki markup），
  但**不要**尝试解析成富文本 —— 智能体读纯文本足够
- 摘要为空时用「（无描述）」占位
- 相关工单最多 5 条，每条「号 + 摘要 + 状态」

## 4. 附件下载与状态机

- 附件状态：`idle`（未下载）/ `downloading` / `done`（已下载，存路径）/ `failed`（原因）/ `tooLarge`（超上限，不可用）
- **并发上限 3**（不要一次下 20 个）
- 已下载的**复用**工作区里的文件，不重复下载（判断依据：附件 id 已在本轮会话里下过）
- 单文件超过 `maxAttachmentMb`（默认 100MB）→ `tooLarge`，行**不可勾选**
- 下载失败 → 该行显示原因，不影响同批其他附件
- 「只选日志类」筛选：扩展名 ∈ `.log .log.gz .txt .har .json .out .trace .dump`

下载完成后：
```js
shell.insertFileReferences([
  { source: 'file', ref: '<绝对路径>', offset: 0, length: 0,
    label: 'server.log.gz', appearance: 'file', clipboardText: '<绝对路径>' }
]);
```

## 5. Host 侧改动（队友负责）

1. `POST /jira/api/search` 支持可选 `maxResults`（默认 50，上限 200）—— 相关工单查询用
2. `POST /jira/api/attachments` 支持可选 `attachmentIds` 数组（只下选中的）—— 批量加入对话用
   - 不传 `attachmentIds` = 下全部（保持现有行为，向后兼容）
   - 返回结构不变（`saved[]` / `failed[]`）

**既有 4 条路由的行为、请求体、响应体完全不变。**

## 6. 不变量

- 既有 4 条路由 + 3 条新增路由的请求体/响应体不变（新增字段只能可选）
- 评论正文、描述、附件文件名等来自 JIRA 的内容**只作纯文本渲染**，禁止 `dangerouslySetInnerHTML`
- 认证头仍只经 `curl --config -` 的 stdin 传入，不进 argv
- 不新增任何写操作路由（写评论是 v1.8.0）
- 版本号不变（1.6.0），不打包发布

## 7. 验收

- `node --check lib/client.js` / `lib/index.js`
- `harness/run-harness-detail.mjs` 43 项 + `run-harness.mjs` 29 项全通过
- 客户端静态自查：无 `dangerouslySetInnerHTML`、无 `scope.set('password')`、无 token 进 UI
- 实机：安装后新路由存活、popover 能打开、加入对话能把文本写进输入框
