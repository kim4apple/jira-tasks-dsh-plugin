# 实施记录：dsh-jira-tasks 账号密码登录支持

- 上游仓库：<https://github.com/liu3734/jira-tasks-dsh-plugin.git>（clone 于 `research/jira-src/repo`）
- **Fork：<https://github.com/kim4apple/jira-tasks-dsh-plugin>**
- 基线：`main @ db3a1af`（v1.4.0）
- 分支：`feature/explicit-account-password-auth`（已合并进 fork 的 `main`）
- 契约：[SPEC.md](SPEC.md)
- 补丁：`account-password.patch`（可干净 apply 到上游 main）／`commits/`（format-patch 提交序列）

## 已推送到 fork 的提交

| commit | 内容 | 文件 |
|---|---|---|
| `17cf8b7` | docs：说明账号密码登录方式与 Cloud/DC 差异 | `README.md` `README.en.md` `manifest.json` |
| `64d327a` | feat：设置卡片新增用户名/密码输入，账号密码优先于令牌 | `lib/client.js` |
| `2b840e7` | feat：Host 侧支持显式账号密码（Basic）与令牌（Bearer） | `lib/index.js` `plugin/host.js` |
| `af60b28` | docs：修正账号引用的描述（设置页账号写入 Config） | `manifest.json` |
| `30dd43f` | chore：版本升到 1.5.0，README 补 fork 说明 | `package.json` `manifest.json` `README*.md` |
| `78487e8` | merge：合并 feature 分支 | — |

合计 7 个文件，+513 / −98。

> **发布工作流已 fork 适配并推送**（commit `f25982f`）：`.github/workflows/npm-publish-github-packages.yml`
> 里 GitHub Packages 的作用域名原写死 `@liu3734/dsh-jira-tasks`，现改为
> `@${{ github.repository_owner }}/dsh-jira-tasks`，fork 发布进自己的命名空间。
> （当时推不上去是因为 gh 令牌缺 `workflow` scope；已通过
> `gh auth refresh -h github.com -s workflow` 补上并推送成功。）
> 该工作流只在**创建 Release** 或手动 dispatch 时触发，推送代码不会触发。
> 注意 npmjs.org 那一步仍用无作用域的 `dsh-jira-tasks` 名字，
> 因此只对拥有该 npm 包名的账号生效；fork 发到 GitHub Packages 用的是
> `@kim4apple/dsh-jira-tasks`。

## 已安装到 DSH（desktop + web 两个 profile）

构建产物打包到稳定路径，两个 profile 都从它安装：

```
~/.dsh/plugin-packs/dsh-jira-tasks-1.5.0.tgz     (48 KB, 由 fork 的 main 构建)

desktop  spec: file:~/.dsh/plugin-packs/dsh-jira-tasks-1.5.0.tgz  | v1.5.0 | in bundles ✓
web      spec: file:~/.dsh/plugin-packs/dsh-jira-tasks-1.5.0.tgz  | v1.5.0 | in bundles ✓
```

安装命令：

```bash
dsh plugin --profile desktop add ~/.dsh/plugin-packs/dsh-jira-tasks-1.5.0.tgz
dsh plugin --profile web    add ~/.dsh/plugin-packs/dsh-jira-tasks-1.5.0.tgz
```

> **为什么用本地 tarball 而不是 `github:kim4apple/jira-tasks-dsh-plugin`**：这台机器到
> github.com 的 **git smart-HTTP 端点**时通时不通 —— `git ls-remote` 连测 3 次全部 25 秒
> 超时，而同一时刻 `gh api` 与 codeload 压缩包下载都正常。pnpm 装 `github:` 依赖必须先
> `git ls-remote`，于是会卡死（实测卡了 5 分钟以上）。改用本地 tarball 后安装耗时
> **455 ms – 1.1 s**。
>
> 源码仍然以你的 fork 为准（`https://github.com/kim4apple/jira-tasks-dsh-plugin`，`main` 已推）。
> 等 git 链路稳定时想切回 fork 引用，一条命令即可：
> `dsh plugin --profile desktop add github:kim4apple/jira-tasks-dsh-plugin`

`dsh plugin` 只是把参数转发给 profile 目录里的 pnpm；`/usr/local/bin/dsh` 是桌面端自带的
那份 CLI（软链到 `DeepSeek Harness.app/Contents/Resources/runtime/cli/bin/dsh`），
因此能直接操作 Electron 独占的 desktop profile。

**让运行中的 DSH 加载新代码**：应用不会自动重新 import 插件模块。
不重启应用的办法是让插件重新挂载（这正是 GUI 插件管理器的开关动作）：

```bash
# 通过插件管理器把 jira-tasks 关闭再打开
```

实测：关闭 → 打开之后，运行中的 DSH 立刻开始返回新版的 `authMode` 字段，
并按账号密码构造 `Authorization: Basic …`。

## 运行中实例的活体证据（不是读代码，是查运行中的 DSH）

| 检查方式 | 结果 |
|---|---|
| `POST /jira/api/test` 传账号密码 | `{"ok":true,"user":"Alice","authMode":"basic"}`，实际发出 `Basic …` → `alice:s3cr3t` |
| Inspect `Config.listConfigs(include:jira-tasks)` | 运行中实例的 Config schema 已含 `username` 字段（v1.4.0 只有 `baseUrl`） |
| Inspect `Slots.listSubTree(settings.section)` | 渲染进程里 `jira-tasks` 设置分区已挂载且 active |

## 对运行中的 DSH 的实测结果

