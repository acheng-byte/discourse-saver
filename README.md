# Discourse Saver V5.5.3

> **维护说明**：当前不定期维护 **Raw Edition 特别版**（`raw-edition/` 目录）。
> 稳定版（根目录）和油猴脚本（`.user.js`）**不再更新**，代码保留供参考。
> 请使用 [Raw Edition](raw-edition/) 获取最新功能与 Bug 修复。
> 油猴脚本一键安装：[discourse-saver-raw.user.js](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js)


**中文 | [English](README_EN.md)**

通用 Discourse 论坛内容保存工具 - 一键保存任意 Discourse 论坛（如 LinuxDo、Discourse Meta、Rust Users 等数百个站点）的帖子和评论到 Obsidian、飞书多维表格、Notion，或导出为 HTML 文件。

支持 **Chrome 扩展** 和 **油猴脚本（Tampermonkey）** 两种安装方式。另有 **Raw Edition 特别版**（`raw-edition/` 目录），直接使用 Discourse 原生 Markdown，表格/代码块零损耗。

> **V5.5.0 更新**（2026-04-14）：
> - **油猴脚本新增飞书同步** - 完整飞书多维表格 API 实现
> - **移除思源笔记、语雀（仅油猴脚本版）** - 油猴脚本专注 Obsidian / 飞书 / Notion / HTML 四大目标；Chrome 扩展版仍支持语雀和思源笔记
> - **Raw API 支持** - 评论优先使用 Discourse 原生 Markdown（表格/代码块零损耗）
> - **自定义楼层保存** - 支持 `5`、`2-8`、`1,3,5`、`1-5,8,10-12` 等格式
> - **多项 Bug 修复** - Notion 任务列表、视频下载守卫、楼层过滤逻辑等
> - **Raw Edition 特别版** - 主帖也使用原始 Markdown，零 Turndown 转换损耗

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
| **单击** 悬浮保存按钮 | 保存主帖到 Obsidian/飞书/Notion/HTML |
| **长按** 悬浮保存按钮 | 弹出操作菜单（保存整帖 / 指定楼层 / 仅当前楼）|
| **Ctrl+Shift+S**（Mac: **⌘+Shift+S**）| 快捷键保存主帖 |

---

## V5.4 新功能

### 悬浮保存按钮（V5.4.0）

| 特性 | 说明 |
|-----|------|
| **独立悬浮按钮** | 替代原链接按钮拦截方案，页面右侧显示独立保存按钮 |
| **单击保存** | 点击按钮直接保存整帖 |
| **自动显隐** | 进入帖子页面自动出现，离开时自动移除 |

### 长按菜单 + 指定楼层（V5.4.1 / V5.4.2）

| 特性 | 说明 |
|-----|------|
| **长按弹出菜单** | 长按悬浮按钮弹出操作菜单 |
| **指定楼层保存** | 输入楼层格式：`5`、`2-8`、`1,3,5`、`1-5,8,10-12` |
| **多楼层合并** | 多楼层内容合并为单个文件保存（V5.4.2）|
| **仅当前楼** | 快速保存单条评论 |

---

## V5.1 新功能

### 油猴脚本版（V5.1）

| 特性 | 说明 |
|-----|------|
| **跨浏览器** | 支持 Chrome/Edge/Firefox/Safari 等所有主流浏览器 |
| **Tampermonkey** | 通过油猴扩展安装，无需开发者模式 |
| **40+ 论坛** | 通过 @match 规则匹配 40+ Discourse 论坛 |
| **四平台保存** | Obsidian / 飞书 / Notion / HTML 导出 |
| **评论保存** | 支持折叠模式和用户名超链接 |

> **安装地址**：[油猴脚本一键安装页面](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js)

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
2. 访问 [油猴脚本一键安装页面](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js)
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
2. 插件会**自动检测**并激活，页面右侧出现**悬浮保存按钮**
3. **单击** → 保存整帖到已启用的平台（Obsidian/飞书/Notion/HTML）
4. **长按** → 弹出菜单，可选择「保存整帖」「指定楼层」「仅当前楼」

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
| 启用插件 | 关闭后悬浮按钮消失，恢复原始页面（需刷新页面） |

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
| ~~保存到语雀~~ | ~~启用语雀知识库同步（V5.1）~~ **油猴脚本版已于 V5.5.0 移除**（Chrome 扩展 V5.4.x 残留，不再更新）|
| ~~保存到思源笔记~~ | ~~启用思源笔记同步（V5.1）~~ **油猴脚本版已于 V5.5.0 移除**（Chrome 扩展 V5.4.x 残留，不再更新）|
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

### 语雀设置（V5.1，仅 Chrome 扩展）

> **注意**：语雀支持仅在 Chrome 扩展版本中可用，油猴脚本版已于 V5.5.0 移除。

| 配置项 | 说明 |
|-------|------|
| Access Token | 语雀个人访问令牌 |
| 知识库 | 目标知识库（命名空间或 ID） |
| 保存目录 | 知识库中的保存路径 |

**使用前提：**
1. 在语雀开发者设置中获取个人访问令牌
2. 确保知识库存在且令牌有写入权限

### 思源笔记设置（V5.1，仅 Chrome 扩展）

> **注意**：思源笔记支持仅在 Chrome 扩展版本中可用，油猴脚本版已于 V5.5.0 移除。

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

