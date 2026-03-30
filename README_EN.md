# Discourse Saver V4.3.5

**[中文](README.md) | English**

Save **any Discourse forum** posts and comments to **Obsidian**, **Feishu Bitable**, or **Notion** with one click.

> **V4.3.5 Updates**:
> - **HTML Export Enhancement** - Image Lightbox, table fullscreen/copy, 5 themes
> - **PWA Support** - Installable to device home screen, offline viewing
> - **PDF Export** - One-click export to PDF from toolbar
> - **Code Copy** - One-click code block copy
> - **Responsive Design** - Perfect for mobile, tablet, desktop

## Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome | ✅ Full Support | Native support |
| Edge | ✅ Full Support | Chromium-based, fully compatible |
| Brave | ✅ Full Support | Chromium-based, fully compatible |
| Opera | ✅ Full Support | Chromium-based, fully compatible |
| Firefox | ❌ Not Supported | Extension API incompatible |
| Safari | ❌ Not Supported | Extension API incompatible |

## Supported Forums

### Tested Compatible Sites (56 sites, 93.3% pass rate)

#### Programming Language Communities (12/12)

| Site | URL | Status |
|------|-----|--------|
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

#### AI/ML Communities (3/3)

| Site | URL | Status |
|------|-----|--------|
| OpenAI Community | [community.openai.com](https://community.openai.com) | ✅ |
| Hugging Face | [discuss.huggingface.co](https://discuss.huggingface.co) | ✅ |
| PyTorch | [discuss.pytorch.org](https://discuss.pytorch.org) | ✅ |

#### Web Frameworks (3/4)

| Site | URL | Status |
|------|-----|--------|
| Django | [forum.djangoproject.com](https://forum.djangoproject.com) | ✅ |
| Ruby on Rails | [discuss.rubyonrails.org](https://discuss.rubyonrails.org) | ✅ |
| Ember | [discuss.emberjs.com](https://discuss.emberjs.com) | ✅ |
| Vue.js | [forum.vuejs.org](https://forum.vuejs.org) | ❌ API Limited |

#### DevOps/Cloud Services (8/9)

| Site | URL | Status |
|------|-----|--------|
| Docker Community | [forums.docker.com](https://forums.docker.com) | ✅ |
| Kubernetes | [discuss.kubernetes.io](https://discuss.kubernetes.io) | ✅ |
| Terraform (HashiCorp) | [discuss.hashicorp.com](https://discuss.hashicorp.com) | ✅ |
| Ansible | [forum.ansible.com](https://forum.ansible.com) | ✅ |
| GitLab | [forum.gitlab.com](https://forum.gitlab.com) | ✅ |
| CircleCI | [discuss.circleci.com](https://discuss.circleci.com) | ✅ |
| Fly.io | [community.fly.io](https://community.fly.io) | ✅ |
| Vercel | [vercel.community](https://vercel.community) | ✅ |
| Rancher | [forums.rancher.com](https://forums.rancher.com) | ❌ API Limited |

#### Databases (5/5)

| Site | URL | Status |
|------|-----|--------|
| Elastic | [discuss.elastic.co](https://discuss.elastic.co) | ✅ |
| MongoDB | [mongodb.com/community/forums](https://www.mongodb.com/community/forums) | ✅ |
| Redis | [forum.redis.io](https://forum.redis.io) | ✅ |
| CockroachDB | [forum.cockroachlabs.com](https://forum.cockroachlabs.com) | ✅ |
| TimescaleDB | [timescale.com/forum](https://www.timescale.com/forum) | ✅ |

#### Open Source Projects (8/8)

| Site | URL | Status |
|------|-----|--------|
| Fedora | [discussion.fedoraproject.org](https://discussion.fedoraproject.org) | ✅ |
| Ubuntu | [discourse.ubuntu.com](https://discourse.ubuntu.com) | ✅ |
| NixOS | [discourse.nixos.org](https://discourse.nixos.org) | ✅ |
| Home Assistant | [community.home-assistant.io](https://community.home-assistant.io) | ✅ |
| Hugo | [discourse.gohugo.io](https://discourse.gohugo.io) | ✅ |
| Let's Encrypt | [community.letsencrypt.org](https://community.letsencrypt.org) | ✅ |
| Grafana | [community.grafana.com](https://community.grafana.com) | ✅ |
| Tor Project | [forum.torproject.net](https://forum.torproject.net) | ✅ |

#### Game Development (5/5)

| Site | URL | Status |
|------|-----|--------|
| Godot | [forum.godotengine.org](https://forum.godotengine.org) | ✅ |
| Defold | [forum.defold.com](https://forum.defold.com) | ✅ |
| Phaser | [phaser.discourse.group](https://phaser.discourse.group) | ✅ |
| Roblox DevForum | [devforum.roblox.com](https://devforum.roblox.com) | ✅ |
| Unreal Engine | [forums.unrealengine.com](https://forums.unrealengine.com) | ✅ |

#### Blockchain/Web3 (4/4)

| Site | URL | Status |
|------|-----|--------|
| Ethereum Research | [ethresear.ch](https://ethresear.ch) | ✅ |
| Polkadot | [forum.polkadot.network](https://forum.polkadot.network) | ✅ |
| Cosmos | [forum.cosmos.network](https://forum.cosmos.network) | ✅ |
| Near Protocol | [gov.near.org](https://gov.near.org) | ✅ |

#### Productivity Tools (2/2)

| Site | URL | Status |
|------|-----|--------|
| Obsidian | [forum.obsidian.md](https://forum.obsidian.md) | ✅ |
| Logseq | [discuss.logseq.com](https://discuss.logseq.com) | ✅ |

#### Browser/Privacy (2/2)

| Site | URL | Status |
|------|-----|--------|
| Brave Community | [community.brave.com](https://community.brave.com) | ✅ |
| Bitwarden | [community.bitwarden.com](https://community.bitwarden.com) | ✅ |

#### Others (3/4)

| Site | URL | Status |
|------|-----|--------|
| Netlify | [answers.netlify.com](https://answers.netlify.com) | ✅ |
| Webflow | [forum.webflow.com](https://forum.webflow.com) | ✅ |
| Linux.do | [linux.do](https://linux.do) | ✅ |
| Atom/Electron | [discuss.atom.io](https://discuss.atom.io) | ❌ Closed |

### Sites Requiring Login

The following sites require login to access, plugin should work normally after login:

| Site | URL | Notes |
|------|-----|-------|
| Envato Forums | [forums.envato.com](https://forums.envato.com) | Business Forum |
| Revolut Community | [community.revolut.com](https://community.revolut.com) | Financial Services |
| Cloudflare Community | [community.cloudflare.com](https://community.cloudflare.com) | Requires Account |
| Unity Discussions | [discussions.unity.com](https://discussions.unity.com) | Developer Account |
| Affinity Forum | [forum.affinity.serif.com](https://forum.affinity.serif.com) | Product Users |

### Non-Discourse Sites (Not Supported)

| Site | URL | Actual Framework | Notes |
|------|-----|-----------------|-------|
| **Ruby China** | [ruby-china.org](https://ruby-china.org) | Homeland | Similar appearance but different framework |
| **V2EX** | [v2ex.com](https://v2ex.com) | Custom | Not Discourse |
| **NodeSeek** | [nodeseek.com](https://nodeseek.com) | Custom | Not Discourse |
| **LearnKu** | [learnku.com](https://learnku.com) | Custom | Not Discourse |

> **Note**: The above sites are tech communities but don't use Discourse framework, thus not supported.

### Custom Sites

For privately deployed or undetected Discourse sites, you can manually add them in settings.

## Core Features

| Action | Result |
|--------|--------|
| **Single click** on post link button | Save post to Obsidian/Feishu |
| **Single click** on comment link button | Save post + that comment (filename: `Title-Floor X.md`) |
| **Double click** on link button | Copy link to clipboard |
| **Ctrl+Shift+S** (Mac: **⌘+Shift+S**) | Keyboard shortcut to save post |

---

## V4.3.5 New Features

### HTML Export Enhancement

| Feature | Description |
|---------|-------------|
| **Image Lightbox** | Click to zoom, ESC or click to close |
| **Image Gallery** | Supports figure/figcaption format, fallback on load failure |
| **Table Enhancement** | One-click copy as TSV, fullscreen view, zebra stripes, scroll hints |
| **5 Themes** | LinuxDo Original, Dark Geek, Business, Sakura, Lavender |
| **PWA Support** | Installable to device home screen, offline viewing |
| **PDF Export** | One-click export to PDF from toolbar |
| **Code Copy** | One-click code block copy |
| **Responsive Design** | Perfect for mobile, tablet, desktop |

### Settings Page

| Feature | Description |
|---------|-------------|
| **HTML Export Tips** | Base64 image embedding file size warning |

### Performance Optimization

| Feature | Description |
|---------|-------------|
| **Comment Batching** | 20 per batch, prevents rate limiting |
| **Notion Batching** | 100 blocks per batch, follows API limits |
| **Feishu Large Files** | Supports extra-long content upload |

## V4.0.5 New Features

| Feature | Description |
|---------|-------------|
| **Multi-language Support** | Settings page supports Chinese/English toggle |
| **Comments API Fetch** | Fetch all comments via Discourse API, solving lazy-loading limitation |
| **Save All Comments** | New "Save All" option, comment count supports 0-10000 |
| **56+ Sites Compatible** | Tested 60 Discourse sites, 93.3% pass rate |

## V3.6.0 Features

| Feature | Description |
|---------|-------------|
| **Support All Discourse** | Auto-detect any Discourse forum (4-layer detection mechanism) |
| **Custom Site Management** | Manually add/remove sites, support private deployments |
| **Image Base64 Embedding** | Convert images to Base64 embedded in notes, complete single-file save |
| **Image Compression** | Set max width and quality to control file size |
| **GIF Processing** | Option to skip GIF animations (keep original links) |

## V3.5 Features

| Feature | Description |
|---------|-------------|
| Link Button Hijacking | Single click to save, double click to copy link |
| Feishu Bitable | Sync save to Feishu, support MD attachment upload |
| Feishu/Lark Dual Versions | Support domestic version (feishu.cn) and international version (larksuite.com) |
| Comment Link Support | Click comment link button to save post + that comment |
| Floor Identification | Obsidian: `Title-Floor X.md` / Feishu: `Title [Floor X]` |
| Plugin Toggle | Can disable plugin, restore link button original function |

---

## Installation

### Chrome / Edge / Brave / Opera Installation

1. Download all plugin files to a local folder
2. Open browser extensions page:
   - **Chrome**: Visit `chrome://extensions/`
   - **Edge**: Visit `edge://extensions/`
   - **Brave**: Visit `brave://extensions/`
   - **Opera**: Visit `opera://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select plugin folder `discourse-saver`

> **Tip**: All Chromium-based browsers (Chrome, Edge, Brave, Opera, etc.) support this extension

---

## Usage

### Save Posts

1. Visit any **Discourse forum** (LinuxDo, Discourse Meta, etc.) post page
2. Plugin will **auto-detect** and activate (first visit will show prompt)
3. Find the **link button** (chain icon) in the bottom right of post/comment
4. **Single click** → Save to Obsidian/Feishu
5. **Double click** → Copy link to clipboard

### File Naming Rules

**Obsidian Filename:**
- Main post: Title.md
- Comment: Title-Floor X.md (X is floor number)

**Feishu Title:**
- Main post: Title
- Comment: Title [Floor X]

---

## Configuration Options

Click Chrome extension icon → Right click → "Options"

### Multi-language Support

Settings page supports Chinese/English toggle, click **中文 / EN** button in top right corner to switch language.

### Plugin Status

| Option | Description |
|--------|-------------|
| Enable Plugin | When disabled, link button restores original function (requires page refresh) |

### Custom Sites (V3.6.0)

| Option | Description |
|--------|-------------|
| Add Site | Enter domain (e.g., `forum.example.com`) to manually add |
| Remove Site | Click delete button next to site to remove |

> **Note**: Most Discourse forums are auto-detected. Custom site feature is for:
> - Privately deployed Discourse (may have removed identifiers)
> - Special sites where detection fails

### Save Targets

| Option | Description |
|--------|-------------|
| Save to Obsidian | Enable Obsidian save |
| Save to Feishu Bitable | Enable Feishu sync |
| Save to Notion Database | Enable Notion sync (V4.0.1) |

### Obsidian Settings

| Option | Description |
|--------|-------------|
| Vault Name | Leave empty to use currently open vault (recommended) |
| Save Folder | Which folder in vault to save to |
| Use Advanced URI | Support large content save (recommended to enable) |

### Feishu Settings

| Option | Description |
|--------|-------------|
| API Version | Choose Feishu domestic version or Lark international version |
| App ID | Feishu Open Platform application ID |
| App Secret | Feishu Open Platform application secret |
| app_token | Bitable token (string after `/base/` in URL) |
| table_id | Data table ID (string after `?table=` in URL) |
| Upload MD Attachment | Upload complete content as MD file attachment |

### Notion Settings (V4.0.2)

| Option | Description |
|--------|-------------|
| Integration Token | Notion Integration key starting with `secret_` |
| Database ID | 32-character hexadecimal Database identifier |
| Property Mapping | Configure Database property names (default Chinese: 标题, 链接, 作者, etc.) |

**Database Property Requirements:**

| Property Name | Type | Required |
|--------------|------|----------|
| 标题 (Title) | Title | ✅ |
| 链接 (Link) | URL | ✅ |
| 作者 (Author) | Rich Text | |
| 分类 (Category) | Rich Text or Select | |
| 保存日期 (Save Date) | Date | |
| 评论数 (Comments) | Number | |

> **Detailed Configuration Tutorial**: See [NOTION-GUIDE.html](NOTION-GUIDE.html)

### Content Settings

| Option | Description |
|--------|-------------|
| Add Metadata | Whether to add Chinese frontmatter |
| Keep Image Links | Whether to keep images in posts |

### Image Embedding Settings (V3.6.0)

| Option | Description |
|--------|-------------|
| Embed Images in Notes | When enabled, convert images to Base64 embedded in Markdown |
| Max Image Width | 0=original size, or choose 1920/1280/800/480px |
| Image Quality | 100%/90%/80%/60%, lower quality reduces file size |
| Skip GIF Animations | When enabled, GIFs keep original links (Base64 loses animation) |

> **⚠️ Important**: When image embedding is enabled, **you must also enable Advanced URI plugin**, otherwise large files cannot be saved. Plugin will auto-prompt and enable.

### Comment Settings

| Option | Description |
|--------|-------------|
| Save Comments | Whether to save comments (default off) |
| Comment Count | 0-10000 comments, default 100 |
| Save All | When checked, save all post comments (via API fetch) |
| Collapse Comments | Use `<details>` tag to collapse |

---

### Comment Fetching

Plugin supports two comment fetching methods:

| Comment Count | Fetch Method | Description |
|--------------|--------------|-------------|
| ≤30 comments | Page Extract | Extract from current page DOM (fast) |
| >30 comments or "Save All" checked | **API Fetch** | Fetch complete comments via Discourse API (solves lazy-loading) |

**API Fetch Advantages:**
- No need to manually scroll page
- Can fetch all comments (not limited by lazy-loading)
- Shows loading progress when >500 comments

> **Tip**: If post has more than 30 comments, recommend checking "Save All" to get complete comments.

---

## Feishu Configuration Tutorial

Feishu Bitable can serve as a post index library for easy search and management.

### Step 1: Create Feishu Application

1. Visit [Feishu Open Platform](https://open.feishu.cn/)
2. Log in to your Feishu account
3. Click "**Create Application**" → Select "**Enterprise Self-built Application**"
4. Fill in application name (e.g., LinuxDo Collector) and description
5. After creation, enter application details page

### Step 2: Get Credentials

Find in application details page "**Credentials and Basic Info**":

| Field | Location |
|-------|----------|
| App ID | Application credentials area, copy directly |
| App Secret | Click "Show" then copy |

> **Important**: App Secret only shows once, please save it properly!

### Step 3: Configure Permissions

1. Select "**Permission Management**" in left menu
2. Search and add the following permissions (all are **no-review permissions**, no approval needed):

| Permission ID | Permission Name | Description |
|--------------|----------------|-------------|
| `bitable:app` | Bitable | Read/write bitable (**Required**) |
| `drive:file:upload` | Upload Files | Needed when uploading MD attachments |

3. Click "**Batch Enable**"

### Step 4: Create Bitable

1. Click "**+**" in Feishu Docs → Select "**Bitable**"
2. Add the following fields (**field names must match exactly**):

| Field Name | Field Type | Description |
|-----------|-----------|-------------|
| 标题 (Title) | Text | Post title |
| 链接 (Link) | **Hyperlink** | Original post URL (clickable) |
| 作者 (Author) | Text | Poster |
| 保存时间 (Save Time) | Date | Auto-record save time |
| 评论数 (Comments) | Number | Comment count |
| 附件 (Attachment) | Attachment | MD file (when upload attachment is checked) |
| 正文 (Content) | Text | Content summary (when not uploading attachment) |

> **Note**: "Link" field must be **Hyperlink type**, not plain text!

### Step 5: Get Table Parameters

Extract app_token and table_id from Bitable URL:

**URL Format Example:**

> https://feishu.cn/base/**XxXxXxXxXx**?table=**tblYyYyYy**&view=...

**Extraction Method:**
- **app_token**: Part after `/base/` and before `?` (e.g., XxXxXxXxXx)
- **table_id**: Part after `?table=` (e.g., tblYyYyYy, starts with `tbl`)

> **Important Note**:
>
> | Parameter | Meaning | Extract Location | Format |
> |-----------|---------|-----------------|--------|
> | **app_token** | Identifier for entire bitable document | After `/base/` in URL before `?` | Alphanumeric string |
> | **table_id** | Identifier for current data table | After `?table=` in URL | Starts with `tbl` |
>
> **Common Errors**:
> - Copied entire URL instead of extracting corresponding part
> - Swapped app_token and table_id
> - A bitable can have multiple data tables, ensure you copy the ID of the table you want to use

### Step 6: Add Application as Collaborator

**This step is very important! Many people miss this step causing save failures.**

1. Click "**...**" in top right of Bitable
2. Select "**More**" → "**Add Document App**"
3. Search for your just created application name (e.g., LinuxDo Collector)
4. Add as "**Editable**" collaborator

### Step 7: Publish Application

1. Return to application details page on Feishu Open Platform
2. Click "**Version Management and Publishing**" on left
3. Click "**Create Version**"
4. Fill in version number and update notes
5. Click "**Publish**"

> **Note**: Enterprise self-built applications **must be published** to use API normally!

### Step 8: Fill Plugin Configuration

Fill in relevant information in Chrome plugin configuration page's "Feishu Settings", click "**Test Connection**" to verify.

> **V3.5.12 New**: Test connection will automatically verify if the following fields exist and if types are correct:
> - 标题 (Text), 链接 (Hyperlink), 作者 (Text), 保存时间 (Date)
> - 评论数 (Number), 附件 (Attachment), 正文 (Text)
>
> If field configuration is wrong, detailed error prompts will be shown. See [FEISHU-FIELD-VALIDATION.md](FEISHU-FIELD-VALIDATION.md)

---

## Saved Note Format

### File Naming

- **Main post**: Title.md
- **Comment**: Title-Floor X.md (X is floor number)

### Note Structure

Saved notes contain YAML frontmatter metadata and body content:

```text
---
来源: https://linux.do/t/topic/847468
标题: Secret Garden Gardener Invitation
作者: Neo
保存时间: 2026-03-11 19:38:14
标签: [linuxdo]
评论数: 100
---

# Secret Garden Gardener Invitation

[Post content...]

<span style="color: red;">Colors are preserved</span>

---

## Comments (Total 100)

### Floor 1 - Alice

Thanks for sharing!

### Floor 2 - Bob

<span style="color: blue;">Colors are also preserved</span>
```

**Notes:**
- HTML color styles in posts are preserved
- Comments are displayed by floor (if save comments is enabled)

---

## FAQ

### Q1: Not all comments saved?

**A:** If comment count exceeds 30, please check "**Save All**" option in settings.

**How it works:**
- ≤30 comments: Extract from page DOM (fast)
- >30 comments: Fetch via Discourse API (complete, solves lazy-loading)
- Check "Save All": Force API fetch for all comments

**Suggestions:**
1. Check "Save Comments" in settings
2. Check "Save All" to get complete comments
3. Shows loading progress when >500 comments

### Q2: No response after clicking link button?

**A:** Please check:
1. Is Obsidian running
2. Does browser allow `obsidian://` protocol (first use will prompt)
3. Press F12 to check if console has errors

### Q3: Content too long, save failed?

**A:** Please enable "Use Advanced URI Plugin" in settings, need to first install [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri) plugin in Obsidian.

### Q4: Feishu save failed?

**A:** Please check in this order:
1. Are App ID and App Secret correct (no extra spaces)
2. Is `bitable:app` permission added
3. Is application **published**
4. Is application added as **collaborator** to Bitable (most common reason!)
5. Are app_token and table_id correctly extracted

### Q5: Feishu reports "FieldNameNotFound" error?

**A:** Bitable is missing required fields. Please ensure the following fields exist (names must match exactly):
- 标题 (Text)
- 链接 (Hyperlink)
- 作者 (Text)
- 保存时间 (Date)
- 评论数 (Number)
- 正文 (Text) or 附件 (Attachment)

### Q6: How to restore link button original function?

**A:** Turn off "Enable Plugin" switch in settings, then refresh page.

### Q7: How to configure Feishu international version (Lark)?

**A:**
1. Visit [Lark Open Platform](https://open.larksuite.com/)
2. Configuration steps same as domestic version
3. Select "**Lark International Version**" in plugin configuration

### Q8: Can Edge browser be used?

**A:** Yes! Edge browser is based on Chromium kernel, fully supports this extension. Installation method:
1. Visit `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select plugin folder

All Chromium-based browsers (Chrome, Edge, Brave, Opera) support this extension.

### Q9: Notion save failed?

**A:** Please check in this order:
1. Does Integration Token start with `secret_`
2. Is Database ID a 32-character hexadecimal string
3. Is Integration connected to Database (most common reason!)
4. Does property mapping match Database property names exactly (case-sensitive)

See [NOTION-GUIDE.html](NOTION-GUIDE.html)

### Q10: Do Notion and Obsidian/Feishu conflict?

**A:** No conflict! Three save targets are completely independent. You can enable all platforms simultaneously, save to multiple places with one click. Any platform save failure won't affect other platforms.

---

## Changelog

### v4.3.5 (2026-03-15)

- **New**: HTML Export Enhancement
  - Image Lightbox - Click to zoom, ESC or click to close
  - Image Gallery - Supports figure/figcaption format
  - Image Error Handling - Shows placeholder on load failure
  - Table Enhancement - One-click copy as TSV, fullscreen, zebra stripes
  - Table Scroll Hints - Shows swipe hint for wide tables
  - 5 Theme Switching - LinuxDo Original, Dark Geek, Business, Sakura, Lavender
  - PWA Support - Installable to device home screen
  - PDF Export - One-click export from toolbar
  - Code Block Copy - One-click copy code content
  - Responsive Design - Perfect for mobile, tablet, desktop
- **New**: Settings page HTML export tips - Base64 image embedding file size warning
- **Optimize**: Comment batching - 20 per batch, prevents rate limiting
- **Optimize**: Notion batching - 100 blocks per batch, follows API limits
- **Optimize**: Feishu large files - Supports extra-long content upload

### v4.0.5 (2026-03-14)

- **New**: Multi-language support (Chinese/English)
  - Complete settings page internationalization
  - One-click language toggle in top right corner
- **New**: Comments API fetch functionality
  - Fetch all comments via Discourse API
  - Solves lazy-loading limitation of only getting ~30 comments
  - New "Save All" option
  - Comment count range extended to 0-10000
  - Shows loading progress when >500 comments
- **New**: Compatibility test report
  - Tested 60 Discourse sites
  - 56 sites passed (93.3% pass rate)
  - Covers Programming Languages, AI/ML, DevOps, Databases, etc.
- **Fix**: Notion multi-platform video support improvements
  - YouTube, Vimeo use Notion native video block (can play directly)
  - Bilibili, Youku, TikTok, QQ Video, Xigua Video, Facebook use bookmark block
  - Solves Notion not natively supporting Chinese video platforms
- **New**: Notion iframe parsing supports more platforms
  - Added Youku `player.youku.com/embed/` parsing
  - Added TikTok `tiktok.com/embed/` parsing
  - Added QQ Video `v.qq.com` parsing
  - Added Xigua Video `ixigua.com/iframe/` parsing
  - Added Facebook `facebook.com/plugins/video` parsing

### v4.0.2 (2026-03-12)

- **Fix**: Post content line break loss issue
  - Fixed `<br>` tag not generating line breaks during TurndownService conversion
  - Fixed line breaks lost inside colored style content (e.g., `<span style="color:red">`)
  - Comment area content line breaks synchronized fix
- **Fix**: Code block line break loss issue
  - Fixed LinuxDo code block structure `<pre><div>button</div><code>` detection failure
  - Fixed `<pre><code>` code block internal `<br>` tags not converting to line breaks
  - Code blocks can be displayed and copied normally after exporting to Obsidian
- **Improve**: Notion functionality enhancement
  - Added image support (`![](url)` converts to Notion image block)
  - Added unordered list (`-`, `*`), ordered list (`1.`), horizontal rule support
  - Property mapping default values changed to Chinese (标题, 链接, 作者, 分类, 保存日期, 评论数)
  - Test connection added strict property type validation (Title/URL/Rich Text/Date/Number)
  - Detailed error prompts (property doesn't exist, type mismatch)
- **Fix**: Save target added Notion option (previously omitted)
- **Optimize**: Comment area collapsed/non-collapsed modes both display line breaks normally

### v4.0.1 (2026-03-12)

- **New**: Notion Database save functionality
  - Support Notion Integration Token authentication
  - Custom property mapping (support Chinese property names)
  - Post content saves to Notion Page body
  - Detailed error prompts and configuration validation
- **New**: [Notion Configuration Guide HTML Version](NOTION-GUIDE.html)
- **Optimize**: Three platforms completely isolated (Obsidian, Feishu, Notion don't affect each other)
- **Optimize**: Save target validation updated (support choose one or multiple)

### v3.6.0 (2026-03-12)

- **New**: Support all Discourse forums
  - 4-layer auto-detection mechanism (Meta Generator, DOM structure, CSS classes, Ember features)
  - Custom site management (manually add/remove)
  - Added `detector.js` lightweight detector, load main script on demand
- **New**: Image Base64 embedding feature
  - Convert images to Base64 embedded in Markdown, complete single-file save
  - Support image compression (max width, quality settings)
  - Support skip GIF animations (keep original links)
  - Auto-enable Advanced URI (required for large files)
- **Optimize**: Memory management improvements
  - Fixed Object URL memory leak
  - Duplicate image download deduplication optimization
- **Optimize**: UI improvements
  - Image settings collapsible panel
  - Custom site management interface
  - Advanced URI auto-prompt

[... Previous version history omitted for brevity ...]

---

## Technical Details

### Browser Compatibility

This extension uses **Manifest V3** standard, fully compatible with all Chromium-based browsers:

| Technical Standard | Compatible Browsers |
|-------------------|-------------------|
| Manifest V3 | Chrome 88+, Edge 88+, Brave 1.20+, Opera 74+ |
| Chrome Extension API | Fully compatible with Chromium kernel browsers |
| Content Scripts | Cross-browser standard API |
| Service Worker | Replaces traditional Background Scripts |

> **Note**: Firefox uses different extension API (WebExtensions), incompatible with this extension

### File Structure

Plugin directory discourse-saver contains the following files:

**Root Directory Files:**
- manifest.json - Plugin configuration (Manifest V3)
- detector.js - Site detector (V3.6.0 new)
- content.js - Content script (hijacking + saving)
- background.js - Background script (Feishu API + script injection)
- options.html - Configuration page
- options.js - Configuration logic
- README.md - Documentation

**lib Directory:**
- turndown.min.js - HTML to Markdown library
- marked.min.js - Markdown to HTML library (for HTML export)

**icons Directory:**
- icon16.png / icon48.png / icon128.png - Extension icons

### Permission Description

| Permission | Description |
|-----------|-------------|
| storage | Save user configuration |
| activeTab | Access current tab |
| scripting | Dynamic script injection (V3.6.0) |
| host_permissions | Access Feishu API + detect all websites |

---

## License

MIT License

---

## Acknowledgments

- [LinuxDo](https://linux.do)
- [Obsidian](https://obsidian.md)
- [Feishu Open Platform](https://open.feishu.cn)
- [Notion](https://www.notion.so)
- [Turndown](https://github.com/mixmark-io/turndown)
- [Advanced URI](https://github.com/Vinzent03/obsidian-advanced-uri)
