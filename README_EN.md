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
- **Parallel save** to multiple targets — any failure is isolated
- **Feishu dual mode** — Bitable + Cloud Doc simultaneously
- **WebDAV & Baidu Netdisk** cloud storage support
- **Auto folder routing** by forum domain
- **Floating save button** with long-press floor selection
- **Custom floor saving** — range (`1-10`) and list (`1,3,5,8`) formats
- **HTML export** — 5 themes, image lightbox, PDF export
- **Image/video download** to Obsidian Vault with local path rewriting
- **Bilingual UI** — Chinese/English toggle
- **Auto filename sanitization** for cross-platform safety

## Installation

> **Use the Raw Edition** — located in the [`raw-edition/`](raw-edition/) directory.

### Chrome Extension (Chromium browsers)

1. Clone or download the [`raw-edition/`](raw-edition/) folder
2. Open `chrome://extensions/` (or `edge://extensions/`)
3. Enable **Developer mode** -> **Load unpacked** -> select the folder

### Userscript (All browsers)

Install [Tampermonkey](https://www.tampermonkey.net/), then use the [one-click install link](https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js).

## Usage

- **Click** the floating save button to save the current post to all enabled targets.
- **Long-press** the button to select specific floors to save.
- **Click** a comment's link button to save the post with that specific floor.

## Full Documentation

For detailed configuration, multi-save setup, and changelog, see:
**[raw-edition/README_EN.md](raw-edition/README_EN.md)**

## Browser Support

| Browser | Extension | Userscript |
|---------|-----------|------------|
| Chrome | Supported | Supported |
| Edge | Supported | Supported |
| Firefox | — | Supported |
| Safari | — | Supported |
| Brave / Opera | Supported | Supported |

## License

MIT License — free to use, modify, and distribute.
