// Discourse Saver - Content Script V4.3.11
// 劫持链接按钮，保存帖子+评论到Obsidian（保留颜色样式）
// V3.5: 支持同时保存到飞书多维表格（带MD附件）
// V3.5.1: 单击保存到Obsidian，双击触发原生复制链接
// V3.5.2: 支持飞书国内版和Lark国际版
// V4.0.1: 新增 Notion Database 保存功能
// V3.5.3: 支持评论区链接按钮 - 点击评论链接保存主帖+该评论
// V3.5.4: 修复双击检测竞态条件 + 改进原生复制链接触发机制
// V3.5.5: 修复飞书记录重复问题（搜索逻辑改进）
// V3.5.6: 保存时间改为北京时间格式
// V3.5.7: 改为劫持链接按钮
// V3.5.8: 修复误触发问题 - 增加严格的区域检测，只拦截帖子操作菜单中的链接按钮
// V3.5.9: 增强链接按钮检测 - 使用 post-action-menu__copy-link class
// V3.5.10: 修复评论楼层号获取 - 从 .topic-post 而非 article 获取 data-post-number
// V3.5.11: 明确支持 Edge/Brave/Opera 等 Chromium 浏览器
// V3.5.12: 飞书字段验证功能
// V3.5.13: 增强错误提示 + UI文字更新 + Mac快捷键支持
// V3.6.0: 支持所有 Discourse 论坛 + 自定义站点管理 + 图片 Base64 嵌入
// V4.0.2: 修复换行丢失问题 - <br>标签现在正确转换为换行符
// V4.0.3: onebox 链接预览优化 + 在线视频链接自动转 iframe（YouTube/Bilibili/Vimeo）
// V4.0.4: 修复视频封面重复问题 - 视频链接转iframe时自动删除封面图片，非视频链接保留缩略图
// V4.0.6: 修复只启用飞书/Notion时的反馈和错误处理问题
// V4.2.2: 新增文档和音频嵌入支持 - PDF预览、Word/Excel/PPT图标链接、SVG嵌入、音频播放器
// V4.3.5: HTML导出增强 - 图片Lightbox、表格全屏/复制、5种主题切换、PWA支持、PDF导出、代码复制
// V4.3.8: 评论用户名超链接 + 修复SVG图片语法 + 折叠评论Markdown转HTML
// V4.3.9: 修复Notion导出裸URL链接问题 - 非Markdown格式的URL现在也能正确显示为可点击链接
//
// 功能说明：
// - 点击主帖链接按钮：保存主帖（如开启"保存评论"则包含所有评论）
// - 点击评论链接按钮：保存主帖+该条评论（文件名带楼层号，不受"保存评论"设置影响）
// - 双击同一链接按钮：触发原生复制链接功能（必须是同一个按钮）

