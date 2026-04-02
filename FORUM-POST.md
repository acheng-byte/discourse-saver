# Discourse Saver V5.3.1 - 一键保存任意Discourse论坛帖子到Obsidian/飞书/Notion/语雀/思源笔记

> 支持所有Discourse论坛（56+站点验证），单击保存帖子+评论到Obsidian、飞书多维表格、Notion Database、语雀知识库或思源笔记。支持Chrome扩展和油猴脚本两种安装方式，覆盖所有主流浏览器。

## 前言

作为一个重度Discourse论坛用户和知识管理爱好者，我经常想把论坛上的精华帖子保存到自己的知识库中。但每次手动复制粘贴，格式都会乱掉，图片也保存不了，非常麻烦。

于是我开发了 **Discourse Saver**——一个支持所有Discourse论坛的帖子保存工具。

它可以：
- **一键保存到五大平台**：Obsidian、飞书多维表格、Notion Database、语雀知识库、思源笔记
- **自动检测Discourse**：四层检测机制，访问任意Discourse站点自动激活
- **保留完整格式**：颜色、代码高亮、表格样式、图片全部保留
- **HTML导出**：5种主题、图片Lightbox、表格复制、PWA离线查看、PDF导出
- **油猴脚本版**：跨浏览器通用（Chrome/Edge/Firefox/Safari）

---

## 功能亮点

| 功能 | 说明 |
|-----|------|
| 五平台保存 | Obsidian + 飞书多维表格 + Notion + 语雀 + 思源笔记 |
| 飞书上传独立控制（V5.3.1） | 正文/MD附件/HTML附件三项独立勾选 |
| 油猴脚本版 | 支持 Tampermonkey/Greasemonkey，跨浏览器通用 |
| HTML导出增强（V4.3.5） | 图片Lightbox、表格全屏/复制、5种主题、PWA、PDF导出 |
| 评论用户名超链接（V4.3.8） | 点击用户名跳转到用户主页 |
| 支持56+论坛 | 自动检测 + 自定义站点管理 |
| 图片Base64嵌入 | 图片转为Base64嵌入Markdown，单文件完整保存 |
| 评论批量获取 | 通过Discourse API获取全部评论，突破懒加载限制 |
| 快捷键支持 | `Ctrl+Shift+S` (Mac: `Cmd+Shift+S`) |
| 代码块复制 | 一键复制代码内容 |
| 响应式设计 | 完美适配手机、平板、桌面 |

---

## 安装方法

