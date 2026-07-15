> **Maintenance Notice**: Only Raw Edition (`raw-edition/` directory) is actively maintained. The stable version (root) and userscript (`.user.js`) are no longer updated — kept for reference only.
> Use Raw Edition for latest features and bug fixes.
> One-click userscript install: [discourse-saver-raw.user.js](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js)

# Discourse Saver v1.1.2

**[中文](README.md) | English**

Save any Discourse forum posts and comments to multiple targets with one click. Works on all Discourse forums via auto-detection — no manual site configuration needed.

If this extension helps you, consider supporting via [Afdian](https://ifdian.net/a/acheng111) ❤️

---

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration Guide](#configuration-guide)
  - [Obsidian Setup](#obsidian-setup)
  - [Feishu Setup](#feishu-setup)
  - [Notion Setup](#notion-setup)
  - [WebDAV Setup](#webdav-setup)
  - [Baidu Netdisk Setup](#baidu-netdisk-setup)
  - [HTML / MD Export](#html--md-export)
  - [Content Settings](#content-settings)
- [Supported Discourse Forums](#supported-discourse-forums)
- [FAQ](#faq)
- [Changelog](#changelog)

---

## Save Targets

- **Obsidian** — Markdown files with frontmatter metadata
- **Feishu Bitable** — Structured database records with attachments
- **Feishu Cloud Doc** — Document-format save with MD/HTML attachments
- **Notion** — Database entries with rich page content
- **WebDAV** — Jianguyun, Nextcloud, and any WebDAV-compatible storage
- **Baidu Netdisk** — Device code OAuth authorization
- **HTML Export** — Standalone HTML files (5 themes + PDF export)
- **MD Export** — Download Markdown file to local directory

## Key Features

- Supports **all Discourse forums** via 4-layer auto-detection + 50+ built-in known hosts
- **Parallel save** to multiple targets independently — any failure is isolated
- **Reactions rendering** — Display post reactions (Boosts/❤️/👍) as comments with clickable user links
- **Attachment download** — PDF/DOCX/XLSX/ZIP files saved to Obsidian Vault via REST API
- **MD file export** — Download generated Markdown to local directory
- **Feishu dual mode** — Bitable (database) + Cloud Doc simultaneously
- **WebDAV support** — Jianguyun, Nextcloud, and more
- **Baidu Netdisk** — Device code authorization flow (no redirect URI issues)
- **Auto folder routing** — Files organized by forum domain automatically
- **Floating save button** + long-press floor selection
- **Custom floor saving** — Range (`1-10`) and list (`1,3,5,8`) formats
- **HTML export** — 5 themes, image lightbox, table enhancements, PDF export
- **Image/video download** to Obsidian Vault with local path rewriting
- **Bilingual UI** — Chinese/English toggle
- **Auto filename sanitization** — Strips illegal characters for cross-platform safety

---

## Installation

### Chrome Extension (Chromium browsers)

1. Download from [GitHub Releases](https://github.com/acheng-byte/discourse-saver/releases) or `git clone` this repo
2. Open `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** → **Load unpacked** → select the `raw-edition` folder

### Userscript (All browsers)

Install [Tampermonkey](https://www.tampermonkey.net/), then use the [one-click install link](https://acheng-byte.github.io/discourse-saver/install.html).

---

## Usage

| Action | Effect |
|--------|--------|
| **Click** post link button 🔗 | Save post to all enabled targets |
| **Click** comment link button | Save post + that specific comment |
| **Double-click** link button | Copy link to clipboard |
| **Long-press** floor button | Select specific floors to save |

---

## Configuration Guide

Click the extension icon → Right-click → "Options" to open settings.

### Obsidian Setup

**Prerequisites:** Install Obsidian and open your Vault.

1. **Vault Name**: Leave empty to auto-use current vault (recommended)
2. **Save Folder**: Target folder path, e.g. `Discourse收集箱`
3. **Advanced URI**: Recommended. Install [Advanced URI](https://obsidian.md/plugins?id=obsidian-advanced-uri) plugin for large content support
4. **Download images/videos/attachments**:
   - Install [Local REST API](https://obsidian.md/plugins?id=obsidian-local-rest-api) plugin in Obsidian
   - Get API Key from Obsidian Settings → Local REST API
   - Images, videos, and attachments (PDF, DOCX, etc.) will be downloaded to Vault
5. **Embed images (Base64)**: Alternative to download — embeds images directly in Markdown

### Feishu Setup

Detailed guide: [Feishu Configuration Guide](https://acheng-byte.github.io/discourse-saver/feishu-guide.html)

1. Create an app at [Feishu Open Platform](https://open.feishu.cn/app)
2. Get **App ID** and **App Secret**
3. Add permissions: `bitable:app` (required), `docs:doc` + `drive:drive` (for cloud docs)
4. Publish app and get approval
5. Create a Bitable, get **app_token** and **table_id** from URL

### Notion Setup

Detailed guide: [Notion Configuration Guide](https://acheng-byte.github.io/discourse-saver/notion-guide.html)

1. Create Integration at [Notion Developers](https://www.notion.so/my-integrations)
2. Copy **Internal Integration Token**
3. Create Database and connect Integration
4. Fill in Token and Database ID in extension settings

### WebDAV Setup

Supports Jianguyun (坚果云), Nextcloud, and other WebDAV services.

**Jianguyun Steps:**
1. Login to [Jianguyun](https://www.jianguoyun.com) → Account → Security Options
2. Create an **App Password** (not your login password)
3. Fill in: URL=`https://dav.jianguoyun.com/dav/`, Username=your email, Password=app password
4. Click "Test Connection" to verify

### Baidu Netdisk Setup

**V1.1.2 uses Device Code Flow** — no App Key configuration needed.

1. Switch to "Baidu Netdisk" tab in settings
2. Click "Authorize" button
3. Browser opens Baidu device authorization page
4. Login with your Baidu account to complete authorization
5. Token is saved automatically; posts save to `/apps/ob-sync/Discourse收集箱/`

### HTML / MD Export

- **HTML Export**: Generates standalone HTML with 5 themes, PDF export, code copy, image lightbox
- **MD Export**: Downloads the generated Markdown file to your specified local directory

### Content Settings

- **Metadata (Frontmatter)**: YAML frontmatter with source, author, category, tags
- **Post Info Callout**: Obsidian callout block before content
- **Save Comments**: Fetch and save post comments, with floor range support
- **Render Reactions**: Display post reactions (❤️/👍/👏 etc.) as comments with clickable user links
- **Download Attachments**: Save PDF/DOCX/XLSX/ZIP to Vault via REST API

---

## Supported Discourse Forums

50+ popular Discourse forums are built-in for instant detection:

| Forum | Domain |
|-------|--------|
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
| Rust Users | users.rust-lang.org |
| Swift Forums | forums.swift.org |
| Mozilla Discourse | discourse.mozilla.org |
| Trae | trae.ai / trae.com.cn |
| All *.discourse.group subdomains | ... |

> Other Discourse forums are also auto-detected via meta tags, DOM structure, and CSS classes. If a site isn't recognized, add it manually in "Custom Sites" settings.

---

## FAQ

**Q: Save to Obsidian fails?**
A: Make sure Obsidian is open and Advanced URI plugin is installed. For image download, check Local REST API plugin is enabled with correct API Key.

**Q: Feishu save error?**
A: Verify App ID/Secret, ensure app is published and approved. See [Feishu Guide](https://acheng-byte.github.io/discourse-saver/feishu-guide.html).

**Q: Baidu Netdisk authorization fails?**
A: V1.1.2 uses device code flow. Click the authorize button and follow the browser prompts. Clear cache and retry if it fails.

**Q: Some forums not detected?**
A: Add the forum domain in "Custom Sites" settings. Most Discourse forums are auto-detected.

**Q: Code blocks rendering incorrectly?**
A: Raw Edition uses Discourse's original Markdown source, preserving code block structure. Check for conflicting Obsidian plugins.

**Q: How to save to multiple platforms?**
A: All save targets are independent. Enable any combination — e.g., Obsidian + Feishu + HTML Export simultaneously.

---

## Changelog

### v1.1.2

- Baidu OAuth switched to Device Code Flow (fixes redirect_uri_mismatch)
- Reactions rendering as comments with clickable user links
- Attachment download (PDF/DOCX/XLSX/ZIP) to Obsidian Vault
- MD file export to local directory
- Added Afdian support channel
- 50+ known Discourse hosts for instant detection
- Fixed reactions not passed to Markdown converter
- Fixed duplicate ID bug for WebDAV/Baidu tab checkboxes
- Unified time format to Beijing toLocaleString
- Complete i18n translations

### v1.1.0

- Raw Edition initial release
- WebDAV + Baidu Netdisk save targets
- Feishu Cloud Doc dual mode
- Custom floor saving
- Floating save button with long-press

---

## License

MIT License — free to use, modify, and distribute.

## Acknowledgments

- [LinuxDo](https://linux.do)
- [Obsidian](https://obsidian.md)
- [Feishu Open Platform](https://open.feishu.cn)
- [Notion](https://www.notion.so)
- [Turndown](https://github.com/mixmark-io/turndown)

## Support the Developer

If this extension helps you, consider supporting via:

- **Afdian**: [https://ifdian.net/a/acheng111](https://ifdian.net/a/acheng111) (recommended, no fees)
- Click "Buy Me a Coffee" button in settings (WeChat/Alipay)
