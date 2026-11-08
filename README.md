# JIRA 任务面板（DeepSeek Harness 插件）

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**中文** · [English](README.en.md)

把 JIRA 搬进 DeepSeek Harness：**输入框下方**直接显示当前项目里指派给你的「开启 / 重新开启」任务，**左侧栏**多一个「JIRA 统计」入口，看项目进度、版本进度和版本内的任务清单。只读，不改 JIRA。

> **这是 [kim4apple/jira-tasks-dsh-plugin](https://github.com/kim4apple/jira-tasks-dsh-plugin) 的 fork**（上游：[liu3734/jira-tasks-dsh-plugin](https://github.com/liu3734/jira-tasks-dsh-plugin)）。
> 相对上游 v1.4.0 的变更：**设置卡片新增「用户名 / 邮箱」与「密码」两栏**，账号密码走标准
> `Authorization: Basic base64(用户名:密码)`（Jira Server / Data Center 官方支持），
> 令牌仍走 `Bearer`；401 时按 Jira Cloud / Server-DC 给出不同的可操作提示。
> 详见「[JIRA 地址与认证方式](#jira-地址与认证方式)」。

<img width="1898" alt="输入框下方的 JIRA 任务面板" src="https://github.com/user-attachments/assets/d14d0bd4-4f9f-4aa8-9af8-b8a02a2b7296" />

---

## 快速开始（3 步）

1. **安装插件**（浏览器 / web 端）

   ```bash
   dsh plugin --profile web add dsh-jira-tasks
   ```

   装完**重启 DSH**。

2. **填 JIRA 地址与凭据**：设置 → **JIRA 配置** → 填写地址，再选一种认证方式：**账号 + 密码**（Server/DC 常用）或**访问令牌 / PAT** → 看到**绿灯**即连通。

   <img width="1590" alt="设置 → JIRA 配置：地址、令牌与连接状态灯" src="https://github.com/user-attachments/assets/af5f11c6-aa9a-4c3b-84ca-cff6c0017b22" />

   > 卡片现在有四栏：**JIRA 地址**、**用户名 / 邮箱**、**密码**、**访问令牌 / PAT（Bearer）**。上图是加入账号密码之前的样子。

3. **填项目 Key**：点面板标题右侧 **⚙**，填写项目编号（如 `HCPFYH1`），保存即查询。

---

## 界面

| 位置 | 是什么 | 能做什么 |
|---|---|---|
| 输入框下方 | 我的任务面板 | 看本人在「开启 / 重新开启」里的任务，点开进 JIRA |
| 左侧栏「JIRA 统计」 | 项目统计页 | 切项目、看总量与完成率、按版本看进度 |
| 版本列表 → 版本名 | 版本任务列表 | 看该版本的所有任务，点表头排序，本人排最前 |

### 1. 我的任务面板

新会话和正在聊的会话都会显示，默认**折叠**成一行标题 + 任务数：

- 点标题展开 / 收起，查看列表（按更新时间倒序，最多 50 条）
- 每条带**状态徽章**（新建 / 进行中 / 其他）、优先级和类型标签
- 点 **⟳** 立即刷新；点任务在**新标签页**打开 JIRA 详情
- 点 **⚙** 改项目 Key 和 JQL

<img width="1972" alt="展开后的任务列表，带状态徽章与标签" src="https://github.com/user-attachments/assets/9f543e04-a5ad-4b86-85c8-baa2de26f44e" />

### 2. 任务统计页

左侧栏点 **JIRA 统计** 打开，与会话无关，是全局页面。

<img width="1400" alt="任务统计页：概览卡片与版本统计列表" src="https://raw.githubusercontent.com/liu3734/jira-tasks-dsh-plugin/main/docs/images/stats-overview.webp" />

- 顶部**一个输入框**：下拉列出你已配置过的项目 Key（标注来自哪个工作区），也可直接输入项目编号回车查询
- **概览卡片**：任务总数、已完成、进行中、待办、完成率
- **版本统计**：按发布日期倒序，每页 10 个版本，底部「上一页 / 下一页」；每行含发布状态、发布日期、任务数、待办 / 进行中 / 已完成与完成率
- **⟳ 刷新**在后台更新，不打断当前内容、不整页闪白
- 切回看过的项目**先用缓存秒开**，再静默刷新
- 自动记住上次看的项目，下次打开直接回来

### 3. 版本任务列表

点任意版本名进入。

<img width="1400" alt="版本任务列表：点表头排序，本人任务带「我」且排最前" src="https://raw.githubusercontent.com/liu3734/jira-tasks-dsh-plugin/main/docs/images/version-tasks.webp" />

- **点表头排序**：编号 / 摘要 / 状态 / 优先级 / 类型 / 负责人 / 更新，再点一次切升降序
- **默认本人任务排最前**，其余按更新时间倒序
- 任务编号可点，在新标签页打开 JIRA 详情
- 「← 返回版本列表」回到上一级

---

## 配置

全部配置都在 **设置 → JIRA 配置**（左侧导航，在「Agent 预设」下面）里。插件面板里的同一张卡片是同一个表单，两处都行。

### JIRA 地址与认证方式

设置卡片有四栏：**JIRA 地址**、**用户名 / 邮箱**、**密码**、**访问令牌 / PAT（Bearer）**。

| 栏位 | 填什么 | 存在哪 |
|---|---|---|
| JIRA 地址 | 如 `http://jira.example.com/` | 插件配置项，界面可回读 |
| 用户名 / 邮箱 | Jira Server/DC 的登录用户名；Jira Cloud 填账号邮箱 | 插件配置项，界面可回读 |
| 密码 | 该账号的密码 | 凭据存储，前端只显示「已保存，留空保持不变」 |
| 访问令牌 / PAT（Bearer） | JIRA 个人访问令牌 | 凭据存储，前端只显示「已配置」 |

**认证方式按你填的内容自动决定：**

| 填了什么 | 实际使用的认证头 |
|---|---|
| 用户名 + 密码（两栏都填） | `Authorization: Basic base64(用户名:密码)` |
| 只填访问令牌 | `Authorization: Bearer <令牌>` |
| 两者都填 | **账号密码优先** |

卡片上有一条始终可见的规则提示：

> 账号密码填「用户名 + 密码」两栏（自动 Basic）；只填令牌则按 PAT/Bearer 使用。含 “:” 的旧值仍按 Basic 处理。Jira Cloud 只接受「邮箱 + API token」，不接受真密码。

- 向后兼容：老配置里「用户名:令牌」这种单值（令牌含 `:`）仍按 Basic 处理。
- 密码只写进凭据存储（`~/.dsh/.credentials.yaml`），**不会回传前端**，也**不会写进配置文档**；前端只显示「已保存，留空保持不变」。
- 令牌 / 密码留空保存 = 保持原值不变；点「清除设置页保存值（回退到环境变量）」可一次清掉设置页保存的令牌、密码与用户名，改用环境变量。
- 地址留空保存 = 清除设置项，回退到环境变量 / 凭据文件里的 `JIRA_BASE_URL`

> **部署形态决定密码能不能用**
>
> - **Jira Server / Data Center**：账号密码可用（Atlassian 官方支持 Basic 认证）。仍**推荐改用 PAT**（Bearer），更安全、可随时吊销。
> - **Jira Cloud**：Atlassian **已废弃密码认证**，只接受「邮箱 + API token」（Basic）或 OAuth 2.0 (3LO)。填真密码会返回 **401**。
> - **Server/DC 启用了 2FA / SSO**：密码 Basic 认证不可用，必须改用 PAT。

**连接状态灯**（卡片底部）：

| 灯 | 含义 |
|---|---|
| 🟢 绿 | 地址与凭据可用，并显示当前登录用户 |
| 🔴 红 | 不可用，显示 JIRA 返回的原因（如 401） |
| ⚪ 灰 | 地址或凭据未配置 |

状态灯下面还有一行 **当前认证方式**：`Basic（账号 alice）`、`Bearer（访问令牌 / PAT）`，还没测过则是 `未知`；测试失败时也会显示实际生效的方式。

打开卡片会自动探测一次，保存后自动重测；点 **测试连接** 可以用**还没保存的输入**立即验证。

### 工单详情、评论与附件下载

任务面板（会话输入框下方）与版本任务列表里的工单，点 **「详情」** 就能展开这个工单的：

- **全部字段** —— 概要（状态 / 类型 / 优先级 / 经办人 / 报告人 / 时间）、描述、标签 / 组件 / 修复版本，
  以及 JIRA 里的**自定义字段**（`customfield_*`）
- **评论** —— 作者、时间、正文
- **附件** —— 文件名、大小、类型、上传者、时间

附件可以直接下载：

| 操作 | 结果 |
|---|---|
| 附件行的 **「下载」** | 该附件存到 `<工作区>/jira-attachments/<工单号>/`，面板里显示保存路径 |
| 面板顶部的 **「下载全部附件」** | 这个工单的全部附件一次性存下来，逐条列出成功与失败 |

> **下载到工作区是有意为之**：文件落在工作区里，**把这个路径告诉智能体，它就能直接读取分析**——
> 比如「看下 PROJ-123 的日志」。附件里常见的 `.log` / `.log.gz` / `.txt` / `.har` 都可以直接 grep。

**安全边界**（插件内部强制执行，不依赖前端）：

- 前端只传 **附件 id**，下载地址由 Host 从 JIRA 响应里取，浏览器无法指定任意 URL
- 附件地址必须与配置的 JIRA 地址**同主机同端口**，否则拒绝下载
- 跨主机跳转时**不会带上认证头**，避免把账号密码泄露给第三方
- 文件名会做消毒（去目录、去 `..`、限长），落盘路径越界一律拒绝
- 单个附件大小上限默认 **100 MB**（`maxAttachmentMb`）

> 只读能力，不改 JIRA。

### 项目 Key 与 JQL（按工作区保存）

- **项目 Key**：如 `HCPFYH1`，保存后立即查询，该工作区的新会话自动加载
- **JQL**：留空走默认查询，也可自定义，`{projectKey}` / `{key}` 会被替换成项目 Key

默认查询（中文工作流状态名）：

```jql
project = "{projectKey}" AND status in ("开启", "重新开启") AND assignee = currentUser() ORDER BY updated DESC
```

> 用英文状态（Open / Reopened）的团队，在 ⚙ 里填一段自定义 JQL 即可。

### 用环境变量（可选）

不想在界面里填凭据，也可以用启动环境或 `~/.dsh/.credentials.yaml` 里的：

```yaml
JIRA_BASE_URL: "http://jira.example.com/"
JIRA_USERNAME: "<账号（Server/DC 用户名，Cloud 邮箱）>"
JIRA_PASSWORD: "<账号密码>"
JIRA_API_TOKEN: "<PAT 或 user:token>"
```

优先级：

- 地址：设置页地址 > `JIRA_BASE_URL` > `JIRA_URL`
- 账号：设置页填写的账号 > `JIRA_TASKS_USERNAME` > `JIRA_USERNAME`
- 密码：设置页保存的密码（`JIRA_TASKS_PASSWORD`）> `JIRA_PASSWORD`
- 令牌：设置页令牌 > `JIRA_API_TOKEN` > `JIRA_TOKEN`

**设置页保存的值优先于环境变量**，环境里已经导出 `JIRA_API_TOKEN` / `JIRA_USERNAME` / `JIRA_PASSWORD` 也能在界面覆盖它们。

---

## 桌面端（DeepSeek Harness.app）

桌面端使用独立的 `desktop` profile，且必须用桌面端自带的命令（npm 全局装的 `dsh` 会拒绝操作该 profile）：

1. 先打开一次桌面端（由应用初始化 profile），然后**完全退出**（macOS 用 `Cmd+Q`，关窗口不算退出）
2. 菜单 → **管理 dsh 命令 / Manage dsh Command** → Install，把桌面端自带 `dsh` 装进 PATH
3. 安装插件：

   ```bash
   dsh plugin --profile desktop add dsh-jira-tasks
   ```

4. 重新打开桌面端

> 桌面端与浏览器**配置不互通**：项目 Key / JQL 按页面来源分开存，两边各配一次即可。JIRA 地址与凭据（账号密码 / 令牌）来自同一份设置，无需重复配置。

---

## 升级与卸载

```bash
# 升级
dsh plugin --profile web add dsh-jira-tasks@latest

# 卸载（浏览器 / 桌面端）
dsh plugin --profile web remove dsh-jira-tasks
dsh plugin --profile desktop remove dsh-jira-tasks
```

升级后**重启 DSH**。

---

## 常见问题

<details>
<summary>装完后看不到面板</summary>

- 确认已**重启 DSH**（桌面端要完全退出再打开）
- 确认 profile 配置里 `dsh.profile.bundles` 包含 `"dsh-jira-tasks"`（浏览器：`~/.dsh/profiles/web/package.json`；桌面端：`~/.dsh/profiles/desktop/package.json`）。这是最常见的漏装原因，手动追加这一项即可
- DSH 版本需在 `0.1.7` ~ `0.2.x` 范围内，超出会被跳过
- 桌面端显示「未配置」但记得配过：桌面端与浏览器的项目配置各存一份，需要各配一次
</details>

<details>
<summary>面板显示「查询失败」</summary>

| 提示 | 处理 |
|---|---|
| 未设置项目 Key | 点标题右侧 ⚙ 填项目 Key |
| 未配置 JIRA 地址 | 去「设置 → JIRA 配置」填地址 |
| 未配置 JIRA 凭据 | 去「设置 → JIRA 配置」填访问令牌，或填用户名 + 密码 |
| 401 … | 凭据无效或认证方式不对：Jira Cloud 不能用真密码（只接受「邮箱 + API token」或 OAuth 2.0），Server/DC 优先改用 PAT；重填后用「测试连接」验证 |
| 无法解析 JIRA 响应 | 网络 / 代理问题，检查机器能否访问 JIRA |
</details>

<details>
<summary>点版本名提示「接口返回空响应（HTTP 405）」</summary>

页面已更新但后台进程还在跑旧插件。**完全退出 DSH 再打开**即可（刷新网页不算）。
</details>

<details>
<summary>统计数字和 JIRA 里不一致</summary>

- 状态归属沿用 JIRA 的 `statusCategory`：工作流里被归为「完成」分类的状态都会算成已完成
- 统计包含子任务
- 单次最多统计 20000 条任务，超出会在页面顶部提示「仅统计前 N 条」
</details>

<details>
<summary>不想用 npm，手动安装</summary>

1. 把本仓库复制为 profile 内的 `packages/dsh-jira-tasks/`（可忽略 `.git/`）
2. 编辑该 profile 的 `package.json`：`dependencies` 加 `"dsh-jira-tasks": "file:./packages/dsh-jira-tasks"`，`dsh.profile.bundles` 加 `"dsh-jira-tasks"`
3. 在 profile 目录执行 `pnpm install`，然后重启 DSH
</details>

---

## 兼容性

| 维度 | 覆盖 |
|---|---|
| DSH 版本 | `0.1.7` ~ `0.2.x`（不含 `0.3.0` 及其预发布） |
| 运行形态 | 浏览器（`dsh web`）、桌面端 DeepSeek Harness.app（Electron） |
| 主题 | 浅色 / 深色自适应 |
| JIRA | Server / Data Center REST API v2，PAT（Bearer）或账号密码（Basic）认证 |

## License

MIT
