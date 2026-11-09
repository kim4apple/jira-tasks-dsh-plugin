# 实施契约：工单详情 + 评论 + 附件下载（v1.6.0）

分支：`feature/issue-detail-and-attachment-download`（基于 fork main @ f25982f）

## 1. 新增 Host 路由（3 条，全部 POST）

### 1.1 `POST /jira/api/issue` —— 工单完整详情

**请求**：`{ "issueKey": "PROJ-123" }`

**JIRA 调用**（2 次，复用现有 `curlJson` 与凭据解析）：
- `GET /rest/api/2/issue/{key}` —— **不传 `fields` 参数**，即返回全部可导航字段
- `GET /rest/api/2/issue/{key}/comment?maxResults=100&orderBy=created`

**响应**：
```json
{
  "ok": true,
  "key": "PROJ-123",
  "summary": "…", "issueType": "Bug", "status": "开启", "statusCategory": "new",
  "priority": "High", "assignee": "Alice", "reporter": "Bob",
  "created": "…", "updated": "…", "resolved": null,
  "description": "…",
  "labels": ["a"], "components": ["c"], "fixVersions": ["v1.0"],
  "customFields": { "customfield_10001": … },
  "allFields": { …原始 fields 全量… },
  "comments": [ { "id": "…", "author": "Bob", "created": "…", "updated": "…", "body": "…" } ],
  "attachments": [ { "id": "…", "filename": "server.log.gz", "size": 12345,
                     "contentType": "application/gzip", "created": "…",
                     "author": "Bob", "url": "http://…/rest/api/2/attachment/content/10001" } ],
  "changelog": [ { "id": "…", "author": "…", "created": "…", "items": [ … ] } ]
}
```
- `customFields`：从 `allFields` 里挑出 `customfield_*` 的键值对（供 UI 单独展示自定义字段）
- `changelog`：若 `allFields.changelog` 存在则取 `histories` 数组，否则空数组
- `comments`：`author` 取 `author.displayName || author.name`
- `attachments`：`author` 同上；`url` 取 JIRA 返回的 `content` 字段

### 1.2 `POST /jira/api/attachment` —— 下载单个附件到工作区

**请求**：`{ "issueKey": "PROJ-123", "attachmentId": "10001" }`
**注意：前端只传 `attachmentId`，绝不传 URL** —— 由 Host 自行取工单详情、按 id 找到
JIRA 自己返回的 `content` URL，从根本上杜绝浏览器侧 SSRF。

**响应**：
```json
{ "ok": true, "issueKey": "PROJ-123", "attachmentId": "10001",
  "filename": "server.log.gz", "path": "/abs/path/to/workspace/jira-attachments/PROJ-123/server.log.gz",
  "bytes": 12345, "contentType": "application/gzip" }
```
失败：`{ "ok": false, "error": "…" }`

### 1.3 `POST /jira/api/attachments` —— 批量下载该工单全部附件

**请求**：`{ "issueKey": "PROJ-123" }`

**响应**：
```json
{ "ok": true, "issueKey": "PROJ-123",
  "dir": "/abs/path/…/jira-attachments/PROJ-123",
  "saved":   [ { "attachmentId": "10001", "filename": "server.log.gz", "path": "…", "bytes": 12345, "contentType": "…" } ],
  "failed":  [ { "attachmentId": "10002", "filename": "x.zip", "reason": "…" } ] }
```
一次取工单详情 → 逐个下载。单个失败不影响其余。

## 2. 落盘位置与命名

```
<workspaceRoot>/jira-attachments/<ISSUE-KEY>/<sanitized-filename>
```
- `workspaceRoot` = `sandboxPolicy.workspaceRoot`（插件已在用）
- 文件名消毒：
  1. 取 `path.basename`，去掉目录部分
  2. 去掉控制字符与 `..`
  3. 只保留 `[A-Za-z0-9._-]` 与空格，其余换成 `_`
  4. 长度上限 120 字符（保留扩展名）
  5. 同名冲突追加 `-1`、`-2`
- 最终路径必须 `path.resolve()` 后仍位于目标目录内，否则拒绝

## 3. 安全边界（必须全部实现）

1. **SSRF**：附件 URL 的 hostname 必须与配置的 JIRA baseUrl hostname **完全一致**，
   否则拒绝下载并报错。协议只允许 http/https。
2. **重定向不泄露凭据**：
   - 先用**不带 `-L`** 的探测请求拿 `%{http_code}` 与 `%{redirect_url}`
   - 无重定向 → 带认证头下载
   - 重定向到**同主机** → 带认证头 + `-L` 下载
   - 重定向到**不同主机** → **不带认证头** + `-L` 下载（签名 URL 自带鉴权）
3. **大小上限**：Config 新增 `maxAttachmentMb`（默认 100）。下载前用附件元数据的 `size`
   预检；curl 侧再加 `--max-filesize`。
4. **认证头仍只走 stdin**：沿用 `curl --config -` + stdin 传 `header = "Authorization: …"`，
   绝不进 argv。
5. **不落日志**：错误信息里不得出现认证头、密码或完整 URL 的 query。

## 4. 现有代码复用要求

- 凭据解析复用 `resolveConnection()`（返回 `{baseUrl, token, username, password}`）
- 认证头复用 `buildAuthHeader(cred.token, cred)`
- HTTP GET 复用 `curlJson(baseUrl, cred, path, query, options)`（它已支持 query 与 timeout）
- 新增一个 `downloadToFile(baseUrl, cred, url, destPath, maxBytes)`，
  内部用 `subprocess.spawn` + `curl --output`

## 5. Client 侧（由 client 负责人实现）

- 任务面板（会话输框下方）与版本任务列表里，**工单号可点击打开详情**
- 详情面板展示：
  - 概要：摘要 / 状态 / 类型 / 优先级 / 经办人 / 报告人 / 时间
  - 描述
  - 自定义字段（`customFields`）
  - 评论列表（作者 / 时间 / 正文）
  - 附件表格：文件名 / 大小 / 类型 / 上传者 / 时间 + **「下载」**按钮
  - 顶部 **「下载全部附件」** 按钮
- 下载成功后展示保存路径（用户可直接让智能体分析该文件）
- 打开详情的入口：工单号链接 → `/browse/KEY` 的链接改为「打开详情」按钮，
  或保留原链接并新增一个详情按钮

## 6. 不变量

- 既有 4 条路由的行为、请求体、响应体**完全不变**（向后兼容）
- `Config` 只**新增** `maxAttachmentMb`，既有字段不动
- `cordis.patch.yml` 不需要改
- 既有错误文案不动
