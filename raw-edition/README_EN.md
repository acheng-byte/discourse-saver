> **Maintenance Notice**: Only Raw Edition (`raw-edition/` directory) is actively maintained. The stable version (root) and userscript (`.user.js`) are no longer updated — kept for reference only.
> Use Raw Edition for latest features and bug fixes.
> One-click userscript install: [discourse-saver-raw.user.js](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js)

# Discourse Saver v1.1.0

**[中文](README.md) | English**

Save any Discourse forum posts and comments to multiple targets with one click. Works on all Discourse forums via auto-detection — no manual site configuration needed.

## Save Targets

- **Obsidian** — Markdown files with frontmatter metadata
- **Feishu Bitable** — Structured database records with attachments
- **Feishu Cloud Doc** — Document-format save with MD/HTML attachments
- **Notion** — Database entries with rich page content
- **WebDAV** — Jianguyun, Nextcloud, and any WebDAV-compatible storage
- **Baidu Netdisk** — OAuth-authorized cloud upload
- **HTML Export** — Standalone HTML files (5 themes + PDF export)

## Key Features

- Supports **all Discourse forums** via 4-layer auto-detection
- **Parallel save** to multiple targets independently — any failure is isolated
- **Feishu dual mode** — Bitable (database) + Cloud Doc simultaneously
- **WebDAV support** — Jianguyun, Nextcloud, and more
- **Baidu Netdisk** — OAuth authorization flow
- **Auto folder routing** — Files organized by forum domain automatically
- **Floating save button** + long-press floor selection
- **Custom floor saving** — Range (`1-10`) and list (`1,3,5,8`) formats
- **HTML export** — 5 themes, image lightbox, table enhancements, PDF export
- **Image/video download** to Obsidian Vault with local path rewriting
- **Bilingual UI** — Chinese/English toggle
- **Auto filename sanitization** — Strips illegal characters for cross-platform safety

## Installation

### Chrome Extension (Chromium browsers)

1. Clone or download the `raw-edition/` folder
2. Open `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** → **Load unpacked** → select the folder

### Userscript (All browsers)

Install [Tampermonkey](https://www.tampermonkey.net/), then use the [one-click install link](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js).

## Usage

- **Click** the floating save button to save the current post to all enabled targets.
- **Long-press** the button to select specific floors to save.
- **Click** a comment's link button to save the post with that specific floor.

## Configuration

Open the extension options page to configure:

- **Save targets** — Enable/disable each target independently
- **Obsidian** — Vault name, folder, Advanced URI, image/video download settings
- **Feishu** — App credentials, Bitable/Cloud Doc tokens, upload toggles (body/MD/HTML)
- **Notion** — Integration token, database ID, property mapping
- **WebDAV** — Server URL, credentials, remote path
- **Baidu Netdisk** — OAuth token (auto-authorized)
- **HTML Export** — Output folder, theme selection
- **Content** — Metadata, image embedding, comment settings

All settings are accessible through a tabbed interface with bilingual labels.

## Multi-Save Targets

All save targets are **completely independent**. You can enable any combination:

- Enable just one target, or all seven at once
- Each target runs in parallel — a failure in one does not block others
- Feishu Bitable and Feishu Cloud Doc can run simultaneously in dual mode

## Browser Support

| Browser | Extension | Userscript |
|---------|-----------|------------|
| Chrome | Supported | Supported |
| Edge | Supported | Supported |
| Firefox | — | Supported |
| Safari | — | Supported |
| Brave / Opera | Supported | Supported |

## Changelog

### v1.1.0

- WebDAV support (Jianguyun, Nextcloud, etc.)
- Baidu Netdisk OAuth authorization
- Feishu Cloud Doc dual mode
- Custom floor saving (range/list formats)
- Floating save button with long-press floor selection
- Auto folder routing by forum domain
- HTML export enhancements (5 themes, PDF export)
- Image/video download to Obsidian Vault
- Auto filename sanitization for illegal characters
- Bilingual UI (Chinese/English)

## License

MIT License — free to use, modify, and distribute.

## Acknowledgments

- [LinuxDo](https://linux.do)
- [Obsidian](https://obsidian.md)
- [Feishu Open Platform](https://open.feishu.cn)
- [Notion](https://www.notion.so)
- [Turndown](https://github.com/mixmark-io/turndown)
