# Discourse Saver V5.3.1

**中文 | [English](README_EN.md)**

通用 Discourse 论坛内容保存工具 - 一键保存任意 Discourse 论坛（如 LinuxDo、Discourse Meta、Rust Users 等数百个站点）的帖子和评论到 Obsidian、飞书多维表格、Notion、语雀、思源笔记，或导出为 HTML 文件。

支持 **Chrome 扩展** 和 **油猴脚本（Tampermonkey）** 两种安装方式。

> **V5.3.1 更新**（2026-04-02）：
> - **飞书上传选项独立控制** - 正文/MD附件/HTML附件三项独立勾选
> - **全面审计修复14项bug** - 静默失败、缓存导致卡死、警告未显示等
> - **详细日志增强** - 保存路径、文件名、文件大小全部记录
>
> **V5.1 更新**：
> - **语雀支持** - 保存帖子到语雀知识库
> - **思源笔记支持** - 通过本地内核 API 保存帖子到思源笔记
> - **Tab 标签页布局** - 设置页面重构为清晰的标签页导航
> - **三种主题模式** - 支持浅色/深色/跟随系统主题切换
> - **HTML 导出增强** - 图片 Lightbox、表格全屏/复制、5 种主题、PWA、PDF 导出
> - **油猴脚本版** - 支持 Tampermonkey/Greasemonkey，跨浏览器通用

## 浏览器支持

### Chrome 扩展

| 浏览器 | 支持状态 | 说明 |
|-------|---------|------|
| Chrome | ✅ 完全支持 | 原生支持 |
| Edge | ✅ 完全支持 | 基于 Chromium，完全兼容 |
| Brave | ✅ 完全支持 | 基于 Chromium，完全兼容 |
| Opera | ✅ 完全支持 | 基于 Chromium，完全兼容 |
| Firefox | ❌ 不支持 | 扩展 API 不兼容（请使用油猴脚本版） |
| Safari | ❌ 不支持 | 扩展 API 不兼容（请使用油猴脚本版） |

### 油猴脚本（Tampermonkey）

| 浏览器 | 支持状态 | 说明 |
|-------|---------|------|
| Chrome | ✅ 支持 | 需安装 Tampermonkey 扩展 |
| Edge | ✅ 支持 | 需安装 Tampermonkey 扩展 |
| Firefox | ✅ 支持 | 需安装 Tampermonkey/Greasemonkey 扩展 |
| Safari | ✅ 支持 | 需安装 Userscripts 扩展 |
| Opera | ✅ 支持 | 需安装 Tampermonkey 扩展 |

## 支持的论坛

### 已测试兼容站点（56个，通过率 93.3%）

#### 编程语言社区 (12/12)