(function() {
  'use strict';

  console.log('[Discourse Saver] content.js 开始执行，URL:', location.href);

  // 防止重复执行（扩展重新加载后版本号会变，允许重新注入）
  const CONTENT_SCRIPT_VERSION = '4.3.11';
  if (window.__discourseSaverVersion === CONTENT_SCRIPT_VERSION) {
    console.log('[Discourse Saver] content.js 已在运行（同版本），跳过');
    return;
  }
  window.__discourseSaverVersion = CONTENT_SCRIPT_VERSION;
  window.__discourseSaverInjected = true;

  // 默认配置
  const DEFAULT_CONFIG = {
    // V3.5.1: 插件总开关
    pluginEnabled: true,

    // V3.6.0: 自定义站点列表
    customSites: [],

    vaultName: '',
    folderPath: 'Discourse收集箱',
    addMetadata: false,
    addPostInfoCallout: false,
    calloutFollowMetadata: true,
    calloutSource: true,       calloutSourceKey: '来源',
    calloutTitle: true,        calloutTitleKey: '标题',
    calloutAuthor: true,       calloutAuthorKey: '作者',
    calloutCategory: true,     calloutCategoryKey: '类别',
    calloutTags: true,
    calloutSaveTime: true,     calloutSaveTimeKey: '保存时间',
    calloutPlatform: true,     calloutPlatformKey: '平台',
    calloutCommentCount: true, calloutCommentCountKey: '评论数',
    // 元数据字段独立勾选 + 自定义字段名（仅影响 Obsidian/语雀/思源 frontmatter，飞书/Notion 字段不受影响）
    metaSource: true,       metaSourceKey: '来源',
    metaTitle: true,        metaTitleKey: '标题',
    metaAuthor: true,       metaAuthorKey: '作者',
    metaAuthorUrl: true,
    metaCategory: true,     metaCategoryKey: '类别',
    metaTags: true,                              // key 固定为 tags（Obsidian 标准字段）
    metaSaveTime: true,     metaSaveTimeKey: '保存时间',
    metaPlatform: true,     metaPlatformKey: '平台',
    metaReadStatus: true,   metaReadStatusKey: '阅读状态',
    metaOrganize: true,     metaOrganizeKey: '整理',
    metaCommentCount: true, metaCommentCountKey: '评论数',
    includeImages: true,
    saveComments: false,
    commentCount: 100,
    saveAllComments: false,  // V4.0.6: 保存全部评论
    foldComments: false,  // V3.2: 默认不折叠，使用普通Markdown格式
    renderReactions: false,  // V1.1.2: 渲染 Reactions（打call/Boosts）为评论
    // V4.3.7: 楼层范围设置
    useFloorRange: false,
    floorFrom: 1,
    floorTo: 100,
    useAdvancedUri: true, // V3.4: 默认使用 Advanced URI 插件

    // V3.6.0: 图片嵌入设置
    embedImages: false,
    imageMaxWidth: 1920,
    imageQuality: 0.9,
    imageSkipGif: true,

    // V3.5: 飞书设置
    saveToObsidian: true,
    saveToFeishu: false,
    feishuApiDomain: 'feishu', // 'feishu' 或 'lark'
    feishuAppId: '',
    feishuAppSecret: '',
    feishuAppToken: '',
    feishuTableId: '',
    feishuUploadContent: true,
    feishuUploadContentAsCloudDoc: false,
    feishuUploadAttachment: false,

    // V4.0.1: Notion 设置
    // V4.0.2: 默认属性名改为中文
    // V4.2.3: 保持空值，使用时根据语言动态获取（在 saveToObsidian 函数中处理）
    saveToNotion: false,
    notionToken: '',
    notionDatabaseId: '',
    notionPropTitle: '',
    notionPropUrl: '',
    notionPropAuthor: '',
    notionPropCategory: '',
    notionPropTags: '',          // V4.3.7: 标签属性
    notionPropSavedDate: '',
    notionPropCommentCount: '',

    // V4.2.6: HTML 导出设置
    exportHtml: false,
    feishuUploadHtml: false,
    htmlExportFolder: 'Discourse导出',  // V4.3.6: HTML 导出文件夹

    // V1.1.2: MD 文件下载
    exportMd: false,
    mdExportFolder: 'Discourse导出',

    // 下载图片/视频/附件到Vault
    downloadImages: false,
    downloadVideos: true,
    downloadAttachments: true,  // V1.1.2: 下载附件文件（PDF/DOCX等）
    restApiKey: '',
    restApiPort: 27123,
    mediaFolderName: 'media',
    mediaFolderPerTitle: false,

    // 语雀设置
    saveToYuque: false,
    yuqueToken: '',
    yuqueRepoNamespace: '',
    yuqueDocPublic: 0,

    // 思源笔记设置
    saveToSiyuan: false,
    siyuanApiUrl: 'http://127.0.0.1:6806',
    siyuanToken: '',
    siyuanNotebook: '',
    siyuanSavePath: '/Discourse收集箱',

    // WebDAV 设置
    saveToWebDAV: false,
    webdavUrl: '',
    webdavUsername: '',
    webdavPassword: '',
    webdavPath: '/Discourse收集箱',
    webdavAutoFolder: false,

    // 百度网盘设置
    saveToBaidu: false,
    baiduAppFolder: '/apps/ob-sync',
    baiduVaultFolder: 'Discourse收集箱',
    baiduAutoFolder: false
  };

  // V4.2.3: Notion 属性的语言相关默认值
  const NOTION_PROP_DEFAULTS = {
    zh: {
      notionPropTitle: '标题',
      notionPropUrl: '链接',
      notionPropAuthor: '作者',
      notionPropCategory: '分类',
      notionPropTags: '标签',
      notionPropSavedDate: '保存日期',
      notionPropCommentCount: '评论数'
    },
    en: {
      notionPropTitle: 'Title',
      notionPropUrl: 'Link',
      notionPropAuthor: 'Author',
      notionPropCategory: 'Category',
      notionPropTags: 'Tags',
      notionPropSavedDate: 'Save Date',
      notionPropCommentCount: 'Comments'
    }
  };

  // 获取当前语言的 Notion 默认属性值
  function getNotionPropDefault(propName, lang) {
    const defaults = NOTION_PROP_DEFAULTS[lang] || NOTION_PROP_DEFAULTS.zh;
    return defaults[propName] || '';
  }

  // V4.2.2: Promise 包装 chrome.runtime.sendMessage（感谢 @Gannyn 提供并行保存方案）
  // 用于并行执行飞书和 Notion 保存操作
  function sendMessageAsync(message) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response || { success: false, error: '未收到响应' });
          }
        });
      } catch (err) {
        // 扩展上下文失效时 sendMessage 会抛出同步异常
        resolve({ success: false, error: '扩展上下文已失效: ' + err.message });
      }
    });
  }

  function asBool(v, defaultValue = false) {
    if (v === true || v === false) return v;
    if (v === 1 || v === '1') return true;
    if (v === 0 || v === '0') return false;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s === 'true') return true;
      if (s === 'false') return false;
    }
    return defaultValue;
  }

  // 发送运行日志到 background（静默失败，不影响主流程）
  function rlog(level, message) {
    try {
      chrome.runtime.sendMessage({ action: 'log', level, source: 'content', message });
    } catch (_) { /* 扩展上下文失效时忽略 */ }
  }

  // 安全获取 className（SVG 元素的 className 是 SVGAnimatedString 对象，不是字符串）
  function safeClassName(el) {
    if (!el) return '';
    if (typeof el.className === 'string') return el.className;
    return el.getAttribute('class') || '';
  }

  // 检查是否在帖子页面（多种选择器降级匹配不同版本 Discourse）
  function isTopicPage() {
    const selectors = [
      '#topic-title h1',           // 标准 Discourse
      '#topic-title',              // 无 h1 的变体
      '.topic-header',             // 某些主题
      '.fancy-title',              // LinuxDo 等
      'h1[data-topic-id]',         // 带 topic-id 属性的 h1
      '.topic-body',               // 帖子正文区域
      '.post-stream',              // 帖子流
    ];
    for (const sel of selectors) {
      if (document.querySelector(sel)) return true;
    }
    // 兜底：URL 匹配 /t/ 模式（Discourse 标准帖子 URL）
    if (/\/t\/[^/]+\/\d+/.test(location.pathname)) return true;
    return false;
  }

  // V5.4.0: 悬浮保存按钮（替代链接拦截）
  // V5.4.1: 长按弹出操作菜单，支持指定楼层保存
  let floatingBtnAdded = false;

  // V1.1.2: 获取当前论坛友好名称（用于长按菜单内显示）
  function getForumName() {
    const host = window.location.hostname.toLowerCase();
    let forumName = host.replace(/^www\./, '');

    const forumNameMap = {
      'linux.do': 'Linux.do',
      'meta.discourse.org': 'Meta Discourse',
      'community.openai.com': 'OpenAI Community',
      'forum.obsidian.md': 'Obsidian Forum',
      'forum.cursor.com': 'Cursor Forum',
      'community.cloudflare.com': 'Cloudflare',
      'forums.docker.com': 'Docker Forums',
      'discuss.python.org': 'Python Discourse',
      'forum.gitlab.com': 'GitLab Forum',
      'discuss.hashicorp.com': 'HashiCorp',
      'discuss.elastic.co': 'Elastic',
      'community.home-assistant.io': 'Home Assistant',
      'community.bitwarden.com': 'Bitwarden',
      'forum.proxmox.com': 'Proxmox',
      'forum.unity.com': 'Unity',
      'forums.unrealengine.com': 'Unreal Engine',
      'users.rust-lang.org': 'Rust Users',
      'discourse.mozilla.org': 'Mozilla',
      'forums.swift.org': 'Swift Forums',
      'elixirforum.com': 'Elixir Forum',
      'trae.ai': 'Trae',
      'trae.com.cn': 'Trae'
    };

    if (forumNameMap[host]) {
      forumName = forumNameMap[host];
    } else if (forumName.includes('.')) {
      const parts = forumName.split('.');
      if (parts.length >= 2) {
        forumName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
      }
    }
    return forumName;
  }

  function createFloatingButton() {
    if (floatingBtnAdded) return;
    if (document.getElementById('ds-fab')) return;
    floatingBtnAdded = true;

    const btn = document.createElement('div');
    btn.id = 'ds-fab';
    btn.title = '点击保存整帖 | 长按更多操作';
    btn.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
      </svg>`;

    const style = document.createElement('style');
    style.textContent = `
      #ds-fab {
        position: fixed;
        top: 60px;
        right: 20px;
        z-index: 2147483647;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #4a90d9;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        user-select: none;
        -webkit-user-select: none;
        opacity: 0.85;
      }
      #ds-fab:hover {
        opacity: 1;
        transform: scale(1.1);
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
      }
      #ds-fab:active { cursor: grabbing; }
      #ds-fab.ds-fab-saving {
        background: #f0ad4e;
        animation: ds-fab-pulse 0.8s infinite;
      }
      #ds-fab.ds-fab-longpress {
        background: #5cb85c;
        transform: scale(1.2);
      }
      @keyframes ds-fab-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
      }
      #ds-fab-menu {
        position: fixed;
        z-index: 2147483647;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.25);
        padding: 12px;
        min-width: 200px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        color: #333;
      }
      #ds-fab-menu .ds-menu-title {
        font-weight: 600;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
        color: #4a90d9;
        font-size: 13px;
      }
      #ds-fab-menu .ds-menu-subtitle {
        font-size: 11px;
        color: #999;
        padding: 4px 10px 2px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        cursor: pointer;
        user-select: none;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      #ds-fab-menu .ds-menu-subtitle:hover {
        color: #666;
      }
      #ds-fab-menu .ds-menu-subtitle .ds-collapse-icon {
        transition: transform 0.2s;
        font-size: 10px;
      }
      #ds-fab-menu .ds-menu-subtitle.collapsed .ds-collapse-icon {
        transform: rotate(-90deg);
      }
      #ds-fab-menu .ds-collapse-section {
        overflow: hidden;
        transition: max-height 0.25s ease;
      }
      #ds-fab-menu .ds-collapse-section.collapsed {
        max-height: 0 !important;
      }
      #ds-fab-menu .ds-menu-item {
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: background 0.15s;
      }
      #ds-fab-menu .ds-menu-item:hover {
        background: #f0f4f8;
      }
      #ds-fab-menu .ds-menu-item svg {
        flex-shrink: 0;
        width: 16px;
        height: 16px;
      }
      #ds-fab-menu .ds-menu-divider {
        height: 1px;
        background: #eee;
        margin: 6px 0;
      }
      #ds-fab-menu .ds-floor-input {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
      }
      #ds-fab-menu .ds-floor-input input {
        width: 60px;
        padding: 4px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 14px;
        text-align: center;
        outline: none;
      }
      #ds-fab-menu .ds-floor-input input:focus {
        border-color: #4a90d9;
        box-shadow: 0 0 0 2px rgba(74,144,217,0.2);
      }
      #ds-fab-menu .ds-floor-btn {
        padding: 4px 12px;
        background: #4a90d9;
        color: #fff;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
      }
      #ds-fab-menu .ds-floor-btn:hover { background: #357abd; }
      #ds-fab-menu .ds-menu-toggle {
        display: flex; align-items: center; justify-content: space-between;
        padding: 6px 12px; font-size: 13px; color: var(--ds-text, #333);
      }
      #ds-fab-menu .ds-toggle-switch {
        position: relative; display: inline-block; width: 34px; height: 18px; flex-shrink: 0;
      }
      #ds-fab-menu .ds-toggle-switch input { opacity: 0; width: 0; height: 0; }
      #ds-fab-menu .ds-toggle-slider {
        position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
        background: #ccc; border-radius: 18px; transition: .2s;
      }
      #ds-fab-menu .ds-toggle-slider:before {
        position: absolute; content: ""; height: 12px; width: 12px;
        left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .2s;
      }
      #ds-fab-menu .ds-toggle-switch input:checked + .ds-toggle-slider { background: #4a90e2; }
      #ds-fab-menu .ds-toggle-switch input:checked + .ds-toggle-slider:before { transform: translateX(16px); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(btn);

    // 拖拽 + 长按逻辑
    let isDragging = false;
    let dragStartX, dragStartY, btnStartX, btnStartY;
    let hasMoved = false;
    let longPressTimer = null;
    let isLongPress = false;

    function clearLongPress() {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      btn.classList.remove('ds-fab-longpress');
    }

    btn.addEventListener('mousedown', (e) => {
      isDragging = true;
      hasMoved = false;
      isLongPress = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      const rect = btn.getBoundingClientRect();
      btnStartX = rect.left;
      btnStartY = rect.top;
      btn.style.cursor = 'grabbing';
      btn.style.transition = 'none';
      e.preventDefault();

      // 长按计时（800ms）
      longPressTimer = setTimeout(() => {
        if (!hasMoved) {
          isLongPress = true;
          btn.classList.add('ds-fab-longpress');
          showFabMenu(btn);
        }
      }, 800);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
        clearLongPress();
      }
      let newX = btnStartX + dx;
      let newY = btnStartY + dy;
      const maxX = window.innerWidth - 50;
      const maxY = window.innerHeight - 50;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      btn.style.left = newX + 'px';
      btn.style.top = newY + 'px';
      btn.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      clearLongPress();
      btn.style.cursor = 'grab';
      btn.style.transition = 'background 0.2s, transform 0.15s, box-shadow 0.2s';
    });

    // 点击保存（非拖拽、非长按时）
    btn.addEventListener('click', (e) => {
      if (hasMoved || isLongPress) return;
      e.stopPropagation();
      console.log('[Discourse Saver] 悬浮按钮点击，保存整帖');
      rlog('INFO', '悬浮按钮触发保存');
      btn.classList.add('ds-fab-saving');
      saveToObsidian(null).finally(() => {
        btn.classList.remove('ds-fab-saving');
      });
    });

    // 触屏拖拽 + 长按支持
    btn.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      isDragging = true;
      hasMoved = false;
      isLongPress = false;
      dragStartX = t.clientX;
      dragStartY = t.clientY;
      const rect = btn.getBoundingClientRect();
      btnStartX = rect.left;
      btnStartY = rect.top;
      btn.style.transition = 'none';

      longPressTimer = setTimeout(() => {
        if (!hasMoved) {
          isLongPress = true;
          btn.classList.add('ds-fab-longpress');
          showFabMenu(btn);
        }
      }, 800);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const t = e.touches[0];
      const dx = t.clientX - dragStartX;
      const dy = t.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
        clearLongPress();
      }
      let newX = btnStartX + dx;
      let newY = btnStartY + dy;
      newX = Math.max(0, Math.min(newX, window.innerWidth - 50));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 50));
      btn.style.left = newX + 'px';
      btn.style.top = newY + 'px';
      btn.style.right = 'auto';
    }, { passive: true });

    document.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      clearLongPress();
      btn.style.transition = 'background 0.2s, transform 0.15s, box-shadow 0.2s';
    });

    console.log('[Discourse Saver] 悬浮保存按钮已创建');
    rlog('INFO', '悬浮按钮已创建');
  }

  // V5.4.1: 悬浮按钮长按菜单
  // V1.1.2: 新增仅保存到指定目标、复制Markdown、复制纯文本、导出HTML/MD等选项
  function showFabMenu(anchorBtn) {
    // 关闭已有菜单
    closeFabMenu();

    const menu = document.createElement('div');
    menu.id = 'ds-fab-menu';

    const forumName = getForumName();

    menu.innerHTML = `
      <div class="ds-menu-title">Discourse Saver <span style="font-size:11px;font-weight:400;opacity:0.7;background:rgba(255,255,255,0.15);padding:2px 8px;border-radius:10px;margin-left:6px;">${forumName}</span></div>
      <div class="ds-menu-item" data-action="save-all">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <span>保存整个帖子</span>
      </div>
      <div class="ds-menu-divider"></div>
      <div class="ds-menu-subtitle" id="ds-collapse-targets">
        <span>仅保存到</span>
        <span class="ds-collapse-icon">▼</span>
      </div>
      <div class="ds-collapse-section" id="ds-collapse-targets-section">
      <div class="ds-menu-item" data-action="save-obsidian">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <span>仅保存到 Obsidian</span>
      </div>
      <div class="ds-menu-item" data-action="save-feishu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
        <span>仅保存到飞书</span>
      </div>
      <div class="ds-menu-item" data-action="save-baidu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span>仅保存到百度网盘</span>
      </div>
      <div class="ds-menu-item" data-action="save-notion">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>仅保存到 Notion</span>
      </div>
      <div class="ds-menu-item" data-action="save-yuque">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        <span>仅保存到语雀</span>
      </div>
      <div class="ds-menu-item" data-action="save-siyuan">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
        <span>仅保存到思源</span>
      </div>
      <div class="ds-menu-item" data-action="save-webdav">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        <span>仅保存到 WebDAV</span>
      </div>
      </div>
      <div class="ds-menu-divider"></div>
      <div class="ds-menu-item" data-action="save-html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        <span>导出 HTML 文件</span>
      </div>
      <div class="ds-menu-item" data-action="save-md">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <span>导出 MD 文件</span>
      </div>
      <div class="ds-menu-divider"></div>
      <div class="ds-menu-item" data-action="copy-md">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span>复制为 Markdown</span>
      </div>
      <div class="ds-menu-item" data-action="copy-text">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        <span>复制纯文本</span>
      </div>
      <div class="ds-menu-divider"></div>
      <div class="ds-menu-toggle">
        <span>保存评论</span>
        <label class="ds-toggle-switch">
          <input type="checkbox" id="ds-fab-save-comments">
          <span class="ds-toggle-slider"></span>
        </label>
      </div>
      <div class="ds-menu-divider"></div>
      <div class="ds-floor-input">
        <input type="text" id="ds-floor-num" placeholder="如: 5 或 2-8 或 1,3,5-7" style="width:140px" />
        <button class="ds-floor-btn" id="ds-floor-go">保存</button>
      </div>
      <div class="ds-menu-divider"></div>
      <div class="ds-menu-item" data-action="settings">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>设置</span>
      </div>
      <div id="ds-floor-hint" style="font-size:11px;color:#888;padding:0 10px 6px;"></div>
    `;

    document.body.appendChild(menu);

    // 定位菜单：在按钮左侧弹出
    const btnRect = anchorBtn.getBoundingClientRect();
    const menuWidth = 240;
    let menuLeft = btnRect.left - menuWidth - 10;
    let menuTop = btnRect.top;
    // 如果左边放不下，放右边
    if (menuLeft < 10) {
      menuLeft = btnRect.right + 10;
    }
    // 底部超出屏幕则上移
    if (menuTop + 350 > window.innerHeight) {
      menuTop = window.innerHeight - 360;
    }
    menu.style.left = menuLeft + 'px';
    menu.style.top = menuTop + 'px';

    // 折叠/展开「仅保存到」区域，状态记忆
    const collapseTitle = menu.querySelector('#ds-collapse-targets');
    const collapseSection = menu.querySelector('#ds-collapse-targets-section');
    if (collapseTitle && collapseSection) {
      // 设置初始高度
      collapseSection.style.maxHeight = collapseSection.scrollHeight + 'px';
      // 读取保存的状态
      chrome.storage.local.get({ fabMenuTargetsCollapsed: true }, (result) => {
        if (result.fabMenuTargetsCollapsed) {
          collapseSection.classList.add('collapsed');
          collapseTitle.classList.add('collapsed');
        }
      });
      collapseTitle.addEventListener('click', () => {
        const isCollapsed = collapseSection.classList.toggle('collapsed');
        collapseTitle.classList.toggle('collapsed', isCollapsed);
        if (!isCollapsed) {
          collapseSection.style.maxHeight = collapseSection.scrollHeight + 'px';
        }
        chrome.storage.local.set({ fabMenuTargetsCollapsed: isCollapsed });
      });
    }

    // 保存整帖（所有已启用目标）
    menu.querySelector('[data-action="save-all"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'all').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 仅保存到 Obsidian
    menu.querySelector('[data-action="save-obsidian"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'obsidian').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 仅保存到飞书
    menu.querySelector('[data-action="save-feishu"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'feishu').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 仅保存到百度网盘
    menu.querySelector('[data-action="save-baidu"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'baidu').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 仅保存到 Notion
    menu.querySelector('[data-action="save-notion"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'notion').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 仅保存到语雀
    menu.querySelector('[data-action="save-yuque"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'yuque').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 仅保存到思源
    menu.querySelector('[data-action="save-siyuan"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'siyuan').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 仅保存到 WebDAV
    menu.querySelector('[data-action="save-webdav"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'webdav').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 设置按钮
    menu.querySelector('[data-action="settings"]').addEventListener('click', () => {
      closeFabMenu();
      chrome.runtime.sendMessage({ action: 'openOptionsPage' });
    });

    // 导出 HTML
    menu.querySelector('[data-action="save-html"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'html').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 导出 MD
    menu.querySelector('[data-action="save-md"]').addEventListener('click', () => {
      closeFabMenu();
      anchorBtn.classList.add('ds-fab-saving');
      saveToObsidian(null, 'md').finally(() => {
        anchorBtn.classList.remove('ds-fab-saving');
      });
    });

    // 复制为 Markdown
    menu.querySelector('[data-action="copy-md"]').addEventListener('click', async () => {
      closeFabMenu();
      try {
        showNotification('正在提取内容...', 'info');
        const topicIdFromUrl = window.location.pathname.match(/\/t\/[^/]+\/(\d+)/)?.[1] || null;
        let extracted = null;
        if (topicIdFromUrl) {
          extracted = await extractContentViaAPI(topicIdFromUrl);
        }
        if (!extracted) {
          extracted = extractContent();
        }
        if (extracted) {
          const config = await chrome.storage.sync.get(DEFAULT_CONFIG);
          const langResult = await chrome.storage.local.get(['uiLanguage']);
          const uiLang = langResult.uiLanguage || 'zh';
          let rawMainContent = extracted.rawMarkdown || null;
          let apiCookedHtml = extracted.contentHTML;
          const markdown = convertToMarkdownWithComments(
            extracted.contentHTML,
            { title: extracted.title, url: extracted.url, author: extracted.author, authorUrl: extracted.authorUrl || '', createdAt: extracted.createdAt || null, topicId: extracted.topicId, category: extracted.category, tags: extracted.tags },
            [],
            config,
            rawMainContent,
            apiCookedHtml,
            extracted.reactions || []
          );
          await navigator.clipboard.writeText(markdown);
          showNotification('已复制为 Markdown', 'success');
          rlog('INFO', '复制Markdown成功');
        } else {
          showNotification('无法提取内容', 'error');
        }
      } catch (e) {
        console.error('[Discourse Saver] 复制Markdown失败:', e);
        showNotification('复制失败: ' + e.message, 'error');
      }
    });

    // 复制纯文本
    menu.querySelector('[data-action="copy-text"]').addEventListener('click', async () => {
      closeFabMenu();
      try {
        showNotification('正在提取内容...', 'info');
        const contentEl = document.querySelector('.topic-body .cooked') || document.querySelector('.cooked');
        if (contentEl) {
          const text = contentEl.innerText || contentEl.textContent;
          await navigator.clipboard.writeText(text);
          showNotification('已复制纯文本', 'success');
          rlog('INFO', '复制纯文本成功');
        } else {
          showNotification('无法提取内容', 'error');
        }
      } catch (e) {
        console.error('[Discourse Saver] 复制纯文本失败:', e);
        showNotification('复制失败: ' + e.message, 'error');
      }
    });

    // 保存评论 toggle：读取当前状态并监听变更写回 storage
    const saveCommentsToggle = menu.querySelector('#ds-fab-save-comments');
    chrome.storage.sync.get({ saveComments: false }, (result) => {
      saveCommentsToggle.checked = result.saveComments;
    });
    saveCommentsToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ saveComments: saveCommentsToggle.checked });
    });

    // 楼层保存
    const floorInput = menu.querySelector('#ds-floor-num');
    const floorBtn = menu.querySelector('#ds-floor-go');
    const floorHint = menu.querySelector('#ds-floor-hint');

    // 解析楼层输入：支持 "5", "2-8", "1,3,5", "1-5,8,10-12"
    function parseFloors(str) {
      const floors = new Set();
      const parts = str.replace(/\s/g, '').split(',');
      for (const part of parts) {
        if (!part) continue;
        const rangeMatch = part.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          const from = parseInt(rangeMatch[1]);
          const to = parseInt(rangeMatch[2]);
          if (from > to || to - from > 200) return null; // 防止过大范围
          for (let i = from; i <= to; i++) floors.add(i);
        } else if (/^\d+$/.test(part)) {
          floors.add(parseInt(part));
        } else {
          return null; // 格式错误
        }
      }
      return floors.size > 0 ? Array.from(floors).sort((a, b) => a - b) : null;
    }

    // 实时提示解析结果
    floorInput.addEventListener('input', () => {
      const raw = floorInput.value.trim();
      if (!raw) { floorHint.textContent = ''; return; }
      const floors = parseFloors(raw);
      if (!floors) {
        floorHint.textContent = '格式错误';
        floorHint.style.color = '#d9534f';
      } else {
        floorHint.textContent = `共 ${floors.length} 楼: ${floors.slice(0, 8).join(', ')}${floors.length > 8 ? '...' : ''}`;
        floorHint.style.color = '#5cb85c';
      }
    });

    function doFloorSave() {
      const raw = floorInput.value.trim();
      if (!raw) {
        floorInput.style.borderColor = '#d9534f';
        floorInput.focus();
        return;
      }
      const floors = parseFloors(raw);
      if (!floors) {
        floorInput.style.borderColor = '#d9534f';
        floorHint.textContent = '格式错误，请输入如: 5 或 2-8 或 1,3,5-7';
        floorHint.style.color = '#d9534f';
        return;
      }
      closeFabMenu();
      console.log('[Discourse Saver] 菜单楼层保存:', floors);
      rlog('INFO', '菜单楼层保存: ' + floors.join(','));
      anchorBtn.classList.add('ds-fab-saving');

      // V5.4.2: 多楼层合并为一个文件保存
      if (floors.length === 1) {
        // 单楼：按原逻辑
        const postNum = floors[0] === 1 ? null : String(floors[0]);
        saveToObsidian(postNum).finally(() => {
          anchorBtn.classList.remove('ds-fab-saving');
        });
      } else {
        // 多楼：传数组，合并为一个文件
        saveToObsidian(floors).finally(() => {
          anchorBtn.classList.remove('ds-fab-saving');
        });
      }
    }

    floorBtn.addEventListener('click', doFloorSave);
    floorInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doFloorSave();
      if (e.key === 'Escape') closeFabMenu();
    });

    // 点击菜单外部关闭
    setTimeout(() => {
      document.addEventListener('click', closeFabMenuOnOutsideClick);
    }, 100);

    // 自动聚焦输入框
    setTimeout(() => floorInput.focus(), 50);
  }

  function closeFabMenuOnOutsideClick(e) {
    const menu = document.getElementById('ds-fab-menu');
    const fab = document.getElementById('ds-fab');
    if (menu && !menu.contains(e.target) && !fab.contains(e.target)) {
      closeFabMenu();
    }
  }

  function closeFabMenu() {
    const menu = document.getElementById('ds-fab-menu');
    if (menu) menu.remove();
    document.removeEventListener('click', closeFabMenuOnOutsideClick);
  }

  // V5.4.0: 移除悬浮按钮（离开帖子页面时）
  function removeFloatingButton() {
    closeFabMenu();
    const btn = document.getElementById('ds-fab');
    if (btn) {
      btn.remove();
      floatingBtnAdded = false;
      console.log('[Discourse Saver] 悬浮按钮已移除（非帖子页面）');
    }
  }

  // V5.4.2: 将楼层数组格式化为简洁描述（用于文件名）
  // [2,3,4,5] → "2至5楼"
  // [2,3,5,8] → "2-3,5,8楼"
  // [5] → "5楼"
  function formatFloorRange(floors) {
    if (floors.length === 0) return '';
    if (floors.length === 1) return floors[0] + '楼';
    const sorted = [...floors].sort((a, b) => a - b);
    // 如果是完全连续的
    if (sorted[sorted.length - 1] - sorted[0] === sorted.length - 1) {
      return `${sorted[0]}至${sorted[sorted.length - 1]}楼`;
    }
    // 分段压缩：连续的用-，不连续的用逗号
    const parts = [];
    let start = sorted[0], prev = sorted[0];
    for (let i = 1; i <= sorted.length; i++) {
      if (i < sorted.length && sorted[i] === prev + 1) {
        prev = sorted[i];
      } else {
        parts.push(start === prev ? String(start) : `${start}-${prev}`);
        if (i < sorted.length) { start = sorted[i]; prev = sorted[i]; }
      }
    }
    // 文件名太长时截断
    let desc = parts.join(',');
    if (desc.length > 30) desc = desc.substring(0, 27) + '...';
    return desc + '楼';
  }

  // V5.5.7: 通过 API 提取主帖内容（不依赖 DOM，任意滚动位置均可保存）
  // V1.1.2: 新增 Reactions 提取（打call/Boosts）
  // 与评论的 extractCommentsViaAPI 逻辑对称，返回与 extractContent() 相同的字段结构
  async function extractContentViaAPI(topicId) {
    if (!topicId) return null;
    try {
      const res = await fetch(`${window.location.origin}/t/${topicId}.json`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (!res.ok) {
        console.warn('[Discourse Saver] extractContentViaAPI: /t/' + topicId + '.json 返回', res.status);
        return null;
      }
      const data = await res.json();
      const firstPost = data.post_stream?.posts?.[0];
      if (!firstPost) return null;

      const title = data.title || '';
      const contentHTML = firstPost.cooked || '';
      const rawMarkdown = firstPost.raw || null;
      const author = firstPost.display_username || firstPost.username || '未知作者';
      const url = window.location.href;

      // 分类：优先用 category_slug → 再用 category_id 反查或 DOM 补充
      let category = '';
      if (data.category_id) {
        const catEl = document.querySelector('.badge-category__name, .category-name');
        if (catEl) category = catEl.textContent.trim();
      }

      // 标签：优先用 API 返回值，若为空则从 DOM 提取（linux.do 等实例 API 可能不返回 tags）
      let tags = Array.isArray(data.tags) ? data.tags.filter(t => typeof t === 'string' && t.trim()) : [];
      if (tags.length === 0) {
        const tagEls = document.querySelectorAll('.discourse-tags .discourse-tag, .list-tags .discourse-tag, a.discourse-tag');
        tagEls.forEach(el => {
          const text = el.textContent.trim();
          if (text && !tags.includes(text)) tags.push(text);
        });
        if (tags.length > 0) console.log('[Discourse Saver] tags 从 DOM 补充:', tags);
      }

      // 作者主页 URL
      const authorUsername = firstPost.username || '';
      const authorUrl = authorUsername ? `${window.location.origin}/u/${authorUsername}` : '';
      // 发帖时间（北京时间用 toBeijingTimeStr 在 frontmatter 生成时转换）
      const createdAt = firstPost.created_at || data.created_at || null;

      // V1.1.2: 构建用户ID→用户名映射（用于 Reactions 渲染）
      const userIdMap = {};
      if (Array.isArray(data.users)) {
        for (const u of data.users) {
          if (u.id && u.username) userIdMap[u.id] = u.username;
        }
      }
      // 补充第一帖作者
      if (firstPost.username && !userIdMap[firstPost.user_id]) {
        userIdMap[firstPost.user_id] = firstPost.username;
      }

      // V1.1.2: 获取主帖 Reactions
      let reactions = [];
      const config = await chrome.storage.sync.get({ renderReactions: false });
      if (config.renderReactions && firstPost.reactions && firstPost.reactions.length > 0) {
        reactions = await fetchPostReactions(firstPost.id, userIdMap);
      }

      console.log('[Discourse Saver] API 提取主帖成功:', title, '作者:', author, 'raw长度:', rawMarkdown?.length);
      return { title, contentHTML, rawMarkdown, url, author, authorUrl, createdAt, topicId, category, tags, reactions };
    } catch (e) {
      console.warn('[Discourse Saver] extractContentViaAPI 失败:', e);
      return null;
    }
  }

  // V1.1.2: 获取帖子的 Reactions 详情（含用户名）
  async function fetchPostReactions(postId, userIdMap = {}) {
    try {
      const res = await fetch(`${window.location.origin}/post_reactions.json?post_id=${postId}`, {
        credentials: 'include',
        cache: 'no-store'
      });
      if (!res.ok) return [];
      const data = await res.json();

      // Discourse Reactions 插件返回格式：{ reactions: [{ reaction_type, count, users: [{ id, username, ... }] }] }
      // 或简化格式：{ reactions: [{ reaction_type, count, user_ids: [...] }] }
      const reactionsList = Array.isArray(data) ? data : (data.reactions || []);
      const reactions = [];

      for (const r of reactionsList) {
        const reactionType = r.reaction_type || r.value || '';
        const count = r.count || 0;
        let users = [];

        if (Array.isArray(r.users)) {
          users = r.users.map(u => u.username || userIdMap[u.id] || `user${u.id}`).filter(Boolean);
        } else if (Array.isArray(r.user_ids)) {
          users = r.user_ids.map(id => userIdMap[id] || `user${id}`).filter(Boolean);
        }

        if (reactionType && count > 0) {
          reactions.push({ type: reactionType, count, users });
        }
      }

      return reactions;
    } catch (e) {
      console.warn('[Discourse Saver] 获取 Reactions 失败:', e);
      return [];
    }
  }

  // V1.1.2: 渲染 Reactions 为 Markdown 评论样式
  function renderReactionsToMarkdown(reactions, forumOrigin = '') {
    if (!reactions || reactions.length === 0) return '';

    // Linux.do Reactions 类型 → emoji 映射
    const REACTION_EMOJI = {
      'call': '',
      'boost': '',
      'heart': '❤️',
      'thumbs_up': '👍',
      'clap': '👏',
      'smile': '😊',
      'thinking': '🤔',
      'fire': '🔥',
      '100': '💯',
      'party': '🎉',
      'pray': '🙏',
      'laugh': '😂',
      'cry': '😢',
      'angry': '😡',
      'star': '⭐',
      'eyes': '',
      'muscle': '💪',
      'coffee': '',
      'rocket': '',
      'tada': '',
      'bulb': '💡',
      'warning': '⚠️',
      'question': '',
      'exclamation': '❗',
      'white_check_mark': '✅',
      'x': '',
      'heavy_plus_sign': '',
      'heavy_minus_sign': '➖',
      'arrow_up': '️',
      'arrow_down': '⬇️',
    };

    let markdown = '\n\n---\n\n';
    markdown += '## 反应（Reactions）\n\n';

    for (const reaction of reactions) {
      const emoji = REACTION_EMOJI[reaction.type] || reaction.type || '❓';
      // 渲染用户列表为可点击链接（Obsidian 支持外链点击）
      let userList;
      if (reaction.users && reaction.users.length > 0) {
        const userLinks = reaction.users.map(u => {
          const username = typeof u === 'string' ? u : (u.username || `user${u.id}`);
          const userUrl = forumOrigin ? `${forumOrigin}/u/${username}` : `https://linux.do/u/${username}`;
          return `[@${username}](${userUrl})`;
        });
        userList = userLinks.join('、');
      } else {
        userList = `${reaction.count}人`;
      }

      markdown += `- **${emoji} ${reaction.count}** ${userList}\n`;
    }

    return markdown;
  }

  // 自动识别平台名称（基于 hostname）
  function detectPlatform() {
    const hostname = window.location.hostname.toLowerCase();
    const platformMap = {
      'linux.do': 'LINUX DO',
      'meta.discourse.org': 'Discourse Meta',
      'discuss.python.org': 'Python',
      'community.cloudflare.com': 'Cloudflare Community',
      'discourse.mozilla.org': 'Mozilla',
      'forums.swift.org': 'Swift Forums',
      'community.openai.com': 'OpenAI Community',
    };
    if (platformMap[hostname]) return platformMap[hostname];
    // 自定义站点：尝试从域名推断
    return hostname.replace(/^www\./, '').split('.').slice(0, -1).join('.').toUpperCase() || hostname.toUpperCase();
  }

  // 提取帖子内容（DOM 方式，作为 API 的 fallback）
  function extractContent() {
    // 多选择器兼容不同 Discourse 主题和版本
    const titleElement = document.querySelector('#topic-title h1') ||
      document.querySelector('.topic-title h1') ||
      document.querySelector('.fancy-title') ||
      document.querySelector('h1[data-topic-id]') ||
      document.querySelector('.header-title h1');
    const contentElement = document.querySelector('.topic-body .cooked') ||
      document.querySelector('.post-body .cooked') ||
      document.querySelector('.topic-post:first-of-type .cooked') ||
      document.querySelector('.cooked');
    const authorElement = document.querySelector('.topic-meta-data .creator a, .names .first a') ||
      document.querySelector('.topic-post:first-of-type .username a') ||
      document.querySelector('.topic-meta-data a.username');

    if (!titleElement || !contentElement) {
      console.warn('[Discourse Saver] extractContent 失败: title=', !!titleElement, 'content=', !!contentElement);
      return null;
    }

    const title = titleElement.textContent.trim();
    const contentHTML = contentElement.innerHTML;
    const url = window.location.href;
    const author = authorElement ? authorElement.textContent.trim() : '未知作者';
    const topicId = window.location.pathname.match(/\/t\/[^/]+\/(\d+)/)?.[1] || null;

    // V5.3.2: 提取分类信息（兼容多种Discourse版本DOM结构）
    let category = '';
    const categorySelectors = [
      '.topic-category .badge-category__name',
      '.badge-category-bg .badge-category__name',
      '.topic-header-extra .badge-category .category-name',
      '.title-wrapper .badge-category .category-name',
      '.topic-category .category-name',
      '#topic-title .badge-category__wrapper .badge-category__name',
      '.topic-meta-data .badge-category__name',
      '.badge-category__name',
      '.category-name'
    ];
    for (const sel of categorySelectors) {
      const el = document.querySelector(sel);
      if (el) {
        const text = el.textContent.trim();
        if (text && text !== '分类' && text !== 'category') {
          category = text;
          break;
        }
      }
    }

    // V5.3.2: 提取标签信息（兼容多种Discourse版本DOM结构）
    const tags = [];
    const tagSelectors = [
      '.discourse-tags .discourse-tag',
      '.list-tags .discourse-tag',
      '.topic-header-extra .discourse-tag',
      '#topic-title .discourse-tag',
      '.title-wrapper .discourse-tag',
      '.topic-meta-data .discourse-tag',
      'a.discourse-tag',
      '.tag-list .tag-badge-wrapper a'
    ];
    for (const sel of tagSelectors) {
      const elements = document.querySelectorAll(sel);
      if (elements.length > 0) {
        elements.forEach(tag => {
          const tagText = tag.textContent.trim();
          if (tagText && !tags.includes(tagText)) {
            tags.push(tagText);
          }
        });
        break;
      }
    }

    // V1.1.2: DOM 回退也返回完整字段，保持与 API 提取一致
    const authorUsername = authorElement ? (authorElement.getAttribute('href') || '').match(/\/u\/([^/]+)/)?.[1] || '' : '';
    const domAuthorUrl = authorUsername ? `${window.location.origin}/u/${authorUsername}` : '';
    return { title, contentHTML, url, author, authorUrl: domAuthorUrl, createdAt: null, topicId, category, tags, reactions: [] };
  }

  // V3: 提取评论
  function extractComments(maxCount = 100) {
    const comments = [];

    // 方法1: 尝试 crawler-post 选择器
    let commentElements = document.querySelectorAll('div.crawler-post');

    // 如果找不到，尝试备用选择器
    if (commentElements.length === 0) {
      commentElements = document.querySelectorAll('.topic-post');
    }

    // 跳过第一个（主帖），获取评论
    const commentNodes = Array.from(commentElements).slice(1, maxCount + 1);
    const baseUrl = window.location.origin;

    for (const el of commentNodes) {
      // 提取用户名（多种选择器兼容）
      const usernameEl = el.querySelector('.creator span[itemprop="name"]') ||
                         el.querySelector('.names .first a') ||
                         el.querySelector('.username a');
      const username = usernameEl ? usernameEl.textContent.trim() : '匿名用户';

      // V4.3.8: 提取用户主页链接
      let userUrl = '';
      const userLinkEl = el.querySelector('.creator a[href*="/u/"]') ||
                         el.querySelector('.names .first a[href*="/u/"]') ||
                         el.querySelector('.username a[href*="/u/"]') ||
                         el.querySelector('a[data-user-card]');
      if (userLinkEl) {
        userUrl = userLinkEl.href;
      } else if (username && username !== '匿名用户') {
        userUrl = `${baseUrl}/u/${username}`;
      }

      // 提取评论内容
      const contentEl = el.querySelector('.post[itemprop="text"]') ||
                        el.querySelector('.cooked');
      const contentHTML = contentEl ? contentEl.innerHTML : '';

      // 提取楼层号
      const positionEl = el.querySelector('span[itemprop="position"]') ||
                         el.querySelector('.post-number');
      const position = positionEl ? positionEl.textContent.trim() : (comments.length + 1).toString();

      // 提取时间
      const timeEl = el.querySelector('time.post-time') ||
                     el.querySelector('.relative-date');
      const time = timeEl ? (timeEl.getAttribute('datetime') || timeEl.textContent) : '';

      // 提取点赞数
      const likesEl = el.querySelector('meta[itemprop="userInteractionCount"]') ||
                      el.querySelector('.post-likes');
      const likes = likesEl ?
                    (likesEl.getAttribute('content') || likesEl.textContent.replace(/[^\d]/g, '')) : '0';

      if (contentHTML) {
        comments.push({
          username,
          userUrl,
          contentHTML,
          position,
          time,
          likes
        });
      }
    }

    console.log(`[Discourse Saver] 提取到 ${comments.length} 条评论`);
    return comments;
  }

  // V4.0.6: 使用 Discourse API 获取评论（解决懒加载问题）
  async function extractCommentsViaAPI(topicId, maxCount, saveAll = false, progressCallback = null) {
    const comments = [];
    const baseUrl = window.location.origin;

    try {
      // 1. 获取帖子信息和所有评论ID
      if (progressCallback) progressCallback('正在获取帖子信息...');
      const topicUrl = `${baseUrl}/t/${topicId}.json`;
      const topicResponse = await fetch(topicUrl, { credentials: 'include', cache: 'no-store' });

      if (!topicResponse.ok) {
        throw new Error(`获取帖子信息失败: ${topicResponse.status}`);
      }

      const topicData = await topicResponse.json();
      const stream = topicData.post_stream?.stream || [];
      const totalPosts = stream.length;

      if (totalPosts === 0) {
        console.log('[Discourse Saver] 没有找到评论');
        return comments;
      }

      // 跳过主帖（第一个），获取评论ID列表
      const commentIds = stream.slice(1);
      const targetCount = saveAll ? commentIds.length : Math.min(maxCount, commentIds.length);
      const idsToFetch = commentIds.slice(0, targetCount);

      console.log(`[Discourse Saver] 总评论数: ${commentIds.length}, 目标获取: ${targetCount}`);

      // 显示警告（超过500条）
      if (targetCount > 500 && progressCallback) {
        progressCallback(`评论较多(${targetCount}条)，请耐心等待...`);
        await new Promise(r => setTimeout(r, 1000)); // 让用户看到警告
      }

      // 2. 分批获取评论内容（每批20个）
      const batchSize = 20;
      for (let i = 0; i < idsToFetch.length; i += batchSize) {
        const batch = idsToFetch.slice(i, i + batchSize);
        const params = batch.map(id => `post_ids[]=${id}`).join('&');
        const postsUrl = `${baseUrl}/t/${topicId}/posts.json?${params}`;

        if (progressCallback) {
          const progress = Math.min(i + batchSize, idsToFetch.length);
          progressCallback(`正在加载评论 ${progress}/${targetCount}...`);
        }

        const postsResponse = await fetch(postsUrl, { credentials: 'include', cache: 'no-store' });
        if (!postsResponse.ok) {
          console.warn(`[Discourse Saver] 批次请求失败: ${postsResponse.status}`);
          continue;
        }

        const postsData = await postsResponse.json();
        const posts = postsData.post_stream?.posts || [];

        for (const post of posts) {
          if (post.post_number === 1) continue; // 跳过主帖

          // V4.3.8: 构建用户主页链接
          const postUsername = post.username || post.display_username || '匿名用户';
          const userUrl = postUsername !== '匿名用户' ? `${baseUrl}/u/${postUsername}` : '';

          comments.push({
            username: postUsername,
            userUrl,
            contentHTML: post.cooked || '',
            rawMarkdown: post.raw || '',   // V5.5-raw: 优先使用原始 Markdown
            position: String(post.post_number),
            time: post.created_at || '',
            likes: String(post.like_count || 0)
          });
        }

        // 防止请求过快被限制
        if (i + batchSize < idsToFetch.length) {
          await new Promise(r => setTimeout(r, 100));
        }
      }

      // 按楼层号排序
      comments.sort((a, b) => parseInt(a.position) - parseInt(b.position));

      console.log(`[Discourse Saver] API获取到 ${comments.length} 条评论`);
      return comments;

    } catch (error) {
      console.error('[Discourse Saver] API获取评论失败:', error);
      throw error;
    }
  }

  // V5.5-raw: 将 cooked HTML 中的图片 URL 映射回 raw 的 upload:// token
  // V5.5.4: 修复当 cookedHtml 为空时直接返回导致 upload:// 残留的 bug
  function resolveUploadUrls(rawMarkdown, cookedHtml) {
    if (!rawMarkdown) return rawMarkdown;
    // 找出 raw 中所有 upload:// token
    const uploadTokens = rawMarkdown.match(/upload:\/\/[^\s\)\"'\]]+/g);
    if (!uploadTokens || uploadTokens.length === 0) return rawMarkdown;

    // 从 cooked HTML 提取所有 CDN URL（img src、a href、audio/source/video src）
    const imgUrls = [];
    const allUrlRegex = /(?:src|href)="(https?:\/\/[^"]+\/uploads\/[^"]+)"/g;
    let m;
    while ((m = allUrlRegex.exec(cookedHtml)) !== null) {
      if (!imgUrls.includes(m[1])) imgUrls.push(m[1]);
    }

    let resolved = rawMarkdown;
    uploadTokens.forEach((token, idx) => {
      // 取 upload:// 后的 hash（去掉扩展名）
      const tokenBody = token.replace('upload://', '');
      const hashPart = tokenBody.split('.')[0];

      // 优先：在 URL 中找到包含此 hash 的完整 URL
      const matchedUrl = imgUrls.find(u => u.includes(hashPart));
      // V5.5.3: fallback → /uploads/short-url/ 确保 upload:// 一定被替换
      const replacement = matchedUrl ||
        (idx < imgUrls.length ? imgUrls[idx] : null) ||
        window.location.origin + '/uploads/short-url/' + tokenBody;
      resolved = resolved.split(token).join(replacement);
    });

    return resolved;
  }

  // V5.5-raw: 通过 /raw/{topicId}/1 获取主帖原始 Markdown
  // V5.5-raw: 同时获取 raw Markdown 和 API cooked HTML（含折叠 details 内的图片）
  async function fetchRawMainPost(topicId) {
    if (!topicId) return { rawText: null, cookedHtml: null };
    const baseUrl = window.location.origin;
    let rawText = null;
    let cookedHtml = null;
    try {
      const [rawRes, jsonRes] = await Promise.all([
        fetch(`${baseUrl}/raw/${topicId}/1`, { credentials: 'include', cache: 'no-store' }),
        fetch(`${baseUrl}/t/${topicId}.json`, { credentials: 'include', cache: 'no-store' })
      ]);
      if (rawRes.ok) {
        rawText = await rawRes.text();
        console.log(`[Discourse Saver] 获取到原始 Markdown，长度: ${rawText.length}`);
      } else {
        console.warn(`[Discourse Saver] /raw/${topicId}/1 返回 ${rawRes.status}`);
      }
      if (jsonRes.ok) {
        const json = await jsonRes.json();
        cookedHtml = json.post_stream?.posts?.[0]?.cooked || null;
        console.log(`[Discourse Saver] 获取到 API cooked HTML，长度: ${cookedHtml ? cookedHtml.length : 0}`);
      }
    } catch (e) {
      console.warn('[Discourse Saver] fetchRawMainPost 失败，回退 Turndown:', e);
    }
    return { rawText, cookedHtml };
  }

  // V3.5.3: 提取指定楼层的单条评论
  function extractSingleComment(postNumber) {
    // 查找指定楼层的评论元素
    const commentElements = document.querySelectorAll('.topic-post, article[data-post-id]');
    const baseUrl = window.location.origin;

    for (const el of commentElements) {
      const posNum = el.getAttribute('data-post-number') ||
                     el.querySelector('[data-post-number]')?.getAttribute('data-post-number');

      if (posNum === postNumber) {
        // 提取用户名
        const usernameEl = el.querySelector('.creator span[itemprop="name"]') ||
                           el.querySelector('.names .first a') ||
                           el.querySelector('.username a');
        const username = usernameEl ? usernameEl.textContent.trim() : '匿名用户';

        // V4.3.8: 提取用户主页链接
        let userUrl = '';
        const userLinkEl = el.querySelector('.creator a[href*="/u/"]') ||
                           el.querySelector('.names .first a[href*="/u/"]') ||
                           el.querySelector('.username a[href*="/u/"]') ||
                           el.querySelector('a[data-user-card]');
        if (userLinkEl) {
          userUrl = userLinkEl.href;
        } else if (username && username !== '匿名用户') {
          userUrl = `${baseUrl}/u/${username}`;
        }

        // 提取评论内容
        const contentEl = el.querySelector('.post[itemprop="text"]') ||
                          el.querySelector('.cooked');
        const contentHTML = contentEl ? contentEl.innerHTML : '';

        // 提取时间
        const timeEl = el.querySelector('time.post-time') ||
                       el.querySelector('.relative-date');
        const time = timeEl ? (timeEl.getAttribute('datetime') || timeEl.textContent) : '';

        // 提取点赞数
        const likesEl = el.querySelector('meta[itemprop="userInteractionCount"]') ||
                        el.querySelector('.post-likes');
        const likes = likesEl ?
                      (likesEl.getAttribute('content') || likesEl.textContent.replace(/[^\d]/g, '')) : '0';

        if (contentHTML) {
          console.log(`[Discourse Saver] 提取到第${postNumber}楼评论，作者: ${username}`);
          return {
            username,
            userUrl,
            contentHTML,
            position: postNumber,
            time,
            likes
          };
        }
      }
    }

    console.log(`[Discourse Saver] 未找到第${postNumber}楼评论`);
    return null;
  }

  // 创建Turndown服务实例（复用）
  function createTurndownService() {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-'
    });

    // 规则1：保留有style属性的元素（保留颜色）
    // V4.0.2: 修复内部<br>标签不换行的问题
    turndownService.addRule('preserveStyledElements', {
      filter: (node) => {
        return (node.nodeName === 'SPAN' || node.nodeName === 'DIV' || node.nodeName === 'P') &&
               node.hasAttribute('style') &&
               node.getAttribute('style').includes('color');
      },
      replacement: (content, node) => {
        // 获取HTML并将<br>转换为换行符
        let html = node.outerHTML;
        // 将<br>、<br/>、<br />转换为换行符
        html = html.replace(/<br\s*\/?>/gi, '\n');
        return html;
      }
    });

    // 规则1.5：处理<br>标签，确保换行符被保留
    // V4.0.2: 新增，修复换行丢失问题
    turndownService.addRule('lineBreaks', {
      filter: 'br',
      replacement: () => '\n'
    });

    // 规则2：保留表格HTML
    turndownService.addRule('preserveTables', {
      filter: 'table',
      replacement: (content, node) => {
        return '\n\n' + node.outerHTML + '\n\n';
      }
    });

    // 通用视频链接解析函数 - 支持多平台
    // 返回 { embedUrl: string, isVideo: boolean, platform: string }
    function parseVideoUrl(href) {
      if (!href) return { embedUrl: '', isVideo: false, platform: '' };

      // YouTube 处理
      const youtubeMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
      if (youtubeMatch) {
        return { embedUrl: 'https://www.youtube.com/embed/' + youtubeMatch[1], isVideo: true, platform: 'youtube' };
      }

      // Bilibili 处理
      const bilibiliMatch = href.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+)/i);
      if (bilibiliMatch) {
        return { embedUrl: 'https://player.bilibili.com/player.html?bvid=' + bilibiliMatch[1] + '&autoplay=0', isVideo: true, platform: 'bilibili' };
      }

      // Vimeo 处理
      const vimeoMatch = href.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        return { embedUrl: 'https://player.vimeo.com/video/' + vimeoMatch[1], isVideo: true, platform: 'vimeo' };
      }

      // 优酷处理 - v.youku.com/v_show/id_XXXXX.html
      const youkuMatch = href.match(/youku\.com\/v_show\/id_([a-zA-Z0-9=]+)/i);
      if (youkuMatch) {
        return { embedUrl: 'https://player.youku.com/embed/' + youkuMatch[1], isVideo: true, platform: 'youku' };
      }

      // 抖音处理 - douyin.com/video/XXXXX（不支持 iframe，返回链接格式）
      const douyinMatch = href.match(/douyin\.com\/video\/(\d+)/);
      if (douyinMatch) {
        return { embedUrl: '', isVideo: true, platform: 'douyin', videoId: douyinMatch[1], originalUrl: href };
      }

      // TikTok处理 - tiktok.com/@user/video/XXXXX
      const tiktokMatch = href.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
      if (tiktokMatch) {
        return { embedUrl: 'https://www.tiktok.com/embed/v2/' + tiktokMatch[1], isVideo: true, platform: 'tiktok' };
      }

      // X/Twitter 视频处理 - twitter.com/user/status/XXXXX 或 x.com/user/status/XXXXX
      const twitterMatch = href.match(/(?:twitter\.com|x\.com)\/[^\/]+\/status\/(\d+)/);
      if (twitterMatch) {
        // Twitter/X 不支持简单 iframe，返回嵌入代码标记
        return { embedUrl: '', isVideo: true, platform: 'twitter', tweetId: twitterMatch[1], originalUrl: href };
      }

      // Facebook 视频处理 - facebook.com/watch/?v=XXXXX 或 fb.watch/XXXXX
      const fbWatchMatch = href.match(/facebook\.com\/watch\/?\?v=(\d+)/);
      if (fbWatchMatch) {
        const encodedUrl = encodeURIComponent(href);
        return { embedUrl: 'https://www.facebook.com/plugins/video.php?href=' + encodedUrl + '&show_text=false', isVideo: true, platform: 'facebook' };
      }
      const fbShortMatch = href.match(/fb\.watch\/([a-zA-Z0-9]+)/);
      if (fbShortMatch) {
        const encodedUrl = encodeURIComponent(href);
        return { embedUrl: 'https://www.facebook.com/plugins/video.php?href=' + encodedUrl + '&show_text=false', isVideo: true, platform: 'facebook' };
      }
      // Facebook 视频页面 - facebook.com/xxx/videos/XXXXX
      const fbVideoMatch = href.match(/facebook\.com\/[^\/]+\/videos\/(\d+)/);
      if (fbVideoMatch) {
        const encodedUrl = encodeURIComponent(href);
        return { embedUrl: 'https://www.facebook.com/plugins/video.php?href=' + encodedUrl + '&show_text=false', isVideo: true, platform: 'facebook' };
      }

      // 腾讯视频处理 - v.qq.com/x/page/XXXXX.html 或 v.qq.com/x/cover/XXXXX/XXXXX.html
      const qqVideoMatch = href.match(/v\.qq\.com\/x\/(?:page|cover\/[^\/]+)\/([a-zA-Z0-9]+)\.html/);
      if (qqVideoMatch) {
        return { embedUrl: 'https://v.qq.com/txp/iframe/player.html?vid=' + qqVideoMatch[1], isVideo: true, platform: 'qq' };
      }

      // 西瓜视频处理 - ixigua.com/XXXXX
      const xiguaMatch = href.match(/ixigua\.com\/(\d+)/);
      if (xiguaMatch) {
        return { embedUrl: 'https://www.ixigua.com/iframe/' + xiguaMatch[1], isVideo: true, platform: 'xigua' };
      }

      return { embedUrl: '', isVideo: false, platform: '' };
    }

    // 生成视频嵌入输出（iframe 或链接）
    function generateVideoEmbed(videoInfo, originalUrl) {
      if (videoInfo.embedUrl) {
        return '\n\n<iframe src="' + videoInfo.embedUrl + '" style="width:100%; aspect-ratio:16/9;" frameborder="0" allowfullscreen></iframe>\n\n';
      }
      // 不支持 iframe 的平台，返回带平台标记的链接
      if (videoInfo.platform === 'douyin') {
        return '\n\n**[抖音视频](' + originalUrl + ')**\n\n';
      }
      if (videoInfo.platform === 'twitter') {
        return '\n\n**[X/Twitter](' + originalUrl + ')**\n\n';
      }
      return '\n\n' + originalUrl + '\n\n';
    }

    // 规则2.5：处理LinuxDo的onebox（链接预览卡片）- 转换为丰富的引用块格式
    // V4.0.4: 视频 onebox 直接转 iframe，普通 onebox 显示缩略图
    // 支持平台：YouTube, Bilibili, Vimeo, 优酷, 抖音, TikTok, X/Twitter, Facebook, 腾讯视频, 西瓜视频
    turndownService.addRule('onebox', {
      filter: (node) => {
        if (node.nodeName !== 'ASIDE') return false;
        const className = safeClassName(node);
        return className.includes('onebox') || className.includes('quote');
      },
      replacement: (content, node) => {
        const link = node.querySelector('a[href]');
        if (!link) return '';

        const href = link.href;

        // V4.0.4: 检测是否为视频链接，如果是则直接转为 iframe 或特殊格式
        const videoInfo = parseVideoUrl(href);

        // 如果是视频链接，直接输出 iframe 或链接
        if (videoInfo.isVideo) {
          return generateVideoEmbed(videoInfo, href);
        }

        // 非视频链接：显示完整的 onebox 预览卡片
        const titleEl = node.querySelector('h3, h4, .onebox-title, .title, header');
        const title = titleEl?.textContent?.trim() || link.textContent?.trim() || '链接';
        const descEl = node.querySelector('.onebox-description, .description, p, .excerpt');
        const description = descEl?.textContent?.trim() || '';

        // 提取缩略图
        let thumbnailUrl = '';
        const imgEl = node.querySelector('img[src]');
        if (imgEl) {
          thumbnailUrl = imgEl.src;
        }

        // 构建引用块格式
        let result = '\n\n> **' + title + '**\n';
        if (description) {
          result += '> ' + description.substring(0, 200) + (description.length > 200 ? '...' : '') + '\n';
        }
        if (thumbnailUrl) {
          result += '> ![thumbnail](' + thumbnailUrl + ')\n';
        }
        result += '> 🔗 ' + href + '\n\n';

        return result;
      }
    });

    // 规则3：代码块保留语言标识
    // V4.0.2: 修复代码块内换行丢失问题
    // V4.0.2: 修复 LinuxDo 代码块结构（pre > div.按钮 + code）
    turndownService.addRule('codeBlocks', {
      filter: (node) => {
        // LinuxDo 的代码块结构：<pre><div>按钮</div><code>代码</code></pre>
        // 或者标准结构：<pre><code>代码</code></pre>
        // 只要 pre 里包含 code 就匹配
        return node.nodeName === 'PRE' && node.querySelector('code');
      },
      replacement: (content, node) => {
        // 查找 code 元素（可能不是 firstChild）
        const codeNode = node.querySelector('code');
        if (!codeNode) return content;

        // V4.0.2: 先将 <br> 标签转换为换行符，再获取文本内容
        // 克隆节点以避免修改原始 DOM
        const clonedCode = codeNode.cloneNode(true);
        // 将所有 <br> 替换为换行符文本节点
        const brTags = clonedCode.querySelectorAll('br');
        brTags.forEach(br => {
          br.replaceWith('\n');
        });
        const code = clonedCode.textContent;

        // 获取语言标识（从 class 或 data-code-wrap 属性）
        const langFromClass = safeClassName(codeNode).match(/lang-(\w+)/);
        const langFromData = node.getAttribute('data-code-wrap');
        const lang = langFromClass ? langFromClass[1] : (langFromData || '');

        return '\n\n```' + lang + '\n' + code.replace(/\n+$/, '') + '\n```\n\n';
      }
    });

    // 规则3.5：处理独立的 <pre> 标签（不包含 <code>）
    // V4.0.2: 新增，确保所有预格式文本的换行都正确
    turndownService.addRule('preBlocks', {
      filter: (node) => {
        // 只匹配不包含 code 的 pre 标签
        return node.nodeName === 'PRE' && !node.querySelector('code');
      },
      replacement: (content, node) => {
        // 克隆节点处理 <br> 标签
        const clonedPre = node.cloneNode(true);
        const brTags = clonedPre.querySelectorAll('br');
        brTags.forEach(br => {
          br.replaceWith('\n');
        });
        const code = clonedPre.textContent;
        return '\n\n```\n' + code.replace(/\n+$/, '') + '\n```\n\n';
      }
    });

    // 规则4：处理LinuxDo的lightbox图片链接（a标签包裹img）
    turndownService.addRule('lightboxImages', {
      filter: (node) => {
        return node.nodeName === 'A' &&
               node.classList.contains('lightbox') &&
               node.querySelector('img');
      },
      replacement: (content, node) => {
        const img = node.querySelector('img');
        if (!img) return '';

        // 使用原图链接（href）而非缩略图
        const src = node.href || img.src;
        const fullSrc = src.startsWith('http') ? src : src.startsWith('upload://') ? window.location.origin + '/uploads/short-url/' + src.slice(9) : window.location.origin + src;

        // 清理 alt：去掉 |WxH 尺寸标注、末尾数字下划线
        const rawAlt = img.getAttribute('data-base62-sha1') || img.alt || '';
        const alt = rawAlt.replace(/\|[^\]|]+/g, '').replace(/[_\d]+$/, '').replace(/[\r\n]+/g, ' ').trim() || 'image';

        return '\n\n![' + alt + '](' + fullSrc + ')\n\n';
      }
    });

    // 规则4.5：处理视频缩略图容器（div.video-thumbnail）
    // V4.0.4: LinuxDo 的视频预览结构是 div.video-thumbnail 包含 a>img
    // 直接转换为 iframe，跳过缩略图图片
    turndownService.addRule('videoThumbnailContainer', {
      filter: (node) => {
        if (node.nodeName !== 'DIV') return false;
        const className = safeClassName(node);
        return className.includes('video-thumbnail');
      },
      replacement: (content, node) => {
        const link = node.querySelector('a[href]');
        if (!link) return '';
        const href = link.href || '';

        // 使用通用视频解析函数
        const videoInfo = parseVideoUrl(href);

        if (videoInfo.isVideo) {
          return generateVideoEmbed(videoInfo, href);
        }

        return '\n\n' + href + '\n\n';
      }
    });

    // 规则4.6：删除视频封面缩略图（独立的 img 元素）
    // V4.0.4: 作为备用规则，处理不在 div.video-thumbnail 内的视频缩略图
    // 支持平台：YouTube, Bilibili, Vimeo, 优酷, 抖音, TikTok, X/Twitter, Facebook, 腾讯视频, 西瓜视频
    turndownService.addRule('removeVideoThumbnails', {
      filter: (node) => {
        if (node.nodeName !== 'IMG') return false;
        const className = safeClassName(node);
        const parentClassName = safeClassName(node.parentElement);
        const src = node.src || '';

        // 如果父元素已经是 video-thumbnail，跳过（由上面的规则处理）
        if (parentClassName.includes('video-thumbnail')) return false;

        // 方法1：通过 class 检测（LinuxDo 缓存的视频缩略图）
        if (className.includes('youtube-thumbnail')) return true;
        if (className.includes('bilibili-thumbnail') || className.includes('bilibili')) return true;
        if (className.includes('vimeo-thumbnail') || className.includes('vimeo')) return true;
        if (className.includes('youku-thumbnail') || className.includes('youku')) return true;
        if (className.includes('douyin-thumbnail') || className.includes('douyin')) return true;
        if (className.includes('tiktok-thumbnail') || className.includes('tiktok')) return true;
        if (className.includes('twitter-thumbnail') || className.includes('twitter')) return true;
        if (className.includes('facebook-thumbnail') || className.includes('facebook')) return true;
        if (className.includes('qq-thumbnail') || className.includes('qqvideo')) return true;
        if (className.includes('xigua-thumbnail') || className.includes('xigua')) return true;
        // 通用视频缩略图 class
        if (className.includes('video-thumbnail') || className.includes('video-cover')) return true;

        // 方法2：通过 URL 检测（原始视频平台 CDN）
        // YouTube
        if (/(?:img\.youtube\.com|i\.ytimg\.com|i\d?\.ytimg\.com)\/vi\//.test(src)) return true;
        // Bilibili
        if (/(?:hdslb\.com|bilivideo\.com|biliimg\.com).*(?:cover|archive|video)/.test(src)) return true;
        // Vimeo
        if (/(?:vimeocdn\.com|vumbnail\.com)\/video\//.test(src)) return true;
        // 优酷
        if (/(?:ykimg\.com|alicdn\.com).*(?:youku|yk).*(?:cover|snapshot|thumb)/i.test(src)) return true;
        // 抖音/TikTok
        if (/(?:douyinpic\.com|tiktokcdn\.com|bytedance\.com).*(?:cover|thumb|image)/i.test(src)) return true;
        // Twitter/X
        if (/(?:pbs\.twimg\.com|twimg\.com).*(?:video_thumb|ext_tw_video)/i.test(src)) return true;
        // Facebook
        if (/(?:fbcdn\.net|facebook\.com).*(?:video|vthumb)/i.test(src)) return true;
        // 腾讯视频
        if (/(?:puui\.qpic\.cn|vpic\.video\.qq\.com).*(?:cover|vcover)/i.test(src)) return true;
        // 西瓜视频
        if (/(?:p\d+\.pstatp\.com|sf\d+-cdn-tos\.douyinstatic\.com).*(?:tos-cn|cover)/i.test(src)) return true;

        return false;
      },
      replacement: () => ''  // 完全移除视频封面图片
    });

    // 规则5：处理普通图片（非lightbox）
    turndownService.addRule('images', {
      filter: (node) => {
        if (node.nodeName !== 'IMG') return false;
        // 跳过emoji图片
        if (node.classList.contains('emoji')) return false;
        // 跳过已被lightbox规则处理的
        if (node.parentNode?.classList?.contains('lightbox')) return false;
        return true;
      },
      replacement: (content, node) => {
        const src = node.src;
        if (!src) return '';

        const fullSrc = src.startsWith('http') ? src : src.startsWith('upload://') ? window.location.origin + '/uploads/short-url/' + src.slice(9) : window.location.origin + src;
        // 清理 alt：去掉 |WxH 尺寸标注、末尾数字下划线
        const rawAlt = node.alt || '';
        const alt = rawAlt.replace(/\|[^\]|]+/g, '').replace(/[_\d]+$/, '').replace(/[\r\n]+/g, ' ').trim() || 'image';

        return '\n\n![' + alt + '](' + fullSrc + ')\n\n';
      }
    });

    // 规则6：移除emoji图片和GIF动图（完全移除）
    turndownService.addRule('emojiAndGifImages', {
      filter: (node) => {
        if (node.nodeName !== 'IMG') return false;
        const className = safeClassName(node);
        const src = node.src || '';
        const alt = node.alt || '';
        // emoji图片
        if (className.includes('emoji') ||
            src.includes('/emoji/') ||
            src.includes('twemoji') ||
            /^:[^:]+:$/.test(alt)) return true;
        // GIF动图
        if (src.includes('.gif') || className.includes('animated')) return true;
        return false;
      },
      replacement: () => ''  // 完全移除
    });

    // 规则7：处理视频（嵌入到Obsidian）
    turndownService.addRule('videoEmbed', {
      filter: (node) => {
        // 处理 video 标签
        if (node.nodeName === 'VIDEO') return true;
        // 处理包含视频的 a 标签
        if (node.nodeName === 'A') {
          const href = node.href || '';
          return /\.(mp4|webm|mov|avi)(\?|$)/i.test(href);
        }
        return false;
      },
      replacement: (content, node) => {
        let src = '';
        if (node.nodeName === 'VIDEO') {
          // 从 video 标签获取 src
          const sourceEl = node.querySelector('source');
          src = node.src || sourceEl?.src || '';
        } else if (node.nodeName === 'A') {
          src = node.href;
        }

        if (!src) return '';
        const fullSrc = src.startsWith('http') ? src : src.startsWith('upload://') ? window.location.origin + '/uploads/short-url/' + src.slice(9) : window.location.origin + src;
        return '\n\n![video](' + fullSrc + ')\n\n';
      }
    });

    // 规则7.1：处理在线视频链接转为 iframe 嵌入
    // 支持平台：YouTube, Bilibili, Vimeo, 优酷, 抖音, TikTok, X/Twitter, Facebook, 腾讯视频, 西瓜视频
    turndownService.addRule('onlineVideoEmbed', {
      filter: (node) => {
        if (node.nodeName !== 'A') return false;
        const href = node.href || '';
        // 使用通用视频解析函数检测
        const videoInfo = parseVideoUrl(href);
        return videoInfo.isVideo;
      },
      replacement: (content, node) => {
        const href = node.href || '';

        // 使用通用视频解析函数
        const videoInfo = parseVideoUrl(href);

        if (videoInfo.isVideo) {
          return generateVideoEmbed(videoInfo, href);
        }

        return '[' + content + '](' + href + ')';
      }
    });

    // 规则7.2：处理音频链接转为 HTML5 audio 嵌入
    // 支持格式：mp3, wav, ogg, m4a, flac, aac, webm
    turndownService.addRule('audioEmbed', {
      filter: (node) => {
        if (node.nodeName !== 'A') return false;
        const href = (node.href || '').toLowerCase();
        return /\.(mp3|wav|ogg|m4a|flac|aac|webm)(\?|$)/i.test(href);
      },
      replacement: (content, node) => {
        const href = node.href || '';
        const fileName = content.trim() || href.split('/').pop().split('?')[0] || '音频';
        // 使用 HTML5 audio 标签嵌入
        return '\n\n🎵 **' + fileName + '**\n<audio controls src="' + href + '" style="width:100%;"></audio>\n\n';
      }
    });

    // 规则7.3：处理文档链接（PDF、Word、Excel、PPT、SVG等）
    // PDF 使用 iframe 嵌入预览，其他显示为带图标的链接
    // V4.3.8: 排除 lightbox 链接，避免与 lightbox 规则冲突导致图片语法被破坏
    turndownService.addRule('documentEmbed', {
      filter: (node) => {
        if (node.nodeName !== 'A') return false;
        // V4.3.8: 如果是 lightbox 链接，跳过，让 lightbox 规则处理
        if (node.classList?.contains('lightbox')) return false;
        const href = (node.href || '').toLowerCase();
        return /\.(pdf|docx?|xlsx?|pptx?|svg|csv|txt|rtf|odt|ods|odp)(\?|$)/i.test(href);
      },
      replacement: (content, node) => {
        const href = node.href || '';
        const hrefLower = href.toLowerCase();

        // V4.3.8: 处理嵌套图片问题
        // 如果 content 已经是图片 markdown 语法 ![alt](url)，提取 alt 文本
        let fileName = content.trim().replace(/[\r\n]+/g, ' ').trim();
        const imgMatch = fileName.match(/^!\[([^\]]*)\]\([^)]+\)$/);
        if (imgMatch) {
          fileName = imgMatch[1] || ''; // 提取 alt 文本
        }
        fileName = fileName || href.split('/').pop().split('?')[0] || '文档';

        // SVG 直接作为图片嵌入
        if (/\.svg(\?|$)/i.test(hrefLower)) {
          return '\n\n![' + fileName + '](' + href + ')\n\n';
        }

        // PDF 显示下载链接（iframe 跨域限制，改用本地预览提示）
        if (/\.pdf(\?|$)/i.test(hrefLower)) {
          return '\n\n📄 **' + fileName + '**\n📥 [下载 PDF](' + href + ')\n💡 *下载后可在 Obsidian 中使用 `![[' + fileName + ']]` 嵌入预览*\n\n';
        }

        // Word 文档
        if (/\.docx?(\?|$)/i.test(hrefLower)) {
          return '\n\n📝 **' + fileName + '**\n📥 [下载 Word 文档](' + href + ')\n\n';
        }

        // Excel 表格
        if (/\.(xlsx?|csv)(\?|$)/i.test(hrefLower)) {
          return '\n\n📊 **' + fileName + '**\n📥 [下载表格文件](' + href + ')\n\n';
        }

        // PPT 演示文稿
        if (/\.pptx?(\?|$)/i.test(hrefLower)) {
          return '\n\n📽️ **' + fileName + '**\n📥 [下载演示文稿](' + href + ')\n\n';
        }

        // 纯文本文件
        if (/\.(txt|rtf)(\?|$)/i.test(hrefLower)) {
          return '\n\n📃 **' + fileName + '**\n📥 [下载文本文件](' + href + ')\n\n';
        }

        // OpenDocument 格式
        if (/\.od[tsp](\?|$)/i.test(hrefLower)) {
          const icon = /\.odt/i.test(hrefLower) ? '📝' : /\.ods/i.test(hrefLower) ? '📊' : '📽️';
          return '\n\n' + icon + ' **' + fileName + '**\n📥 [下载文档](' + href + ')\n\n';
        }

        // 默认处理
        return '\n\n📎 **' + fileName + '**\n📥 [下载文件](' + href + ')\n\n';
      }
    });

    // 规则7.4：处理 HTML5 audio 标签（论坛中已有的音频播放器）
    turndownService.addRule('audioTag', {
      filter: (node) => {
        return node.nodeName === 'AUDIO';
      },
      replacement: (content, node) => {
        const src = node.src || node.querySelector('source')?.src || '';
        if (!src) return '';
        const fileName = src.split('/').pop().split('?')[0] || '音频';
        return '\n\n🎵 **' + fileName + '**\n<audio controls src="' + src + '" style="width:100%;"></audio>\n\n';
      }
    });

    // 规则7.5：处理 HTML5 video 标签（论坛中已有的视频播放器）
    turndownService.addRule('videoTag', {
      filter: (node) => {
        return node.nodeName === 'VIDEO';
      },
      replacement: (content, node) => {
        const src = node.src || node.querySelector('source')?.src || '';
        if (!src) return '';
        // 使用 video 标签嵌入
        return '\n\n<video controls src="' + src + '" style="width:100%; max-width:800px;"></video>\n\n';
      }
    });

    // 规则8：移除图片元信息span（仅匹配特定class或纯尺寸信息）
    turndownService.addRule('removeImageMeta', {
      filter: (node) => {
        // 只处理span元素
        if (node.nodeName !== 'SPAN') return false;
        const text = node.textContent?.trim() || '';
        const className = safeClassName(node);
        // 匹配meta class或纯尺寸信息文本
        if (className.includes('meta') || className.includes('image-size-info')) return true;
        // 仅当文本是纯尺寸信息时才移除（如 "1920×1080 180 KB"）
        if (/^\d+×\d+\s+\d+(?:\.\d+)?\s*(?:KB|MB|GB)$/i.test(text)) return true;
        return false;
      },
      replacement: () => ''
    });

    return turndownService;
  }

  // V3.2: 清理Markdown中的残留语法（保守版，不破坏正常链接和图片）
  // V3.6.0: 添加 keepGif 参数，在启用图片嵌入时保留 GIF 链接
  function cleanupMarkdown(markdown, keepGif = false) {
    // 0. 处理论坛自定义 BBCode，尽量保留可读文本
    markdown = markdown.replace(/\[date=([^\]\s]+)([^\]]*)\]/gi, (_, dateValue, attrs = '') => {
      const timeMatch = attrs.match(/\btime=([^\s\]]+)/i);
      const timezoneMatch = attrs.match(/\btimezone=(?:"([^"]+)"|([^\s\]]+))/i);
      const parts = [dateValue];
      if (timeMatch && timeMatch[1]) parts.push(timeMatch[1].replace(/^"|"$/g, ''));
      const timezoneValue = timezoneMatch ? (timezoneMatch[1] || timezoneMatch[2] || '') : '';
      if (timezoneValue) parts.push(`(${timezoneValue})`);
      return parts.join(' ');
    });
    markdown = markdown.replace(/\[\/date\]/gi, '');
    markdown = markdown.replace(/\[(?:color|bgcolor|size|font|align|float|left|center|right|justify)(?:=[^\]]*)?\]/gi, '');
    markdown = markdown.replace(/\[\/(?:color|bgcolor|size|font|align|float|left|center|right|justify)\]/gi, '');

    // 0. 移除 Discourse 专有折叠语法 [details] / [/details]，保留内容
    markdown = markdown.replace(/\[details=[^\]]*\]/g, '');
    markdown = markdown.replace(/\[\/details\]/g, '');

    // 0.1 清理图片 alt 中的 Discourse 尺寸语法
    // 例如 ![image|63x54](url) / ![image|63](url) -> ![image](url)
    // 先处理完整图片语法，避免 Obsidian 把 |63 误判成尺寸参数导致渲染异常
    markdown = markdown.replace(/!\[([^\]\r\n|]*?)\|[^\]\r\n]*\]\(([^)\r\n]+)\)/g, '![$1]($2)');
    // 再兜底处理残留 alt（不带链接体的非常规片段）
    markdown = markdown.replace(/!\[([^\]\r\n|]*?)\|[^\]\r\n]*\]/g, '![$1]');

    // 1. 移除空锚点链接 [](#anchor-id)
    markdown = markdown.replace(/\[\s*\]\(#[^)]*\)/g, '');

    // 2. 移除emoji图片语法 ![:emoji:](url)
    markdown = markdown.replace(/!\[:[a-z_]+:\]\([^)]+\)/gi, '');

    // 3. 移除图片尺寸信息行（独立成行的 "1920×1080 180 KB" 格式）
    markdown = markdown.replace(/^\s*\d+×\d+\s+\d+(?:\.\d+)?\s*(?:KB|MB|GB)\s*$/gim, '');

    // 4. 移除转义下划线
    markdown = markdown.replace(/\\_/g, '_');

    // 5. 清理嵌套图片链接 [![alt](thumb)](original) → ![alt](original)
    markdown = markdown.replace(/\[!\[([^\]]*)\]\([^)]+\)\]\(([^)]+)\)/g, '![$1]($2)');

    // V4.3.8: 清理双重嵌套 ![![alt](thumb)](url) → ![alt](url)
    markdown = markdown.replace(/!\[!\[([^\]]*)\]\([^)]+\)\]\(([^)]+)\)/g, '![$1]($2)');

    // V4.3.8: 修复残留的双感叹号 !![ → ![
    markdown = markdown.replace(/!!\[/g, '![');

    // 6. 移除残留的HTML标签（aside, article等）
    markdown = markdown.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '');
    markdown = markdown.replace(/<article[^>]*>[\s\S]*?<\/article>/gi, '');

    // 7. 移除GIF图片链接（V3.6.0: 除非 keepGif 为 true）
    if (!keepGif) {
      markdown = markdown.replace(/!\[[^\]]*\]\([^)]*\.gif[^)]*\)/gi, '');
    }

    // 8. 处理 [spoiler]...[/spoiler] BBCode：保留内容，去掉标签
    markdown = markdown.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, (_, content) => {
      return '\n\n' + content.trim() + '\n\n';
    });
    markdown = markdown.replace(/\[\/?spoiler\]/gi, '');

    // 9. 移除 raw markdown 中的 Discourse 文本表情码 :emoji_name:（OB 不渲染）
    // 匹配 :name: 格式，排除在代码、链接、图片语法中的
    markdown = markdown.replace(/(?<![`\[!(\w]):[a-z_0-9+\-]{2,30}:(?![`\])\w])/gi, '');

    // 10. 移除多余空行
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    return markdown;
  }

  // 保存前的最终兜底清洗，避免个别分支残留 Discourse 尺寸语法
  function normalizeImageMarkdownFinal(markdown) {
    if (!markdown) return markdown;
    let out = markdown;
    out = out.replace(/!\[([^\]\r\n|]*?)\|[^\]\r\n]*\]\(([^)\r\n]+)\)/g, '![$1]($2)');
    out = out.replace(/!\[([^\]\r\n|]*?)\|[^\]\r\n]*\]/g, '![$1]');
    out = out.replace(/\n{3,}/g, '\n\n');
    return out;
  }

  // 某些 Discourse 站点（如 Linux DO）会在 raw 中返回论坛自定义 BBCode。
  // 这些标签无法稳定转成 Markdown，继续使用 raw 反而会把源码原样保存下来。
  function containsUnsupportedForumBbcode(markdown) {
    if (!markdown) return false;
    return /\[(?:\/)?(?:color|bgcolor|date|time|datetime|size|font|align|float|left|center|right|justify)\b[^\]]*\]/i.test(markdown);
  }

  function convertRawOrCookedToMarkdown(rawMarkdown, cookedHtml, turndownService, keepGif = false, scopeLabel = '内容') {
    const safeCookedHtml = cookedHtml || '';
    if (!rawMarkdown) {
      const cookedMarkdown = turndownService.turndown(safeCookedHtml);
      return cleanupMarkdown(cookedMarkdown, keepGif).trim();
    }

    const resolvedRaw = resolveUploadUrls(rawMarkdown, safeCookedHtml).trim();
    if (safeCookedHtml && containsUnsupportedForumBbcode(resolvedRaw)) {
      console.log(`[Discourse Saver] ${scopeLabel}检测到论坛自定义 BBCode，回退到 cooked HTML 转 Markdown`);
      const cookedMarkdown = turndownService.turndown(safeCookedHtml);
      return cleanupMarkdown(cookedMarkdown, keepGif).trim();
    }

    return cleanupMarkdown(resolvedRaw, keepGif).trim();
  }

  // V3.6.0: 图片转 Base64 功能
  // 下载图片并转为 Base64 数据
  async function fetchImageAsBase64(url, maxWidth, quality, skipGif) {
    try {
      // 检查是否为 GIF
      if (skipGif && /\.gif(\?|$)/i.test(url)) {
        console.log('[Discourse Saver] 跳过 GIF 图片:', url);
        return null;
      }

      // 获取图片：same-origin 请求携带 Cookie（保证同域登录内容可访问）
      // 跨域 CDN（cdn3.linux.do 等）不带 Cookie，兼容 Access-Control-Allow-Origin: * 的 CDN
      // credentials: 'include' 与 CDN 通配符 CORS 不兼容，会导致 Failed to fetch
      const response = await fetch(url, {
        credentials: 'same-origin',
        cache: 'no-store'
      });

      if (!response.ok) {
        console.warn('[Discourse Saver] 图片下载失败:', url, response.status);
        return null;
      }

      const blob = await response.blob();

      // 检查是否为 GIF（通过 MIME 类型）
      if (skipGif && blob.type === 'image/gif') {
        console.log('[Discourse Saver] 跳过 GIF 图片 (MIME):', url);
        return null;
      }

      // 使用 Canvas 处理图片（压缩和转换）
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        // 创建 Object URL 并在使用后释放，避免内存泄漏
        const blobUrl = URL.createObjectURL(blob);

        img.onload = () => {
          // 释放 Object URL
          URL.revokeObjectURL(blobUrl);

          try {
            let width = img.width;
            let height = img.height;

            // 如果设置了最大宽度且图片超宽，等比缩放
            if (maxWidth > 0 && width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 转为 Base64（JPEG 格式，支持质量压缩）
            // 对于透明图片使用 PNG
            const hasAlpha = blob.type === 'image/png';
            const outputType = hasAlpha ? 'image/png' : 'image/jpeg';
            const base64 = canvas.toDataURL(outputType, quality);

            console.log('[Discourse Saver] 图片转换成功:', url, `${img.width}x${img.height} → ${width}x${height}`);
            resolve(base64);
          } catch (e) {
            console.warn('[Discourse Saver] Canvas 处理失败:', e);
            resolve(null);
          }
        };

        img.onerror = () => {
          // 释放 Object URL
          URL.revokeObjectURL(blobUrl);
          console.warn('[Discourse Saver] 图片加载失败:', url);
          resolve(null);
        };

        img.src = blobUrl;
      });
    } catch (error) {
      console.warn('[Discourse Saver] 获取图片异常:', url, error);
      return null;
    }
  }

  // V5.3: 通过 background.js 下载媒体文件到 Vault 并替换 Markdown 路径
  // V1.1.2: 新增附件下载支持（PDF/DOCX/XLSX等）
  // postTitle 用于替换 mediaFolderName 中的 {title} 变量
  async function downloadAndReplaceMedia(markdown, config, postTitle = '') {
    // 支持 {title} 变量：用帖子标题替换，过滤 OB 非法字符（\ / : * ? " < > |）
    const safeTitle = postTitle
      ? postTitle.replace(/[\\/:*?"<>|《》]/g, '').replace(/\s+/g, '-').replace(/^[-\s]+|[-\s]+$/g, '').substring(0, 60)
      : '';
    const rawFolderTemplate = config.mediaFolderName || 'media';
    // {title} 变量替换（手动写入路径时生效）
    let mediaFolderName = rawFolderTemplate.replace(/\{title\}/g, safeTitle || 'untitled');
    // mediaFolderPerTitle 勾选框：路径中未手动使用 {title} 时才追加子目录，避免重复
    if (config.mediaFolderPerTitle && safeTitle && !rawFolderTemplate.includes('{title}')) {
      mediaFolderName = mediaFolderName.replace(/\/+$/, '') + '/' + safeTitle;
    }
    const includeVideos = config.downloadVideos !== false;
    const includeAttachments = config.downloadAttachments !== false;

    // 文件扩展名分类
    const IMAGE_EXTENSIONS = /\.(?:png|jpe?g|gif|webp|bmp|avif|heic|heif|svg)(?:[?#].*)?$/i;
    const VIDEO_EXTENSIONS = /\.(?:mp4|webm|mov|avi|mkv|m4v)(?:[?#].*)?$/i;
    const ATTACHMENT_EXTENSIONS = /\.(?:pdf|docx?|xlsx?|pptx?|zip|rar|7z|tar|gz|bz2|xz|csv|txt|md|json|xml|ya?ml|log|sql|sqlite|db|epub|mobi|azw3|dmg|exe|msi|pkg|deb|rpm|apk|ipa|psd|ai|sketch|fig)(?:[?#].*)?$/i;

    // URL 清理工具
    function stripMarkdownUrl(url) {
      if (!url || typeof url !== 'string') return '';
      let cleanUrl = url.trim();
      cleanUrl = cleanUrl.replace(/^<|>$/g, '');
      cleanUrl = cleanUrl.replace(/\s+["'][^"']*["']\s*$/, '');
      return cleanUrl.trim();
    }

    function normalizeDownloadUrl(url) {
      const cleanUrl = stripMarkdownUrl(url);
      if (!cleanUrl) return '';
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) return cleanUrl;
      if (cleanUrl.startsWith('/')) return window.location.origin + cleanUrl;
      if (cleanUrl.startsWith('upload://')) return window.location.origin + '/uploads/short-url/' + cleanUrl.slice(9);
      return '';
    }

    function isDiscourseShortUploadUrl(url) {
      try {
        return /\/uploads\/short-url\//i.test(new URL(url).pathname);
      } catch (e) {
        return false;
      }
    }

    function isLikelyAttachmentUrl(url, linkText = '') {
      const normalizedUrl = normalizeDownloadUrl(url);
      if (!normalizedUrl) return false;
      try {
        const urlObj = new URL(normalizedUrl);
        const path = decodeURIComponent(urlObj.pathname);
        const text = decodeURIComponent(linkText || '').trim();
        if (/\/uploads\/short-url\//i.test(path)) return true;
        if (/\/uploads\/default\/original\//i.test(path)) return true;
        if (ATTACHMENT_EXTENSIONS.test(path) || ATTACHMENT_EXTENSIONS.test(text)) return true;
        return false;
      } catch (e) {
        return false;
      }
    }

    // 收集媒体/附件URL
    const mediaUrls = [];
    const seenUrls = new Set();

    function addDownload(url, type, alt = '', fileNameHint = '') {
      const originalUrl = stripMarkdownUrl(url);
      const normalizedUrl = normalizeDownloadUrl(url);
      if (!normalizedUrl || seenUrls.has(normalizedUrl)) return;
      seenUrls.add(normalizedUrl);
      mediaUrls.push({
        originalUrl,
        url: normalizedUrl,
        type,
        alt: (alt || '').trim(),
        fileNameHint: (fileNameHint || '').trim()
      });
    }

    // 匹配图片 ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let match;
    while ((match = imageRegex.exec(markdown)) !== null) {
      addDownload(match[2], 'image', match[1], match[1]);
    }

    // 匹配视频链接
    if (includeVideos) {
      const videoRegex = /\[([^\]]*)\]\((https?:\/\/[^)]+\.(?:mp4|webm|mov|avi|mkv|m4v)[^)]*)\)/gi;
      while ((match = videoRegex.exec(markdown)) !== null) {
        addDownload(match[2], 'video', match[1], match[1]);
      }
      // 独立的视频 URL 行
      const videoLineRegex = /^(https?:\/\/\S+\.(?:mp4|webm|mov|avi|mkv|m4v)\S*)$/gim;
      while ((match = videoLineRegex.exec(markdown)) !== null) {
        addDownload(match[1], 'video');
      }
    }

    // V1.1.2: 匹配附件链接
    if (includeAttachments) {
      // 优先识别 documentEmbed 生成的两行格式，文件名在上一行粗体里
      const documentBlockRegex = /\*\*([^*\n]+)\*\*\s*\n\s*📥\s*\[[^\]]*\]\(([^)]+)\)/g;
      while ((match = documentBlockRegex.exec(markdown)) !== null) {
        const fileNameHint = match[1].trim();
        const url = match[2];
        if (isLikelyAttachmentUrl(url, fileNameHint)) {
          addDownload(url, 'attachment', fileNameHint, fileNameHint);
        }
      }

      // 普通 Markdown 链接里的附件；排除图片语法，避免重复
      const linkRegex = /(^|[^!])\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
      while ((match = linkRegex.exec(markdown)) !== null) {
        const linkText = match[2] || '';
        const url = match[3];
        if (isLikelyAttachmentUrl(url, linkText)) {
          let type = 'attachment';
          const cleanUrl = stripMarkdownUrl(url);
          if (IMAGE_EXTENSIONS.test(cleanUrl)) type = 'image';
          if (VIDEO_EXTENSIONS.test(cleanUrl)) type = 'video';
          addDownload(url, type, linkText, linkText);
        }
      }

      // 裸链接附件
      const bareUrlRegex = /(^|\s)(https?:\/\/\S+)/g;
      while ((match = bareUrlRegex.exec(markdown)) !== null) {
        const url = match[2].replace(/[),.;]+$/, '');
        if (isLikelyAttachmentUrl(url)) {
          let type = 'attachment';
          if (IMAGE_EXTENSIONS.test(url)) type = 'image';
          if (VIDEO_EXTENSIONS.test(url)) type = 'video';
          addDownload(url, type);
        }
      }
    }

    if (mediaUrls.length === 0) return markdown;

    console.log(`[Discourse Saver] 找到 ${mediaUrls.length} 个媒体/附件文件，通过 REST API 写入 Vault...`);

    // 媒体文件夹从 Vault 根目录起算，不拼保存文件夹
    const vaultMediaPath = mediaFolderName;

    // V5.5.7: 在 content.js（页面上下文）中预先 fetch 二进制数据，携带 Cookie
    // background.js Service Worker 无法获取页面 Cookie，必须在此处提前下载
    const mediaUrlsWithData = await Promise.all(mediaUrls.map(async (media) => {
      try {
        // same-origin 带 Cookie，跨域 CDN 不带 Cookie（兼容 CDN 通配符 CORS）
        const res = await fetch(media.url, { credentials: 'same-origin', cache: 'no-store' });
        if (!res.ok) {
          rlog('WARN', `预取媒体失败 HTTP ${res.status}: ${media.url}`);
          return { ...media, binaryBase64: null };
        }
        const buf = await res.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        const binaryBase64 = btoa(binary);
        const mimeType = res.headers.get('content-type') || '';
        return { ...media, binaryBase64, mimeType };
      } catch (e) {
        rlog('WARN', `预取媒体异常: ${e.message} | ${media.url}`);
        return { ...media, binaryBase64: null };
      }
    }));

    // 通过 background.js 处理写入 Obsidian（已含二进制数据，background 无需再 fetch）
    try {
      const response = await sendMessageAsync({
        action: 'downloadMediaToVault',
        config: {
          restApiKey: config.restApiKey,
          restApiPort: config.restApiPort || 27123
        },
        mediaUrls: mediaUrlsWithData,
        vaultMediaPath: vaultMediaPath,
        mediaFolderName: mediaFolderName,
        forumOrigin: window.location.origin
      });

      if (response && response.results) {
        let processedMarkdown = markdown;
        let successCount = 0;

        for (const result of response.results) {
          if (result.success && result.relativePath) {
            const urlsToReplace = [result.originalUrl, result.sourceUrl].filter(Boolean);
            [...new Set(urlsToReplace)].forEach((url) => {
              const escapedUrl = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              // 替换图片语法 ![alt](url) → ![[path]]
              processedMarkdown = processedMarkdown.replace(
                new RegExp(`!\\[[^\\]]*\\]\\(${escapedUrl}\\)`, 'g'),
                `![[${result.relativePath}]]`
              );
              // 替换链接语法 [text](url) → [text](path) 或 ![[path]]
              processedMarkdown = processedMarkdown.replace(
                new RegExp(`\\[([^\\]]*)\\]\\(${escapedUrl}\\)`, 'g'),
                `[$1](${result.relativePath})`
              );
              // 替换裸URL为Wiki引用
              processedMarkdown = processedMarkdown.replace(
                new RegExp(escapedUrl, 'g'),
                `![[${result.relativePath}]]`
              );
            });
            successCount++;
          }
        }

        console.log(`[Discourse Saver] 媒体/附件下载完成: ${successCount}/${mediaUrls.length} 成功`);
        if (successCount > 0) {
          showNotification(`已下载 ${successCount}/${mediaUrls.length} 个媒体/附件 → ${vaultMediaPath}`, 'success');
          rlog('INFO', '媒体/附件已下载: ' + successCount + '/' + mediaUrls.length + ' 到 ' + vaultMediaPath);
        }
        return processedMarkdown;
      }
    } catch (err) {
      console.warn('[Discourse Saver] 媒体下载失败:', err);
      showNotification('媒体/附件下载失败，保留原链接', 'warning');
    }

    return markdown;
  }

  // V5.3: 后台静默下载媒体（fire-and-forget，不阻塞保存）
  // postTitle 用于替换 mediaFolderName 中的 {title} 变量（同 downloadAndReplaceMedia）
  function fireAndForgetMediaDownload(markdown, config, postTitle = '') {
    const safeTitle = postTitle
      ? postTitle.replace(/[\\/:*?"<>|《》]/g, '').replace(/\s+/g, '-').replace(/^[-\s]+|[-\s]+$/g, '').substring(0, 60)
      : '';
    const rawFolderTemplate = config.mediaFolderName || 'media';
    // {title} 变量替换（手动写入路径时生效）
    let mediaFolderName = rawFolderTemplate.replace(/\{title\}/g, safeTitle || 'untitled');
    // mediaFolderPerTitle 勾选框：路径中未手动使用 {title} 时才追加子目录，避免重复
    if (config.mediaFolderPerTitle && safeTitle && !rawFolderTemplate.includes('{title}')) {
      mediaFolderName = mediaFolderName.replace(/\/+$/, '') + '/' + safeTitle;
    }
    const includeVideos = config.downloadVideos !== false;

    // 收集媒体URL
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const mediaUrls = [];
    let match;
    while ((match = imageRegex.exec(markdown)) !== null) {
      let url = match[2];
      if (url && !url.startsWith('data:')) {
        // V5.5.2: 将 Discourse 内部 upload:// 短链转换为可访问的 HTTP URL
        if (url.startsWith('upload://')) {
          url = window.location.origin + '/uploads/short-url/' + url.slice(9);
        }
        mediaUrls.push({ url, type: 'image' });
      }
    }
    if (includeVideos) {
      const videoRegex = /(?:^|\n)(?:https?:\/\/[^\s]+\.(?:mp4|webm|mov|avi)(?:\?[^\s]*)?)/gim;
      let videoMatch;
      while ((videoMatch = videoRegex.exec(markdown)) !== null) {
        mediaUrls.push({ url: videoMatch[0].trim(), type: 'video' });
      }
    }

    if (mediaUrls.length === 0) return;

    const vaultMediaPath = mediaFolderName;

    console.log(`[Discourse Saver] 后台静默下载 ${mediaUrls.length} 个媒体文件...`);

    // 发送到 background.js，不等待结果
    try {
      chrome.runtime.sendMessage({
        action: 'downloadMediaToVault',
        config: {
          restApiKey: config.restApiKey,
          restApiPort: config.restApiPort || 27123
        },
        mediaUrls: mediaUrls,
        vaultMediaPath: vaultMediaPath,
        mediaFolderName: mediaFolderName,
        forumOrigin: window.location.origin
      }, (response) => {
        // 静默处理结果，只写日志
        if (chrome.runtime.lastError) {
          console.warn('[Discourse Saver] 后台媒体下载通信失败:', chrome.runtime.lastError.message);
          rlog('WARN', '后台媒体下载通信失败: ' + chrome.runtime.lastError.message);
          return;
        }
        if (response && response.results) {
          const successCount = response.results.filter(r => r.success).length;
          console.log(`[Discourse Saver] 后台媒体下载完成: ${successCount}/${mediaUrls.length}`);
          rlog('INFO', `运行成功，媒体文件已下载到Vault: ${successCount}/${mediaUrls.length}个`);
        } else if (response && response.error) {
          rlog('WARN', '后台媒体下载失败: ' + response.error);
        }
      });
    } catch (err) {
      console.warn('[Discourse Saver] 后台媒体下载异常:', err);
      rlog('ERROR', '后台媒体下载异常: ' + err.message);
    }
  }

  // V5.5.7: 解析图片外链的真实 CDN URL
  // 使用 credentials: 'include' 跟踪跳转，把 short-url / 内部 URL 换成可直接访问的 CDN URL
  // 如果论坛使用 CDN（如 global.discourse-cdn.com），最终 URL 是公开的，Obsidian 可直接显示
  async function resolveImageUrlsInMarkdown(markdown) {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const isLikelyImageUrl = (url) => {
      if (!url) return false;
      const u = url.toLowerCase();
      return /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(u) ||
             u.includes('/uploads/short-url/') ||
             u.includes('/original/');
    };
    const urlSet = new Set();
    let match;
    while ((match = imageRegex.exec(markdown)) !== null) {
      const url = match[2];
      if (url && url.startsWith('http') && !url.startsWith('data:')) urlSet.add(url);
    }
    while ((match = linkRegex.exec(markdown)) !== null) {
      const full = match[0];
      if (full.startsWith('![')) continue; // 跳过已被 imageRegex 处理的图片语法
      const url = match[2];
      if (url && url.startsWith('http') && !url.startsWith('data:') && isLikelyImageUrl(url)) {
        urlSet.add(url);
      }
    }
    if (urlSet.size === 0) return markdown;

    const resolved = new Map();
    // 优先通过 background 解析（扩展上下文更稳定，避免页面跨域限制）
    try {
      const bgResp = await sendMessageAsync({
        action: 'resolveFinalUrls',
        urls: [...urlSet]
      });
      if (bgResp && bgResp.success && bgResp.resolvedMap) {
        Object.entries(bgResp.resolvedMap).forEach(([from, to]) => {
          if (to && to !== from) resolved.set(from, to);
        });
      }
    } catch (_) {}

    // background 未解析到的链接，回退页面内 fetch
    const unresolved = [...urlSet].filter(url => !resolved.has(url));
    await Promise.all(unresolved.map(async (url) => {
      try {
        let res = await fetch(url, {
          method: 'HEAD',
          credentials: 'include',
          cache: 'no-store',
          redirect: 'follow'
        });
        if (res.status === 405) {
          res = await fetch(url, {
            method: 'GET',
            credentials: 'include',
            cache: 'no-store',
            redirect: 'follow'
          });
        }
        if (res.ok && res.url && res.url !== url) {
          resolved.set(url, res.url);
          rlog('INFO', `外链解析: ${url.slice(-40)} → ${res.url.slice(-40)}`);
        }
      } catch (_) {}
    }));

    if (resolved.size === 0) return markdown;

    let result = markdown;
    for (const [original, final] of resolved) {
      const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(`!\\[([^\\]]*)\\]\\(${escaped}\\)`, 'g'), `![$1](${final})`);
      result = result.replace(new RegExp(`\\[([^\\]]+)\\]\\(${escaped}\\)`, 'g'), `[$1](${final})`);
    }
    console.log(`[Discourse Saver] 外链解析完成: ${resolved.size}/${urlSet.size} 条已替换为真实 CDN URL`);
    return result;
  }

  // 处理 Markdown 中的所有图片，转换为 Base64
  async function processMarkdownImages(markdown, config) {
    if (!config.embedImages) {
      return markdown;
    }

    console.log('[Discourse Saver] 开始处理图片嵌入...');

    // 匹配 Markdown 图片语法 ![alt](url)
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const images = [];
    let match;

    // 收集所有图片
    while ((match = imageRegex.exec(markdown)) !== null) {
      images.push({
        fullMatch: match[0],
        alt: match[1],
        url: match[2]
      });
    }

    if (images.length === 0) {
      console.log('[Discourse Saver] 没有找到需要处理的图片');
      return markdown;
    }

    // 提取唯一的 URL 进行下载，避免重复下载相同图片
    const uniqueUrls = [...new Set(images.map(img => img.url))];
    console.log(`[Discourse Saver] 找到 ${images.length} 张图片（${uniqueUrls.length} 张唯一），开始转换...`);

    // 并行下载所有唯一的图片
    const urlToBase64 = new Map();
    const results = await Promise.all(
      uniqueUrls.map(async (url) => {
        const base64 = await fetchImageAsBase64(
          url,
          config.imageMaxWidth,
          config.imageQuality,
          config.imageSkipGif
        );
        return { url, base64 };
      })
    );

    // 构建 URL 到 Base64 的映射
    for (const result of results) {
      if (result.base64) {
        urlToBase64.set(result.url, result.base64);
      }
    }

    // 替换图片链接为 Base64
    let processedMarkdown = markdown;
    let successCount = 0;
    let skipCount = 0;

    for (const img of images) {
      const base64 = urlToBase64.get(img.url);
      if (base64) {
        // 替换为 Base64 格式
        processedMarkdown = processedMarkdown.replace(
          img.fullMatch,
          `![${img.alt}](${base64})`
        );
        successCount++;
      } else {
        // 保留原链接
        skipCount++;
      }
    }

    console.log(`[Discourse Saver] 图片处理完成: ${successCount} 张嵌入, ${skipCount} 张保留原链接`);
    return processedMarkdown;
  }

  // V3: HTML转Markdown（带评论版本）
  // V5.5-raw: rawMainContent 为可选参数，传入时跳过 Turndown 转换直接使用原始 Markdown
  function convertToMarkdownWithComments(contentHTML, metadata, comments, config, rawMainContent = null, apiCookedHtml = null, reactions = []) {
    const turndownService = createTurndownService();

    // V3.1: 如果不保留图片，移除所有图片规则的输出
    if (!config.includeImages) {
      turndownService.addRule('removeAllImages', {
        filter: ['img', 'a'],
        replacement: (content, node) => {
          if (node.nodeName === 'IMG') return '';
          if (node.nodeName === 'A' && node.classList.contains('lightbox')) return '';
          return content;
        }
      });
    }

    // V3.6.0: 如果启用图片嵌入且保留 GIF，则不在转换阶段移除 GIF
    // 让后续的 processMarkdownImages 函数决定如何处理
    if (config.embedImages && config.imageSkipGif) {
      // 重新定义规则：保留 GIF 图片链接
      turndownService.addRule('keepGifImages', {
        filter: (node) => {
          if (node.nodeName !== 'IMG') return false;
          const src = node.src || '';
          const className = safeClassName(node);
          // 匹配 GIF 图片
          return src.includes('.gif') || className.includes('animated');
        },
        replacement: (content, node) => {
          const src = node.src;
          if (!src) return '';
          const fullSrc = src.startsWith('http') ? src : window.location.origin + src;
          const alt = node.alt?.replace(/[_\d]+$/, '').trim() || 'gif';
          return '\n\n![' + alt + '](' + fullSrc + ')\n\n';
        }
      });
    }

    // V5.5-raw: 优先使用原始 Markdown，回退到 Turndown
    // apiCookedHtml（来自 /t/{id}.json）包含折叠 details 内的图片，优先使用
    const keepGif = config.embedImages && config.imageSkipGif;
    let mainContent;
    if (rawMainContent) {
      mainContent = convertRawOrCookedToMarkdown(
        rawMainContent,
        apiCookedHtml || contentHTML || '',
        turndownService,
        keepGif,
        '主帖'
      );
      console.log('[Discourse Saver] 主帖优先尝试原始 Markdown，必要时回退 cooked HTML');
    } else {
      mainContent = convertRawOrCookedToMarkdown(
        null,
        contentHTML,
        turndownService,
        keepGif,
        '主帖'
      );
    }

    // 构建完整Markdown
    let markdown = '';

    // 添加 frontmatter（仅影响 Obsidian/语雀/思源，飞书/Notion 字段独立，不受此处影响）
    if (config.addMetadata) {
      // 保存时间（北京时间，使用 toLocaleString 格式化）
      const now = new Date();
      const timeStr = now.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');

      // 动态标签（跳过非字符串对象）
      const allTags = [];
      if (metadata.tags && metadata.tags.length > 0) {
        metadata.tags.forEach(tag => {
          // 只接受字符串类型，跳过 API 偶尔返回的对象（如 tag_groups）
          if (typeof tag !== 'string') return;
          const cleanTag = tag.trim();
          if (cleanTag && !allTags.includes(cleanTag)) allTags.push(cleanTag);
        });
      }
      // 去掉 YAML 内联数组不安全的字符：逗号、方括号、引号
      const tagsArray = allTags.map(t => t.replace(/[,\[\]"']/g, '')).filter(t => t);
      const tagsStr = tagsArray.join(', ');

      // 字段名（用户可自定义，默认中文；tags 固定为英文）
      const k = {
        source:      config.metaSourceKey      || '来源',
        title:       config.metaTitleKey       || '标题',
        author:      config.metaAuthorKey      || '作者',
        category:    config.metaCategoryKey    || '类别',
        saveTime:    config.metaSaveTimeKey    || '保存时间',
        platform:    config.metaPlatformKey    || '平台',
        readStatus:  config.metaReadStatusKey  || '阅读状态',
        organize:    config.metaOrganizeKey    || '整理',
        commentCount:config.metaCommentCountKey|| '评论数',
      };

      // YAML 安全字符串：含特殊字符时用双引号包裹，内部 " 转义
      function yamlStr(val) {
        if (val === null || val === undefined) return '""';
        const s = String(val);
        // 以下情况需要引号：含 YAML 特殊字符、首尾空白、空字符串
        if (!s || /[:\[\]{}#&*!|>'"%@`,\n\r\\]/.test(s) || /^\s|\s$/.test(s)) {
          return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
        }
        return s;
      }

      let fm = '---\n';
      // URL 可能含 # 锚点，YAML 中 # 前有空格会被解析为注释，必须引号包裹
      if (config.metaSource !== false)       fm += `${k.source}: ${yamlStr(metadata.url)}\n`;
      if (config.metaTitle !== false)        fm += `${k.title}: ${yamlStr(metadata.title)}\n`;
      // 作者：有主页URL时合并为 [作者名](URL) 格式，Obsidian 阅读模式可点击
      if (config.metaAuthor !== false) {
        const authorVal = (config.metaAuthorUrl !== false && metadata.authorUrl)
          ? `"[${metadata.author.replace(/"/g, '\\"')}](${metadata.authorUrl})"`
          : yamlStr(metadata.author);
        fm += `${k.author}: ${authorVal}\n`;
      }
      if (config.metaCategory !== false)     fm += `${k.category}: ${yamlStr(metadata.category || '未分类')}\n`;
      if (config.metaTags !== false)         fm += `tags: [${tagsStr}]\n`;
      if (config.metaSaveTime !== false)     fm += `${k.saveTime}: ${timeStr}\n`;
      if (config.metaPlatform !== false)     fm += `${k.platform}: "${detectPlatform()}"\n`;
      if (config.metaReadStatus !== false)   fm += `${k.readStatus}: false\n`;
      if (config.metaOrganize !== false)     fm += `${k.organize}: false\n`;
      if (config.metaCommentCount !== false) fm += `${k.commentCount}: ${comments.length}\n`;
      fm += '---\n\n';
      markdown += fm;
    }

    // 可选：在正文前追加 Obsidian Callout 形式的“帖子信息”引用框
    if (config.addPostInfoCallout) {
      const exportTime = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const tagsText = (metadata.tags || [])
        .filter(t => typeof t === 'string' && t.trim())
        .join(', ') || '无';
      const followMeta = config.calloutFollowMetadata !== false;
      const fieldSwitches = followMeta
        ? {
            source: config.metaSource !== false,
            title: config.metaTitle !== false,
            author: config.metaAuthor !== false,
            category: config.metaCategory !== false,
            tags: config.metaTags !== false,
            saveTime: config.metaSaveTime !== false,
            platform: config.metaPlatform !== false,
            commentCount: config.metaCommentCount !== false,
          }
        : {
            source: config.calloutSource !== false,
            title: config.calloutTitle !== false,
            author: config.calloutAuthor !== false,
            category: config.calloutCategory !== false,
            tags: config.calloutTags !== false,
            saveTime: config.calloutSaveTime !== false,
            platform: config.calloutPlatform !== false,
            commentCount: config.calloutCommentCount !== false,
          };
      if (!Object.values(fieldSwitches).some(Boolean)) {
        fieldSwitches.source = true;
      }
      const k = followMeta
        ? {
            source:       config.metaSourceKey       || '来源',
            title:        config.metaTitleKey        || '标题',
            author:       config.metaAuthorKey       || '作者',
            category:     config.metaCategoryKey     || '类别',
            saveTime:     config.metaSaveTimeKey     || '保存时间',
            platform:     config.metaPlatformKey     || '平台',
            commentCount: config.metaCommentCountKey || '评论数',
          }
        : {
            source:       config.calloutSourceKey       || '来源',
            title:        config.calloutTitleKey        || '标题',
            author:       config.calloutAuthorKey       || '作者',
            category:     config.calloutCategoryKey     || '类别',
            saveTime:     config.calloutSaveTimeKey     || '保存时间',
            platform:     config.calloutPlatformKey     || '平台',
            commentCount: config.calloutCommentCountKey || '评论数',
          };
      const authorText = metadata.author || '未知';

      markdown += `> [!info] 帖子信息\n`;
      if (fieldSwitches.source) markdown += `> - ${k.source}: [${metadata.url}](${metadata.url})\n`;
      if (fieldSwitches.title) markdown += `> - ${k.title}: ${metadata.title || '无标题'}\n`;
      if (fieldSwitches.author) markdown += `> - ${k.author}: ${authorText}\n`;
      if (fieldSwitches.category) markdown += `> - ${k.category}: ${metadata.category || '未分类'}\n`;
      if (fieldSwitches.tags) markdown += `> - tags: ${tagsText}\n`;
      if (fieldSwitches.saveTime) markdown += `> - ${k.saveTime}: ${exportTime}\n`;
      if (fieldSwitches.platform) markdown += `> - ${k.platform}: ${detectPlatform()}\n`;
      if (fieldSwitches.commentCount) markdown += `> - ${k.commentCount}: ${Array.isArray(comments) ? comments.length : 0}\n`;
      markdown += '\n';
    }

    // 添加标题和正文
    // 开启 frontmatter 时，标题由属性区承载；关闭 frontmatter 时保留正文 H1。
    if (!config.addMetadata) {
      markdown += `# ${metadata.title}\n\n`;
    }
    markdown += mainContent;

    // V1.1.2: 添加 Reactions（打call/Boosts）渲染
    if (config.renderReactions && reactions && reactions.length > 0) {
      markdown += '\n\n---\n\n';
      const forumOrigin = metadata.url ? new URL(metadata.url).origin : '';
      markdown += renderReactionsToMarkdown(reactions, forumOrigin);
    }

    // 添加评论区
    if (config.saveComments && comments.length > 0) {
      markdown += '\n\n---\n\n';
      markdown += `## 评论区（共${comments.length}条）\n\n`;

      for (const comment of comments) {
        // V5.5-raw: 优先使用 post.raw，回退到 Turndown
        let commentContent;
        if (comment.rawMarkdown) {
          commentContent = convertRawOrCookedToMarkdown(
            comment.rawMarkdown,
            comment.contentHTML,
            turndownService,
            keepGif,
            `评论#${comment.position || ''}`
          );
        } else {
          commentContent = convertRawOrCookedToMarkdown(
            null,
            comment.contentHTML,
            turndownService,
            keepGif,
            `评论#${comment.position || ''}`
          );
        }

        // V4.3.8: 用户名支持超链接，点击跳转到用户主页
        // 普通模式：标题自带粗体，不额外加粗
        // 折叠模式：用 <b> 标签加粗
        const usernameDisplay = comment.userUrl
          ? `[${comment.username}](${comment.userUrl})`
          : comment.username;
        const usernameDisplayHtml = comment.userUrl
          ? `<a href="${comment.userUrl}"><b>${comment.username}</b></a>`
          : `<b>${comment.username}</b>`;

        if (config.foldComments) {
          // 折叠模式：使用 <details> 标签（不用###标题）
          // V4.3.8: 在 HTML 块内，Markdown 语法不渲染，需转换为 HTML 标签
          let htmlContent = commentContent.trim();

          // 转换加粗 **text** → <strong>text</strong>（非贪婪匹配）
          htmlContent = htmlContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
          // 转换删除线 ~~text~~ → <del>text</del>
          htmlContent = htmlContent.replace(/~~(.+?)~~/g, '<del>$1</del>');
          // 转换行内代码 `code` → <code>code</code>
          htmlContent = htmlContent.replace(/`([^`]+)`/g, '<code>$1</code>');
          // 转换链接 [text](url) → <a href="url">text</a>
          // 先保护图片语法，处理链接，再还原
          const imgPlaceholders = [];
          htmlContent = htmlContent.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
            imgPlaceholders.push(match);
            return `__IMG_PLACEHOLDER_${imgPlaceholders.length - 1}__`;
          });
          htmlContent = htmlContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
          imgPlaceholders.forEach((img, i) => {
            htmlContent = htmlContent.replace(`__IMG_PLACEHOLDER_${i}__`, img);
          });

          markdown += `<details>\n<summary><b>${comment.position}楼 - ${usernameDisplayHtml}</b></summary>\n\n`;
          markdown += htmlContent;
          markdown += '\n\n</details>\n\n';
        } else {
          // 非折叠模式：普通标题
          markdown += `### ${comment.position}楼 - ${usernameDisplay}\n\n`;
          markdown += commentContent.trim();
          markdown += '\n\n';
        }
      }
    }

    return markdown;
  }

  // 保存到Obsidian
  // V3.5.3: 支持 targetPostNumber 参数
  // - 为 null 或 '1' 时：保存主帖（可选带所有评论）
  // - 为字符串时：保存主帖 + 该楼层评论
  // - V5.4.2: 为数组时：保存主帖 + 多个指定楼层评论（合并为一个文件）
  async function saveToObsidian(targetPostNumber = null, saveTarget = null) {
    try {
      // 获取配置
      const config = await chrome.storage.sync.get(DEFAULT_CONFIG);
      // V4.2.3: 获取语言设置，用于 Notion 属性默认值
      const langResult = await chrome.storage.local.get(['uiLanguage']);
      const uiLang = langResult.uiLanguage || 'zh';

      // V1.1.2: 长按菜单指定目标时，覆盖配置
      if (saveTarget) {
        // 先关闭所有目标
        config.saveToObsidian = false;
        config.saveToFeishu = false;
        config.saveToNotion = false;
        config.saveToYuque = false;
        config.saveToSiyuan = false;
        config.saveToWebDAV = false;
        config.saveToBaidu = false;
        config.exportHtml = false;
        config.exportMd = false;
        // 再开启指定目标
        switch (saveTarget) {
          case 'obsidian': config.saveToObsidian = true; break;
          case 'feishu': config.saveToFeishu = true; break;
          case 'notion': config.saveToNotion = true; break;
          case 'yuque': config.saveToYuque = true; break;
          case 'siyuan': config.saveToSiyuan = true; break;
          case 'webdav': config.saveToWebDAV = true; break;
          case 'baidu': config.saveToBaidu = true; break;
          case 'html': config.exportHtml = true; break;
          case 'md': config.exportMd = true; break;
          case 'all':
            config.saveToObsidian = true;
            config.saveToFeishu = true;
            config.saveToNotion = true;
            config.saveToYuque = true;
            config.saveToSiyuan = true;
            config.saveToWebDAV = true;
            config.saveToBaidu = true;
            config.exportHtml = true;
            config.exportMd = true;
            break;
        }
        console.log('[Discourse Saver] 长按菜单指定目标:', saveTarget);
      }

      console.log('[Discourse Saver] 读取到的配置:', config);
      console.log('[Discourse Saver] UI语言:', uiLang);
      console.log('[Discourse Saver] 目标楼层:', targetPostNumber || '主帖');

      // V5.5.7: 优先从 URL 获取 topicId，再调 API 提取主帖（不依赖 DOM，任意滚动位置均可）
      const topicIdFromUrl = window.location.pathname.match(/\/t\/[^/]+\/(\d+)/)?.[1] || null;
      let extracted = null;

      if (topicIdFromUrl) {
        showNotification('正在通过 API 获取帖子内容...', 'info');
        extracted = await extractContentViaAPI(topicIdFromUrl);
      }

      // API 失败时降级到 DOM（兼容非标准 Discourse 或 API 被限流的情况）
      if (!extracted) {
        console.log('[Discourse Saver] API 提取失败，回退 DOM...');
        extracted = extractContent();
        if (!extracted) {
          // 短暂等待 SPA 渲染后再试一次
          await new Promise(r => setTimeout(r, 600));
          extracted = extractContent();
        }
      }

      if (!extracted) {
        showNotification('无法提取帖子内容，请确认当前在帖子页面', 'error');
        rlog('WARN', '内容提取失败: topicId=' + topicIdFromUrl + ' DOM title=' + !!document.querySelector('#topic-title h1'));
        return;
      }

      const { title, contentHTML, url, author, authorUrl, createdAt, topicId, category, tags, reactions } = extracted;
      // V5.5.7: API 提取时 rawMarkdown 已内含，不需要后面再单独 fetchRawMainPost
      const preloadedRaw = extracted.rawMarkdown || null;

      // V3.5.3: 根据目标楼层决定评论处理方式
      // V5.4.2: targetPostNumber 可以是数组（多楼层合并保存）
      let comments = [];
      const isMultiFloor = Array.isArray(targetPostNumber);
      const isSingleCommentMode = !isMultiFloor && targetPostNumber && targetPostNumber !== '1';

      if (isMultiFloor) {
        // V5.4.2: 多楼层模式 — 通过API获取评论，按楼层号过滤
        const floors = targetPostNumber.filter(f => f !== 1); // 主帖不当评论
        if (floors.length === 0) {
          showNotification('请输入2楼及以上的楼层号', 'warning');
          return;
        }
        const maxFloor = Math.max(...floors);
        showNotification(`正在通过API获取评论（最高${maxFloor}楼）...`, 'info');

        let allComments = [];
        if (topicId) {
          try {
            allComments = await extractCommentsViaAPI(
              topicId, maxFloor, false,
              (msg) => showNotification(msg, 'info')
            );
          } catch (apiErr) {
            console.warn('[Discourse Saver] API获取失败，回退DOM:', apiErr);
          }
        }

        // 按楼层号过滤
        const floorSet = new Set(floors.map(String));
        comments = allComments.filter(c => floorSet.has(c.position));

        // DOM回退：API没拿到的楼层尝试从DOM补
        if (comments.length < floors.length) {
          const gotFloors = new Set(comments.map(c => c.position));
          for (const floor of floors) {
            if (!gotFloors.has(String(floor))) {
              const domComment = extractSingleComment(String(floor));
              if (domComment) comments.push(domComment);
            }
          }
          comments.sort((a, b) => parseInt(a.position) - parseInt(b.position));
        }

        if (comments.length === 0) {
          showNotification('未找到任何指定楼层的评论', 'error');
          return;
        }
        const notFound = floors.filter(f => !comments.some(c => c.position === String(f)));
        if (notFound.length > 0) {
          showNotification(`${notFound.length} 楼未找到: ${notFound.slice(0, 5).join(',')}${notFound.length > 5 ? '...' : ''}`, 'warning');
        } else {
          showNotification(`已获取 ${comments.length} 楼评论`, 'info');
        }
      } else if (isSingleCommentMode) {
        // 单条评论模式：先尝试DOM，失败后走API
        showNotification(`正在提取第${targetPostNumber}楼评论...`, 'info');
        let singleComment = extractSingleComment(targetPostNumber);
        if (!singleComment && topicId) {
          // DOM没找到（可能没加载到），走API
          console.log(`[Discourse Saver] DOM未找到${targetPostNumber}楼，尝试API`);
          try {
            const apiComments = await extractCommentsViaAPI(
              topicId, parseInt(targetPostNumber), false, null
            );
            singleComment = apiComments.find(c => c.position === targetPostNumber);
          } catch (e) {
            console.warn('[Discourse Saver] API回退失败:', e);
          }
        }
        if (singleComment) {
          comments = [singleComment];
        } else {
          showNotification(`未找到第${targetPostNumber}楼评论`, 'error');
          return;
        }
      } else if (config.saveComments) {
        // 主帖模式 + 启用了保存评论：提取评论
        // V4.3.7: 三种互斥模式：
        // 1. 保存全部 - 获取所有评论
        // 2. 楼层范围 - 获取到指定楼层的评论
        // 3. 自定义数量 - 获取指定数量的评论
        let effectiveCommentCount = config.commentCount;
        let effectiveSaveAll = config.saveAllComments;

        if (config.useFloorRange) {
          // 楼层范围模式：获取到 floorTo 楼的评论（与自定义数量互斥）
          const floorTo = config.floorTo || 100;
          effectiveCommentCount = floorTo;
          console.log(`[Discourse Saver] 楼层范围模式: 获取前 ${floorTo} 楼的评论`);
        }

        // V4.0.6: 根据配置决定使用DOM还是API获取评论
        const useAPI = effectiveSaveAll || effectiveCommentCount > 30;

        if (useAPI && topicId) {
          // 使用API获取评论（解决懒加载问题）
          showNotification('正在通过API加载评论...', 'info');
          try {
            comments = await extractCommentsViaAPI(
              topicId,
              effectiveCommentCount,
              effectiveSaveAll,
              (msg) => showNotification(msg, 'info')
            );
          } catch (apiError) {
            console.warn('[Discourse Saver] API获取失败，回退到DOM方式:', apiError);
            showNotification('API获取失败，使用DOM方式...', 'info');
            comments = extractComments(effectiveCommentCount);
          }
        } else {
          // 使用DOM方式获取（少量评论时更快）
          showNotification('正在提取评论...', 'info');
          comments = extractComments(effectiveCommentCount);
        }
      }

      // V4.3.7: 根据楼层范围过滤评论
      if (config.useFloorRange && comments.length > 0) {
        const floorFrom = config.floorFrom || 1;
        const floorTo = config.floorTo || 100;
        const originalCount = comments.length;
        comments = comments.filter(c => {
          const pos = parseInt(c.position);
          return pos >= floorFrom && pos <= floorTo;
        });
        console.log(`[Discourse Saver] 楼层范围过滤: ${floorFrom}-${floorTo}楼, 原${originalCount}条 → ${comments.length}条`);
      }

      // 转换为Markdown（带评论）
      // 对于单条/多楼层评论模式，强制使用非折叠格式
      const effectiveConfig = (isSingleCommentMode || isMultiFloor)
        ? { ...config, saveComments: true, foldComments: false }
        : config;

      // V5.5-raw: 获取主帖原始 Markdown（仅在保存主帖时使用）
      // V5.5.7: API 提取路径已包含 raw，preloadedRaw 直接复用，避免重复请求
      let rawMainContent = null;
      let apiCookedHtml = null;
      if (!isSingleCommentMode && !isMultiFloor) {
        if (preloadedRaw) {
          rawMainContent = preloadedRaw;
          apiCookedHtml = contentHTML; // API 提取时 contentHTML 就是 cooked HTML
          console.log('[Discourse Saver] 使用预加载 raw Markdown，跳过 fetchRawMainPost');
        } else if (topicId) {
          const fetched = await fetchRawMainPost(topicId);
          rawMainContent = fetched.rawText;
          apiCookedHtml = fetched.cookedHtml;
        }
      }

      let markdown = convertToMarkdownWithComments(
        contentHTML,
        { title, url, author, authorUrl: authorUrl || '', createdAt: createdAt || null, topicId, category, tags },
        comments,
        effectiveConfig,
        rawMainContent,
        apiCookedHtml,
        reactions || []  // V1.1.2: 传入 Reactions 数据
      );

      const shouldSaveToObsidian = config.saveToObsidian !== false; // 默认为 true

      // V5.5.7: 先解析 short-url 跳转为真实 CDN URL（全平台通用，必须在 originalMarkdown 赋值前执行）
      // 飞书MD附件、HTML导出没有图片库，只能用外链 —— CDN URL 是公开的，short-url 需要登录
      // OB 如果开了 embedImages，后续从 CDN URL 做 Base64 反而更稳（CDN 无需认证）
      if (config.includeImages) {
        markdown = await resolveImageUrlsInMarkdown(markdown);
      }
      markdown = normalizeImageMarkdownFinal(markdown);

      // V5.3.2: 保留原始markdown（原链接），供飞书/Notion/HTML等非OB平台使用
      const originalMarkdown = markdown;

      // V5.3.2: 下载媒体到Vault并替换为Wiki引用（仅用于Obsidian）
      console.log('[Discourse Saver] 媒体下载检查: downloadImages=' + config.downloadImages + ', restApiKey=' + (config.restApiKey ? '已设置(' + config.restApiKey.length + '字符)' : '未设置'));
      if (shouldSaveToObsidian && config.downloadImages && config.restApiKey) {
        rlog('INFO', '下载媒体到Vault, port=' + (config.restApiPort || 27123));
        const _sanitizeSeg = (seg, maxLen = 72) => {
          let s = String(seg || '')
            .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/[. ]+$/g, '');
          if (!s) s = 'untitled';
          if (s.length > maxLen) s = s.substring(0, maxLen).replace(/[. ]+$/g, '');
          return s || 'untitled';
        };
        const _sanitizePath = (path) => String(path || '').split('/').filter(Boolean).map(seg => _sanitizeSeg(seg)).join('/');
        const _safeTitle = title ? _sanitizeSeg(title.replace(/[《》]/g, '').replace(/\s+/g, '-').replace(/^[-\s]+|[-\s]+$/g, ''), 60) : '';
        const _rawTpl = config.mediaFolderName || 'media';
        let _mediaPreviewPath = _rawTpl.replace(/\{title\}/g, _safeTitle || 'untitled');
        if (config.mediaFolderPerTitle && _safeTitle && !_rawTpl.includes('{title}')) _mediaPreviewPath = _mediaPreviewPath.replace(/\/+$/, '') + '/' + _safeTitle;
        _mediaPreviewPath = _sanitizePath(_mediaPreviewPath);
        showNotification(`正在下载媒体文件到 ${_mediaPreviewPath}...`, 'info');
        markdown = await downloadAndReplaceMedia(markdown, config, title);
      } else if (shouldSaveToObsidian && config.downloadImages && !config.restApiKey) {
        console.warn('[Discourse Saver] 已勾选下载媒体但未填写 REST API Key');
        rlog('WARN', '媒体下载跳过: 未填写 REST API Key');
      }
      // V3.6.0: 处理图片嵌入（Base64）— 与downloadImages互斥
      else if (shouldSaveToObsidian && config.embedImages) {
        showNotification('正在处理图片嵌入...', 'info');
        markdown = await processMarkdownImages(markdown, config);
      }
      markdown = normalizeImageMarkdownFinal(markdown);

      // 构建文件名：只用标题
      // V3.5.3: 单条评论模式时添加楼层号后缀
      const sanitizeFileSegment = (seg, maxLen = 80) => {
        const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
        let s = String(seg || '')
          .replace(/[《》]/g, '')
          .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^[\s.-]+|[\s.-]+$/g, '');
        if (!s) s = 'untitled';
        if (RESERVED.test(s)) s = `_${s}`;
        if (s.length > maxLen) s = s.substring(0, maxLen).replace(/[\s.-]+$/g, '');
        return s || 'untitled';
      };
      const sanitizedTitle = sanitizeFileSegment(title, 80);

      // 评论模式：文件名加楼层号，避免覆盖主帖文件
      let fileName;
      if (isMultiFloor) {
        // 多楼层：生成简洁的楼层描述
        const floors = targetPostNumber.filter(f => f !== 1);
        const floorDesc = formatFloorRange(floors);
        fileName = sanitizeFileSegment(`${sanitizedTitle}-${floorDesc}`, 100);
      } else if (isSingleCommentMode) {
        fileName = sanitizeFileSegment(`${sanitizedTitle}-${targetPostNumber}楼`, 100);
      } else {
        fileName = sanitizedTitle;
      }
      if (!fileName) fileName = `untitled-${Date.now()}`;

      // 构建Obsidian URI
      const filePath = config.folderPath ? `${config.folderPath}/${fileName}` : fileName;
      const vaultParam = config.vaultName && config.vaultName.trim() !== ''
        ? 'vault=' + encodeURIComponent(config.vaultName.trim()) + '&'
        : '';

      // 构建普通URI（用于检测长度）
      let uri = 'obsidian://new?' + vaultParam;
      uri += 'file=' + encodeURIComponent(filePath) + '&';
      uri += 'overwrite=true&';
      uri += 'content=' + encodeURIComponent(markdown);

      // V5.3.1: 增强保存详情日志
      console.log('[Discourse Saver] === Obsidian 保存详情 ===');
      console.log('[Discourse Saver] 文件名:', fileName + '.md');
      console.log('[Discourse Saver] 保存路径:', filePath + '.md');
      console.log('[Discourse Saver] Vault:', config.vaultName || '(默认)');
      console.log('[Discourse Saver] 文件夹:', config.folderPath || '(根目录)');
      console.log('[Discourse Saver] 内容大小:', markdown.length + '字符');
      console.log('[Discourse Saver] 评论数量:', comments.length);
      console.log('[Discourse Saver] 使用Advanced URI:', config.useAdvancedUri);
      console.log('[Discourse Saver] URI长度:', uri.length);

      // V3.4.1: Advanced URI 优先模式
      // 当启用 Advanced URI 时，始终使用它（更可靠，无大小限制）
      const URI_LENGTH_LIMIT = 100000;

      if (shouldSaveToObsidian && config.useAdvancedUri) {
        // 始终使用 Advanced URI 插件（更可靠）
        console.log('[Discourse Saver] 使用 Advanced URI 插件（始终模式）');

        try {
          await navigator.clipboard.writeText(markdown);

          // 构建 Advanced URI
          let advancedUri = 'obsidian://advanced-uri?' + vaultParam;
          advancedUri += 'filepath=' + encodeURIComponent(filePath + '.md') + '&';
          advancedUri += 'clipboard=true&';  // 自动从剪贴板读取内容
          advancedUri += 'mode=overwrite';

          // V5.5.7: 用隐藏 <a> 点击代替 window.location.href
          // window.location.href 会导致当前页卸载，Chrome 可能吊销剪贴板权限
          // 隐藏 <a> 点击触发 obsidian:// 协议，当前页保持不动，剪贴板读取更可靠
          const tempLink = document.createElement('a');
          tempLink.href = advancedUri;
          tempLink.style.display = 'none';
          document.body.appendChild(tempLink);
          tempLink.click();
          setTimeout(() => document.body.removeChild(tempLink), 1000);

          // 显示成功提示
          let msg;
          if (isMultiFloor) {
            msg = `已保存主帖+${comments.length}楼评论`;
            showNotification(msg, 'success');
            rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath + ' (多楼层' + comments.length + '条)');
          } else if (isSingleCommentMode) {
            msg = `已保存主帖+第${targetPostNumber}楼评论`;
            showNotification(msg, 'success');
            rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath + ' (评论#' + targetPostNumber + ')');
          } else if (config.saveComments && comments.length > 0) {
            if (comments.length < config.commentCount) {
              msg = `已保存（获取到${comments.length}条评论，如需更多请先滚动页面加载）`;
              showNotification(msg, 'warning');
            } else {
              msg = `已保存到Obsidian（含${comments.length}条评论）`;
              showNotification(msg, 'success');
            }
            rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath + ' (' + comments.length + '条评论)');
          } else if (config.saveComments && comments.length === 0) {
            showNotification('已保存到Obsidian（未找到评论）', 'info');
            rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath + ' (无评论)');
          } else {
            showNotification('已保存到Obsidian', 'success');
            rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath);
          }
        } catch (clipboardError) {
          console.error('[Discourse Saver] 剪贴板写入失败:', clipboardError);
          showNotification('剪贴板不可用，请手动复制', 'error');
        }
      } else if (shouldSaveToObsidian && uri.length > URI_LENGTH_LIMIT) {
        // 未启用 Advanced URI 但内容过大，弹窗提示安装
        console.log('[Discourse Saver] URI过长 (' + uri.length + ' 字符)，需要 Advanced URI');
        showAdvancedUriPrompt(markdown, filePath, vaultParam, title, comments.length);
      } else if (shouldSaveToObsidian) {
        // 未启用 Advanced URI 且内容不大，使用普通 URI
        // V5.5.7: 同样用隐藏 <a> 点击，避免页面卸载导致 Obsidian 协议处理异常
        const tempLink2 = document.createElement('a');
        tempLink2.href = uri;
        tempLink2.style.display = 'none';
        document.body.appendChild(tempLink2);
        tempLink2.click();
        setTimeout(() => document.body.removeChild(tempLink2), 1000);

        // 显示成功提示
        let msg;
        if (isSingleCommentMode) {
          // 单条评论模式
          msg = `已保存主帖+第${targetPostNumber}楼评论`;
          showNotification(msg, 'success');
          rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath + ' (评论#' + targetPostNumber + ')');
        } else if (config.saveComments && comments.length > 0) {
          if (comments.length < config.commentCount) {
            msg = `已保存（获取到${comments.length}条评论，如需更多请先滚动页面加载）`;
            showNotification(msg, 'warning');
          } else {
            msg = `已保存到Obsidian（含${comments.length}条评论）`;
            showNotification(msg, 'success');
          }
          rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath + ' (' + comments.length + '条评论)');
        } else if (config.saveComments && comments.length === 0) {
          showNotification('已保存到Obsidian（未找到评论）', 'info');
          rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath + ' (无评论)');
        } else {
          showNotification('已保存到Obsidian', 'success');
          rlog('INFO', '运行成功，帖子已保存到 Obsidian: ' + filePath);
        }
      }

      // V4.2.6: 导出 HTML 文件
      if (config.exportHtml) {
        console.log('[Discourse Saver] 开始导出 HTML 文件...');
        showNotification('正在生成 HTML 文件...', 'info');

        // 使用 setTimeout 让 UI 有时间显示加载提示
        setTimeout(() => {
          try {
            const htmlContent = convertMarkdownToHtml(originalMarkdown, {
              title: title,
              author: author,
              url: url,
              category: category,    // V4.3.7: 分类
              tags: tags             // V4.3.7: 标签
            });

            if (htmlContent) {
              // V4.3.6: HTML文件命名与Obsidian保持一致，区分主帖和分帖
              let safeFileName;
              if (isMultiFloor) {
                const floors = targetPostNumber.filter(f => f !== 1);
                safeFileName = `${sanitizeFileName(title)}-${formatFloorRange(floors)}`;
              } else if (isSingleCommentMode) {
                safeFileName = `${sanitizeFileName(title)}-${targetPostNumber}楼`;
              } else {
                safeFileName = sanitizeFileName(title) || 'discourse-export';
              }

              // V4.3.6: 使用配置的HTML导出文件夹
              const htmlFolder = config.htmlExportFolder || '';
              const fullFileName = htmlFolder
                ? `${htmlFolder}/${safeFileName}.html`
                : `${safeFileName}.html`;

              // 通过 background.js 下载（支持自定义路径）
              try {
                chrome.runtime.sendMessage({
                  action: 'downloadHtml',
                  filename: fullFileName,
                  content: htmlContent
                }, response => {
                  if (chrome.runtime.lastError) {
                    console.error('[Discourse Saver] HTML 导出消息发送失败:', chrome.runtime.lastError.message);
                    showNotification('HTML 导出失败: 扩展通信错误', 'error');
                    return;
                  }
                  if (response?.success) {
                    showNotification('HTML 文件已导出', 'success');
                    console.log('[Discourse Saver] HTML 文件导出成功');
                    rlog('INFO', '运行成功，HTML文件已导出: ' + fullFileName);
                  } else {
                    showNotification('HTML 导出失败: ' + (response?.error || '未知错误'), 'error');
                    console.error('[Discourse Saver] HTML 导出失败:', response?.error);
                  }
                });
              } catch (sendErr) {
                console.error('[Discourse Saver] HTML 导出消息发送异常:', sendErr);
                showNotification('HTML 导出失败: 扩展上下文已失效', 'error');
              }
            } else {
              console.error('[Discourse Saver] HTML 转换失败');
              showNotification('HTML 导出失败：转换错误', 'error');
            }
          } catch (htmlError) {
            console.error('[Discourse Saver] HTML 导出异常:', htmlError);
            showNotification('HTML 导出失败: ' + htmlError.message, 'error');
          }
        }, 50);
      }

      // V1.1.2: 导出 MD 文件到本地
      if (config.exportMd) {
        console.log('[Discourse Saver] 开始导出 MD 文件...');
        showNotification('正在生成 MD 文件...', 'info');

        setTimeout(() => {
          try {
            // 使用已生成的 markdown 内容（与 Obsidian 保存的内容一致）
            const mdContent = markdown;

            if (mdContent) {
              // MD 文件命名与 Obsidian/HTML 保持一致
              let safeMdFileName;
              if (isMultiFloor) {
                const floors = targetPostNumber.filter(f => f !== 1);
                safeMdFileName = `${sanitizeFileName(title)}-${formatFloorRange(floors)}`;
              } else if (isSingleCommentMode) {
                safeMdFileName = `${sanitizeFileName(title)}-${targetPostNumber}楼`;
              } else {
                safeMdFileName = sanitizeFileName(title) || 'discourse-export';
              }

              const mdFolder = config.mdExportFolder || '';
              const fullMdFileName = mdFolder
                ? `${mdFolder}/${safeMdFileName}.md`
                : `${safeMdFileName}.md`;

              try {
                chrome.runtime.sendMessage({
                  action: 'downloadMd',
                  filename: fullMdFileName,
                  content: mdContent
                }, response => {
                  if (chrome.runtime.lastError) {
                    console.error('[Discourse Saver] MD 导出消息发送失败:', chrome.runtime.lastError.message);
                    showNotification('MD 导出失败: 扩展通信错误', 'error');
                    return;
                  }
                  if (response?.success) {
                    showNotification('MD 文件已导出', 'success');
                    console.log('[Discourse Saver] MD 文件导出成功');
                    rlog('INFO', '运行成功，MD文件已导出: ' + fullMdFileName);
                  } else {
                    showNotification('MD 导出失败: ' + (response?.error || '未知错误'), 'error');
                    console.error('[Discourse Saver] MD 导出失败:', response?.error);
                  }
                });
              } catch (sendErr) {
                console.error('[Discourse Saver] MD 导出消息发送异常:', sendErr);
                showNotification('MD 导出失败: 扩展上下文已失效', 'error');
              }
            } else {
              console.error('[Discourse Saver] MD 内容为空');
              showNotification('MD 导出失败：内容为空', 'error');
            }
          } catch (mdError) {
            console.error('[Discourse Saver] MD 导出异常:', mdError);
            showNotification('MD 导出失败: ' + mdError.message, 'error');
          }
        }, 100);
      }

      // V4.2.2: 飞书和 Notion 并行保存（感谢 @Gannyn 提供并行保存方案）
      // 检查配置是否完整
      const feishuConfigComplete = config.saveToFeishu &&
        config.feishuAppId &&
        config.feishuAppSecret &&
        config.feishuAppToken &&
        config.feishuTableId;

      // V5.3.1: 配置不完整时提示用户，而非静默跳过
      if (config.saveToFeishu && !feishuConfigComplete) {
        const missing = [];
        if (!config.feishuAppId) missing.push('App ID');
        if (!config.feishuAppSecret) missing.push('App Secret');
        if (!config.feishuAppToken) missing.push('App Token');
        if (!config.feishuTableId) missing.push('Table ID');
        showNotification('飞书配置不完整，缺少: ' + missing.join(', '), 'warning');
        rlog('WARN', '飞书保存跳过: 配置不完整，缺少 ' + missing.join(', '));
      }

      const notionConfigComplete = config.saveToNotion &&
        config.notionToken &&
        config.notionDatabaseId;

      if (config.saveToNotion && !notionConfigComplete) {
        const missing = [];
        if (!config.notionToken) missing.push('API Token');
        if (!config.notionDatabaseId) missing.push('Database ID');
        showNotification('Notion 配置不完整，缺少: ' + missing.join(', '), 'warning');
        rlog('WARN', 'Notion 保存跳过: 配置不完整，缺少 ' + missing.join(', '));
      }

      // 构建并行保存任务
      const remoteSaveTasks = [];

      // 准备飞书保存任务
      if (feishuConfigComplete) {
        console.log('[Discourse Saver→飞书] 检测到飞书配置，准备保存...');
        showNotification('正在保存到飞书...', 'info');

        // V3.5.5: 统一清理URL，移除查询参数和锚点，确保URL一致性
        let cleanUrl = url.replace(/#.*$/, '').replace(/\?.*$/, '');

        // V3.5.4: 评论书签保存时，URL和标题加上楼层标识
        let feishuUrl = cleanUrl;
        let feishuTitle = title;
        if (isMultiFloor) {
          const floors = targetPostNumber.filter(f => f !== 1);
          const floorDesc = formatFloorRange(floors);
          feishuTitle = `${title} [${floorDesc}]`;
        } else if (isSingleCommentMode) {
          const match = cleanUrl.match(/^(.*\/t\/[^/]+\/\d+)(\/\d+)?$/);
          if (match) {
            cleanUrl = match[1];
          }
          feishuUrl = `${cleanUrl}/${targetPostNumber}`;
          feishuTitle = `${title} [${targetPostNumber}楼]`;
        }

        // V4.2.6: 如果需要上传 HTML 附件，生成 HTML 内容
        let feishuHtmlContent = null;
        if (config.feishuUploadHtml) {
          try {
            feishuHtmlContent = convertMarkdownToHtml(originalMarkdown, {
              title: feishuTitle,
              author: author,
              url: feishuUrl,
              category: category,
              tags: tags
            });
            console.log('[Discourse Saver→飞书] HTML 内容已生成，准备上传');
          } catch (htmlErr) {
            console.error('[Discourse Saver→飞书] HTML 生成失败:', htmlErr);
          }
        }

        const uploadContentNormalized = asBool(config.feishuUploadContent, true);
        const uploadContentAsCloudDocNormalized = asBool(config.feishuUploadContentAsCloudDoc, false);
        rlog('INFO', `[feishu] 发送保存请求: uploadContentAsCloudDoc=${uploadContentAsCloudDocNormalized}, uploadContent=${uploadContentNormalized}`);
        const feishuTask = sendMessageAsync({
          action: 'saveToFeishu',
          config: {
            apiDomain: config.feishuApiDomain || 'feishu',
            appId: config.feishuAppId,
            appSecret: config.feishuAppSecret,
            appToken: config.feishuAppToken,
            tableId: config.feishuTableId,
            uploadContent: uploadContentNormalized,  // V5.3.1: 默认true
            uploadContentAsCloudDoc: uploadContentAsCloudDocNormalized,
            uploadAttachment: asBool(config.feishuUploadAttachment, false),
            uploadHtmlAttachment: asBool(config.feishuUploadHtml, false)  // V4.2.6
          },
          postData: {
            title: feishuTitle,
            url: feishuUrl,
            author: author,
            authorUrl: authorUrl || '',
            content: originalMarkdown,
            htmlContent: feishuHtmlContent,  // V4.2.6: HTML 内容
            category: category || '',        // V4.3.7: 分类
            tags: tags || [],                // V4.3.7: 标签
            commentCount: comments.length
          }
        }).then(response => ({ target: 'feishu', response }));

        remoteSaveTasks.push(feishuTask);
      }

      // 准备 Notion 保存任务
      if (notionConfigComplete) {
        console.log('[Discourse Saver→Notion] 检测到 Notion 配置，准备保存...');
        showNotification('正在保存到 Notion...', 'info');

        // 清理URL，移除查询参数和锚点
        let cleanNotionUrl = url.replace(/#.*$/, '').replace(/\?.*$/, '');

        // 评论书签保存时，URL和标题加上楼层标识
        let notionUrl = cleanNotionUrl;
        let notionTitle = title;
        if (isMultiFloor) {
          const floors = targetPostNumber.filter(f => f !== 1);
          notionTitle = `${title} [${formatFloorRange(floors)}]`;
        } else if (isSingleCommentMode) {
          const match = cleanNotionUrl.match(/^(.*\/t\/[^/]+\/\d+)(\/\d+)?$/);
          if (match) {
            cleanNotionUrl = match[1];
          }
          notionUrl = `${cleanNotionUrl}/${targetPostNumber}`;
          notionTitle = `${title} [${targetPostNumber}楼]`;
        }

        // V4.3.7: 使用已提取的分类和标签（不再重复提取）
        // V4.2.3: 使用语言相关的默认值
        const notionTask = sendMessageAsync({
          action: 'saveToNotion',
          config: {
            notionToken: config.notionToken,
            notionDatabaseId: config.notionDatabaseId,
            notionPropTitle: config.notionPropTitle || getNotionPropDefault('notionPropTitle', uiLang),
            notionPropUrl: config.notionPropUrl || getNotionPropDefault('notionPropUrl', uiLang),
            notionPropAuthor: config.notionPropAuthor || getNotionPropDefault('notionPropAuthor', uiLang),
            notionPropCategory: config.notionPropCategory || getNotionPropDefault('notionPropCategory', uiLang),
            notionPropTags: config.notionPropTags || getNotionPropDefault('notionPropTags', uiLang),
            notionPropSavedDate: config.notionPropSavedDate || getNotionPropDefault('notionPropSavedDate', uiLang),
            notionPropCommentCount: config.notionPropCommentCount || getNotionPropDefault('notionPropCommentCount', uiLang)
          },
          postData: {
            title: notionTitle,
            url: notionUrl,
            author: author,
            content: originalMarkdown,
            category: category || '',
            tags: tags || [],
            commentCount: comments.length
          }
        }).then(response => ({ target: 'notion', response }));

        remoteSaveTasks.push(notionTask);
      }

      // 准备语雀保存任务
      const yuqueConfigComplete = config.saveToYuque &&
        config.yuqueToken &&
        config.yuqueRepoNamespace;

      if (config.saveToYuque && !yuqueConfigComplete) {
        const missing = [];
        if (!config.yuqueToken) missing.push('Token');
        if (!config.yuqueRepoNamespace) missing.push('知识库 Namespace');
        showNotification('语雀配置不完整，缺少: ' + missing.join(', '), 'warning');
        rlog('WARN', '语雀保存跳过: 配置不完整，缺少 ' + missing.join(', '));
      }

      if (yuqueConfigComplete) {
        console.log('[Discourse Saver→语雀] 检测到语雀配置，准备保存...');
        showNotification('正在保存到语雀...', 'info');

        let cleanYuqueUrl = url.replace(/#.*$/, '').replace(/\?.*$/, '');
        let yuqueUrl = cleanYuqueUrl;
        let yuqueTitle = title;
        if (isMultiFloor) {
          const floors = targetPostNumber.filter(f => f !== 1);
          yuqueTitle = `${title} [${formatFloorRange(floors)}]`;
        } else if (isSingleCommentMode) {
          const match = cleanYuqueUrl.match(/^(.*\/t\/[^/]+\/\d+)(\/\d+)?$/);
          if (match) {
            cleanYuqueUrl = match[1];
          }
          yuqueUrl = `${cleanYuqueUrl}/${targetPostNumber}`;
          yuqueTitle = `${title} [${targetPostNumber}楼]`;
        }

        const yuqueTask = sendMessageAsync({
          action: 'saveToYuque',
          config: {
            yuqueToken: config.yuqueToken,
            yuqueRepoNamespace: config.yuqueRepoNamespace,
            yuqueDocPublic: config.yuqueDocPublic || 0
          },
          postData: {
            title: yuqueTitle,
            url: yuqueUrl,
            author: author,
            content: originalMarkdown,
            category: category || '',
            tags: tags || [],
            commentCount: comments.length
          }
        }).then(response => ({ target: 'yuque', response }));

        remoteSaveTasks.push(yuqueTask);
      }

      // 思源笔记保存
      const siyuanConfigComplete = config.saveToSiyuan &&
        config.siyuanNotebook;

      if (config.saveToSiyuan && !siyuanConfigComplete) {
        showNotification('思源笔记配置不完整，缺少: 笔记本ID', 'warning');
        rlog('WARN', '思源保存跳过: 配置不完整，缺少笔记本ID');
      }

      if (siyuanConfigComplete) {
        let cleanSiyuanUrl = url.replace(/#.*$/, '').replace(/\?.*$/, '');
        let siyuanUrl = cleanSiyuanUrl;
        let siyuanTitle = title;

        if (isMultiFloor) {
          const floors = targetPostNumber.filter(f => f !== 1);
          siyuanTitle = `${title} [${formatFloorRange(floors)}]`;
        } else if (isSingleCommentMode) {
          const match = cleanSiyuanUrl.match(/^(.*\/t\/[^/]+\/\d+)(\/\d+)?$/);
          if (match) {
            cleanSiyuanUrl = match[1];
          }
          siyuanUrl = `${cleanSiyuanUrl}/${targetPostNumber}`;
          siyuanTitle = `${title} [${targetPostNumber}楼]`;
        }

        const siyuanTask = sendMessageAsync({
          action: 'saveToSiyuan',
          config: {
            siyuanApiUrl: config.siyuanApiUrl || 'http://127.0.0.1:6806',
            siyuanToken: config.siyuanToken || '',
            siyuanNotebook: config.siyuanNotebook,
            siyuanSavePath: config.siyuanSavePath || '/Discourse收集箱'
          },
          data: {
            title: siyuanTitle,
            url: siyuanUrl,
            markdown: originalMarkdown,
            author: author,
            category: category || '',
            tags: tags || [],
            commentCount: comments.length
          }
        }).then(response => ({ target: 'siyuan', response }));

        remoteSaveTasks.push(siyuanTask);
      }

      // WebDAV 保存
      const webdavConfigComplete = config.saveToWebDAV &&
        config.webdavUrl && config.webdavUsername && config.webdavPassword;

      if (config.saveToWebDAV && !webdavConfigComplete) {
        showNotification('WebDAV 配置不完整，缺少: URL/用户名/密码', 'warning');
        rlog('WARN', 'WebDAV 保存跳过: 配置不完整');
      }

      if (webdavConfigComplete) {
        let webdavTitle = title;
        if (isMultiFloor) {
          const floors = targetPostNumber.filter(f => f !== 1);
          webdavTitle = `${title} [${formatFloorRange(floors)}]`;
        } else if (isSingleCommentMode) {
          webdavTitle = `${title} [${targetPostNumber}楼]`;
        }

        // 自动按论坛域名分文件夹
        let webdavSavePath = config.webdavPath || '/Discourse收集箱';
        if (config.webdavAutoFolder) {
          try {
            const domain = new URL(url).hostname;
            const folderName = domain.split('.')[0].replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '');
            if (folderName) {
              webdavSavePath = webdavSavePath.replace(/\/$/, '') + '/' + folderName;
            }
          } catch (e) {
            // URL 解析失败，使用默认路径
          }
        }

        const webdavTask = sendMessageAsync({
          action: 'saveToWebDAV',
          config: {
            webdavUrl: config.webdavUrl,
            webdavUsername: config.webdavUsername,
            webdavPassword: config.webdavPassword,
            webdavPath: webdavSavePath
          },
          postData: {
            title: webdavTitle,
            url: url.replace(/#.*$/, '').replace(/\?.*$/, ''),
            content: originalMarkdown,
            author: author,
            category: category || ''
          }
        }).then(response => ({ target: 'webdav', response }));

        remoteSaveTasks.push(webdavTask);
      }

      // 百度网盘保存
      const baiduConfigComplete = config.saveToBaidu;

      if (baiduConfigComplete) {
        let baiduTitle = title;
        if (isMultiFloor) {
          const floors = targetPostNumber.filter(f => f !== 1);
          baiduTitle = `${title} [${formatFloorRange(floors)}]`;
        } else if (isSingleCommentMode) {
          baiduTitle = `${title} [${targetPostNumber}楼]`;
        }

        const baiduTask = sendMessageAsync({
          action: 'saveToBaidu',
          config: {
            baiduAppFolder: config.baiduAppFolder || '/apps/ob-sync',
            baiduVaultFolder: config.baiduVaultFolder || 'Discourse收集箱',
            baiduAutoFolder: config.baiduAutoFolder || false
          },
          postData: {
            title: baiduTitle,
            url: url.replace(/#.*$/, '').replace(/\?.*$/, ''),
            content: originalMarkdown,
            author: author,
            category: category || ''
          }
        }).then(response => ({ target: 'baidu', response }));

        remoteSaveTasks.push(baiduTask);
      }

      // 并行执行所有远程保存任务
      if (remoteSaveTasks.length > 0) {
        Promise.allSettled(remoteSaveTasks).then(results => {
          results.forEach(result => {
            if (result.status === 'fulfilled') {
              const { target, response } = result.value;

              // V5.3.1: 统一处理各平台响应，消费 uploadWarnings/contentWarnings 并展示给用户
              if (target === 'feishu') {
                if (response && response.success) {
                  const actionText = response.action === 'updated' ? '已更新' : '已保存';
                  const warnings = response.uploadWarnings || [];
                  if (warnings.length > 0) {
                    showNotification(`飞书${actionText}成功，但部分内容未上传: ${warnings.join('; ')}`, 'warning');
                    rlog('WARN', '飞书' + actionText + '成功但有警告: ' + warnings.join('; '));
                  } else {
                    showNotification(`飞书${actionText}成功`, 'success');
                  }
                  rlog('INFO', '帖子已保存到飞书 (' + actionText + '), 标题: ' + title);
                } else {
                  console.error('[Discourse Saver→飞书] 保存失败:', response?.error);
                  showNotification('飞书保存失败: ' + (response?.error || '未知错误'), 'error');
                }
              } else if (target === 'notion') {
                if (response && response.success) {
                  const actionText = response.action === 'updated' ? '已更新' : '已保存';
                  const warnings = response.contentWarnings || [];
                  const archiveWarning = (response.action === 'updated' && response.oldPageArchived === false) ? '旧页面归档失败' : '';
                  const allWarnings = warnings.concat(archiveWarning ? [archiveWarning] : []);
                  if (allWarnings.length > 0) {
                    showNotification(`Notion ${actionText}成功，但: ${allWarnings.join('; ')}`, 'warning');
                    rlog('WARN', 'Notion ' + actionText + '成功但有警告: ' + allWarnings.join('; '));
                  } else {
                    showNotification(`Notion ${actionText}成功`, 'success');
                  }
                  rlog('INFO', '帖子已保存到 Notion (' + actionText + '), 标题: ' + title + (response.url ? ', URL: ' + response.url : ''));
                } else {
                  console.error('[Discourse Saver→Notion] 保存失败:', response?.error);
                  showNotification('Notion 保存失败: ' + (response?.error || '未知错误'), 'error');
                }
              } else if (target === 'yuque') {
                if (response && response.success) {
                  const actionText = response.action === 'updated' ? '已更新' : '已保存';
                  showNotification(`语雀${actionText}成功`, 'success');
                  rlog('INFO', '帖子已保存到语雀 (' + actionText + '), 标题: ' + title + (response.slug ? ', slug: ' + response.slug : ''));
                } else {
                  console.error('[Discourse Saver→语雀] 保存失败:', response?.error);
                  showNotification('语雀保存失败: ' + (response?.error || '未知错误'), 'error');
                }
              } else if (target === 'siyuan') {
                if (response && response.success) {
                  showNotification('思源笔记保存成功', 'success');
                  rlog('INFO', '帖子已保存到思源笔记, 标题: ' + title + (response.path ? ', 路径: ' + response.path : ''));
                } else {
                  console.error('[Discourse Saver→思源] 保存失败:', response?.error);
                  showNotification('思源笔记保存失败: ' + (response?.error || '未知错误'), 'error');
                }
              } else if (target === 'webdav') {
                if (response && response.success) {
                  showNotification('WebDAV 保存成功', 'success');
                  rlog('INFO', '帖子已保存到 WebDAV, 标题: ' + title + (response.path ? ', 路径: ' + response.path : ''));
                } else {
                  console.error('[Discourse Saver→WebDAV] 保存失败:', response?.error);
                  showNotification('WebDAV 保存失败: ' + (response?.error || '未知错误'), 'error');
                }
              } else if (target === 'baidu') {
                if (response && response.success) {
                  showNotification('百度网盘保存成功', 'success');
                  rlog('INFO', '帖子已保存到百度网盘, 标题: ' + title + (response.path ? ', 路径: ' + response.path : ''));
                } else {
                  console.error('[Discourse Saver→百度] 保存失败:', response?.error);
                  showNotification('百度网盘保存失败: ' + (response?.error || '未知错误'), 'error');
                }
              }
            } else {
              // Promise rejected（理论上不会发生，因为 sendMessageAsync 总是 resolve）
              console.error('[Discourse Saver] 保存任务异常:', result.reason);
            }
          });
        }).catch(err => {
          console.error('[Discourse Saver] 并行保存处理异常:', err);
        });
      }

      // V4.0.1: 如果所有保存目标都没有启用，提示用户
      // V4.2.6: 增加 exportHtml/exportMd 为有效保存目标
      if (!shouldSaveToObsidian && !feishuConfigComplete && !notionConfigComplete && !yuqueConfigComplete && !siyuanConfigComplete && !webdavConfigComplete && !baiduConfigComplete && !config.exportHtml && !config.exportMd) {
        showNotification('请在设置中至少启用一个保存目标', 'warning');
      }

    } catch (error) {
      console.error('[Discourse Saver] 保存失败:', error);
      showNotification('保存失败: ' + error.message, 'error');
    }
  }

  // V3.4: 弹窗提示安装 Advanced URI 插件
  function showAdvancedUriPrompt(markdown, filePath, vaultParam, title, commentCount) {
    // 移除旧弹窗
    const oldPrompt = document.querySelector('#linuxdo-obsidian-prompt');
    if (oldPrompt) oldPrompt.remove();

    const overlay = document.createElement('div');
    overlay.id = 'linuxdo-obsidian-prompt';
    overlay.innerHTML = `
      <div class="prompt-overlay">
        <div class="prompt-box">
          <h3>内容过大，需要安装插件</h3>
          <p>当前内容超过 100KB，原生 Obsidian URI 无法处理。</p>
          <p>请安装 <strong>Advanced URI</strong> 插件来支持大内容保存：</p>
          <ol>
            <li>打开 Obsidian → 设置 → 第三方插件</li>
            <li>搜索 "Advanced URI" 并安装</li>
            <li>启用插件后，在本插件设置中勾选"使用 Advanced URI"</li>
          </ol>
          <div class="prompt-buttons">
            <button class="btn-copy">复制内容到剪贴板</button>
            <button class="btn-close">关闭</button>
          </div>
          <p class="prompt-tip">复制后可手动在 Obsidian 中粘贴</p>
        </div>
      </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      #linuxdo-obsidian-prompt .prompt-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      }
      #linuxdo-obsidian-prompt .prompt-box {
        background: #fff;
        padding: 24px;
        border-radius: 12px;
        max-width: 420px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
      }
      #linuxdo-obsidian-prompt h3 {
        margin: 0 0 12px 0;
        color: #dc2626;
        font-size: 18px;
      }
      #linuxdo-obsidian-prompt p {
        margin: 8px 0;
        color: #333;
        font-size: 14px;
        line-height: 1.6;
      }
      #linuxdo-obsidian-prompt ol {
        margin: 12px 0;
        padding-left: 20px;
        color: #555;
        font-size: 13px;
        line-height: 1.8;
      }
      #linuxdo-obsidian-prompt strong {
        color: #2563eb;
      }
      #linuxdo-obsidian-prompt .prompt-buttons {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }
      #linuxdo-obsidian-prompt button {
        flex: 1;
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        font-family: inherit;
      }
      #linuxdo-obsidian-prompt .btn-copy {
        background: #2563eb;
        color: #fff;
      }
      #linuxdo-obsidian-prompt .btn-copy:hover {
        background: #1d4ed8;
      }
      #linuxdo-obsidian-prompt .btn-close {
        background: #f0f0f0;
        color: #666;
      }
      #linuxdo-obsidian-prompt .btn-close:hover {
        background: #e5e5e5;
      }
      #linuxdo-obsidian-prompt .prompt-tip {
        font-size: 12px !important;
        color: #888 !important;
        margin-top: 12px !important;
        text-align: center;
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // 绑定事件
    overlay.querySelector('.btn-copy').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(markdown);
        showNotification(`已复制到剪贴板（${commentCount}条评论）`, 'success');
        rlog('INFO', '运行成功，帖子已复制到剪贴板 (' + commentCount + '条评论)');
        overlay.remove();
      } catch (err) {
        showNotification('复制失败: ' + err.message, 'error');
      }
    });

    overlay.querySelector('.btn-close').addEventListener('click', () => {
      overlay.remove();
    });

    // 点击遮罩关闭
    overlay.querySelector('.prompt-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('prompt-overlay')) {
        overlay.remove();
      }
    });
  }

  // V4.2.8: 获取 HTML 导出的内联 CSS 样式（支持多主题 + 响应式 + PWA）
  function getHtmlExportStyles() {
    return `
      :root { --transition-speed: 0.3s; }
      * { margin: 0; padding: 0; box-sizing: border-box; }

      html { scroll-behavior: smooth; }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        padding-top: 70px;
        padding-bottom: env(safe-area-inset-bottom, 20px);
        line-height: 1.75;
        background: var(--bg-page);
        color: var(--text-primary);
        transition: background var(--transition-speed), color var(--transition-speed);
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        min-height: 100vh;
      }

      /* ========== 主题1: L站原风格 (Linux.do) ========== */
      [data-theme="linuxdo"] {
        --bg-page: #ffffff;
        --bg-card: #ffffff;
        --bg-code: #f4f4f4;
        --bg-quote: #e8f4fc;
        --bg-table-header: #f8f9fa;
        --bg-details: #f8f9fa;
        --bg-details-hover: #e9ecef;
        --bg-tip: linear-gradient(135deg, #4b9ed9 0%, #3a8bc9 100%);
        --text-primary: #222222;
        --text-secondary: #555555;
        --text-muted: #999999;
        --text-code: #333333;
        --border-color: #e9e9e9;
        --accent-color: #4b9ed9;
        --accent-hover: #3a8bc9;
        --quote-border: #4b9ed9;
        --shadow: 0 1px 3px rgba(0,0,0,0.08);
        --radius: 4px;
        --radius-lg: 8px;
      }

      /* ========== 主题2: 暗夜极客 (男生风格1) ========== */
      [data-theme="dark-geek"] {
        --bg-page: #0d1117;
        --bg-card: #161b22;
        --bg-code: #1f2428;
        --bg-quote: #1f2937;
        --bg-table-header: #21262d;
        --bg-details: #21262d;
        --bg-details-hover: #30363d;
        --bg-tip: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
        --text-primary: #e6edf3;
        --text-secondary: #8b949e;
        --text-muted: #6e7681;
        --text-code: #79c0ff;
        --border-color: #30363d;
        --accent-color: #00ff88;
        --accent-hover: #00cc6a;
        --quote-border: #00ff88;
        --shadow: 0 4px 20px rgba(0,255,136,0.08);
        --radius: 6px;
        --radius-lg: 10px;
      }

      /* ========== 主题3: 商务精英 (男生风格2) ========== */
      [data-theme="business"] {
        --bg-page: #f8fafc;
        --bg-card: #ffffff;
        --bg-code: #1e293b;
        --bg-quote: #f1f5f9;
        --bg-table-header: #e2e8f0;
        --bg-details: #f1f5f9;
        --bg-details-hover: #e2e8f0;
        --bg-tip: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        --text-primary: #0f172a;
        --text-secondary: #475569;
        --text-muted: #94a3b8;
        --text-code: #e2e8f0;
        --border-color: #e2e8f0;
        --accent-color: #3b82f6;
        --accent-hover: #2563eb;
        --quote-border: #3b82f6;
        --shadow: 0 1px 2px rgba(0,0,0,0.05);
        --radius: 6px;
        --radius-lg: 8px;
      }

      /* ========== 主题4: 樱花粉 (女生风格1) ========== */
      [data-theme="sakura"] {
        --bg-page: #fef7f8;
        --bg-card: #ffffff;
        --bg-code: #3d3d3d;
        --bg-quote: #fff0f3;
        --bg-table-header: #ffeef1;
        --bg-details: #fff5f7;
        --bg-details-hover: #ffecef;
        --bg-tip: linear-gradient(135deg, #ff7eb3 0%, #ff5c8a 100%);
        --text-primary: #4a4a4a;
        --text-secondary: #777777;
        --text-muted: #aaaaaa;
        --text-code: #ffb3c6;
        --border-color: #ffd6de;
        --accent-color: #ff7eb3;
        --accent-hover: #ff5c8a;
        --quote-border: #ff7eb3;
        --shadow: 0 4px 15px rgba(255,126,179,0.12);
        --radius: 12px;
        --radius-lg: 16px;
      }

      /* ========== 主题5: 薰衣草 (女生风格2) ========== */
      [data-theme="lavender"] {
        --bg-page: #faf8ff;
        --bg-card: #ffffff;
        --bg-code: #2d2a3e;
        --bg-quote: #f5f0ff;
        --bg-table-header: #efe8ff;
        --bg-details: #f5f2ff;
        --bg-details-hover: #ede6ff;
        --bg-tip: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
        --text-primary: #2e2942;
        --text-secondary: #5c5672;
        --text-muted: #9f96b8;
        --text-code: #d4bcff;
        --border-color: #e2d9f3;
        --accent-color: #a78bfa;
        --accent-hover: #8b5cf6;
        --quote-border: #a78bfa;
        --shadow: 0 4px 15px rgba(167,139,250,0.12);
        --radius: 10px;
        --radius-lg: 14px;
      }

      /* ========== 工具栏 ========== */
      .toolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: var(--bg-card);
        border-bottom: 1px solid var(--border-color);
        z-index: 1000;
        box-shadow: var(--shadow);
        transition: transform var(--transition-speed), background var(--transition-speed);
        padding-top: env(safe-area-inset-top, 0px);
      }

      .toolbar-inner {
        display: flex;
        gap: 6px;
        padding: 10px 16px;
        flex-wrap: wrap;
        justify-content: center;
        max-width: 900px;
        margin: 0 auto;
      }

      .toolbar-btn {
        padding: 6px 12px;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        background: var(--bg-card);
        color: var(--text-primary);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .toolbar-btn:hover, .toolbar-btn:active {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-color);
        transform: translateY(-1px);
      }

      .toolbar-btn.active {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-color);
      }

      .toolbar-btn.pdf-btn,
      .toolbar-btn.install-btn {
        background: var(--bg-tip);
        color: white;
        border: none;
      }

      .toolbar-btn.pdf-btn:hover,
      .toolbar-btn.install-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      /* ========== 文章容器 ========== */
      .article-container {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      /* ========== 元数据卡片 ========== */
      .metadata {
        background: var(--bg-card);
        padding: 20px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: all var(--transition-speed);
      }

      .metadata h1 {
        font-size: 20px;
        color: var(--text-primary);
        margin-bottom: 14px;
        line-height: 1.4;
        font-weight: 600;
      }

      .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        margin-bottom: 8px;
      }

      .meta-item {
        font-size: 13px;
        color: var(--text-secondary);
      }

      .meta-item strong {
        color: var(--text-primary);
        font-weight: 500;
      }

      .meta-link {
        font-size: 13px;
        color: var(--text-secondary);
        margin: 0;
        word-break: break-all;
      }

      .meta-link strong {
        color: var(--text-primary);
        font-weight: 500;
      }

      .metadata a {
        color: var(--accent-color);
        text-decoration: none;
      }

      .metadata a:hover { text-decoration: underline; }

      /* ========== 内容区域 ========== */
      .content {
        background: var(--bg-card);
        padding: 24px 20px;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow);
        border: 1px solid var(--border-color);
        transition: all var(--transition-speed);
        overflow-wrap: break-word;
        word-wrap: break-word;
      }

      .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 {
        margin: 20px 0 10px 0;
        color: var(--text-primary);
        font-weight: 600;
        line-height: 1.3;
      }

      .content h1 { font-size: 24px; }
      .content h2 { font-size: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
      .content h3 { font-size: 18px; }
      .content h4 { font-size: 16px; }
      .content p { margin: 12px 0; color: var(--text-primary); }

      /* ========== 图片增强 ========== */
      .content img {
        max-width: 100%;
        height: auto;
        border-radius: var(--radius);
        margin: 12px 0;
        display: block;
        cursor: zoom-in;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .content img:hover {
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      }

      .content img.error {
        min-height: 100px;
        background: var(--bg-details);
        border: 2px dashed var(--border-color);
        cursor: default;
      }

      .content img.error::after {
        content: '图片加载失败';
        display: block;
        text-align: center;
        color: var(--text-muted);
        padding: 20px;
      }

      /* 图片容器（带描述） */
      .content figure {
        margin: 16px 0;
        padding: 0;
      }

      .content figure img {
        margin: 0;
      }

      .content figcaption {
        font-size: 13px;
        color: var(--text-muted);
        text-align: center;
        padding: 8px 12px;
        background: var(--bg-details);
        border-radius: 0 0 var(--radius) var(--radius);
      }

      /* 图片画廊（多图并排） */
      .content .image-gallery {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;
        margin: 16px 0;
      }

      .content .image-gallery img {
        width: 100%;
        height: 180px;
        object-fit: cover;
        margin: 0;
      }

      /* Lightbox 图片放大 */
      .lightbox-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        cursor: zoom-out;
        animation: fadeIn 0.2s ease;
      }

      .lightbox-overlay.active {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .lightbox-overlay img {
        max-width: 95%;
        max-height: 95%;
        object-fit: contain;
        border-radius: var(--radius);
        box-shadow: 0 10px 50px rgba(0,0,0,0.5);
        cursor: default;
        animation: zoomIn 0.2s ease;
      }

      .lightbox-close {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.2);
        border: none;
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .lightbox-close:hover {
        background: rgba(255,255,255,0.3);
      }

      .lightbox-caption {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        color: white;
        font-size: 14px;
        padding: 8px 16px;
        background: rgba(0,0,0,0.6);
        border-radius: var(--radius);
        max-width: 80%;
        text-align: center;
      }

      @keyframes zoomIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      /* ========== 视频/音频/iframe 嵌入 ========== */
      .content iframe {
        width: 100%;
        max-width: 100%;
        aspect-ratio: 16/9;
        border: none;
        border-radius: var(--radius);
        margin: 16px 0;
        background: var(--bg-details);
      }

      .content video {
        width: 100%;
        max-width: 800px;
        border-radius: var(--radius);
        margin: 16px 0;
        background: #000;
      }

      .content audio {
        width: 100%;
        max-width: 500px;
        margin: 12px 0;
        border-radius: var(--radius);
      }

      /* 视频/文档容器 */
      .content .video-container,
      .content .embed-container {
        position: relative;
        width: 100%;
        margin: 16px 0;
        border-radius: var(--radius);
        overflow: hidden;
        background: var(--bg-details);
      }

      .content .video-container iframe,
      .content .embed-container iframe {
        margin: 0;
      }

      /* 链接预览卡片 (onebox) */
      .content .link-preview,
      .content .onebox {
        display: block;
        padding: 12px;
        margin: 14px 0;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        background: var(--bg-details);
        text-decoration: none;
        color: var(--text-primary);
        transition: all 0.2s;
      }

      .content .link-preview:hover,
      .content .onebox:hover {
        background: var(--bg-details-hover);
        border-color: var(--accent-color);
      }

      .content .link-preview img,
      .content .onebox img {
        max-height: 200px;
        object-fit: cover;
        margin-bottom: 8px;
      }

      /* PDF/文档链接样式 */
      .content .document-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        margin: 8px 0;
        background: var(--bg-details);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        color: var(--text-primary);
        text-decoration: none;
        font-size: 14px;
        transition: all 0.2s;
      }

      .content .document-link:hover {
        background: var(--bg-details-hover);
        border-color: var(--accent-color);
      }

      .content pre {
        position: relative;
        background: var(--bg-code);
        color: var(--text-code);
        padding: 14px;
        padding-top: 38px;
        border-radius: var(--radius);
        overflow-x: auto;
        margin: 14px 0;
        font-family: "SF Mono", "Fira Code", "Source Code Pro", Consolas, monospace;
        font-size: 13px;
        line-height: 1.5;
        -webkit-overflow-scrolling: touch;
      }

      /* 代码块复制按钮 */
      .copy-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        padding: 4px 10px;
        font-size: 12px;
        background: var(--bg-details);
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.2s;
        z-index: 10;
      }

      .copy-btn:hover {
        opacity: 1;
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-color);
      }

      .copy-btn.copied {
        background: #22c55e;
        color: white;
        border-color: #22c55e;
        opacity: 1;
      }

      /* 链接复制按钮 */
      .copy-link-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        margin-left: 8px;
        font-size: 12px;
        background: var(--bg-details);
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        cursor: pointer;
        transition: all 0.2s;
        vertical-align: middle;
      }

      .copy-link-btn:hover {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-color);
      }

      .copy-link-btn.copied {
        background: #22c55e;
        color: white;
        border-color: #22c55e;
      }

      /* Toast 提示 */
      .toast {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        padding: 10px 20px;
        background: var(--bg-card);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        font-size: 14px;
        opacity: 0;
        transition: all 0.3s;
        z-index: 10000;
        pointer-events: none;
      }

      .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      .content code {
        background: var(--bg-details);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: "SF Mono", "Fira Code", Consolas, monospace;
        font-size: 0.88em;
        color: var(--accent-color);
      }

      .content pre code {
        background: none;
        padding: 0;
        color: inherit;
        font-size: inherit;
      }

      .content blockquote {
        border-left: 4px solid var(--quote-border);
        padding: 12px 16px;
        margin: 14px 0;
        background: var(--bg-quote);
        border-radius: 0 var(--radius) var(--radius) 0;
        color: var(--text-secondary);
      }

      .content ul, .content ol { margin: 12px 0; padding-left: 20px; }
      .content li { margin: 6px 0; color: var(--text-primary); }
      .content a { color: var(--accent-color); text-decoration: none; }
      .content a:hover { text-decoration: underline; }
      .content hr { border: none; border-top: 1px solid var(--border-color); margin: 20px 0; }

      /* ========== 表格增强 ========== */
      .content .table-wrapper {
        position: relative;
        margin: 16px 0;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        overflow: hidden;
      }

      .content .table-toolbar {
        display: flex;
        gap: 6px;
        padding: 8px 12px;
        background: var(--bg-details);
        border-bottom: 1px solid var(--border-color);
      }

      .content .table-btn {
        padding: 4px 10px;
        font-size: 12px;
        background: var(--bg-card);
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        cursor: pointer;
        transition: all 0.2s;
      }

      .content .table-btn:hover {
        background: var(--bg-details-hover);
        color: var(--text-primary);
      }

      .content .table-btn.copied {
        background: var(--accent-color);
        color: white;
        border-color: var(--accent-color);
      }

      .content .table-scroll {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .content table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
        min-width: 100%;
      }

      .content th, .content td {
        border: 1px solid var(--border-color);
        padding: 10px 12px;
        text-align: left;
      }

      .content th {
        background: var(--bg-table-header);
        font-weight: 600;
        color: var(--text-primary);
        position: sticky;
        top: 0;
        z-index: 1;
      }

      /* 表格条纹效果 */
      .content tr:nth-child(even) td {
        background: var(--bg-details);
      }

      .content tr:hover td {
        background: var(--bg-details-hover);
      }

      /* 表格首列固定（可选） */
      .content td:first-child {
        font-weight: 500;
      }

      /* 表格数字右对齐 */
      .content td[data-type="number"] {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      /* 表格全屏模式 */
      .table-fullscreen {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        margin: 0 !important;
        border-radius: 0 !important;
        z-index: 9999 !important;
        background: var(--bg-card) !important;
      }

      .table-fullscreen .table-scroll {
        max-height: calc(100vh - 60px);
      }

      /* 响应式表格提示 */
      .content .table-scroll-hint {
        display: none;
        font-size: 12px;
        color: var(--text-muted);
        text-align: center;
        padding: 6px;
        background: var(--bg-details);
        border-top: 1px solid var(--border-color);
      }

      @media (max-width: 768px) {
        .content .table-scroll-hint {
          display: block;
        }
        .content th, .content td {
          padding: 8px 10px;
          font-size: 13px;
        }
      }

      /* ========== 折叠块 ========== */
      .content details {
        margin: 14px 0;
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        overflow: hidden;
      }

      .content summary {
        cursor: pointer;
        padding: 12px 14px;
        background: var(--bg-details);
        font-weight: 500;
        user-select: none;
        color: var(--text-primary);
        transition: background 0.2s;
        -webkit-tap-highlight-color: transparent;
      }

      .content summary:hover, .content summary:active {
        background: var(--bg-details-hover);
      }

      .content details[open] summary {
        border-bottom: 1px solid var(--border-color);
      }

      .content details > div { padding: 14px; }
      .content .details-content { padding: 14px; }

      /* 剧透块 */
      .content details.spoiler > summary {
        background: var(--bg-code);
        color: var(--text-muted);
        font-style: italic;
      }

      /* 引用块内的来源署名 */
      .content blockquote cite {
        display: block;
        font-style: normal;
        font-weight: 600;
        font-size: 0.85em;
        margin-bottom: 8px;
        color: var(--accent-color);
      }

      /* ========== 页脚 ========== */
      .footer {
        text-align: center;
        margin-top: 24px;
        padding: 16px;
        font-size: 12px;
        color: var(--text-muted);
      }

      .footer a { color: var(--accent-color); text-decoration: underline; }
      .footer a:hover { opacity: 0.8; }

      /* ========== 响应式设计 ========== */
      /* 平板 */
      @media (min-width: 768px) {
        body { padding: 30px; padding-top: 80px; }
        .toolbar { padding: 12px 24px; gap: 8px; }
        .toolbar-btn { padding: 8px 16px; font-size: 14px; }
        .metadata { padding: 24px; }
        .metadata h1 { font-size: 24px; }
        .content { padding: 32px; }
        .content h1 { font-size: 28px; }
        .content h2 { font-size: 24px; }
        .content h3 { font-size: 20px; }
      }

      /* 桌面 */
      @media (min-width: 1024px) {
        body { max-width: 900px; padding: 40px; padding-top: 90px; }
        .toolbar { padding: 14px 40px; }
        .metadata h1 { font-size: 28px; }
        .content { padding: 40px; }
      }

      /* 小屏手机 */
      @media (max-width: 375px) {
        body { padding: 12px; padding-top: 65px; }
        .toolbar { padding: 8px 10px; gap: 4px; }
        .toolbar-btn { padding: 5px 8px; font-size: 11px; }
        .metadata { padding: 14px; }
        .metadata h1 { font-size: 17px; }
        .content { padding: 16px 14px; }
        .content h1 { font-size: 20px; }
        .content h2 { font-size: 18px; }
        .content pre { padding: 10px; font-size: 12px; }
      }

      /* ========== 打印样式 ========== */
      @media print {
        .toolbar { display: none !important; }
        body {
          padding: 0;
          padding-top: 0;
          background: white !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .metadata, .content {
          box-shadow: none;
          border: 1px solid #ddd;
          page-break-inside: avoid;
        }
        .content pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .content img { max-width: 100% !important; }
      }

      /* ========== PWA 安装提示 ========== */
      .pwa-install {
        display: none;
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-tip);
        color: white;
        padding: 12px 20px;
        border-radius: var(--radius-lg);
        font-size: 14px;
        cursor: pointer;
        z-index: 1001;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }

      /* ========== 暗色模式媒体查询支持 ========== */
      @media (prefers-color-scheme: dark) {
        [data-theme="auto"] {
          --bg-page: #0d1117;
          --bg-card: #161b22;
          --bg-code: #1f2428;
          --text-primary: #e6edf3;
          --text-secondary: #8b949e;
          --border-color: #30363d;
        }
      }

      /* ========== 触摸优化 ========== */
      @media (hover: none) and (pointer: coarse) {
        .toolbar-btn {
          min-height: 44px;
          min-width: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      /* ========== 横屏适配 ========== */
      @media (orientation: landscape) and (max-height: 500px) {
        .toolbar { padding: 6px 16px; }
        .toolbar-btn { padding: 4px 10px; }
        body { padding-top: 55px; }
      }
    `;
  }

  // V4.2.8: 获取完整的主题切换 + PWA 脚本
  function getThemeScript() {
    return `
    <script>
      // ========== 主题切换 ==========
      const themeButtons = document.querySelectorAll('.toolbar-btn[data-theme]');
      const html = document.documentElement;
      const savedTheme = localStorage.getItem('discourse-saver-theme') || 'linuxdo';
      html.setAttribute('data-theme', savedTheme);
      updateActiveButton(savedTheme);

      themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const theme = btn.getAttribute('data-theme');
          html.setAttribute('data-theme', theme);
          localStorage.setItem('discourse-saver-theme', theme);
          updateActiveButton(theme);
        });
      });

      function updateActiveButton(theme) {
        themeButtons.forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-theme') === theme);
        });
      }

      // ========== PDF 导出 ==========
      const pdfBtn = document.getElementById('pdf-btn');
      if (pdfBtn) {
        pdfBtn.addEventListener('click', () => {
          window.print();
        });
      }

      // ========== PWA 支持 ==========
      if ('serviceWorker' in navigator) {
        const swCode = \`
          const CACHE_NAME = 'discourse-saver-v1';
          self.addEventListener('install', e => self.skipWaiting());
          self.addEventListener('activate', e => e.waitUntil(clients.claim()));
          self.addEventListener('fetch', e => {
            e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
          });
        \`;
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(swUrl).catch(() => {});
      }

      // ========== PWA 安装提示 ==========
      let deferredPrompt;
      const installBtn = document.getElementById('install-btn');
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) {
          installBtn.style.display = 'block';
        }
      });

      if (installBtn) {
        installBtn.addEventListener('click', () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then(() => {
              installBtn.style.display = 'none';
              deferredPrompt = null;
            });
          }
        });
      }

      // ========== 滚动时隐藏/显示工具栏 ==========
      let lastScrollY = 0;
      const toolbar = document.querySelector('.toolbar');
      window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          toolbar.style.transform = 'translateY(-100%)';
        } else {
          toolbar.style.transform = 'translateY(0)';
        }
        lastScrollY = currentScrollY;
      }, { passive: true });

      // ========== 图片懒加载 ==========
      if ('IntersectionObserver' in window) {
        const imgObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
              }
              imgObserver.unobserve(img);
            }
          });
        });
        document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
      }

      // ========== Toast 提示 ==========
      const toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);

      function showToast(message, duration = 2000) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), duration);
      }

      // ========== 代码块复制功能 ==========
      document.querySelectorAll('.content pre').forEach(pre => {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = '复制';
        btn.setAttribute('title', '复制代码');

        btn.addEventListener('click', async () => {
          const code = pre.querySelector('code');
          const text = code ? code.textContent : pre.textContent;

          try {
            await navigator.clipboard.writeText(text);
            btn.textContent = '已复制';
            btn.classList.add('copied');
            showToast('代码已复制到剪贴板');
            setTimeout(() => {
              btn.textContent = '复制';
              btn.classList.remove('copied');
            }, 2000);
          } catch (err) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            btn.textContent = '已复制';
            btn.classList.add('copied');
            showToast('代码已复制到剪贴板');
            setTimeout(() => {
              btn.textContent = '复制';
              btn.classList.remove('copied');
            }, 2000);
          }
        });

        pre.appendChild(btn);
      });

      // ========== 原文链接复制功能 ==========
      const metaLink = document.querySelector('.meta-link a');
      if (metaLink) {
        const copyLinkBtn = document.createElement('button');
        copyLinkBtn.className = 'copy-link-btn';
        copyLinkBtn.innerHTML = '复制链接';
        copyLinkBtn.setAttribute('title', '复制原文链接');

        copyLinkBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          const url = metaLink.href;

          try {
            await navigator.clipboard.writeText(url);
            copyLinkBtn.textContent = '已复制';
            copyLinkBtn.classList.add('copied');
            showToast('链接已复制到剪贴板');
            setTimeout(() => {
              copyLinkBtn.textContent = '复制链接';
              copyLinkBtn.classList.remove('copied');
            }, 2000);
          } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = url;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            copyLinkBtn.textContent = '已复制';
            copyLinkBtn.classList.add('copied');
            showToast('链接已复制到剪贴板');
            setTimeout(() => {
              copyLinkBtn.textContent = '复制链接';
              copyLinkBtn.classList.remove('copied');
            }, 2000);
          }
        });

        metaLink.parentNode.appendChild(copyLinkBtn);
      }

      // ========== 标题复制功能 ==========
      const titleEl = document.querySelector('.metadata h1');
      if (titleEl) {
        titleEl.style.cursor = 'pointer';
        titleEl.setAttribute('title', '点击复制标题');
        titleEl.addEventListener('click', async () => {
          const text = titleEl.textContent;
          try {
            await navigator.clipboard.writeText(text);
            showToast('标题已复制到剪贴板');
          } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('标题已复制到剪贴板');
          }
        });
      }

      // ========== 图片点击放大 (Lightbox) ==========
      // 创建 lightbox 容器
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox-overlay';
      lightbox.innerHTML = \`
        <button class="lightbox-close">&times;</button>
        <img src="" alt="">
        <div class="lightbox-caption"></div>
      \`;
      document.body.appendChild(lightbox);

      const lightboxImg = lightbox.querySelector('img');
      const lightboxCaption = lightbox.querySelector('.lightbox-caption');
      const lightboxClose = lightbox.querySelector('.lightbox-close');

      // 关闭 lightbox
      function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }

      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxClose) {
          closeLightbox();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
          closeLightbox();
        }
      });

      // 为所有内容图片添加点击放大
      function openLightbox(img) {
        // 检查是否为小图片（表情等）
        const width = img.naturalWidth || img.width;
        if (width < 50 || img.classList.contains('emoji')) return;

        lightboxImg.src = img.src;
        lightboxCaption.textContent = img.alt || img.title || '';
        lightboxCaption.style.display = lightboxCaption.textContent ? 'block' : 'none';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      document.querySelectorAll('.content img').forEach(img => {
        // 设置可点击样式
        img.style.cursor = 'pointer';

        // 单击放大
        img.addEventListener('click', () => openLightbox(img));

        // 双击放大（备用）
        img.addEventListener('dblclick', () => openLightbox(img));

        // 图片加载失败处理
        img.addEventListener('error', () => {
          img.classList.add('error');
          img.style.cursor = 'default';
          img.alt = '图片加载失败';
        });
      });

      // ========== 表格增强处理 ==========
      document.querySelectorAll('.content table').forEach(table => {
        // 跳过已处理的表格
        if (table.parentElement.classList.contains('table-scroll')) return;

        // 创建表格包装器
        const wrapper = document.createElement('div');
        wrapper.className = 'table-wrapper';

        // 创建工具栏
        const toolbar = document.createElement('div');
        toolbar.className = 'table-toolbar';

        // 复制表格按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'table-btn';
        copyBtn.textContent = '复制表格';
        copyBtn.setAttribute('title', '复制为制表符分隔文本');

        copyBtn.addEventListener('click', async () => {
          // 提取表格数据为 TSV 格式
          const rows = table.querySelectorAll('tr');
          const data = [];
          rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => cell.textContent.trim());
            data.push(rowData.join('\\t'));
          });
          const text = data.join('\\n');

          try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = '已复制';
            copyBtn.classList.add('copied');
            showToast('表格已复制到剪贴板');
            setTimeout(() => {
              copyBtn.textContent = '复制表格';
              copyBtn.classList.remove('copied');
            }, 2000);
          } catch (err) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            copyBtn.textContent = '已复制';
            copyBtn.classList.add('copied');
            showToast('表格已复制到剪贴板');
            setTimeout(() => {
              copyBtn.textContent = '复制表格';
              copyBtn.classList.remove('copied');
            }, 2000);
          }
        });

        // 全屏按钮
        const fullscreenBtn = document.createElement('button');
        fullscreenBtn.className = 'table-btn';
        fullscreenBtn.textContent = '全屏';
        fullscreenBtn.setAttribute('title', '全屏查看表格');

        fullscreenBtn.addEventListener('click', () => {
          if (wrapper.classList.contains('table-fullscreen')) {
            wrapper.classList.remove('table-fullscreen');
            fullscreenBtn.textContent = '全屏';
            document.body.style.overflow = '';
          } else {
            wrapper.classList.add('table-fullscreen');
            fullscreenBtn.textContent = '退出全屏';
            document.body.style.overflow = 'hidden';
          }
        });

        // ESC 退出全屏
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && wrapper.classList.contains('table-fullscreen')) {
            wrapper.classList.remove('table-fullscreen');
            fullscreenBtn.textContent = '全屏';
            document.body.style.overflow = '';
          }
        });

        toolbar.appendChild(copyBtn);
        toolbar.appendChild(fullscreenBtn);

        // 创建滚动容器
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'table-scroll';

        // 创建滚动提示
        const hint = document.createElement('div');
        hint.className = 'table-scroll-hint';
        hint.textContent = '左右滑动查看完整表格';

        // 组装结构
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(toolbar);
        wrapper.appendChild(scrollContainer);
        scrollContainer.appendChild(table);
        wrapper.appendChild(hint);
      });
    <\/script>`;
  }

  // V4.3.12: 预处理 Discourse 专有语法，转换为标准 HTML（仅供 HTML 导出使用）
  function preprocessDiscourseMarkdown(md, renderFn) {
    // 1. [details=Title]...[/details] → <details><summary>
    //    支持带引号和不带引号两种写法：[details=标题] / [details="标题"]
    md = md.replace(/\[details(?:="?([^"\]]*)"?)?\]([\s\S]*?)\[\/details\]/gi, (_, title, content) => {
      const t = title ? escapeHtml(title.trim()) : '展开详情';
      return `<details><summary>${t}</summary><div class="details-content">\n${renderFn(content.trim())}\n</div></details>\n\n`;
    });

    // 2. [spoiler]...[/spoiler] → <details class="spoiler">
    md = md.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, (_, content) => {
      return `<details class="spoiler"><summary>⚠️ 剧透（点击展开）</summary><div class="details-content">\n${renderFn(content.trim())}\n</div></details>\n\n`;
    });

    // 3. [quote="user, post:N, topic:N"]...[/quote] → <blockquote> with cite
    md = md.replace(/\[quote(?:="([^"]*)")?\]([\s\S]*?)\[\/quote\]/gi, (_, attr, content) => {
      const user = attr ? escapeHtml(attr.split(',')[0].trim()) : '';
      const cite = user ? `<cite>${user} 说：</cite>\n` : '';
      return `<blockquote>${cite}${renderFn(content.trim())}</blockquote>\n\n`;
    });

    // 4. [wrap=...]...[/wrap] → 去掉包装标签，保留内容
    md = md.replace(/\[wrap=[^\]]*\]([\s\S]*?)\[\/wrap\]/gi, '$1');

    // 5. [color=X]...[/color] → 内联颜色（只允许合法颜色值，防止 XSS）
    md = md.replace(/\[color=([a-zA-Z]+|#[0-9a-fA-F]{3,8})\]([\s\S]*?)\[\/color\]/gi,
      (_, color, text) => `<span style="color:${color}">${text}</span>`);

    return md;
  }

  // V4.2.7: 将 Markdown 转换为 HTML（支持多主题 + PDF 导出）
  function convertMarkdownToHtml(markdown, metadata) {
    // 使用 marked.js 库进行转换
    if (typeof marked === 'undefined') {
      console.error('[Discourse Saver] marked.js 库未加载');
      return null;
    }

    // 配置 marked (v9.x 兼容配置)
    marked.setOptions({
      breaks: true,      // 将换行符转换为 <br>
      gfm: true          // 启用 GitHub Flavored Markdown
    });

    // V4.3.7: 移除 frontmatter（顶部卡片已显示元信息，避免重复）
    let cleanMarkdown = markdown;
    const frontmatterMatch = markdown.match(/^---\n[\s\S]*?\n---\n*/);
    if (frontmatterMatch) {
      cleanMarkdown = markdown.slice(frontmatterMatch[0].length);
    }

    // V4.3.12: 预处理 Discourse 专有语法（details/spoiler/quote/wrap/color）
    cleanMarkdown = preprocessDiscourseMarkdown(cleanMarkdown, (md) => marked.parse(md));

    // 转换 Markdown 为 HTML
    const htmlContent = marked.parse(cleanMarkdown);

    // 生成完整的 HTML 文档
    const exportTime = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // V4.2.8: 生成内联 PWA manifest (Base64 编码)
    const safeTitle = escapeHtml(metadata.title);
    const shortTitle = metadata.title.length > 12 ? metadata.title.substring(0, 12) + '...' : metadata.title;
    const manifestJson = JSON.stringify({
      name: metadata.title,
      short_name: shortTitle,
      description: 'Discourse 帖子 - ' + metadata.author,
      start_url: '.',
      display: 'standalone',
      orientation: 'any',
      background_color: '#ffffff',
      theme_color: '#4b9ed9',
      icons: [{
        src: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#4b9ed9" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">D</text></svg>'),
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      }]
    });
    const manifestDataUri = 'data:application/manifest+json,' + encodeURIComponent(manifestJson);
    const iconDataUri = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#4b9ed9" width="100" height="100" rx="20"/><text x="50" y="65" font-size="50" text-anchor="middle" fill="white">D</text></svg>');

    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN" data-theme="linuxdo">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#4b9ed9" id="theme-color-meta">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="${escapeHtml(shortTitle)}">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="format-detection" content="telephone=no">
  <meta name="msapplication-tap-highlight" content="no">
  <meta name="description" content="Discourse 帖子 - ${escapeHtml(metadata.author)}">
  <link rel="manifest" href="${manifestDataUri}">
  <link rel="apple-touch-icon" href="${iconDataUri}">
  <title>${safeTitle}</title>
  <style>${getHtmlExportStyles()}</style>
</head>
<body>
  <!-- 主题切换工具栏 V4.2.8 -->
  <div class="toolbar" id="toolbar">
    <div class="toolbar-inner">
      <button class="toolbar-btn active" data-theme="linuxdo" title="L站原风格">L站</button>
      <button class="toolbar-btn" data-theme="dark-geek" title="暗夜极客">极客</button>
      <button class="toolbar-btn" data-theme="business" title="商务精英">商务</button>
      <button class="toolbar-btn" data-theme="sakura" title="樱花粉">樱花</button>
      <button class="toolbar-btn" data-theme="lavender" title="薰衣草">薰衣草</button>
      <button class="toolbar-btn pdf-btn" id="pdf-btn" title="导出PDF">PDF</button>
      <button class="toolbar-btn install-btn" id="install-btn" style="display:none" title="安装到设备">安装</button>
    </div>
  </div>

  <article class="article-container">
    <header class="metadata">
      <h1>${safeTitle}</h1>
      <div class="meta-info">
        <span class="meta-item"><strong>作者：</strong>${escapeHtml(metadata.author)}</span>
        <span class="meta-item"><strong>分类：</strong>${escapeHtml(metadata.category || '未分类')}</span>
        <span class="meta-item"><strong>标签：</strong>${metadata.tags && metadata.tags.length > 0 ? metadata.tags.map(t => escapeHtml(t)).join(', ') : '无'}</span>
        <span class="meta-item"><strong>导出时间：</strong>${exportTime}</span>
      </div>
      <p class="meta-link"><strong>原文链接：</strong><a href="${metadata.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(metadata.url)}</a></p>
    </header>
    <main class="content">
      ${htmlContent}
    </main>
  </article>

  <footer class="footer">
    <p>由 <a href="https://github.com/acheng-byte/discourse-saver" target="_blank" rel="noopener noreferrer">Discourse Saver</a> 导出</p>
  </footer>

  ${getThemeScript()}
</body>
</html>`;

    return fullHtml;
  }

  // V4.2.6: HTML 转义函数
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // V4.2.6: 下载文件
  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // V4.2.6: 清理文件名（移除特殊字符）
  function sanitizeFileName(title) {
    return title
      .replace(/[《》<>:"/\\|?*\x00-\x1f]/g, '')  // 移除非法字符
      .replace(/\s+/g, ' ')                        // 合并空格
      .trim()
      .substring(0, 100);                          // 限制长度
  }

  // V3.1: 显示通知（简洁风格）
  function showNotification(message, type = 'info', duration = 3000) {
    // 所有弹窗通知同步写入运行日志，便于排障复盘
    try {
      const levelMap = {
        success: 'INFO',
        info: 'INFO',
        warning: 'WARN',
        error: 'ERROR'
      };
      const level = levelMap[type] || 'INFO';
      rlog(level, `[notify:${type}] ${String(message || '').replace(/\s+/g, ' ').trim()}`);
    } catch (_) {}

    // 移除旧通知
    const oldNotification = document.querySelector('#linuxdo-obsidian-notification');
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement('div');
    notification.id = 'linuxdo-obsidian-notification';
    notification.textContent = message;

    // 简洁配色
    const colors = {
      success: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
      error: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
      warning: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
      info: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' }
    };

    const color = colors[type] || colors.info;

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${color.bg};
      color: ${color.text};
      border: 1px solid ${color.border};
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
      max-width: 320px;
      animation: slideIn 0.2s ease-out;
    `;

    // 添加动画样式
    if (!document.querySelector('#obsidian-notification-style')) {
      const style = document.createElement('style');
      style.id = 'obsidian-notification-style';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-20px); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 自动消失
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.2s ease-out';
      setTimeout(() => notification.remove(), 200);
    }, duration);
  }

  // ===== Raw Viewer: 每贴头像下方的「查看原始 Markdown」按钮 =====

  function addRawViewerStyles() {
    if (document.querySelector('#ds-raw-viewer-style')) return;
    const style = document.createElement('style');
    style.id = 'ds-raw-viewer-style';
    style.textContent = `
      .ds-raw-btn {
        margin-top: 6px;
        width: 32px; height: 32px;
        border-radius: 50%;
        background: transparent;
        border: 1px solid transparent;
        color: var(--primary-medium, #919191);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.15s ease;
        flex-shrink: 0;
      }
      .ds-raw-btn:hover {
        background: var(--d-button-hover-background, rgba(0,0,0,0.08));
        color: var(--primary, #222);
      }
      .ds-raw-btn.ds-active {
        color: var(--tertiary, #0088cc);
        background: var(--tertiary-low, #e6f5ff);
      }
      .ds-raw-btn.ds-loading { cursor: wait; opacity: 0.6; }
      .ds-raw-btn svg { width: 17px; height: 17px; fill: currentColor; pointer-events: none; }
      .ds-raw-wrapper {
        margin: 12px 0 16px 0;
        border-radius: 8px;
        border: 1px solid var(--primary-low);
        background: var(--secondary);
        box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        overflow: hidden;
      }
      .ds-raw-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 7px 14px;
        background: var(--secondary);
        border-bottom: 1px solid var(--primary-low);
        font-size: 13px;
        color: var(--primary-medium);
      }
      .ds-raw-label { font-weight: 500; }
      .ds-raw-copy-btn {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 4px 10px;
        font-size: 12px; font-weight: 600;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid var(--primary-low);
        background: var(--secondary);
        color: var(--primary-medium);
        transition: all 0.15s;
      }
      .ds-raw-copy-btn:hover { color: var(--tertiary); border-color: var(--tertiary); }
      .ds-raw-copy-btn.ds-copied { background: var(--success); color: #fff; border-color: var(--success); }
      .ds-raw-copy-btn svg { width: 13px; height: 13px; fill: currentColor; }
      .ds-raw-textarea {
        display: block; width: 100%;
        min-height: 100px; max-height: 400px;
        padding: 14px 16px;
        font-family: "JetBrains Mono","Fira Code","SF Mono",Consolas,monospace;
        font-size: 13px; line-height: 1.6;
        border: none; outline: none; resize: vertical;
        background: var(--secondary);
        color: var(--primary);
        box-sizing: border-box;
        overflow: auto;
      }
      .ds-raw-textarea:focus { outline: none; box-shadow: none; border: none; }
      @keyframes ds-spin { 100% { transform: rotate(360deg); } }
    `;
    document.head.appendChild(style);
  }

  const _DS_RAW_ICON = `<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>`;
  const _DS_COPY_ICON = `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
  const _DS_CHECK_ICON = `<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
  const _DS_SPIN_ICON = `<svg viewBox="0 0 24 24" style="animation:ds-spin 1s linear infinite"><path d="M12 4V2A10 10 0 0 0 2 12h2a8 8 0 0 1 8-8z"/></svg>`;

  function _dsToggleRawView(btn, postEl, postNumber) {
    const topicId = window.location.pathname.match(/\/t\/[^/]+\/(\d+)/)?.[1] || null;
    if (!topicId) return;
    const cookedEl = postEl.querySelector('.cooked') || postEl.querySelector('.topic-body .regular');
    let wrapper = postEl.querySelector('.ds-raw-wrapper');

    // Toggle off
    if (btn.classList.contains('ds-active')) {
      btn.classList.remove('ds-active');
      btn.title = '查看原始 Markdown';
      if (wrapper) wrapper.style.display = 'none';
      if (cookedEl) cookedEl.style.display = '';
      return;
    }
    // Toggle on (already loaded)
    if (wrapper) {
      btn.classList.add('ds-active');
      btn.title = '关闭源码视图';
      wrapper.style.display = '';
      if (cookedEl) cookedEl.style.display = 'none';
      return;
    }

    // First load
    btn.innerHTML = _DS_SPIN_ICON;
    btn.classList.add('ds-loading');

    fetch(`${window.location.origin}/raw/${topicId}/${postNumber}`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(rawText => {
        // Resolve upload:// tokens using cooked HTML already in DOM
        const cookedHtml = cookedEl ? cookedEl.innerHTML : '';
        const resolved = resolveUploadUrls(rawText, cookedHtml);

        wrapper = document.createElement('div');
        wrapper.className = 'ds-raw-wrapper';

        // Header
        const header = document.createElement('div');
        header.className = 'ds-raw-header';
        const label = document.createElement('span');
        label.className = 'ds-raw-label';
        label.textContent = `原始 Markdown · #${postNumber}`;

        const copyBtn = document.createElement('button');
        copyBtn.className = 'ds-raw-copy-btn';
        copyBtn.innerHTML = `${_DS_COPY_ICON} 复制`;
        copyBtn.title = '复制到剪贴板';
        copyBtn.addEventListener('click', () => {
          const text = textarea.value;
          const finish = () => {
            copyBtn.innerHTML = `${_DS_CHECK_ICON} 已复制`;
            copyBtn.classList.add('ds-copied');
            setTimeout(() => { copyBtn.innerHTML = `${_DS_COPY_ICON} 复制`; copyBtn.classList.remove('ds-copied'); }, 2000);
          };
          if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(finish).catch(() => _dsFallbackCopy(text, finish));
          } else {
            _dsFallbackCopy(text, finish);
          }
        });

        header.appendChild(label);
        header.appendChild(copyBtn);

        // Textarea
        const textarea = document.createElement('textarea');
        textarea.className = 'ds-raw-textarea';
        textarea.value = resolved;
        textarea.readOnly = true;
        textarea.spellcheck = false;

        wrapper.appendChild(header);
        wrapper.appendChild(textarea);

        if (cookedEl) {
          cookedEl.parentNode.insertBefore(wrapper, cookedEl.nextSibling);
          cookedEl.style.display = 'none';
        } else {
          postEl.appendChild(wrapper);
        }

        // Auto-resize
        setTimeout(() => {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight + 4, 400) + 'px';
        }, 0);

        btn.innerHTML = _DS_RAW_ICON;
        btn.classList.remove('ds-loading');
        btn.classList.add('ds-active');
        btn.title = '关闭源码视图';
      })
      .catch(err => {
        console.warn('[Discourse Saver] 获取原始 Markdown 失败:', err);
        btn.innerHTML = _DS_RAW_ICON;
        btn.classList.remove('ds-loading');
      });
  }

  function _dsFallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch (e) {}
    document.body.removeChild(ta);
  }

  function _dsAddRawBtn(postEl) {
    if (postEl.dataset.dsRawBtnAdded) return;
    const id = postEl.id || '';
    if (!id.startsWith('post_')) return;
    const postNumber = id.split('_')[1];
    if (!postNumber) return;
    const avatarContainer = postEl.querySelector('.topic-avatar');
    if (!avatarContainer) return;

    addRawViewerStyles();

    const btn = document.createElement('button');
    btn.className = 'ds-raw-btn';
    btn.innerHTML = _DS_RAW_ICON;
    btn.title = '查看原始 Markdown';
    btn.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      if (btn.classList.contains('ds-loading')) return;
      _dsToggleRawView(btn, postEl, postNumber);
    });

    avatarContainer.appendChild(btn);
    postEl.dataset.dsRawBtnAdded = 'true';
  }

  function scanAndAddRawButtons() {
    document.querySelectorAll('[id^="post_"]').forEach(_dsAddRawBtn);
  }

  // ===== End Raw Viewer =====

  // 添加快捷键支持
  let keyboardListenerAdded = false;
  function setupKeyboardShortcut() {
    if (keyboardListenerAdded) {
      console.log('[Discourse Saver] 快捷键监听器已存在，跳过添加');
      return;
    }
    keyboardListenerAdded = true;

    document.addEventListener('keydown', (e) => {
      // 只在帖子页面响应快捷键
      if (!isTopicPage()) return;

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        console.log('[Discourse Saver] 快捷键触发');
        saveToObsidian();
      }
    });
  }

  // 插件是否已初始化（针对当前页面）
  let pluginInitialized = false;
  let currentTopicUrl = null;

  // 初始化
  async function init() {
    // 检查插件是否启用
    let config;
    try {
      config = await chrome.storage.sync.get({ pluginEnabled: true });
    } catch (err) {
      console.warn('[Discourse Saver] 读取存储失败（扩展上下文可能已失效）:', err.message);
      return;
    }
    if (!config.pluginEnabled) {
      console.log('[Discourse Saver] 插件已禁用');
      rlog('INFO', '插件已禁用');
      return;
    }

    // 检查是否是帖子页面
    if (!isTopicPage()) {
      removeFloatingButton(); // V5.4.0: SPA导航离开帖子页面时移除悬浮按钮
      console.log('[Discourse Saver] 非帖子页面，跳过初始化');
      rlog('DEBUG', '非帖子页面: ' + location.pathname.substring(0, 60));
      return;
    }

    // 检查是否已经为当前页面初始化过
    const topicUrl = window.location.pathname;
    if (pluginInitialized && currentTopicUrl === topicUrl) {
      console.log('[Discourse Saver] 当前页面已初始化');
      return;
    }

    // V5.4.0: 悬浮按钮替代链接拦截
    createFloatingButton();
    setupKeyboardShortcut();
    // Raw Viewer: 为已加载的帖子添加查看原始 Markdown 按钮
    scanAndAddRawButtons();
    setTimeout(scanAndAddRawButtons, 1500);

    pluginInitialized = true;
    currentTopicUrl = topicUrl;
    console.log('[Discourse Saver] 插件已加载 (V5.4.0)');
    rlog('INFO', '初始化完成: ' + location.pathname.substring(0, 60));
  }

  // 带重试的初始化（Discourse SPA 可能延迟渲染）
  function initWithRetry(maxRetries = 3, delay = 300) {
    let attempts = 0;
    function tryInit() {
      attempts++;
      init().then(() => {
        if (!pluginInitialized && attempts < maxRetries) {
          setTimeout(tryInit, delay);
        }
      }).catch(err => {
        // V5.3.1: 捕获init异常，避免unhandled rejection导致重试中断
        console.error('[Discourse Saver] init() 异常:', err);
        if (attempts < maxRetries) {
          setTimeout(tryInit, delay);
        }
      });
    }
    tryInit();
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initWithRetry());
  } else {
    initWithRetry();
  }

  // 监听页面导航（单页应用）
  let lastUrl = location.href;
  let navDebounceTimer = null;
  let rawBtnScanTimer = null;
  const observer = new MutationObserver((mutations) => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      console.log('[Discourse Saver] 检测到页面导航:', url);
      rlog('INFO', 'SPA导航: ' + url.substring(0, 80));
      // 页面导航时重置初始化状态，允许重新初始化
      pluginInitialized = false;
      if (navDebounceTimer) clearTimeout(navDebounceTimer);
      navDebounceTimer = setTimeout(() => {
        navDebounceTimer = null;
        initWithRetry(5, 500);
      }, 500);
    }
    // 新帖子加载时（无限滚动）补充 Raw 按钮
    for (const m of mutations) {
      if (m.addedNodes.length) {
        if (rawBtnScanTimer) clearTimeout(rawBtnScanTimer);
        rawBtnScanTimer = setTimeout(() => { rawBtnScanTimer = null; scanAndAddRawButtons(); }, 300);
        break;
      }
    }
  });
  observer.observe(document, { subtree: true, childList: true });

  // 页面卸载时清理
  window.addEventListener('pagehide', () => {
    observer.disconnect();
    if (navDebounceTimer) clearTimeout(navDebounceTimer);
  });

})();
