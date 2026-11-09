# 实施方案 B 契约（Host ↔ Client 必须严格一致）

分支：`feature/explicit-account-password-auth`（基于 `main @ db3a1af`）

## 1. 凭据来源与优先级

| 槽位 | 优先级（前者优先） | 存放位置 |
|---|---|---|
| 用户名 username | ① Config `username`（设置页写入，可回显）② 凭据引用 `JIRA_TASKS_USERNAME` ③ 环境变量 `JIRA_USERNAME` | Config（明文，非机密） |
| 密码 password | ① 凭据引用 `JIRA_TASKS_PASSWORD` ② 环境变量 `JIRA_PASSWORD` | **凭据存储**（`~/.dsh/.credentials.yaml`, 0600） |
| 令牌 token | ① 凭据引用 `JIRA_TASKS_TOKEN` ② `JIRA_API_TOKEN` ③ `JIRA_TOKEN` | 凭据存储（现状不变） |

**密码绝不能进 Config**（Config 会明文落盘到 profile 的 `cordis.patch.yml`）。
用户名不是机密，放 Config 可以回显、可以只读展示。

## 2. 认证头构造（Host 侧唯一构造点）

```js
function buildAuthHeader(token, account) {
  const u = account && typeof account.username === 'string' ? account.username : '';
  const p = account && typeof account.password === 'string' ? account.password : '';
  if (u && p) return 'Basic ' + Buffer.from(u + ':' + p, 'utf-8').toString('base64');
  if (token && token.indexOf(':') !== -1) return 'Basic ' + Buffer.from(token, 'utf-8').toString('base64');
  return 'Bearer ' + (token || '');
}
```

优先级：**显式账号密码 > 含冒号的旧值 > 纯令牌**。旧用户存的 `user:token` 继续可用（向后兼容）。
密码含冒号没问题：Basic 只按**第一个**冒号切分，`user:pa:ss` → 用户名 `user`、密码 `pa:ss`。

`plugin/host.js`（动态插件形态）必须镜像同一逻辑，并把 `btoa` 换成
`Buffer.from(..., 'utf-8')`——`btoa` 遇非 Latin-1 密码会抛异常。

## 3. Host ↔ Client 接口（POST /jira/api/test）

**请求体**（新增两个草稿字段，均为可选）：

```json
{ "baseUrl": "http://jira.example.com", "token": "...", "username": "alice", "password": "..." }
```

- `username` / `password` 是**未保存的草稿值**，只用于本次探测，不落盘。
- `password` **不要 trim**（密码首尾空格有意义）；`token` 沿用现状（trim）。
- 草稿优先；草稿为空时回退到已保存 / 环境配置。

**响应体**（新增一个字段）：

```json
{ "ok": true, "baseUrl": "...", "user": "Alice", "authMode": "basic" }
{ "ok": false, "code": "auth", "error": "……", "authMode": "basic" }
```

- `authMode` ∈ `"basic"` | `"bearer"`，表示**实际生效**的认证方式。
- `authMode` 必带（成功与失败都要带），便于 UI 显示当前生效方式。
- 响应**不得包含**任何密码或令牌material。

**错误码语义**（`code` 字段，现有取值 `unconfigured` / `network` / `auth` / `http` / `error` 保持不变）。

## 4. Cloud / Server 判别与可操作报错

Host 需要按 base URL 主机名判别部署形态：

- `*.atlassian.net` → Jira Cloud
- 其它 → Jira Server / Data Center

401/403 时的报错文案（`handleTest`）：

- Cloud + basic 模式：
  `Jira Cloud 不接受账号密码登录，请改用「邮箱 + API token」（Basic）或 PAT（Bearer）。`
- 非 Cloud + basic 模式：
  `账号或密码不正确；该实例也可能只接受 PAT（Bearer）或 API token。`
- bearer 模式：保持原样（`Authentication required` 之类），不要误导。

## 5. 不变量（改完必须仍然成立）

1. 认证头**只经 `curl --config -` 的 stdin 传递**，绝不出现在 argv / 进程列表。
2. `/jira/api/test` 的响应体**不含**密码、令牌material。
3. 草稿值只影响本次探测；不点「保存」就不写入存储。
4. `credentials.set()` **拒绝空串** → 留空 = 保持不变（现有令牌框已是此语义）。
5. 被启动环境遮蔽的引用不可写 → 复用现有 `shadowedTokenRef()` / `tokenReadOnlyHint()`
   （`lib/client.js:1302-1312`）给出可操作提示。
6. 路由路径、`cordis.patch.yml` 的 inject 列表、`manifest.json` 的 `hostRoutes` **不变**。
7. React hook 规则：不要在 `JiraSettingsPage` 里提前 return（`lib/client.js:1358-1363` 有历史坑注释）。
