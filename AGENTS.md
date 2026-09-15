# AGENTS.md — 祈愿龙珠 IDW Wiki

给在此项目中工作的 AI Agent / 协作者的说明。**推送前请完整读一遍。**

## 项目性质

纯静态站点（HTML + CSS + JS，**无构建步骤**）。
- 仓库：`emolTzi/qiyuan-dmz-wiki`
- 线上：**https://idw.emoltzi.com/**（GitHub Pages + 自定义域名）
- 部署方式：**push 到 `main` 分支即自动部署**，无需任何构建/发布命令，1-2 分钟生效

## 工作目录（Windows）

```
C:\Users\Tzi\WorkBuddy\qiyuan-dmz-wiki
```

> ⚠️ `C:\Development\qiyuan-dmz-wiki` 是**旧副本**，不要在那里改、也不要推送，会与正本冲突。

## 关键文件（勿动）

| 文件 | 说明 |
|---|---|
| `CNAME` | 内容仅一行 `idw.emoltzi.com`。**绝对不要删除或修改**，删了自定义域名立即失效 |
| `.nojekyll` | 空文件，禁用 Jekyll 处理。不要删除 |

## 环境状态（已就绪，无需配置）

- **git** 2.54 已装，提交身份已配：`emolTzi` / `122765857+emolTzi@users.noreply.github.com`
- **GitHub 认证**：Windows 凭据管理器已保存凭据（`git:https://github.com` → emolTzi），推送**不需要输入密码或令牌**
- **代理**：git 已配置 per-domain 代理，走本机 v2rayN：

```
http.https://github.com.proxy          = socks5h://127.0.0.1:10808
http.https://raw.githubusercontent.com.proxy = socks5h://127.0.0.1:10808
http.https://api.github.com.proxy      = socks5h://127.0.0.1:10808
http.https://codeload.github.com.proxy = socks5h://127.0.0.1:10808
```

> 🔴 **前提：推送前必须确认 v2rayN 正在运行**（监听 127.0.0.1:10808）。
> 未运行时 git 会报 `Could not resolve host: github.com` 或连接超时 —— 此时**不要改动任何 git 配置**，只需启动 v2rayN 后重试。

## 推送流程

```powershell
cd C:\Users\Tzi\WorkBuddy\qiyuan-dmz-wiki
git status                     # 1. 确认改动内容（先看清楚再提交）
git add -A                     # 2. 暂存全部改动
git commit -m "改动说明"        # 3. 提交（中文说明可用）
git push                       # 4. 推送（代理与认证自动生效）
```

成功输出形如：`f4a51af..2504de3  main -> main`

## 常见问题处理

| 现象 | 原因 | 处理 |
|---|---|---|
| `Could not resolve host` / 超时 | v2rayN 未运行 | 启动 v2rayN，重试；不要改 git 配置 |
| `Updates were rejected` / `non-fast-forward` | 远程有本地没有的提交（例如有人在 GitHub 网页改过、或另一台机器推过） | `git pull --rebase` 然后 `git push`；若 rebase 报冲突，**停止并报告冲突文件**，不要强推 |
| `nothing to commit` | 没有实际改动 | 确认文件已保存；无需推送 |
| `LF will be replaced by CRLF` | 行尾符提示 | **不是错误**，忽略 |
| PowerShell 输出中文乱码 | 控制台编码 | **不影响命令执行**，忽略 |

## 查询部署状态（可选）

`gh` CLI **不读取 git 的代理配置**，需要显式设置代理环境变量：

```powershell
$env:HTTPS_PROXY = "socks5h://127.0.0.1:10808"
gh api /repos/emolTzi/qiyuan-dmz-wiki/pages --jq '.status'   # building → built
```

`built` 表示部署完成。也可直接访问 https://idw.emoltzi.com/ 验证。

## 内容编辑约定

- **破缓存**：修改 `assets/css/*.css` 或 `assets/js/*.js` 后，把各 HTML 页面里资源引用的 `?v=N` 统一递增为 `?v=N+1`（如 `style.css?v=3` → `?v=4`），否则浏览器可能继续使用旧缓存
- **页面清单**：`index.html`（首页）、`races.html` / `race.html`（种族）、`ki.html`（气功）、`strikes.html`（近战）、`skills.html`（技能）、`classes.html`（职业）、`advanced.html`（进阶）、`guide.html`（指南）
- **数据源**：`assets/js/data.js` 为数据表（种族/形态/气功等），改数值优先改这里
- 保持现有视觉风格（深蓝渐变 + 金色边框 + 星空/黑洞动效），除非明确要求改版

## 绝对不要做

1. 不要删除或修改 `CNAME`、`.nojekyll`
2. 不要在 `C:\Development\qiyuan-dmz-wiki`（旧副本）操作
3. 不要用 `git push --force` 覆盖远程历史
4. 不要把令牌、密钥等敏感信息写入本仓库（**公开仓库**）
5. 不要修改 git 全局代理配置来"修复"网络问题（先检查 v2rayN 是否运行）