### Q2: 点击悬浮按钮后没反应？

**A:** 请检查：
1. Obsidian 是否已运行（保存到 Obsidian 时需要）
2. 浏览器是否允许 `obsidian://` 协议（首次使用会弹窗询问）
3. 按 F12 查看控制台是否有错误
4. 确认已在设置页面配置好目标平台（至少启用一个）

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

### Q6: 如何隐藏悬浮按钮？

**A:** 在设置中关闭「启用插件」开关，然后刷新页面，悬浮按钮即消失。

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

**A:** 不冲突！所有保存目标完全独立。你可以同时启用多个平台，一键保存到多个地方。任何一个平台保存失败不会影响其他平台。

### Q11: 思源笔记保存失败？（仅 Chrome 扩展）

**A:** 请按以下顺序检查：
1. 思源笔记桌面客户端是否正在运行
2. API 地址是否正确（默认 `http://127.0.0.1:6806`）
3. 笔记本 ID 是否正确填写（格式为 `YYYYMMDDHHMMSS-xxxxxxx`）
4. 如果开启了访问授权码，API Token 是否正确填写
5. 检查防火墙是否阻止了本地连接

> 详见 [思源笔记配置指南](docs/siyuan-guide.html)

### Q12: 思源笔记保存后找不到文档？（仅 Chrome 扩展）

**A:** 文档保存在 `{笔记本}/{保存路径}/{站点名}/` 目录下。可以：
1. 在思源笔记左侧文件树中刷新查看
2. 使用全局搜索（`Ctrl+P`）搜索帖子标题
3. 检查保存路径设置是否正确

---

## 更新日志

### v1.0.0 (2026-05-04) - 首次上架 Chrome Web Store

- **发布**：正式上架 Chrome Web Store
- **移除**：捐赠弹窗（符合 Chrome 商店政策）
- **新增**：页脚爱发电支持链接

### v5.6.3 (2026-05-01)

- **修复**：下载图片/视频到 Vault 时的路径兼容问题，对非法标题与媒体目录名做清洗（非法字符、尾部点/空格、超长路径、保留名），避免保存失败
- **修复**：下载链与外链冲突，开启"下载图片/视频"时不再优先改链，提升下载稳定性

### v5.6.1 (2026-04-28)

- 压缩包更新，脚本无变化

### v5.6.0 (2026-04-20) - HTML 导出全面升级

- **新增**：HTML 导出 5 种主题（L站原风格 / 暗夜极客 / 商务精英 / 樱花粉 / 薰衣草）
- **新增**：PDF 一键导出
- **新增**：图片 Lightbox 点击放大
- **新增**：代码块一键复制
- **新增**：表格增强（全屏查看、TSV 复制、斑马纹）
- **新增**：引入 marked.js 做标准 Markdown → HTML 渲染

### v5.5.3 (2026-04-18)

- **修复**：`resolveUploadUrls` 匹配失败时 fallback 为 `/uploads/short-url/hash`，确保 `![[wiki-link]]` 替换正常生效
- **修复**：`originalMarkdown` 快照中的 `upload://` 同样转换为可访问 HTTP URL
- **修复**：图片 alt 尺寸标注清理，扩展正则匹配 `|690x282, 75%` 等带缩放比例的格式

### v5.5.2 (2026-04-16)

- **修复**：`upload://` 图片下载，Discourse 内部短链自动转换为 `/uploads/short-url/hash.ext`
- **修复**：图片渲染改用 `window.location.origin`，兼容所有 Discourse 站点

### v5.5.1 (2026-04-15)

- **修复**：图片 alt 中的尺寸标注 `|230x500` 导致图片渲染失败
- **修复**：`[spoiler]` BBCode 标签正确剥除，保留内部内容
- **修复**：表情符号过滤（Turndown 模式 + Raw 原始模式）
- **修复**：媒体文件 HTTPS 降级 HTTP 时端口错误（27124→27123）

### v5.5.0 (2026-04-14)

- **新增**：油猴脚本完整飞书多维表格同步（gmFetch / token 缓存 / 文件上传）
- **新增**：Raw API 支持 - 评论优先使用 `post.raw` 原生 Markdown，表格/代码块零转换损耗
- **新增**：主帖通过 `/raw/{id}/1` 获取原始 Markdown
- **新增**：`upload://` token 自动解析为真实 CDN URL
- **新增**：指定楼层保存支持范围/列表格式（`2-8`、`1,3,5`、`1-5,8,10-12`）
- **新增**：Raw Edition 特别版
- **修复**：多项 Notion / 多楼层 / Raw 路径 bug

### v5.3.1 (2026-04-02)

- **新增**：飞书上传选项独立控制（正文/MD附件/HTML附件三项）
- **修复**：全面审计修复 14 项 bug（含 P0 级评论保存卡死、飞书附件上传静默失败等）
- **增强**：详细日志，保存路径/文件名/大小全部记录

### v5.1 (2026-03-30)

- **新增**：语雀支持
- **新增**：思源笔记支持
- **新增**：设置页 Tab 标签页布局
- **新增**：三种主题模式（浅色/深色/系统）

### v4.6.24 (2026-03-30)

- **新增**：油猴脚本版（Tampermonkey），跨浏览器通用

### v4.3.5 (2026-03-15)

- **新增**：HTML 导出增强（Lightbox、表格增强、5 种主题、PWA 支持）

