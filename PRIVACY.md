# Privacy Policy for Discourse Saver

**Last updated: 2026-05-04**

## Overview

Discourse Saver ("the Extension") is a Chrome browser extension that saves Discourse forum posts to note-taking applications such as Obsidian, Feishu, Notion, SiYuan Note, and Yuque.

---

## Data Collection

**We do not collect, store, or transmit any personal data to our servers.**

The Extension operates entirely locally in your browser, with the exception of API calls you explicitly configure (e.g., Feishu, Notion).

---

## What the Extension Accesses

| Data | Purpose | Stored Remotely? |
|------|---------|-----------------|
| Forum page content (post text, images) | To save posts to your chosen destination | No |
| Your Feishu/Notion/Yuque API credentials | To authenticate with your configured services | No — stored locally in chrome.storage only |
| Extension settings and preferences | To remember your configuration | No — stored locally in chrome.storage only |
| Runtime logs | For debugging purposes | No — stored locally, never transmitted |

---

## Third-Party Services

The Extension sends data **only to services you explicitly configure**:

- **Feishu / Lark** — if you configure Feishu integration, post content is sent to Feishu's API (`open.feishu.cn` / `open.larksuite.com`)
- **Notion** — if you configure Notion integration, post content is sent to Notion's API (`api.notion.com`)
- **Yuque** — if you configure Yuque integration, post content is sent to Yuque's API (`www.yuque.com`)
- **Obsidian / SiYuan Note** — data is saved locally on your device only

All third-party services are governed by their own privacy policies.

---

## Permissions Explained

| Permission | Reason |
|-----------|--------|
| `activeTab` | Read the current forum page to extract post content |
| `scripting` | Inject the save button into Discourse forum pages |
| `storage` | Save your settings and API credentials locally |
| `downloads` | Export posts as files (HTML, Markdown) to your device |
| `clipboardWrite` | Copy post content to clipboard when requested |
| `<all_urls>` (host permissions) | Required to detect and inject into any Discourse forum, which may be hosted on any domain |

---

## Data Security

- All credentials (API tokens, keys) are stored locally using `chrome.storage.local`
- No data is ever sent to the Extension developer's servers
- The Extension has no backend server

---

## Children's Privacy

This Extension is not directed at children under 13. We do not knowingly collect any information from children.

---

## Changes to This Policy

We may update this Privacy Policy from time to time. Changes will be reflected by the "Last updated" date above.

---

## Contact

If you have questions about this Privacy Policy, please open an issue on GitHub:

**https://github.com/acheng-byte/discourse-saver/issues**

Or contact via 爱发电: **https://ifdian.net/a/acheng111**
