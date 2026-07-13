> **维护说明**：当前不定期维护 Raw Edition 特别版（`raw-edition/` 目录）。
> 稳定版（根目录）和油猴脚本（`.user.js`）不再更新，代码保留供参考。
> 请使用 Raw Edition 获取最新功能与 Bug 修复。
> 油猴脚本一键安装：[discourse-saver-raw.user.js](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js)

# Discourse Saver v1.1.0

**中文 | [English](README_EN.md)**

通用 Discourse 论坛内容保存工具，支持将任意 Discourse 论坛的帖子和评论保存到多种目标平台。支持 **Chrome 扩展** 和 **油猴脚本** 两种安装方式。

> **当前活跃维护版本为 [Raw Edition](raw-edition/)（`raw-edition/` 目录）。** 根目录代码保留供参考，不再更新。

## 保存目标

- **Obsidian** — 保存为 Markdown 文件到 Vault
- **飞书多维表格** — 同步记录到飞书多维表格
- **飞书云文档** — 上传为飞书云文档
- **Notion** — 保存到 Notion Database
- **WebDAV** — 支持坚果云、Nextcloud 等 WebDAV 服务
- **百度网盘** — OAuth 授权登录后上传
- **HTML 导出** — 导出为独立 HTML 文件

## 核心特性

- 支持所有 Discourse 论坛（自动检测，无需手动配置站点列表）
- 多保存目标并行保存，互不干扰
- 飞书多维表格 + 飞书云文档双模式
- WebDAV 支持（坚果云/Nextcloud 等）
- 百度网盘 OAuth 授权登录
- 自动按论坛域名分文件夹
- 悬浮保存按钮 + 长按楼层选择
- 指定楼层保存（支持范围/列表格式）
- HTML 导出（5 种主题 + PDF 导出）
- 图片/视频下载到 Obsidian Vault
- 中英文双语界面
- 文件名非法字符自动清理

## 安装

**请使用 [Raw Edition](raw-edition/) 目录中的版本进行安装。**

### Chrome 扩展

1. 下载 `raw-edition/` 目录下的插件文件到本地文件夹
2. 打开 `chrome://extensions/`（Edge 用 `edge://extensions/`）
3. 开启「开发者模式」
4. 点击「加载已解压的扩展程序」，选择插件文件夹

### 油猴脚本

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 扩展
2. 点击 [discourse-saver-raw.user.js](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js) 一键安装

## 使用方法

| 操作 | 效果 |
|-----|------|
| **单击** 悬浮保存按钮 | 保存主帖到已启用的目标平台 |
| **单击** 评论链接按钮 | 保存主帖 + 该评论 |
| **双击** 链接按钮 | 复制链接到剪贴板 |
| **长按** 楼层按钮 | 选择指定楼层保存 |

## 完整文档

更多配置说明、飞书/Notion 设置教程、常见问题等，请参阅 [raw-edition/README.md](raw-edition/README.md)。

## 浏览器支持

| 浏览器 | Chrome 扩展 | 油猴脚本 |
|-------|:-----------:|:--------:|
| Chrome | ✅ | ✅ |
| Edge | ✅ | ✅ |
| Brave | ✅ | ✅ |
| Firefox | ❌ | ✅ |
| Safari | ❌ | ✅ |

## 许可证

MIT License - 自由使用、修改和分发。
