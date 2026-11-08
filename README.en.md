# JIRA Tasks Panel (DeepSeek Harness Plugin)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[中文](README.md) · **English**

JIRA inside DeepSeek Harness: the **open / reopened** issues assigned to you show up **below the composer input**, and the **left sidebar** gains a **JIRA statistics** entry for project progress, version progress, and each version's issue list. Read-only — it never modifies JIRA.

> **This is a fork of [kim4apple/jira-tasks-dsh-plugin](https://github.com/kim4apple/jira-tasks-dsh-plugin)** (upstream: [liu3734/jira-tasks-dsh-plugin](https://github.com/liu3734/jira-tasks-dsh-plugin)).
> Changes relative to upstream v1.4.0: the settings card gains **"User name / e-mail"** and **"Password"**
> fields; an account + password is sent as the standard `Authorization: Basic base64(user:password)`
> (officially supported on Jira Server / Data Center), while a token still uses `Bearer`. A 401 now
> reports a different, actionable hint depending on Jira Cloud vs. Server/DC.
> See ["JIRA base URL and credentials"](#jira-base-url-and-credentials).

<img width="1898" alt="JIRA tasks panel below the composer input" src="https://github.com/user-attachments/assets/d14d0bd4-4f9f-4aa8-9af8-b8a02a2b7296" />

---

## Quick start (3 steps)

1. **Install the plugin** (browser / web)

   ```bash
   dsh plugin --profile web add dsh-jira-tasks
   ```

   **Restart DSH** afterwards.

2. **Set the JIRA base URL and credentials**: Settings → **JIRA 配置** → fill in the address, then pick one auth method: **user name + password** (common on Server/DC) or **access token / PAT** → a **green** light means it works.

   <img width="1590" alt="Settings → JIRA 配置: address, token and connection light" src="https://github.com/user-attachments/assets/af5f11c6-aa9a-4c3b-84ca-cff6c0017b22" />

   > The card now has four fields: **JIRA base URL**, **user name / e-mail**, **password** and **access token / PAT (Bearer)**. The screenshot above predates account + password.

3. **Set the project key**: click **⚙** on the right of the panel header, enter the project key (e.g. `HCPFYH1`), save — it queries immediately.

---

## Interface

| Where | What | What you can do |
|---|---|---|
| Below the composer | My tasks panel | See your open / reopened issues, click one to open JIRA |
| Left sidebar "JIRA 统计" | Project statistics page | Switch projects, see totals and completion, track versions |
| Version list → version name | Version issue list | See every issue in that version, sort by header, your own first |

### 1. My tasks panel

Shown in both new and active sessions, **collapsed** by default into one header line with the issue count:

- Click the header to expand / collapse the list (newest update first, up to 50 issues)
- Each issue carries a **status badge** (new / in progress / other), priority and type labels
- Click **⟳** to refresh now; click an issue to open its JIRA detail in a **new tab**
- Click **⚙** to change the project key and JQL

<img width="1972" alt="Expanded issue list with status badges and labels" src="https://github.com/user-attachments/assets/9f543e04-a5ad-4b86-85c8-baa2de26f44e" />

### 2. Statistics page

Click **JIRA 统计** in the left sidebar. It is a global page, independent of session and workspace.

<img width="1400" alt="Statistics page: overview cards and the version-statistics list" src="https://raw.githubusercontent.com/liu3734/jira-tasks-dsh-plugin/main/docs/images/stats-overview.webp" />

- **One input box** at the top: its dropdown lists the project keys you already configured (labelled with their workspace), and you can type a project key and press Enter instead
- **Overview cards**: total issues, done, in progress, todo, completion rate
- **Version statistics**: newest release date first, **10 versions per page** with Previous / Next; each row shows release state, release date, issue count, todo / in progress / done and completion
- **⟳ Refresh** updates in the background — no interruption, no full-page flash
- Switching back to a project you already viewed **renders the cache instantly**, then refreshes silently
- Remembers the last project you viewed and reopens on it

### 3. Version issue list

Click any version name to open it.

<img width="1400" alt="Version issue list: sortable headers, your own issues first" src="https://raw.githubusercontent.com/liu3734/jira-tasks-dsh-plugin/main/docs/images/version-tasks.webp" />

- **Click a header to sort**: key / summary / status / priority / type / assignee / updated — click again to reverse
- **Your own issues are listed first** by default, the rest by newest update
- Issue keys are clickable and open JIRA in a new tab
- "← Back to versions" returns to the version list

---

## Configuration

Everything lives in **Settings → JIRA 配置** (left navigation, below Agent presets). The same card in the Plugins panel is the same form — either entry point works.

### JIRA base URL and credentials

The settings card has four fields: **JIRA base URL**, **user name / e-mail**, **password** and **access token / PAT (Bearer)**.

| Field | What to enter | Where it is stored |
|---|---|---|
| JIRA base URL | e.g. `http://jira.example.com/` | Plugin config, readable back in the form |
| User name / e-mail | Login user name on Jira Server/DC; the account e-mail on Jira Cloud | Plugin config, readable back in the form |
| Password | That account's password | Credential store; the UI only shows "saved — leave blank to keep it unchanged" |
| Access token / PAT (Bearer) | Your JIRA personal access token | Credential store; the UI only shows "configured" |

**The auth scheme follows what you filled in:**

| What you filled in | Auth header actually used |
|---|---|
| User name + password (both fields) | `Authorization: Basic base64(user:password)` |
| Access token only | `Authorization: Bearer <token>` |
| Both | **Account + password wins** |

The card always shows this rule:

> Fill in both "user name" and "password" for account login (Basic is used automatically); a token alone is used as PAT/Bearer. Legacy values containing ":" are still treated as Basic. Jira Cloud only accepts "e-mail + API token" and refuses a real password.

- Backward compatible: an old single value like `user:token` (the token contains `:`) is still treated as Basic.
- The password is written **only** to the credential store (`~/.dsh/.credentials.yaml`). It is **never sent back to the frontend** and **never written into the configuration document**; the UI only shows "saved — leave blank to keep it unchanged".
- Saving with the token / password left blank keeps the current value; **Clear settings saved values (fall back to the environment)** drops the saved token, password and user name in one go.
- Saving with the address left blank removes the setting and falls back to `JIRA_BASE_URL` from the environment / credential file

> **Which deployment you run decides whether a password works**
>
> - **Jira Server / Data Center**: account + password works (Atlassian officially supports Basic auth). **Prefer a PAT** (Bearer) anyway — it is easier to revoke.
> - **Jira Cloud**: Atlassian **deprecated password authentication**; it only accepts "e-mail + API token" (Basic) or OAuth 2.0 (3LO). Entering a real password there returns **401**.
> - **Server/DC with 2FA / SSO**: password-based Basic auth does not work — use a PAT.

**Connection light** (at the bottom of the card):

| Light | Meaning |
|---|---|
| 🟢 Green | Address and credentials work; the current user is shown |
| 🔴 Red | Unusable; JIRA's reason is shown (e.g. 401) |
| ⚪ Grey | Address or credentials not configured |

Under the light there is also a **current auth scheme** line: `Basic (user alice)`, `Bearer (access token / PAT)`, or `unknown` before the first test; it shows the scheme that is actually in effect even when the test fails.

Opening the card auto-probes once, and saving re-probes. Click **Test connection** to verify **unsaved input** immediately.

### Issue detail, comments, and attachment downloads

Open the **"详情" / "Detail"** action on any issue in the task panel (below the composer) or in the
version task list to see:

- **All fields** — summary (status / type / priority / assignee / reporter / timestamps), description,
  labels / components / fix versions, and JIRA's **custom fields** (`customfield_*`)
- **Comments** — author, timestamp, body
- **Attachments** — filename, size, type, uploader, timestamp

Attachments can be downloaded directly:

| Action | Result |
|---|---|
| **"下载" / "Download"** on an attachment row | saved under `<workspace>/jira-attachments/<ISSUE-KEY>/`; the saved path is shown in the panel |
| **"下载全部附件" / "Download all"** at the top of the panel | every attachment of the issue, listed with per-file success or failure |

> **Downloading into the workspace is deliberate**: the file lands where your agent can read it —
> just hand it the path ("look at the logs for PROJ-123"). `.log`, `.log.gz`, `.txt`, and `.har`
> attachments can be grepped directly.

**Security boundaries** (enforced by the Host, never by the frontend):

- The frontend sends only an **attachment id**; the Host resolves the download URL from JIRA's own
  response, so the browser cannot point the plugin at an arbitrary URL
- The attachment URL must be on the **same host and port** as the configured JIRA address
- A cross-host redirect is fetched **without** the Authorization header, so credentials are never
  handed to a third party
- Filenames are sanitized (no directories, no `..`, length-capped) and out-of-bounds paths are refused
- Per-attachment size limit defaults to **100 MB** (`maxAttachmentMb`)

> Read-only: it never modifies JIRA.

### Project key and JQL (saved per workspace)

- **Project key**: e.g. `HCPFYH1` — queried immediately after saving, auto-loaded by new sessions in that workspace
- **JQL**: leave empty for the default query, or write your own; `{projectKey}` / `{key}` is replaced with the project key

Default query (Chinese workflow status names):

```jql
project = "{projectKey}" AND status in ("开启", "重新开启") AND assignee = currentUser() ORDER BY updated DESC
```

> Teams using English statuses (Open / Reopened) just set a custom JQL in ⚙.

### Using environment variables (optional)

Instead of the settings card, you can use the launching environment or `~/.dsh/.credentials.yaml`:

```yaml
JIRA_BASE_URL: "http://jira.example.com/"
JIRA_USERNAME: "<account (Server/DC user name, Cloud e-mail)>"
JIRA_PASSWORD: "<account password>"
JIRA_API_TOKEN: "<PAT or user:token>"
```

Precedence:

- Base URL: settings card > `JIRA_BASE_URL` > `JIRA_URL`
- User name: settings card > `JIRA_TASKS_USERNAME` > `JIRA_USERNAME`
- Password: settings card (`JIRA_TASKS_PASSWORD`) > `JIRA_PASSWORD`
- Token: settings card > `JIRA_API_TOKEN` > `JIRA_TOKEN`

**The settings card wins over the environment**, so it can override an already-exported `JIRA_API_TOKEN` / `JIRA_USERNAME` / `JIRA_PASSWORD`.

---

## Desktop app (DeepSeek Harness.app)

The Desktop app uses its own `desktop` profile and only accepts the Desktop-provided `dsh` command (an npm-installed `dsh` refuses to operate on that profile):

1. Open the Desktop app once (to initialize the profile), then **quit it completely** (macOS: `Cmd+Q`; closing the window is not enough)
2. Menu → **Manage dsh Command** → Install, to put the Desktop's own `dsh` on your PATH
3. Install the plugin:

   ```bash
   dsh plugin --profile desktop add dsh-jira-tasks
   ```

4. Reopen the Desktop app

> The Desktop app and the browser **do not share configuration**: project key / JQL are stored per page origin, so configure each surface once. The JIRA base URL and credentials (account + password or token) come from the same settings, so they need no duplication.

---

## Upgrade and uninstall

```bash
# upgrade
dsh plugin --profile web add dsh-jira-tasks@latest

# uninstall (browser / Desktop)
dsh plugin --profile web remove dsh-jira-tasks
dsh plugin --profile desktop remove dsh-jira-tasks
```

**Restart DSH** after upgrading.

---

## Troubleshooting

<details>
<summary>The panel does not appear after installing</summary>

- Make sure DSH was **restarted** (fully quit and reopen the Desktop app)
- Make sure `dsh.profile.bundles` in the profile lists `"dsh-jira-tasks"` (browser: `~/.dsh/profiles/web/package.json`; Desktop: `~/.dsh/profiles/desktop/package.json`). This is the most common cause of a silent no-show — add the entry by hand
- The DSH version must be within the `0.1.7` – `0.2.x` range, otherwise the bundle is skipped
- The Desktop panel says "unconfigured" although you configured it: the Desktop and the browser keep separate project configurations, so configure both
</details>

<details>
<summary>The panel shows "query failed"</summary>

| Message | Fix |
|---|---|
| Project key not set | Click ⚙ on the header and enter the project key |
| JIRA base URL not configured | Fill in the address under Settings → JIRA 配置 |
| JIRA credentials not configured | Fill in the access token under Settings → JIRA 配置, or fill in user name + password |
| 401 … | Invalid credentials or wrong auth scheme: Jira Cloud refuses a real password (only "e-mail + API token" or OAuth 2.0), Server/DC prefers a PAT; re-enter and verify with **Test connection** |
| Cannot parse JIRA response | Network / proxy problem; check whether the machine can reach JIRA |
</details>

<details>
<summary>Clicking a version shows "interface returned an empty response (HTTP 405)"</summary>

The page was updated but the background process still runs the old plugin. **Fully quit and reopen DSH** (refreshing the page is not enough).
</details>

<details>
<summary>Statistics differ from JIRA</summary>

- Status classification follows JIRA's `statusCategory`: any status a workflow maps to the done category counts as done
- Sub-tasks are included
- At most 20,000 issues are scanned per request; beyond that the page shows "only the first N issues" at the top
</details>

<details>
<summary>Manual install without npm</summary>

1. Copy this repository into the profile's `packages/dsh-jira-tasks/` (skip `.git/`)
2. Edit that profile's `package.json`: add `"dsh-jira-tasks": "file:./packages/dsh-jira-tasks"` to `dependencies` and `"dsh-jira-tasks"` to `dsh.profile.bundles`
3. Run `pnpm install` in the profile directory, then restart DSH
</details>

---

## Compatibility

| Dimension | Coverage |
|---|---|
| DSH versions | `0.1.7` – `0.2.x` (excluding `0.3.0` and its prereleases) |
| Surfaces | Browser (`dsh web`) and the Desktop app, DeepSeek Harness.app (Electron) |
| Theme | Adapts to light / dark themes |
| JIRA | Server / Data Center REST API v2, PAT (Bearer) or account + password (Basic) auth |

## License

MIT
