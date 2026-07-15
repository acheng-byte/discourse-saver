> **维护说明**：当前不定期维护 Raw Edition 特别版（`raw-edition/` 目录）。
> 稳定版（根目录）和油猴脚本（`.user.js`）不再更新，代码保留供参考。
> 请使用 Raw Edition 获取最新功能与 Bug 修复。
> 油猴脚本一键安装：[discourse-saver-raw.user.js](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js)

# Discourse Saver v1.1.2

**中文 | [English](README_EN.md)**

通用 Discourse 论坛内容保存工具，支持将任意 Discourse 论坛的帖子和评论保存到多种目标平台。支持 **Chrome 扩展** 和 **油猴脚本** 两种安装方式。

如果这个插件对你有帮助，欢迎通过 [爱发电](https://ifdian.net/a/acheng111) 支持开发者 ❤️

---

## 目录

- [安装教程](#安装)
- [使用方法](#使用方法)
- [配置教程](#配置教程)
  - [Obsidian 设置](#obsidian-设置)
  - [飞书多维表格设置](#飞书设置)
  - [Notion 设置](#notion-设置)
  - [WebDAV 设置（坚果云等）](#webdav-设置)
  - [百度网盘设置](#百度网盘设置)
  - [HTML / MD 导出](#html--md-导出)
  - [内容设置](#内容设置)
- [支持的 Discourse 论坛](#支持的-discourse-论坛)
- [常见问题](#常见问题)
- [更新日志](#更新日志)

---

## 安装

### Chrome 扩展

1. 从 [GitHub Releases](https://github.com/acheng-byte/discourse-saver/releases) 下载最新版本并解压，或 `git clone` 本仓库
2. 打开 `chrome://extensions/`（Edge 用 `edge://extensions/`）
3. 开启右上角「开发者模式」
4. 点击「加载已解压的扩展程序」，选择 `raw-edition` 文件夹
5. 扩展图标出现在浏览器工具栏即安装成功

### 油猴脚本

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 访问 [油猴脚本安装页](https://acheng-byte.github.io/discourse-saver/install.html) 一键安装
3. 脚本会自动识别 Discourse 论坛并启用

---

## 使用方法

| 操作 | 效果 |
|-----|------|
| **单击** 帖子链接按钮 🔗 | 保存主帖（如开启评论设置则包含评论） |
| **单击** 评论链接按钮 | 保存主帖 + 该条评论 |
| **双击** 链接按钮 | 复制链接到剪贴板 |
| **长按** 楼层按钮 | 选择指定楼层保存（支持多楼层） |

---

## 配置教程

点击浏览器工具栏的扩展图标 → 右键 → 「选项」进入设置页面。

### Obsidian 设置

**前提条件：** 安装 Obsidian 并打开你的 Vault。

1. **Vault 名称**：留空自动使用当前打开的 Vault（推荐）
2. **保存文件夹**：帖子保存到的文件夹路径，如 `Discourse收集箱`
3. **Advanced URI**：推荐开启，需安装 Obsidian 社区插件 [Advanced URI](https://obsidian.md/plugins?id=obsidian-advanced-uri)，支持大文件保存
4. **下载图片/视频/附件到 Vault**：
   - 需安装 Obsidian 社区插件 [Local REST API](https://obsidian.md/plugins?id=obsidian-local-rest-api)
   - 在 Obsidian 设置 → Local REST API 中获取 API Key，填入插件设置
   - 开启后图片/视频/附件（PDF、DOCX 等）会直接下载到 Vault 文件夹
   - Markdown 中使用相对路径引用本地文件
5. **图片嵌入（Base64）**：与下载互斥，将图片转为 Base64 直接嵌入 Markdown

### 飞书设置

详细图文教程：[飞书配置指南](https://acheng-byte.github.io/discourse-saver/feishu-guide.html)

**快速步骤：**

1. 访问 [飞书开放平台](https://open.feishu.cn/app) 创建企业自建应用
2. 获取 **App ID** 和 **App Secret**
3. 在应用权限中添加：`bitable:app`（多维表格读写权限）
4. 如需上传云文档，还需添加：`docs:doc`、`drive:drive` 权限
5. 发布应用并审批通过
6. 创建多维表格，获取 **app_token**（URL 中 `/base/` 后的字符串）和 **table_id**
7. 在表格中添加字段：标题（文本）、链接（URL）、正文（文本）等

### Notion 设置

详细图文教程：[Notion 配置指南](https://acheng-byte.github.io/discourse-saver/notion-guide.html)

**快速步骤：**

1. 访问 [Notion Developers](https://www.notion.so/my-integrations) 创建 Integration
2. 复制 **Internal Integration Token**
3. 创建 Database 并添加 Integration 连接
4. 在插件中填入 Token 和 Database ID
5. 配置属性映射（标题、链接、作者等字段对应关系）

### WebDAV 设置

支持坚果云、Nextcloud 等 WebDAV 协议的网盘。

**坚果云配置步骤：**

1. 登录 [坚果云网页版](https://www.jianguoyun.com)
2. 进入「账户信息 → 安全选项」
3. 添加「应用密码」（不是登录密码）
4. 在插件中填入：
   - **WebDAV URL**：`https://dav.jianguoyun.com/dav/`
   - **用户名**：你的坚果云邮箱
   - **密码**：刚才生成的应用密码
   - **保存路径**：如 `/Discourse收集箱`
5. 点击「测试连接」确认配置正确

### 百度网盘设置

**V1.1.2 新增设备码授权流程**，无需配置 App Key，一键授权登录。

**配置步骤：**

1. 在设置页切换到「百度网盘」Tab
2. 点击「百度网盘授权登录」按钮
3. 浏览器会自动打开百度设备授权页面
4. 页面会显示一个设备码，确认即可
5. 在百度登录页面输入你的百度账号密码完成授权
6. 授权成功后 Token 自动保存，后续无需重复授权
7. 帖子会保存到百度网盘 `/apps/ob-sync/Discourse收集箱/` 目录下

> **注意**：如果授权失败，请清除浏览器缓存后重试。Token 过期后会自动刷新，无需重新授权。

### HTML / MD 导出

- **HTML 导出**：生成独立 HTML 文件，包含 5 种主题（L站原风格、极客、商务、樱花、薰衣草），支持 PDF 导出、代码复制、图片 Lightbox
- **MD 文件导出**：将生成的 Markdown 文件直接下载到本地指定目录，方便不使用 Obsidian 的用户直接查看

### 内容设置

- **元数据（Frontmatter）**：在 Markdown 头部添加来源、作者、分类、标签等 YAML 元数据
- **帖子信息 Callout**：在正文前添加 Obsidian Callout 格式的信息框
- **保存评论**：自动抓取帖子评论，支持全部保存或指定楼层范围
- **渲染 Reactions**：将帖子的反应（打call/Boosts/❤️/👍等）渲染为评论区域，显示每个反应的用户名和可点击链接
- **下载图片/附件**：通过 REST API 将图片、视频、附件下载到 Vault

---

## 支持的 Discourse 论坛

插件会自动检测 Discourse 论坛，以下热门站点已内置快速识别：

| 论坛 | 域名 |
|------|------|
| Linux.do | linux.do |
| Discourse Meta | meta.discourse.org |
| OpenAI Community | community.openai.com |
| Obsidian Forum | forum.obsidian.md |
| Cursor Forum | forum.cursor.com |
| Cloudflare Community | community.cloudflare.com |
| Docker Forums | forums.docker.com |
| Python Discourse | discuss.python.org |
| GitLab Forum | forum.gitlab.com |
| HashiCorp Discuss | discuss.hashicorp.com |
| Elastic Discuss | discuss.elastic.co |
| Home Assistant | community.home-assistant.io |
| Bitwarden Community | community.bitwarden.com |
| Proxmox Forum | forum.proxmox.com |
| Unity Forum | forum.unity.com |
| Unreal Engine | forums.unrealengine.com |
| Let's Encrypt | community.letsencrypt.org |
| Rust Users | users.rust-lang.org |
| Swift Forums | forums.swift.org |
| Mozilla Discourse | discourse.mozilla.org |
| Trae | trae.ai / trae.com.cn |
| 以及所有 *.discourse.group 子域名 | ... |

> 其他 Discourse 论坛也会被自动检测（通过 meta 标签、DOM 结构等方式），无需手动添加。如果某个站点未被识别，可以在设置页「自定义站点」中手动添加。

---

## 常见问题

**Q: 保存到 Obsidian 失败？**
A: 确认 Obsidian 已打开，且安装了 Advanced URI 插件（推荐）。如果下载图片失败，检查 Local REST API 插件是否启用，API Key 是否正确。

**Q: 飞书保存报错？**
A: 检查 App ID/Secret 是否正确，应用是否已发布并审批通过。详见 [飞书配置指南](https://acheng-byte.github.io/discourse-saver/feishu-guide.html)。

**Q: 百度网盘授权失败？**
A: V1.1.2 改用设备码授权流程，点击授权按钮后会自动打开百度设备页面。如果仍然失败，清除浏览器缓存后重试。

**Q: 某些论坛无法识别？**
A: 在设置页「自定义站点」中添加论坛域名。大部分 Discourse 论坛会被自动检测。

**Q: 代码块渲染不正确？**
A: Raw Edition 使用 Discourse 原始 Markdown 源码，代码块结构完整保留。如果在 Obsidian 中显示异常，检查是否安装了冲突的社区插件。

**Q: 如何同时保存到多个平台？**
A: 所有保存目标完全独立，可以同时启用多个。例如同时开启 Obsidian + 飞书 + HTML 导出，一键保存到三个地方。

---

## 更新日志

### v1.1.2

- 百度网盘 OAuth 改为设备码授权流程（Device Code Flow），解决 redirect_uri_mismatch
- 新增 Reactions（打call/Boosts）渲染为评论，显示用户名和可点击链接
- 新增附件下载（PDF/DOCX/XLSX/ZIP等），OB 通过 REST API 保存到 Vault
- 新增 MD 文件导出功能，下载到本地指定目录
- 新增爱发电支持渠道
- 内置 50+ 热门 Discourse 论坛快速识别
- 修复 reactions 未传入 Markdown 转换的关键 Bug
- 修复设置页 WebDAV/百度网盘 Tab 内开关失效
- 时间格式统一为北京时间 toLocaleString
- 补全 i18n 翻译

### v1.1.0

- Raw Edition 特别版首发
- 新增 WebDAV、百度网盘保存目标
- 新增飞书云文档模式
- 新增指定楼层保存
- 改进悬浮按钮交互

---

## 许可证

MIT License - 自由使用、修改和分发。

## 致谢

- [LinuxDo](https://linux.do)
- [Obsidian](https://obsidian.md)
- [飞书开放平台](https://open.feishu.cn)
- [Notion](https://www.notion.so)
- [Turndown](https://github.com/mixmark-io/turndown)

## 支持开发者

如果这个插件对你有帮助，欢迎通过以下方式支持：

- **爱发电**：[https://ifdian.net/a/acheng111](https://ifdian.net/a/acheng111)（推荐，无手续费）
- 点击设置页「请我喝杯咖啡」按钮，支持微信/支付宝