### 方式一：油猴脚本安装（推荐，跨浏览器通用）

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 访问 [油猴脚本一键安装页面](https://acheng-byte.github.io/discourse-saver/install.html)
3. 点击「一键复制」按钮复制完整脚本
4. 打开 Tampermonkey 仪表盘 → 新建脚本 → 粘贴代码 → 保存

**支持浏览器**：Chrome、Edge、Firefox、Safari、Brave、Opera 等所有主流浏览器

### 方式二：Chrome扩展安装

1. 访问GitHub仓库：https://github.com/acheng-byte/discourse-saver
2. 点击绿色的 **Code** 按钮 → **Download ZIP**
3. 解压到本地文件夹
4. 打开浏览器扩展页面：
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
5. 开启「**开发者模式**」
6. 点击「**加载已解压的扩展程序**」
7. 选择解压的 `discourse-saver` 文件夹

---

## 支持的论坛

### 自动检测（56+站点验证通过）

插件内置四层检测机制，访问Discourse论坛时自动激活：

| 分类 | 论坛 | 数量 |
|-----|------|------|
| 编程语言 | Rust、Swift、Go、Julia、Elixir、Haskell 等 | 12 |
| AI/ML | OpenAI、Hugging Face、PyTorch | 3 |
| DevOps | Docker、Kubernetes、Terraform、GitLab 等 | 8 |
| 数据库 | Elastic、MongoDB、Redis 等 | 5 |
| 开源项目 | Fedora、Ubuntu、NixOS、Home Assistant 等 | 8 |
| 游戏开发 | Godot、Roblox、Unreal Engine 等 | 5 |
| 区块链 | Ethereum、Polkadot、Cosmos 等 | 4 |
| 其他 | LinuxDo、Obsidian、Netlify 等 | 11+ |

对于未列出的Discourse站点，可在设置中手动添加。

---

## 插件配置

安装完成后，配置页面提供以下选项：

### 保存目标（可同时启用多个）

| 选项 | 说明 |
|-----|------|
| 保存到 Obsidian | 保存为Markdown笔记 |
| 保存到飞书多维表格 | 同步到飞书，支持正文/MD附件/HTML附件独立控制 |
| 保存到 Notion Database | 保存到Notion数据库 |
| 保存到语雀 | 保存到语雀知识库 |
| 保存到思源笔记 | 通过本地内核API保存 |
| HTML导出 | 导出为独立HTML文件（含5种主题） |

### Obsidian 设置

| 选项 | 说明 |
|-----|------|
| Vault 名称 | 留空使用当前打开的vault |
| 保存文件夹 | 保存到vault中的哪个文件夹 |
| 使用 Advanced URI | 支持大内容保存（推荐开启） |

### 飞书设置

详细配置教程请参考插件内附的 [飞书配置指南](https://acheng-byte.github.io/discourse-saver/feishu-guide.html)。

### Notion 设置

| 选项 | 说明 |
|-----|------|
| Integration Token | 以 `ntn_` 或 `secret_` 开头的密钥 |
| Database ID | 32位十六进制标识符 |
| 属性映射 | 配置Database属性名称（默认中文） |

**Database 属性要求**：

| 属性名 | 类型 | 必填 |
|-------|------|------|
| 标题 | Title | ✅ |
| 链接 | URL | ✅ |
| 作者 | Rich Text | |
| 分类 | Rich Text 或 Select | |
| 保存日期 | Date | |
| 评论数 | Number | |

详细配置教程请参考插件内附的 [Notion配置指南](https://acheng-byte.github.io/discourse-saver/notion-guide.html)。

### 内容设置

| 选项 | 说明 |
|-----|------|
| 保留图片链接 | 保留帖子中的图片 |
| 图片Base64嵌入 | 图片转为Base64嵌入Markdown |
| 图片压缩 | 设置最大宽度和压缩质量 |
| 跳过GIF | GIF保留原链接 |

### 评论设置

| 选项 | 说明 |
|-----|------|
| 保存评论区 | 是否保存评论 |
| 评论数量 | 0-10000条 |
| 保存全部 | 通过API获取全部评论 |
| 折叠评论 | 使用 `<details>` 标签折叠 |

---

## 使用方法

| 操作 | 效果 |
|-----|------|
| **单击** 书签/链接按钮 | 保存帖子到Obsidian/飞书/Notion/语雀/思源笔记 |
| **双击** 书签/链接按钮 | 触发原生收藏/复制链接 |
| **Ctrl+Shift+S** | 快捷键保存帖子 |

### 使用流程

1. 访问任意Discourse论坛帖子页面
2. 插件自动检测并激活
3. 单击书签按钮 → 保存到已配置的平台
4. 保存成功后显示提示信息

---

## V4.6.24 新增功能

### 油猴脚本版
- 支持 Tampermonkey/Greasemonkey，跨浏览器通用
- 40+ Discourse 论坛 @match 规则
- 三平台保存：Obsidian / Notion / HTML 导出
- 评论保存、折叠模式、用户名超链接
- [一键安装页面](https://acheng-byte.github.io/discourse-saver/install.html)

### 评论用户名超链接（V4.3.8）
- 普通模式：用户名显示为 Markdown 超链接
- 折叠模式：用户名显示为 HTML 超链接
- 自动识别用户主页链接

### HTML 导出增强（V4.3.5）
- 图片 Lightbox 放大查看
- 表格一键复制为 TSV / 全屏查看
- 5 种主题切换（L站原风格、暗夜极客、商务精英、樱花粉、薰衣草）
- PWA 可安装到设备、离线查看
- PDF 一键导出
- 代码块一键复制
- 响应式设计适配移动端

---

## 常见问题

### Q1: 点击保存后没反应？

请检查：
1. Obsidian是否已运行
2. 浏览器是否允许 `obsidian://` 协议（首次使用会弹窗询问）
3. 按F12查看控制台是否有错误

### Q2: 内容过长保存失败？

请在设置中启用「使用 Advanced URI 插件」，需要先在Obsidian中安装 [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri) 插件。

### Q3: 飞书保存失败？

请检查：
1. App ID 和 App Secret 是否正确
2. 是否已添加 `bitable:app` 权限
3. 应用是否已发布
4. 多维表格是否已添加应用为协作者（最常见原因！）

### Q4: Notion保存失败？

请检查：
1. Integration Token 是否以 `ntn_` 或 `secret_` 开头
2. Database ID 是否为32位十六进制
3. Integration 是否已连接到 Database（最常见原因！）
4. 属性映射是否与 Database 属性名完全匹配

### Q5: 评论没有全部保存？

如果帖子评论超过30条，请在设置中勾选「保存全部」选项，插件将通过Discourse API获取完整评论。

### Q6: 油猴脚本版和Chrome扩展版有什么区别？

| 对比项 | 油猴脚本版 | Chrome扩展版 |
|-------|----------|------------|
| 浏览器支持 | 所有主流浏览器 | 仅Chromium浏览器 |
| 安装方式 | 需要Tampermonkey | 开发者模式加载 |
| 保存目标 | Obsidian + Notion + 语雀 + 思源笔记 + HTML | Obsidian + 飞书 + Notion + 语雀 + 思源笔记 |
| 飞书支持 | 不支持 | 支持 |

---

## 开源地址

GitHub: https://github.com/acheng-byte/discourse-saver

欢迎 Star、Fork、提 Issue 和 PR！

---

## 致谢

- [Discourse](https://discourse.org) - 优秀的开源论坛平台
- [LinuxDo](https://linux.do) - 活跃的技术社区
- [Obsidian](https://obsidian.md) - 优秀的笔记软件
- [飞书开放平台](https://open.feishu.cn) - 强大的API支持
- [Notion](https://www.notion.so) - 优秀的协作工具
- [Turndown](https://github.com/mixmark-io/turndown) - HTML转Markdown
- [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri) - 大内容保存支持

---

**如果觉得有用，欢迎点赞、收藏、分享！有问题请在评论区留言或到 GitHub 提 Issue。**