| 站点 | URL | 状态 |
|------|-----|------|
| Rust Users | [users.rust-lang.org](https://users.rust-lang.org) | ✅ |
| Swift Forums | [forums.swift.org](https://forums.swift.org) | ✅ |
| Go Forum | [forum.golangbridge.org](https://forum.golangbridge.org) | ✅ |
| Julia | [discourse.julialang.org](https://discourse.julialang.org) | ✅ |
| Elixir Forum | [elixirforum.com](https://elixirforum.com) | ✅ |
| Haskell | [discourse.haskell.org](https://discourse.haskell.org) | ✅ |
| Scala Users | [users.scala-lang.org](https://users.scala-lang.org) | ✅ |
| OCaml | [discuss.ocaml.org](https://discuss.ocaml.org) | ✅ |
| Crystal | [forum.crystal-lang.org](https://forum.crystal-lang.org) | ✅ |
| Clojure | [clojureverse.org](https://clojureverse.org) | ✅ |
| Purescript | [discourse.purescript.org](https://discourse.purescript.org) | ✅ |
| Zig | [ziggit.dev](https://ziggit.dev) | ✅ |

#### AI/ML社区 (3/3)

| 站点 | URL | 状态 |
|------|-----|------|
| OpenAI Community | [community.openai.com](https://community.openai.com) | ✅ |
| Hugging Face | [discuss.huggingface.co](https://discuss.huggingface.co) | ✅ |
| PyTorch | [discuss.pytorch.org](https://discuss.pytorch.org) | ✅ |

#### Web框架 (3/4)

| 站点 | URL | 状态 |
|------|-----|------|
| Django | [forum.djangoproject.com](https://forum.djangoproject.com) | ✅ |
| Ruby on Rails | [discuss.rubyonrails.org](https://discuss.rubyonrails.org) | ✅ |
| Ember | [discuss.emberjs.com](https://discuss.emberjs.com) | ✅ |
| Vue.js | [forum.vuejs.org](https://forum.vuejs.org) | ❌ API受限 |

#### DevOps/云服务 (8/9)

| 站点 | URL | 状态 |
|------|-----|------|
| Docker Community | [forums.docker.com](https://forums.docker.com) | ✅ |
| Kubernetes | [discuss.kubernetes.io](https://discuss.kubernetes.io) | ✅ |
| Terraform (HashiCorp) | [discuss.hashicorp.com](https://discuss.hashicorp.com) | ✅ |
| Ansible | [forum.ansible.com](https://forum.ansible.com) | ✅ |
| GitLab | [forum.gitlab.com](https://forum.gitlab.com) | ✅ |
| CircleCI | [discuss.circleci.com](https://discuss.circleci.com) | ✅ |
| Fly.io | [community.fly.io](https://community.fly.io) | ✅ |
| Vercel | [vercel.community](https://vercel.community) | ✅ |
| Rancher | [forums.rancher.com](https://forums.rancher.com) | ❌ API受限 |

#### 数据库 (5/5)

| 站点 | URL | 状态 |
|------|-----|------|
| Elastic | [discuss.elastic.co](https://discuss.elastic.co) | ✅ |
| MongoDB | [mongodb.com/community/forums](https://www.mongodb.com/community/forums) | ✅ |
| Redis | [forum.redis.io](https://forum.redis.io) | ✅ |
| CockroachDB | [forum.cockroachlabs.com](https://forum.cockroachlabs.com) | ✅ |
| TimescaleDB | [timescale.com/forum](https://www.timescale.com/forum) | ✅ |

#### 开源项目 (8/8)

| 站点 | URL | 状态 |
|------|-----|------|
| Fedora | [discussion.fedoraproject.org](https://discussion.fedoraproject.org) | ✅ |
| Ubuntu | [discourse.ubuntu.com](https://discourse.ubuntu.com) | ✅ |
| NixOS | [discourse.nixos.org](https://discourse.nixos.org) | ✅ |
| Home Assistant | [community.home-assistant.io](https://community.home-assistant.io) | ✅ |
| Hugo | [discourse.gohugo.io](https://discourse.gohugo.io) | ✅ |
| Let's Encrypt | [community.letsencrypt.org](https://community.letsencrypt.org) | ✅ |
| Grafana | [community.grafana.com](https://community.grafana.com) | ✅ |
| Tor Project | [forum.torproject.net](https://forum.torproject.net) | ✅ |

#### 游戏开发 (5/5)

| 站点 | URL | 状态 |
|------|-----|------|
| Godot | [forum.godotengine.org](https://forum.godotengine.org) | ✅ |
| Defold | [forum.defold.com](https://forum.defold.com) | ✅ |
| Phaser | [phaser.discourse.group](https://phaser.discourse.group) | ✅ |
| Roblox DevForum | [devforum.roblox.com](https://devforum.roblox.com) | ✅ |
| Unreal Engine | [forums.unrealengine.com](https://forums.unrealengine.com) | ✅ |

#### 区块链/Web3 (4/4)

| 站点 | URL | 状态 |
|------|-----|------|
| Ethereum Research | [ethresear.ch](https://ethresear.ch) | ✅ |
| Polkadot | [forum.polkadot.network](https://forum.polkadot.network) | ✅ |
| Cosmos | [forum.cosmos.network](https://forum.cosmos.network) | ✅ |
| Near Protocol | [gov.near.org](https://gov.near.org) | ✅ |

#### 生产力工具 (2/2)

| 站点 | URL | 状态 |
|------|-----|------|
| Obsidian | [forum.obsidian.md](https://forum.obsidian.md) | ✅ |
| Logseq | [discuss.logseq.com](https://discuss.logseq.com) | ✅ |

#### 浏览器/隐私 (2/2)

| 站点 | URL | 状态 |
|------|-----|------|
| Brave Community | [community.brave.com](https://community.brave.com) | ✅ |
| Bitwarden | [community.bitwarden.com](https://community.bitwarden.com) | ✅ |

#### 其他 (3/4)

| 站点 | URL | 状态 |
|------|-----|------|
| Netlify | [answers.netlify.com](https://answers.netlify.com) | ✅ |
| Webflow | [forum.webflow.com](https://forum.webflow.com) | ✅ |
| Linux.do | [linux.do](https://linux.do) | ✅ |
| Atom/Electron | [discuss.atom.io](https://discuss.atom.io) | ❌ 已关闭 |

### 需要登录的站点

以下站点需要登录才能访问，插件在登录后应可正常工作：

| 站点 | URL | 备注 |
|------|-----|------|
| Envato Forums | [forums.envato.com](https://forums.envato.com) | 商业论坛 |
| Revolut Community | [community.revolut.com](https://community.revolut.com) | 金融服务 |
| Cloudflare Community | [community.cloudflare.com](https://community.cloudflare.com) | 需要账号 |
| Unity Discussions | [discussions.unity.com](https://discussions.unity.com) | 开发者账号 |
| Affinity Forum | [forum.affinity.serif.com](https://forum.affinity.serif.com) | 产品用户 |

### 非 Discourse 站点（不支持）

| 站点 | URL | 实际框架 | 说明 |
|-----|-----|---------|------|
| **Ruby China** | [ruby-china.org](https://ruby-china.org) | Homeland | 外观类似但框架不同 |
| **V2EX** | [v2ex.com](https://v2ex.com) | 自研 | 非 Discourse |
| **NodeSeek** | [nodeseek.com](https://nodeseek.com) | 自研 | 非 Discourse |
| **LearnKu** | [learnku.com](https://learnku.com) | 自研 | 非 Discourse |

> **注意**：以上站点虽然是技术社区，但使用的不是 Discourse 框架，因此不支持。

### 自定义站点

对于私有部署或未被自动检测的 Discourse 站点，可以在设置中手动添加。

## 核心功能

| 操作 | 效果 |
|-----|------|
| **单击** 主帖链接按钮 | 保存主帖到 Obsidian/飞书/Notion/语雀/思源笔记 |
| **单击** 评论链接按钮 | 保存主帖 + 该评论（文件名：`标题-X楼.md`） |
| **双击** 链接按钮 | 复制链接到剪贴板 |
| **Ctrl+Shift+S**（Mac: **⌘+Shift+S**）| 快捷键保存主帖 |

---

## V5.1 新功能

### 油猴脚本版（V5.1）

| 特性 | 说明 |
|-----|------|
| **跨浏览器** | 支持 Chrome/Edge/Firefox/Safari 等所有主流浏览器 |
| **Tampermonkey** | 通过油猴扩展安装，无需开发者模式 |
| **40+ 论坛** | 通过 @match 规则匹配 40+ Discourse 论坛 |
| **五平台保存** | Obsidian / 飞书 / Notion / 语雀 / 思源 / HTML 导出 |
| **评论保存** | 支持折叠模式和用户名超链接 |

> **安装地址**：[油猴脚本一键安装页面](https://acheng-byte.github.io/discourse-saver/install.html)

### 评论用户名超链接（V4.3.8）

| 特性 | 说明 |
|-----|------|
| **Obsidian 导出** | 评论区用户名支持点击跳转到用户主页 |
| **折叠模式兼容** | 折叠评论中的用户名同样支持超链接 |
| **自动识别** | 自动从页面提取用户主页链接 |

### HTML 导出增强

| 特性 | 说明 |
|-----|------|
| **图片 Lightbox** | 点击图片放大查看，ESC 或点击关闭 |
| **图片画廊** | 支持 figure/figcaption 格式，加载失败显示占位符 |
| **表格增强** | 一键复制为 TSV、全屏查看、斑马纹、滚动提示 |
| **5 种主题** | L站原风格、暗夜极客、商务精英、樱花粉、薰衣草 |
| **PWA 支持** | 可安装到设备主屏幕，支持离线查看 |
| **PDF 导出** | 工具栏一键导出为 PDF 文件 |
| **代码复制** | 代码块一键复制功能 |
| **响应式设计** | 完美适配手机、平板、桌面设备 |

### 设置页面

| 特性 | 说明 |
|-----|------|
| **HTML 导出提示** | Base64 图片嵌入文件大小警告 |

### 性能优化

| 特性 | 说明 |
|-----|------|
| **评论批处理** | 每批 20 条，防止请求过快 |
| **Notion 批处理** | 每批 100 块，符合 API 限制 |
| **飞书大文件** | 支持超长内容上传 |

## V4.0.5 新功能

| 特性 | 说明 |
|-----|------|
| **多语言支持** | 设置页面支持中文/English 切换 |
| **评论 API 获取** | 通过 Discourse API 获取全部评论，解决懒加载限制 |
| **保存全部评论** | 新增「保存全部」选项，评论数量支持 0-10000 条 |
| **56+ 站点兼容** | 已测试 60 个 Discourse 站点，93.3% 通过率 |

## V3.6.0 功能

| 特性 | 说明 |
|-----|------|
| **支持所有 Discourse** | 自动检测任意 Discourse 论坛（四层检测机制） |
| **自定义站点管理** | 手动添加/删除站点，支持私有部署 |
| **图片 Base64 嵌入** | 将图片转为 Base64 嵌入笔记，单文件完整保存 |
| **图片压缩** | 可设置最大宽度和质量，控制文件大小 |
| **GIF 处理** | 可选跳过 GIF 动图（保留原链接） |

## V3.5 版本特性

| 特性 | 说明 |
|-----|------|
| 链接按钮劫持 | 单击保存，双击复制链接 |
| 飞书多维表格 | 同步保存到飞书，支持 MD 附件上传 |
| 飞书/Lark双版本 | 支持国内版(feishu.cn)和国际版(larksuite.com) |
| 评论链接支持 | 点击评论链接按钮保存主帖+该评论 |
| 楼层标识 | Obsidian: `标题-X楼.md` / 飞书: `标题 [X楼]` |
| 插件开关 | 可关闭插件，恢复链接按钮原功能 |

---

## 安装方法

### 方式一：油猴脚本安装（推荐，跨浏览器通用）

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 访问 [油猴脚本一键安装页面](https://acheng-byte.github.io/discourse-saver/install.html)
3. 点击「一键复制」按钮复制完整脚本
4. 打开 Tampermonkey 仪表盘 → 新建脚本 → 粘贴代码 → 保存

> **优势**：支持 Chrome、Edge、Firefox、Safari 等所有主流浏览器

### 方式二：Chrome 扩展安装

1. 下载本插件的所有文件到本地文件夹
2. 打开浏览器扩展页面：
   - **Chrome**：访问 `chrome://extensions/`
   - **Edge**：访问 `edge://extensions/`
   - **Brave**：访问 `brave://extensions/`
   - **Opera**：访问 `opera://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择插件文件夹 `discourse-saver`

> **提示**：所有基于 Chromium 的浏览器（Chrome、Edge、Brave、Opera等）都支持本扩展

---

## 使用方法

### 保存帖子

1. 访问任意 **Discourse 论坛**（LinuxDo、Discourse Meta 等）帖子页面
2. 插件会**自动检测**并激活（首次访问会显示提示）
3. 找到帖子/评论右下角的**链接按钮**（链条图标）
4. **单击** → 保存到已启用的平台（Obsidian/飞书/Notion/思源笔记）
5. **双击** → 复制链接到剪贴板

### 文件命名规则

**Obsidian 文件名：**
- 主帖：标题.md
- 评论：标题-X楼.md（X 为楼层号）

**飞书标题：**
- 主帖：标题
- 评论：标题 [X楼]

---

## 配置选项

点击 Chrome 扩展图标 → 右键 → 「选项」

### 多语言支持

设置页面支持中英文切换，点击右上角的 **中文 / EN** 按钮即可切换语言。

### 插件状态

| 配置项 | 说明 |
|-------|------|
| 启用插件 | 关闭后链接按钮恢复原功能（需刷新页面） |

### 自定义站点（V3.6.0）

| 配置项 | 说明 |
|-------|------|
| 添加站点 | 输入域名（如 `forum.example.com`）手动添加 |
| 删除站点 | 点击站点旁的删除按钮移除 |

> **说明**：大多数 Discourse 论坛会被自动检测。自定义站点功能用于：
> - 私有部署的 Discourse（可能移除了标识）
> - 检测失败的特殊站点

### 保存目标

| 配置项 | 说明 |
|-------|------|
| 保存到 Obsidian | 启用 Obsidian 保存 |
| 保存到飞书多维表格 | 启用飞书同步 |
| 保存到 Notion Database | 启用 Notion 同步（V4.0.1）|
| 保存到语雀 | 启用语雀知识库同步（V5.1）|
| 保存到思源笔记 | 启用思源笔记同步（V5.1）|
| 导出 HTML 文件 | 保存为独立 HTML 文件（V4.3.5）|

### Obsidian 设置

| 配置项 | 说明 |
|-------|------|
| Vault 名称 | 留空使用当前打开的 vault（推荐） |
| 保存文件夹 | 保存到 vault 中的哪个文件夹 |
| 使用 Advanced URI | 支持大内容保存（推荐开启） |

#### 下载图片/视频到 Vault 文件夹（新功能）

勾选「下载图片/视频到 Vault 文件夹」后，保存帖子时会自动将图片和视频下载到 Obsidian Vault 本地，Markdown 中的链接会自动替换为本地路径。

**前置条件：必须安装并配置 Obsidian 社区插件「Local REST API」**

**第一步：安装 Local REST API 插件**
1. 打开 Obsidian → 设置 → 第三方插件 → 浏览社区插件
2. 搜索 **Local REST API**，安装并启用

**第二步：启用 HTTP 服务（关键步骤）**
1. 打开 Obsidian → 设置 → 第三方插件 → Local REST API
2. 找到 **「Enable Non-encrypted (HTTP) Server」** 选项
3. **将此开关打开**（默认是关闭的）
4. 启用后 HTTP 端口为 **27123**（默认）

> 为什么必须开启 HTTP？因为 Chrome 扩展无法访问自签名 HTTPS 证书，必须使用 HTTP 端口才能正常连接。此服务仅在本机运行，不会暴露到外网，安全无虞。

**第三步：在 Discourse Saver 中配置**
1. 打开扩展设置 → Obsidian 标签页
2. 勾选「下载图片/视频到 Vault 文件夹」
3. 填入 **API Key**（在 Local REST API 插件设置页面复制）
4. 端口填 **27123**（HTTP 端口，不是默认的 27124）
5. 点击「测试连接」确认成功

**第四步：验证**
- 测试连接显示绿色成功提示 → 配置完成
- 如果显示「Failed to fetch」→ 检查是否已开启 HTTP 服务（第二步）
- 点击「查看日志」可以看到详细的连接诊断信息

### 飞书设置

| 配置项 | 说明 |
|-------|------|
| API 版本 | 选择飞书国内版或 Lark 国际版 |
| App ID | 飞书开放平台应用 ID |
| App Secret | 飞书开放平台应用密钥 |
| app_token | 多维表格 token（URL 中 `/base/` 后面的字符串） |
| table_id | 数据表 ID（URL 中 `?table=` 后面的字符串） |
| 上传正文 | 将帖子正文上传到飞书文本字段（V5.3.1）|
| 上传 MD 附件 | 将完整内容作为 MD 文件附件上传 |
| 上传 HTML 附件 | 上传 HTML 格式附件（V5.3.1）|

### Notion 设置（V4.0.2）

| 配置项 | 说明 |
|-------|------|
| Integration Token | 以 `ntn_` 或 `secret_` 开头的 Notion Integration 密钥 |
| Database ID | 32 位十六进制 Database 标识符 |
| 属性映射 | 配置 Database 属性名称（默认中文：标题、链接、作者等） |

**Database 属性要求：**

| 属性名 | 类型 | 必填 |
|-------|------|------|
| 标题 | Title | ✅ |
| 链接 | URL | ✅ |
| 作者 | Rich Text | |
| 分类 | Rich Text 或 Select | |
| 保存日期 | Date | |
| 评论数 | Number | |

> **详细配置教程**：请参考 [NOTION-GUIDE.html](NOTION-GUIDE.html)

### 语雀设置（V5.1）

| 配置项 | 说明 |
|-------|------|
| Access Token | 语雀个人访问令牌 |
| 知识库 | 目标知识库（命名空间或 ID） |
| 保存目录 | 知识库中的保存路径 |

**使用前提：**
1. 在语雀开发者设置中获取个人访问令牌
2. 确保知识库存在且令牌有写入权限

### 思源笔记设置（V5.1）

| 配置项 | 说明 |
|-------|------|
| API 地址 | 思源笔记内核 API 地址，默认 `http://127.0.0.1:6806` |
| API Token | 思源笔记访问授权码（未开启鉴权可留空） |
| 笔记本 ID | 目标笔记本的 ID（格式：`20210808180117-czj9bvb`） |
| 保存路径 | 笔记本中的保存位置，默认 `/Discourse收集箱` |

**使用前提：**
1. 思源笔记桌面客户端必须处于运行状态
2. 笔记本 ID 为必填项（右键笔记本 → 设置 中获取）
3. 如开启了访问授权码，需填写 API Token

> **详细配置教程**：请参考 [思源笔记配置指南](docs/siyuan-guide.html)

### HTML 导出设置（V4.3.5）

| 配置项 | 说明 |
|-------|------|
| 导出文件夹名 | HTML 文件保存的文件夹名称，默认 `Discourse导出` |

### 内容设置

| 配置项 | 说明 |
|-------|------|
| 添加元数据 | 是否添加中文 frontmatter |
| 保留图片链接 | 是否保留帖子中的图片 |

### 图片嵌入设置（V3.6.0）

| 配置项 | 说明 |
|-------|------|
| 将图片嵌入笔记 | 启用后图片转为 Base64 嵌入 Markdown |
| 图片最大宽度 | 0=原始尺寸，或选择 1920/1280/800/480px |
| 图片质量 | 100%/90%/80%/60%，降低质量减小文件 |
| 跳过 GIF 动图 | 启用后 GIF 保留原链接（Base64 会失去动画） |

> **⚠️ 重要**：启用图片嵌入后，**必须同时启用 Advanced URI 插件**，否则大文件无法保存。插件会自动提示并启用。

### 评论设置

| 配置项 | 说明 |
|-------|------|
| 保存评论区 | 是否保存评论（默认关闭） |
| 评论数量 | 0-10000 条，默认 100 |
| 保存全部 | 勾选后保存帖子的全部评论（通过 API 获取） |
| 折叠评论 | 使用 `<details>` 标签折叠 |

---

### 评论获取说明

插件支持两种评论获取方式：

| 评论数量 | 获取方式 | 说明 |
|---------|---------|------|
| ≤30 条 | 页面提取 | 从当前页面 DOM 提取（快速） |
| >30 条 或 勾选「保存全部」 | **API 获取** | 通过 Discourse API 获取完整评论（解决懒加载问题） |

**API 获取优势：**
- 无需手动滚动页面
- 可获取全部评论（不受懒加载限制）
- 超过 500 条评论时显示加载进度

> **提示**：如果帖子评论超过 30 条，建议勾选「保存全部」以获取完整评论。

---

---

## 飞书配置教程

飞书多维表格可以作为帖子的索引库，方便检索和管理。

### 第一步：创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 登录你的飞书账号
3. 点击「**创建应用**」→ 选择「**企业自建应用**」
4. 填写应用名称（如：LinuxDo收藏器）和描述
5. 创建完成后，进入应用详情页

### 第二步：获取凭证

在应用详情页的「**凭证与基础信息**」中找到：

| 字段 | 位置 |
|-----|------|
| App ID | 应用凭证区域，直接复制 |
| App Secret | 点击「显示」后复制 |

> **重要**：App Secret 只显示一次，请妥善保存！

### 第三步：配置权限

1. 在左侧菜单中选择「**权限管理**」
2. 搜索并添加以下权限（都是**免审权限**，无需审批）：

| 权限标识 | 权限名称 | 说明 |
|---------|---------|------|
| `bitable:app` | 多维表格 | 读写多维表格（**必须**） |
| `drive:file:upload` | 上传文件 | 上传MD附件时需要 |

3. 点击「**批量开通**」

### 第四步：创建多维表格

1. 在飞书文档中点击「**+**」→ 选择「**多维表格**」
2. 添加以下字段（**字段名必须完全一致**）：

| 字段名 | 字段类型 | 说明 |
|-------|---------|------|
| 标题 | 文本 | 帖子标题 |
| 链接 | **超链接** | 原帖URL（可点击跳转） |
| 作者 | 文本 | 发帖人 |
| 保存时间 | 日期 | 自动记录保存时间 |
| 评论数 | 数字 | 评论条数 |
| 附件 | 附件 | MD文件（勾选上传附件时使用） |
| 正文 | 文本 | 内容摘要（不上传附件时使用） |

> **注意**：「链接」字段必须是**超链接类型**，不是普通文本！

### 第五步：获取表格参数

从多维表格的URL中提取 app_token 和 table_id：

**URL 格式示例：**

> https://feishu.cn/base/**XxXxXxXxXx**?table=**tblYyYyYy**&view=...

**提取方法：**
- **app_token**：/base/ 后面到 ? 之前的部分（如 XxXxXxXxXx）
- **table_id**：?table= 后面的部分（如 tblYyYyYy，以 tbl 开头）

> **重要说明**：
>
> | 参数 | 含义 | 提取位置 | 格式 |
> |-----|------|---------|------|
> | **app_token** | 整个多维表格文档的标识 | URL 中 `/base/` 后面到 `?` 之前 | 字母数字串 |
> | **table_id** | 当前数据表的标识 | URL 中 `?table=` 后面的部分 | 以 `tbl` 开头 |
>
> **常见错误**：
> - 复制了整个 URL 而不是提取对应部分
> - app_token 和 table_id 复制反了
> - 一个多维表格可以有多个数据表，确保复制的是你要使用的那个数据表的 ID

### 第六步：添加应用为协作者

**这一步很重要！很多人漏掉这一步导致保存失败。**

1. 在多维表格右上角点击「**...**」
2. 选择「**更多**」→「**添加文档应用**」
3. 搜索你刚创建的应用名称（如：LinuxDo收藏器）
4. 添加为「**可编辑**」协作者

### 第七步：发布应用

1. 回到飞书开放平台的应用详情页
2. 点击左侧「**版本管理与发布**」
3. 点击「**创建版本**」
4. 填写版本号和更新说明
5. 点击「**发布**」

> **注意**：企业自建应用**必须发布**后才能正常使用API！

### 第八步：填写插件配置

在Chrome插件配置页面的「飞书设置」中填入相关信息，点击「**测试连接**」验证。

> **V3.5.12 新增**：测试连接时会自动验证以下字段是否存在及类型是否正确：
> - 标题（文本）、链接（超链接）、作者（文本）、保存时间（日期）
> - 评论数（数字）、附件（附件）、正文（文本）
>
> 如果字段配置有误，会显示详细的错误提示。详见 [FEISHU-FIELD-VALIDATION.md](FEISHU-FIELD-VALIDATION.md)

---

## 保存的笔记格式

### 文件命名

- **主帖**：标题.md
- **评论**：标题-X楼.md（X 为楼层号）

### 笔记结构

保存的笔记包含 YAML frontmatter 元数据和正文内容：

```text
---
来源: https://linux.do/t/topic/847468
标题: 秘密花园园丁邀请函
作者: Neo
分类: 运营反馈
标签: [linuxdo]
保存时间: 2026-03-11 19:38:14
评论数: 100
---

# 秘密花园园丁邀请函

[帖子正文内容...]

<span style="color: red;">颜色会保留</span>

---

## 评论区（共100条）

### 1楼 - Alice

感谢分享！

### 2楼 - Bob

<span style="color: blue;">颜色也会保留</span>
```

**说明：**
- 帖子中的 HTML 颜色样式会被保留
- 评论区按楼层显示（如果启用保存评论）

---

## 常见问题

### Q1: 评论没有全部保存？

**A:** 如果评论数量超过 30 条，请在设置中勾选「**保存全部**」选项。

**原理说明：**
- 评论 ≤30 条：从页面 DOM 提取（快速）
- 评论 >30 条：通过 Discourse API 获取（完整，解决懒加载问题）
- 勾选「保存全部」：强制使用 API 获取所有评论

**操作建议：**
1. 在设置中勾选「保存评论区」
2. 勾选「保存全部」以获取完整评论
3. 超过 500 条评论时会显示加载进度

### Q2: 点击链接按钮后没反应？

**A:** 请检查：
1. Obsidian 是否已运行
2. 浏览器是否允许 `obsidian://` 协议（首次使用会弹窗询问）
3. 按 F12 查看控制台是否有错误

### Q3: 内容过长保存失败？

**A:** 请在设置中启用「使用 Advanced URI 插件」，需要先在 Obsidian 中安装 [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri) 插件。

### Q4: 飞书保存失败？

**A:** 请按以下顺序检查：
1. App ID 和 App Secret 是否正确（无多余空格）
2. 是否已添加 `bitable:app` 权限
3. 应用是否已**发布**
4. 多维表格是否已添加应用为**协作者**（最常见原因！）
5. app_token 和 table_id 是否正确提取

### Q5: 飞书报"FieldNameNotFound"错误？

**A:** 多维表格中缺少必需字段。请确保有以下字段（名称必须完全一致）：
- 标题（文本）
- 链接（超链接）
- 作者（文本）
- 保存时间（日期）
- 评论数（数字）
- 正文（文本）或 附件（附件）

### Q6: 如何恢复链接按钮原功能？

**A:** 在设置中关闭「启用插件」开关，然后刷新页面。

### Q7: 飞书国际版（Lark）如何配置？

**A:**
1. 访问 [Lark开放平台](https://open.larksuite.com/)
2. 配置步骤与国内版相同
3. 在插件配置中选择「**Lark 国际版**」

### Q8: Edge 浏览器可以使用吗？

**A:** 可以！Edge 浏览器基于 Chromium 内核，完全支持本扩展。安装方法：
1. 访问 `edge://extensions/`
2. 开启「开发者模式」
3. 点击「加载解压缩的扩展」
4. 选择插件文件夹

所有基于 Chromium 的浏览器（Chrome、Edge、Brave、Opera）都支持本扩展。

### Q9: Notion 保存失败？

**A:** 请按以下顺序检查：
1. Integration Token 是否以 `ntn_` 或 `secret_` 开头
2. Database ID 是否为 32 位十六进制字符
3. 是否已将 Integration 连接到 Database（最常见原因！）
4. 属性映射是否与 Database 中的属性名完全一致（区分大小写）

详见 [NOTION-GUIDE.html](NOTION-GUIDE.html)

### Q10: Notion 和 Obsidian/飞书冲突吗？

**A:** 不冲突！所有保存目标（Obsidian、飞书、Notion、语雀、思源笔记、HTML 导出）完全独立。你可以同时启用所有平台，一键保存到多个地方。任何一个平台保存失败不会影响其他平台。

### Q11: 思源笔记保存失败？

**A:** 请按以下顺序检查：
1. 思源笔记桌面客户端是否正在运行
2. API 地址是否正确（默认 `http://127.0.0.1:6806`）
3. 笔记本 ID 是否正确填写（格式为 `YYYYMMDDHHMMSS-xxxxxxx`）
4. 如果开启了访问授权码，API Token 是否正确填写
5. 检查防火墙是否阻止了本地连接

> 详见 [思源笔记配置指南](docs/siyuan-guide.html)

### Q12: 思源笔记保存后找不到文档？

**A:** 文档保存在 `{笔记本}/{保存路径}/{站点名}/` 目录下。可以：
1. 在思源笔记左侧文件树中刷新查看
2. 使用全局搜索（`Ctrl+P`）搜索帖子标题
3. 检查保存路径设置是否正确

---

## 更新日志

### v5.3.1 (2026-04-02)

- **新增**：飞书上传选项独立控制 - 正文/MD附件/HTML附件三项独立勾选，互不干扰
- **修复**：全面审计修复 14 项 bug
  - P0：评论保存卡死（缓存导致错误ID列表）、飞书附件上传静默失败、飞书/Notion搜索失败静默返回null导致重复记录、上传警告未显示给用户
  - P1：Notion批量追加失败静默丢弃、归档旧页面失败未通知、配置不完整静默跳过保存、init()异常未捕获
  - P2：7处GET请求新增 `cache: 'no-store'` 防止浏览器缓存旧数据
- **增强**：详细日志 - 飞书/Obsidian/Notion保存路径、文件名、文件大小全部记录

### v5.1 (2026-03-30)

- **新增**：语雀支持 - 保存帖子到语雀知识库
- **新增**：思源笔记支持 - 通过本地内核 API 保存帖子
- **新增**：Tab 标签页布局 - 设置页面重构为清晰的标签页导航
- **新增**：三种主题模式 - 浅色/深色/跟随系统主题切换
- **新增**：路径标准化 - 跨平台路径处理（Windows/Mac/Linux）

### v4.6.24 (2026-03-30)

- **新增**：油猴脚本版（Tampermonkey/Greasemonkey）
  - 跨浏览器通用：Chrome、Edge、Firefox、Safari
  - 40+ Discourse 论坛通过 @match 规则匹配
  - 支持 Obsidian / Notion / HTML 导出
  - 评论保存、折叠模式、用户名超链接
  - [一键安装页面](https://acheng-byte.github.io/discourse-saver/install.html)

### v4.3.8 (2026-03-15)

- **新增**：评论用户名超链接
  - Obsidian 导出 - 评论区用户名支持点击跳转到用户主页
  - 折叠模式兼容 - 折叠评论中的用户名同样支持超链接
  - 自动识别 - 自动从页面提取用户主页链接

### v4.3.5 (2026-03-15)

- **新增**：HTML 导出增强
  - 图片 Lightbox - 点击放大查看，ESC 或点击关闭
  - 图片画廊 - 支持 figure/figcaption 格式
  - 图片错误处理 - 加载失败显示占位符
  - 表格增强 - 一键复制为 TSV、全屏查看、斑马纹
  - 表格滚动提示 - 宽表格显示滑动提示
  - 5 种主题切换 - L站原风格、暗夜极客、商务精英、樱花粉、薰衣草
  - PWA 支持 - 可安装到设备主屏幕
  - PDF 导出 - 工具栏一键导出为 PDF
  - 代码块复制 - 一键复制代码内容
  - 响应式设计 - 完美适配手机、平板、桌面
- **新增**：设置页面 HTML 导出提示 - Base64 图片嵌入文件大小警告
- **优化**：评论批处理 - 每批 20 条，防止请求过快
- **优化**：Notion 批处理 - 每批 100 块，符合 API 限制
- **优化**：飞书大文件 - 支持超长内容上传

### v4.2.2 (2026-03-14)

- **新增**：文档嵌入支持
  - PDF 文件：使用 iframe 嵌入预览，可在 Obsidian 中直接查看
  - Word 文档（.doc/.docx）：显示为带 📝 图标的下载链接
  - Excel 表格（.xls/.xlsx/.csv）：显示为带 📊 图标的下载链接
  - PPT 演示文稿（.ppt/.pptx）：显示为带 📽️ 图标的下载链接
  - SVG 图片：直接作为图片嵌入显示
  - 纯文本文件（.txt/.rtf）：显示为带 📃 图标的下载链接
  - OpenDocument 格式（.odt/.ods/.odp）：对应图标的下载链接
- **新增**：音频嵌入支持
  - 支持格式：MP3、WAV、OGG、M4A、FLAC、AAC、WebM
  - 使用 HTML5 `<audio>` 标签嵌入，可在 Obsidian 中直接播放
  - 显示文件名和播放控件
- **新增**：HTML5 媒体标签处理
  - 识别论坛中已有的 `<audio>` 和 `<video>` 标签
  - 自动转换为可播放的嵌入格式

### v4.2.1 (2026-03-14)

- **优化**：飞书多行文本字段内容优化
  - 移除图片链接（太占空间），只保留 `[图片: alt]` 标识
  - 移除普通网页链接，只保留链接文本
  - 保留有价值的链接（视频、代码仓库、论坛等）
- **新增**：有价值链接白名单
  - 视频平台：YouTube、Bilibili、Vimeo、优酷、爱奇艺、QQ视频、抖音、TikTok、西瓜视频
  - 代码仓库：GitHub、GitLab、Gitee、Bitbucket、Codeberg
  - 论坛站点：linux.do、meta.discourse.org、community.openai.com、forum.cursor.com 等
  - 技术资源：StackOverflow、Gist、CodeSandbox、CodePen、Replit
  - 研究资源：HuggingFace、Kaggle、arXiv、DOI
- **优化**：内容清理增强
  - 自动移除不可见控制字符和零宽字符
  - 标准化换行符（统一为 `\n`）
  - 移除连续多个换行（最多保留2个）
  - 移除多余空格
  - 自动截断超长内容（10万字符限制）
- **新增**：飞书错误码 1254060 友好提示

### v4.0.5 (2026-03-14)

- **新增**：多语言支持（中文/English）
  - 设置页面完整国际化
  - 右上角一键切换语言
- **新增**：评论 API 获取功能
  - 通过 Discourse API 获取全部评论
  - 解决懒加载导致只能获取 30 条评论的限制
  - 新增「保存全部」选项
  - 评论数量范围扩展至 0-10000 条
  - 超过 500 条评论显示加载进度
- **新增**：兼容性测试报告
  - 测试 60 个 Discourse 站点
  - 56 个站点通过测试（93.3% 通过率）
  - 覆盖编程语言、AI/ML、DevOps、数据库等分类
- **修复**：Notion 多平台视频支持改进
  - YouTube、Vimeo 使用 Notion 原生 video 块（可直接播放）
  - Bilibili、优酷、TikTok、QQ视频、西瓜视频、Facebook 改用 bookmark 块
  - 解决 Notion 不原生支持国内视频平台的问题
- **新增**：Notion iframe 解析支持更多平台
  - 新增优酷 `player.youku.com/embed/` 解析
  - 新增 TikTok `tiktok.com/embed/` 解析
  - 新增 QQ视频 `v.qq.com` 解析
  - 新增西瓜视频 `ixigua.com/iframe/` 解析
  - 新增 Facebook `facebook.com/plugins/video` 解析

### v4.0.4 (2026-03-13)

- **新增**：增强视频平台支持
  - 新增 iframe 嵌入：优酷、TikTok、腾讯视频、西瓜视频、Facebook
  - 新增链接格式：抖音、X/Twitter（不支持 iframe）
  - 创建通用视频解析函数 `parseVideoUrl()` 和 `generateVideoEmbed()`
- **优化**：视频缩略图检测增强
  - 新增各平台 CDN 域名检测（ykimg、douyinpic、tiktokcdn、twimg、fbcdn 等）
  - 新增各平台 class 检测（youku-thumbnail、douyin-thumbnail 等）
- **修复**：视频 onebox 直接转 iframe，非视频 onebox 显示预览卡片
- **修复**：Bilibili onebox 缩略图丢失问题

### v4.0.3 (2026-03-12)

- **新增**：在线视频链接自动转 iframe 嵌入（YouTube、Bilibili、Vimeo）
- **新增**：onebox 链接预览优化，显示标题、描述、缩略图
- **新增**：Notion 视频嵌入支持（YouTube、Bilibili、Vimeo 转 video block）
- **新增**：Notion 链接预览支持（bookmark block）
- **优化**：iframe 响应式尺寸（width:100%; aspect-ratio:16/9）

### v4.0.2 (2026-03-12)

- **修复**：帖子内容换行丢失问题
  - 修复 `<br>` 标签在 TurndownService 转换时不生成换行符的问题
  - 修复带颜色样式的内容（如 `<span style="color:red">` ）内部换行丢失
  - 评论区内容换行同步修复
- **修复**：代码块换行丢失问题
  - 修复 LinuxDo 代码块结构 `<pre><div>按钮</div><code>` 检测失败
  - 修复 `<pre><code>` 代码块内 `<br>` 标签不转换为换行符
  - 导出到 Obsidian 后代码块可正常显示和复制
- **改进**：Notion 功能增强
  - 新增图片支持（`![](url)` 转为 Notion 图片块）
  - 新增无序列表（`-`、`*`）、有序列表（`1.`）、分割线支持
  - 属性映射默认值改为中文（标题、链接、作者、分类、保存日期、评论数）
  - 测试连接增加严格的属性类型验证（Title/URL/Rich Text/Date/Number）
  - 详细的错误提示（属性不存在、类型不匹配）
- **修复**：保存目标添加 Notion 选项（之前遗漏）
- **优化**：评论区折叠/非折叠模式均正常显示换行

### v4.0.1 (2026-03-12)

- **新增**：Notion Database 保存功能
  - 支持 Notion Integration Token 认证
  - 自定义属性映射（支持中文属性名）
  - 帖子内容保存到 Notion Page 正文
  - 详细的错误提示和配置验证
- **新增**：[Notion 配置指南 HTML 版](NOTION-GUIDE.html)
- **优化**：三平台完全隔离（Obsidian、飞书、Notion 互不影响）
- **优化**：保存目标验证更新（支持三选一或多选）

### v3.6.0 (2026-03-12)

- **新增**：支持所有 Discourse 论坛
  - 四层自动检测机制（Meta Generator、DOM 结构、CSS 类、Ember 特征）
  - 自定义站点管理（手动添加/删除）
  - 新增 `detector.js` 轻量级检测器，按需加载主脚本
- **新增**：图片 Base64 嵌入功能
  - 将图片转为 Base64 嵌入 Markdown，单文件完整保存
  - 支持图片压缩（最大宽度、质量设置）
  - 支持跳过 GIF 动图（保留原链接）
  - 自动启用 Advanced URI（大文件必需）
- **优化**：内存管理改进
  - 修复 Object URL 内存泄漏
  - 重复图片下载去重优化
- **优化**：UI 改进
  - 图片设置可折叠面板
  - 自定义站点管理界面
  - Advanced URI 自动提示

### v3.5.13 (2026-03-11)

- **新增**：全面增强错误提示系统
  - 40+ 飞书错误码映射，每个错误都有详细的中文说明和解决方法
  - HTTP 错误码友好提示（400/401/403/404/429/500/502/503）
  - 配置参数格式验证（App ID、App Secret、app_token、table_id）
- **新增**：[飞书配置完整指南 HTML 版](FEISHU-GUIDE.html) - 更直观的配置教程
- **优化**：app_token 和 table_id 说明更清晰
  - 明确 app_token 是「整个多维表格文档」的标识
  - 明确 table_id 是「当前数据表」的标识
  - 提供详细的提取示例和常见错误说明
- **优化**：测试连接成功时显示检测到的所有字段列表
- **优化**：UI 文字更新（书签按钮 → 链接按钮，双击复制链接）
- **优化**：支持 Mac 快捷键（⌘+Shift+S）
- **文档**：着重说明浏览器评论获取限制（需先滚动加载评论）

### v3.5.12 (2026-03-11)

- **新增**：飞书字段验证功能 - 测试连接时自动检查9个必需字段
- **新增**：详细的字段错误提示（缺失字段、类型错误）
- **新增**：FEISHU-FIELD-VALIDATION.md 文档
- **优化**：测试连接成功提示更详细

### v3.5.11 (2026-03-11)

- **新增**：明确支持 Edge、Brave、Opera 等 Chromium 浏览器
- **优化**：更新 README 安装说明，添加多浏览器支持文档
- **优化**：添加浏览器兼容性对照表

### v3.5.10 (2026-03-11)

- **修复**：评论楼层号获取 - 从 `.topic-post` 获取 `data-post-number`
- **优化**：文件名格式改为 `标题-X楼.md`（更简洁）
- **优化**：飞书标题格式 `标题 [X楼]`
- **优化**：精简调试日志

### v3.5.9 (2026-03-11)

- **修复**：链接按钮检测 - 使用 `post-action-menu__copy-link` class

### v3.5.8 (2026-03-11)

- **修复**：误触发问题 - 增加严格的区域检测
- **限制**：只拦截帖子操作菜单中的链接按钮

### v3.5.7 (2026-03-11)

- **变更**：劫持按钮从「书签」改为「链接」按钮
- **双击功能**：双击链接按钮复制链接（原为触发收藏）

### v3.5.6 (2026-03-11)

- **优化**：保存时间改为北京时间格式

### v3.5.5 (2026-03-11)

- **修复**：飞书记录重复问题 - 重复保存会更新原记录

### v3.5.4 (2026-03-11)

- **修复**：双击检测竞态条件（必须是同一按钮才触发双击）

### v3.5.3 (2026-03-11)

- **新增**：评论区链接支持 - 点击评论链接保存主帖+该评论

### v3.5.2 (2026-03-11)

- **新增**：飞书 API 版本选择（国内版/Lark国际版）

### v3.5.1 (2026-03-11)

- **新增**：单击保存/双击复制分离
- **新增**：插件开关

### v3.5.0 (2026-03-11)

- **新增**：飞书多维表格支持
- **新增**：MD 文件附件上传
- **新增**：保存目标可选（Obsidian/飞书/双保存）

---

## 技术细节

### 浏览器兼容性

本扩展使用 **Manifest V3** 标准，完全兼容所有基于 Chromium 的浏览器：

| 技术标准 | 兼容浏览器 |
|---------|-----------|
| Manifest V3 | Chrome 88+, Edge 88+, Brave 1.20+, Opera 74+ |
| Chrome Extension API | 完全兼容 Chromium 内核浏览器 |
| Content Scripts | 跨浏览器标准API |
| Service Worker | 替代传统 Background Scripts |

> **注意**：Firefox 使用不同的扩展 API（WebExtensions），不兼容本扩展

### 文件结构

插件目录 discourse-saver 包含以下文件：

**根目录文件：**
- manifest.json - 插件配置（Manifest V3）
- detector.js - 站点检测器（V3.6.0 新增）
- content.js - 内容脚本（劫持+保存）
- background.js - 后台脚本（飞书API+脚本注入）
- options.html - 配置页面
- options.js - 配置逻辑
- README.md - 说明文档

**lib 目录：**
- turndown.min.js - HTML 转 Markdown 库
- marked.min.js - Markdown 转 HTML 库（HTML 导出使用）

**icons 目录：**
- icon16.png / icon48.png / icon128.png - 扩展图标

### 权限说明

| 权限 | 说明 |
|-----|------|
| storage | 保存用户配置 |
| activeTab | 访问当前标签页 |
| scripting | 动态脚本注入（V3.6.0） |
| host_permissions | 访问飞书 API + 所有网站检测 |

---

## 许可证

MIT License - 完全开源，自由使用、修改和分发。

**二次开发署名期望：** 如果你基于本项目进行二次开发或衍生作品，希望能保留原始项目的署名信息（[acheng-byte/discourse-saver](https://github.com/acheng-byte/discourse-saver)）。这不是强制要求，但非常感谢你的尊重。

---

## 致谢

- [LinuxDo](https://linux.do)
- [Obsidian](https://obsidian.md)
- [飞书开放平台](https://open.feishu.cn)
- [Notion](https://www.notion.so)
- [思源笔记](https://b3log.org/siyuan/)
- [Turndown](https://github.com/mixmark-io/turndown)
- [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri)