| 场景 | 插件返回 | 实际发出的头 |
|---|---|---|
| 账号 + 密码（草稿） | `{"ok":true,"user":"Alice","authMode":"basic"}` | `Basic …` → `alice:s3cr3t` |
| 只有令牌 | `{"ok":true,"user":"Token User","authMode":"bearer"}` | `Bearer goodtoken` |
| 旧值 `user:token`（兼容） | `{"ok":true,"authMode":"basic"}` | `Basic …` → `alice:s3cr3t` |
| 密码错误 | `{"ok":false,"code":"auth","error":"Authentication required 账号或密码不正确；该实例也可能只接受 PAT（Bearer）或 API token。"}` | `Basic …` → `alice:wrong` |
| 未配置凭据 | `{"ok":false,"code":"unconfigured","error":"未配置 JIRA 凭据（账号密码或访问令牌）"}` | 未发请求 |

Jira Cloud 专属提示分支（`*.atlassian.net` + Basic → 401）由离线 harness 覆盖
（harness 把 Cloud 域名重写到本地 mock，不向 Atlassian 发任何请求）。

## 认证模型（改后）

```
buildAuthHeader(token, account):
  1) username && password  → Basic base64(username:password)      // 新增的正规入口
  2) token 含 ":"          → Basic base64(token)                   // 向后兼容旧值
  3) 其余                   → Bearer token
```

优先级：**显式账号密码 > 含冒号的旧值 > 纯令牌**。老配置里「用户名:令牌」这种单值继续按 Basic 工作，
不需要用户改任何东西。

凭据来源：

| 槽位 | 优先级 | 存放位置 |
|---|---|---|
| 账号 | Config `username` → `JIRA_TASKS_USERNAME` → `JIRA_USERNAME` | Config（明文、非机密、可回显） |
| 密码 | `JIRA_TASKS_PASSWORD` → `JIRA_PASSWORD` | **凭据存储** `~/.dsh/.credentials.yaml` (0600) |
| 令牌 | `JIRA_TASKS_TOKEN` → `JIRA_API_TOKEN` → `JIRA_TOKEN` | 凭据存储（现状不变） |

**密码绝不进 Config** —— Config 会明文落到 profile 的 `cordis.patch.yml`。
**账号可以进 Config** —— 账号不是机密，放 Config 才能在界面上回显「当前账号是 alice」。

## 关键实现点

- **认证头仍只走 stdin**：沿用 `curl --config -`，令牌/密码从不进 argv（harness 有断言守着）。
- **`authMode` 往返**：Host 在 `/jira/api/test` 的成功与失败响应里都返回 `authMode`
  （`basic` / `bearer`），前端据此显示「当前认证方式：Basic（账号 alice）」。
- **可操作的 401**：按 `*.atlassian.net` 判别部署形态 ——
  Cloud 提示「Jira Cloud 不接受账号密码登录，请改用「邮箱 + API token」（Basic）或 PAT（Bearer）」；
  Server/DC 提示「账号或密码不正确；该实例也可能只接受 PAT（Bearer）或 API token」。
- **`btoa` → `Buffer.from(…, 'utf-8')`**：`plugin/host.js` 的动态插件形态原先用 `btoa`，
  遇到非 Latin-1 密码（如中文）会抛异常；bundle 形态本来就是 `Buffer.from`。
- **密码不 trim**：首尾空格是密码的一部分；令牌仍沿用原来的 trim。
- **草稿只用于探测**：「测试连接」把未保存的账号/密码发给本机 Host，不落盘。

## 验证

`harness/run-harness.mjs` —— 加载**真实的** `lib/index.js`，用桩 Cordis 上下文挂载插件，
驱动插件自己的 `/jira/api/test` 路由打本地 mock Jira，由 mock 记录它收到的 `Authorization` 头。
这不是把逻辑重写一遍测，而是跑实际出货的代码路径。

```
结果：29 通过，0 失败
```

覆盖：账号密码（Config+凭据 / 纯草稿）、Bearer 令牌、旧值兼容、优先级、密码含冒号、
非 Latin-1 密码、401 非 Cloud 提示、401 Cloud 专属提示、未配置凭据、
**认证头不出现在 argv**、环境变量兜底。

其它检查：`node --check`（`lib/index.js`、`lib/client.js`、`plugin/host.js` 按其 snippet 形态包一层）、
`manifest.json` JSON 解析、Config schema 校验（含 `username` 键与 volatile `.get()` 读取）、
`git apply --check`（补丁干净落到 main）。

## 未做（明确留给发布决策）

- **没有 bump `package.json` 版本**：仓库的 GitHub Actions 在版本变化时会自动发布到 npm /
  GitHub Packages，版本号与发布是发布决策，不在本次改动范围内。
- **没有碰本机已安装的插件**：`~/.dsh/profiles/desktop/node_modules/dsh-jira-tasks/` 保持原样
  （仍是 v1.4.0）。要试用需自行安装本分支构建产物。
- **没有跑真实 Jira**：所有 HTTP 观测都打在本机 mock 上。
- **`plugin/client.js` 未改**：动态插件形态没有设置卡片，账号/密码只能由环境变量或凭据存储提供；
  已在 `manifest.json` 的 `envVars` / `credentialRefs` 中声明。

## 复现

```bash
cd research/jira-src/repo
mkdir -p node_modules/@deepseek-ai
ln -sfn ~/.dsh/profiles/desktop/node_modules/@deepseek-ai/schemastery \
         node_modules/@deepseek-ai/schemastery     # 仅测试用，已被 .gitignore 排除
cd ..
node harness/run-harness.mjs
```
