// Discourse Saver V5.1 - 设置页面
// 支持 Obsidian、飞书多维表格、Notion、思源笔记
// V5.1: Tab 布局 + 三主题切换 + 路径标准化 + 咖啡赞赏

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

// 默认配置
const DEFAULT_CONFIG = {
  // 插件总开关
  pluginEnabled: true,

  // 自定义站点列表 (V3.6.0)
  customSites: [],

  // 保存目标
  saveToObsidian: true,
  saveToFeishu: false,

  // Obsidian 设置
  vaultName: '',
  folderPath: 'Discourse收集箱',
  useAdvancedUri: true,

  // 飞书设置
  feishuApiDomain: 'feishu', // 'feishu' 或 'lark'
  feishuAppId: '',
  feishuAppSecret: '',
  feishuAppToken: '',
  feishuTableId: '',
  feishuUploadAttachment: false,

  // 思源笔记设置
  saveToSiyuan: false,
  siyuanApiUrl: 'http://127.0.0.1:6806',
  siyuanToken: '',
  siyuanNotebook: '',
  siyuanSavePath: '/Discourse收集箱',

  // Notion 设置 (V4.0.1)
  // V4.0.2: 默认属性名改为中文
  // V4.2.3: 根据浏览器语言自动选择中/英文默认值
  saveToNotion: false,
  notionToken: '',
  notionDatabaseId: '',
  notionPropTitle: '',  // 动态设置
  notionPropUrl: '',
  notionPropAuthor: '',
  notionPropCategory: '',
  notionPropTags: '',     // V4.3.7: 标签属性
  notionPropSavedDate: '',
  notionPropCommentCount: '',

  // V4.2.6: HTML 导出设置
  exportHtml: false,
  feishuUploadHtml: false,
  htmlExportFolder: 'Discourse导出',  // V4.3.6: HTML 导出文件夹

  // 内容设置
  addMetadata: true,
  includeImages: true,

  // 图片嵌入设置 (V3.6.0)
  embedImages: false,
  imageMaxWidth: 1920,
  imageQuality: 0.9,
  imageSkipGif: true,

  // 图片/视频下载到 Vault (V4.7)
  downloadImages: false,
  downloadVideos: true,
  restApiKey: '',
  restApiPort: 27124,

  // 评论设置
  saveComments: false,
  commentCount: 100,
  saveAllComments: false,
  foldComments: false,
  // V4.3.7: 楼层范围设置
  useFloorRange: false,
  floorFrom: 1,
  floorTo: 100
};

// ========== Tab 切换 ==========
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'tab-' + tabId);
  });
}

// ========== 主题切换 ==========
function applyTheme(mode) {
  const html = document.documentElement;
  if (mode === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else if (mode === 'light') {
    html.removeAttribute('data-theme');
  } else {
    // auto: follow system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
  }
  // Update toggle button states
  document.querySelectorAll('#themeToggle button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.themeVal === mode);
  });
}

function initTheme() {
  const saved = localStorage.getItem('ds-theme') || 'auto';
  applyTheme(saved);
  // Listen for system theme changes when in auto mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if ((localStorage.getItem('ds-theme') || 'auto') === 'auto') {
      applyTheme('auto');
    }
  });
}

function setTheme(mode) {
  localStorage.setItem('ds-theme', mode);
  applyTheme(mode);
}

// ========== 赞赏弹窗 ==========
function openDonateModal() {
  document.getElementById('donateOverlay').classList.add('show');
}

function closeDonateModal() {
  document.getElementById('donateOverlay').classList.remove('show');
}

function switchDonateTab(type) {
  const wechatPanel = document.getElementById('donate-wechat');
  const alipayPanel = document.getElementById('donate-alipay');
  const btns = document.querySelectorAll('.donate-tab-btn');

  btns.forEach(btn => {
    btn.className = 'donate-tab-btn';
    if (btn.dataset.donate === type) {
      btn.classList.add(type === 'wechat' ? 'active-wechat' : 'active-alipay');
    }
  });

  wechatPanel.style.display = type === 'wechat' ? 'block' : 'none';
  alipayPanel.style.display = type === 'alipay' ? 'block' : 'none';
}

// 渲染自定义站点列表
function renderCustomSites(sites) {
  const container = document.getElementById('customSitesList');
  container.innerHTML = '';

  if (!sites || sites.length === 0) {
    return;
  }

  sites.forEach((site, index) => {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.innerHTML = `
      <span class="site-url">${escapeHtml(site)}</span>
      <button type="button" class="remove-btn" data-index="${index}">删除</button>
    `;
    container.appendChild(item);
  });

  // 添加删除事件监听
  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removeSite(index);
    });
  });
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 添加站点
function addSite() {
  const input = document.getElementById('newSiteInput');
  let site = input.value.trim();

  if (!site) {
    showStatus('请输入站点域名', 'error');
    return;
  }

  // 清理输入，提取域名
  site = site.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();

  // 验证域名格式
  if (!/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i.test(site)) {
    showStatus('域名格式不正确', 'error');
    return;
  }

  chrome.storage.sync.get({ customSites: [] }, (config) => {
    const sites = config.customSites || [];

    // 检查是否已存在
    if (sites.includes(site)) {
      showStatus('该站点已存在', 'error');
      return;
    }

    sites.push(site);

    chrome.storage.sync.set({ customSites: sites }, () => {
      if (chrome.runtime.lastError) {
        showStatus('添加失败: ' + chrome.runtime.lastError.message, 'error');
        return;
      }
      input.value = '';
      renderCustomSites(sites);
      showStatus('站点已添加', 'success');
    });
  });
}

// 删除站点
function removeSite(index) {
  chrome.storage.sync.get({ customSites: [] }, (config) => {
    const sites = config.customSites || [];

    if (index >= 0 && index < sites.length) {
      sites.splice(index, 1);

      chrome.storage.sync.set({ customSites: sites }, () => {
        if (chrome.runtime.lastError) {
          showStatus('删除失败: ' + chrome.runtime.lastError.message, 'error');
          return;
        }
        renderCustomSites(sites);
        showStatus('站点已删除', 'success');
      });
    }
  });
}

// 加载配置
function loadOptions() {
  // V4.2.3: 先获取语言设置，再加载配置
  chrome.storage.local.get(['uiLanguage'], (langResult) => {
    const lang = langResult.uiLanguage || 'zh';

    chrome.storage.sync.get(DEFAULT_CONFIG, (config) => {
      // 插件开关
      document.getElementById('pluginEnabled').checked = config.pluginEnabled;

    // 自定义站点 (V3.6.0)
    renderCustomSites(config.customSites || []);

    // 保存目标
    document.getElementById('saveToObsidian').checked = config.saveToObsidian;
    document.getElementById('saveToFeishu').checked = config.saveToFeishu;
    document.getElementById('exportHtml').checked = config.exportHtml || false;
    document.getElementById('htmlExportFolder').value = config.htmlExportFolder || 'Discourse导出';

    // Obsidian 设置
    document.getElementById('vaultName').value = config.vaultName;
    document.getElementById('folderPath').value = config.folderPath;
    document.getElementById('useAdvancedUri').checked = config.useAdvancedUri;

    // 飞书设置
    document.getElementById('feishuApiDomain').value = config.feishuApiDomain || 'feishu';
    document.getElementById('feishuAppId').value = config.feishuAppId;
    document.getElementById('feishuAppSecret').value = config.feishuAppSecret;
    document.getElementById('feishuAppToken').value = config.feishuAppToken;
    document.getElementById('feishuTableId').value = config.feishuTableId;
    document.getElementById('feishuUploadAttachment').checked = config.feishuUploadAttachment;
    document.getElementById('feishuUploadHtml').checked = config.feishuUploadHtml || false;

    // 思源笔记设置
    document.getElementById('saveToSiyuan').checked = config.saveToSiyuan;
    document.getElementById('siyuanApiUrl').value = config.siyuanApiUrl || 'http://127.0.0.1:6806';
    document.getElementById('siyuanToken').value = config.siyuanToken || '';
    document.getElementById('siyuanNotebook').value = config.siyuanNotebook || '';
    document.getElementById('siyuanSavePath').value = config.siyuanSavePath || '/Discourse收集箱';

    // Notion 设置 (V4.0.1)
    // V4.2.3: 根据语言使用对应的默认值
    document.getElementById('saveToNotion').checked = config.saveToNotion;
    document.getElementById('notionToken').value = config.notionToken || '';
    document.getElementById('notionDatabaseId').value = config.notionDatabaseId || '';
    document.getElementById('notionPropTitle').value = config.notionPropTitle || getNotionPropDefault('notionPropTitle', lang);
    document.getElementById('notionPropUrl').value = config.notionPropUrl || getNotionPropDefault('notionPropUrl', lang);
    document.getElementById('notionPropAuthor').value = config.notionPropAuthor || getNotionPropDefault('notionPropAuthor', lang);
    document.getElementById('notionPropCategory').value = config.notionPropCategory || getNotionPropDefault('notionPropCategory', lang);
    document.getElementById('notionPropTags').value = config.notionPropTags || getNotionPropDefault('notionPropTags', lang);
    document.getElementById('notionPropSavedDate').value = config.notionPropSavedDate || getNotionPropDefault('notionPropSavedDate', lang);
    document.getElementById('notionPropCommentCount').value = config.notionPropCommentCount || getNotionPropDefault('notionPropCommentCount', lang);

    // 内容设置
    document.getElementById('addMetadata').checked = config.addMetadata;
    document.getElementById('includeImages').checked = config.includeImages;

    // 图片嵌入设置 (V3.6.0)
    document.getElementById('embedImages').checked = config.embedImages;
    document.getElementById('imageMaxWidth').value = config.imageMaxWidth;
    document.getElementById('imageQuality').value = config.imageQuality;
    document.getElementById('imageSkipGif').checked = config.imageSkipGif;

    // 图片/视频下载设置
    document.getElementById('downloadImages').checked = config.downloadImages;
    document.getElementById('downloadVideos').checked = config.downloadVideos;
    document.getElementById('restApiKey').value = config.restApiKey;
    document.getElementById('restApiPort').value = config.restApiPort;

    // 评论设置
    document.getElementById('saveComments').checked = config.saveComments;
    document.getElementById('commentCount').value = config.commentCount;
    document.getElementById('saveAllComments').checked = config.saveAllComments;
    document.getElementById('foldComments').checked = config.foldComments;
    // V4.3.7: 楼层范围设置
    document.getElementById('useFloorRange').checked = config.useFloorRange;
    document.getElementById('floorFrom').value = config.floorFrom || 1;
    document.getElementById('floorTo').value = config.floorTo || 100;

    // 更新UI状态
    updateObsidianSectionVisibility(config.saveToObsidian);
    updateFeishuOptionsVisibility(config.saveToFeishu);
    updateNotionOptionsVisibility(config.saveToNotion);
    updateSiyuanOptionsVisibility(config.saveToSiyuan);
    updateCommentOptionsVisibility(config.saveComments);
    updateSaveAllCommentsVisibility(config.saveAllComments);
    updateImageSettingsVisibility(config.embedImages);
    updateDownloadImagesVisibility(config.downloadImages);
    updateFloorRangeVisibility(config.useFloorRange);

    // Tab 布局无需展开面板
    });
  });
}

// 更新 Obsidian 区域可见性
function updateObsidianSectionVisibility(enabled) {
  const section = document.getElementById('obsidianSection');
  if (section) {
    section.style.opacity = enabled ? '1' : '0.5';
    const content = section.querySelector('.section-content');
    if (content) {
      content.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }
}

// 更新飞书选项可见性
function updateFeishuOptionsVisibility(enabled) {
  const feishuOptions = document.getElementById('feishuOptions');
  if (feishuOptions) {
    feishuOptions.style.opacity = enabled ? '1' : '0.5';
    feishuOptions.style.pointerEvents = enabled ? 'auto' : 'none';
  }
}

// 更新 Notion 区域可见性 (V4.0.1)
// V4.0.2: 修复 - 控制整个 section 而不只是内部选项
function updateNotionOptionsVisibility(enabled) {
  const section = document.getElementById('notionSection');
  if (section) {
    section.style.opacity = enabled ? '1' : '0.5';
    const content = section.querySelector('.section-content');
    if (content) {
      content.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }
}

// 更新思源笔记区域可见性
function updateSiyuanOptionsVisibility(enabled) {
  const section = document.getElementById('siyuanSection');
  if (section) {
    section.style.opacity = enabled ? '1' : '0.5';
    const content = section.querySelector('.section-content');
    if (content) {
      content.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }
}

// 更新评论选项可见性
function updateCommentOptionsVisibility(enabled) {
  const commentOptions = document.getElementById('commentOptions');
  if (commentOptions) {
    if (enabled) {
      commentOptions.classList.remove('disabled');
    } else {
      commentOptions.classList.add('disabled');
    }
  }
}

// 更新"保存全部"选项状态
function updateSaveAllCommentsVisibility(enabled) {
  const commentCountInput = document.getElementById('commentCount');
  const warningEl = document.getElementById('allCommentsWarning');
  if (commentCountInput) {
    // V4.3.7: 当启用"保存全部"时，禁用评论数量输入
    const floorRangeEnabled = document.getElementById('useFloorRange')?.checked || false;
    const shouldDisable = enabled || floorRangeEnabled;
    commentCountInput.disabled = shouldDisable;
    commentCountInput.style.opacity = shouldDisable ? '0.5' : '1';
  }
  if (warningEl) {
    warningEl.style.display = enabled ? 'block' : 'none';
  }
}

// 更新图片设置面板可见性 (V3.6.0)
function updateImageSettingsVisibility(enabled) {
  const panel = document.getElementById('imageSettingsPanel');
  if (panel) {
    if (enabled) {
      panel.classList.remove('disabled');
    } else {
      panel.classList.add('disabled');
    }
  }
}

// 更新图片下载设置面板可见性 (V4.7)
function updateDownloadImagesVisibility(enabled) {
  const panel = document.getElementById('downloadImagesPanel');
  if (panel) {
    if (enabled) {
      panel.classList.remove('disabled');
    } else {
      panel.classList.add('disabled');
    }
  }
}

// V4.3.7: 更新楼层范围选项可见性
function updateFloorRangeVisibility(enabled) {
  const panel = document.getElementById('floorRangeOptions');
  if (panel) {
    if (enabled) {
      panel.classList.remove('disabled');
    } else {
      panel.classList.add('disabled');
    }
  }

  // V4.3.7: 当启用"楼层范围"时，也禁用评论数量输入（三选项互斥）
  const commentCountInput = document.getElementById('commentCount');
  if (commentCountInput) {
    const saveAllEnabled = document.getElementById('saveAllComments')?.checked || false;
    const shouldDisable = enabled || saveAllEnabled;
    commentCountInput.disabled = shouldDisable;
    commentCountInput.style.opacity = shouldDisable ? '0.5' : '1';
  }
}

// 保存配置
function saveOptions(e) {
  e.preventDefault();

  const commentCount = Math.min(
    Math.max(0, parseInt(document.getElementById('commentCount').value) || 100),
    10000
  );

  const config = {
    // 插件开关
    pluginEnabled: document.getElementById('pluginEnabled').checked,

    // 保存目标
    saveToObsidian: document.getElementById('saveToObsidian').checked,
    saveToFeishu: document.getElementById('saveToFeishu').checked,
    saveToNotion: document.getElementById('saveToNotion').checked,
    saveToSiyuan: document.getElementById('saveToSiyuan').checked,
    exportHtml: document.getElementById('exportHtml').checked,
    htmlExportFolder: document.getElementById('htmlExportFolder').value.trim(),

    // Obsidian 设置
    vaultName: document.getElementById('vaultName').value.trim(),
    folderPath: document.getElementById('folderPath').value.trim(),
    useAdvancedUri: document.getElementById('useAdvancedUri').checked,

    // 飞书设置
    feishuApiDomain: document.getElementById('feishuApiDomain').value,
    feishuAppId: document.getElementById('feishuAppId').value.trim(),
    feishuAppSecret: document.getElementById('feishuAppSecret').value.trim(),
    feishuAppToken: document.getElementById('feishuAppToken').value.trim(),
    feishuTableId: document.getElementById('feishuTableId').value.trim(),
    feishuUploadAttachment: document.getElementById('feishuUploadAttachment').checked,
    feishuUploadHtml: document.getElementById('feishuUploadHtml').checked,

    // 思源笔记设置
    siyuanApiUrl: document.getElementById('siyuanApiUrl').value.trim() || 'http://127.0.0.1:6806',
    siyuanToken: document.getElementById('siyuanToken').value.trim(),
    siyuanNotebook: document.getElementById('siyuanNotebook').value.trim(),
    siyuanSavePath: document.getElementById('siyuanSavePath').value.trim(),

    // Notion 设置 (V4.0.1)
    // V4.3.7: 默认值改为中文
    notionToken: document.getElementById('notionToken').value.trim(),
    notionDatabaseId: document.getElementById('notionDatabaseId').value.trim(),
    notionPropTitle: document.getElementById('notionPropTitle').value.trim() || '标题',
    notionPropUrl: document.getElementById('notionPropUrl').value.trim() || '链接',
    notionPropAuthor: document.getElementById('notionPropAuthor').value.trim() || '作者',
    notionPropCategory: document.getElementById('notionPropCategory').value.trim() || '分类',
    notionPropTags: document.getElementById('notionPropTags').value.trim() || '标签',
    notionPropSavedDate: document.getElementById('notionPropSavedDate').value.trim() || '保存日期',
    notionPropCommentCount: document.getElementById('notionPropCommentCount').value.trim() || '评论数',

    // 内容设置
    addMetadata: document.getElementById('addMetadata').checked,
    includeImages: document.getElementById('includeImages').checked,

    // 图片嵌入设置 (V3.6.0)
    embedImages: document.getElementById('embedImages').checked,
    imageMaxWidth: parseInt(document.getElementById('imageMaxWidth').value) || 1920,
    imageQuality: parseFloat(document.getElementById('imageQuality').value) || 0.9,
    imageSkipGif: document.getElementById('imageSkipGif').checked,

    // 图片/视频下载设置
    downloadImages: document.getElementById('downloadImages').checked,
    downloadVideos: document.getElementById('downloadVideos').checked,
    restApiKey: document.getElementById('restApiKey').value.trim(),
    restApiPort: parseInt(document.getElementById('restApiPort').value) || 27124,

    // 评论设置
    saveComments: document.getElementById('saveComments').checked,
    commentCount: commentCount,
    saveAllComments: document.getElementById('saveAllComments').checked,
    foldComments: document.getElementById('foldComments').checked,
    // V4.3.7: 楼层范围设置
    useFloorRange: document.getElementById('useFloorRange').checked,
    floorFrom: Math.max(1, parseInt(document.getElementById('floorFrom').value) || 1),
    floorTo: Math.max(1, parseInt(document.getElementById('floorTo').value) || 100)
  };

  // 验证：插件启用时至少选择一个保存目标
  if (config.pluginEnabled && !config.saveToObsidian && !config.saveToFeishu && !config.saveToNotion && !config.saveToSiyuan && !config.exportHtml) {
    showStatus('请至少选择一个保存目标', 'error');
    return;
  }

  // 验证：如果启用飞书，检查必填项
  if (config.saveToFeishu) {
    if (!config.feishuAppId || !config.feishuAppSecret || !config.feishuAppToken || !config.feishuTableId) {
      showStatus('请填写完整的飞书配置信息', 'error');
      return;
    }
  }

  // 验证：如果启用 Notion，检查必填项 (V4.0.1)
  if (config.saveToNotion) {
    if (!config.notionToken) {
      showStatus('请填写 Notion Integration Token', 'error');
      return;
    }
    if (!config.notionToken.startsWith('secret_') && !config.notionToken.startsWith('ntn_')) {
      showStatus('Integration Token 格式错误（应以 secret_ 或 ntn_ 开头）', 'error');
      return;
    }
    if (!config.notionDatabaseId) {
      showStatus('请填写 Notion Database ID', 'error');
      return;
    }
    // 验证 Database ID 格式（移除连字符后应为32位十六进制）
    const cleanId = config.notionDatabaseId.replace(/-/g, '');
    if (!/^[a-f0-9]{32}$/i.test(cleanId)) {
      showStatus('Database ID 格式错误（应为 32 位十六进制字符）', 'error');
      return;
    }
    if (!config.notionPropTitle) {
      showStatus('请填写标题属性名', 'error');
      return;
    }
  }

  // 验证：如果启用思源笔记，检查必填项
  if (config.saveToSiyuan) {
    if (!config.siyuanNotebook) {
      showStatus('请填写思源笔记本 ID', 'error');
      return;
    }
    // 验证 API URL 格式
    if (config.siyuanApiUrl) {
      try {
        const url = new URL(config.siyuanApiUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
          showStatus('思源 API 地址必须以 http:// 或 https:// 开头', 'error');
          return;
        }
      } catch (e) {
        showStatus('思源 API 地址格式不正确', 'error');
        return;
      }
    }
  }

  // V3.6.0: 验证图片嵌入需要 Advanced URI
  if (config.embedImages && config.saveToObsidian && !config.useAdvancedUri) {
    // 自动启用 Advanced URI
    config.useAdvancedUri = true;
    document.getElementById('useAdvancedUri').checked = true;
    showStatus('已自动启用 Advanced URI（图片嵌入必需）', 'info');
  }

  // V4.7: 下载图片需要 REST API Key
  if (config.downloadImages && !config.restApiKey) {
    showStatus('请填写 Obsidian Local REST API Key', 'error');
    return;
  }

  chrome.storage.sync.set(config, () => {
    if (chrome.runtime.lastError) {
      showStatus('保存失败: ' + chrome.runtime.lastError.message, 'error');
      return;
    }
    showStatus('设置已保存', 'success');
  });
}

// 恢复默认
function resetOptions() {
  if (confirm('确定恢复默认设置？飞书配置也会被清空。')) {
    chrome.storage.sync.set(DEFAULT_CONFIG, () => {
      loadOptions();
      showStatus('已恢复默认设置', 'success');
    });
  }
}

// 测试飞书连接
async function testFeishuConnection() {
  const btn = document.getElementById('testFeishuBtn');
  const originalText = btn.textContent;

  btn.textContent = '测试中...';
  btn.disabled = true;

  const config = {
    apiDomain: document.getElementById('feishuApiDomain').value,
    appId: document.getElementById('feishuAppId').value.trim(),
    appSecret: document.getElementById('feishuAppSecret').value.trim(),
    appToken: document.getElementById('feishuAppToken').value.trim(),
    tableId: document.getElementById('feishuTableId').value.trim()
  };

  // 验证必填项
  if (!config.appId || !config.appSecret || !config.appToken || !config.tableId) {
    showStatus('请先填写完整的飞书配置', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  try {
    // 发送消息给 background script 测试连接
    chrome.runtime.sendMessage(
      { action: 'testFeishuConnection', config },
      (response) => {
        btn.textContent = originalText;
        btn.disabled = false;

        if (chrome.runtime.lastError) {
          showStatus('测试失败: ' + chrome.runtime.lastError.message, 'error');
          return;
        }

        if (response.success) {
          showStatus(response.message, 'success');
        } else {
          showStatus('连接失败: ' + response.error, 'error');
        }
      }
    );
  } catch (error) {
    btn.textContent = originalText;
    btn.disabled = false;
    showStatus('测试失败: ' + error.message, 'error');
  }
}

// 测试 Notion 连接 (V4.0.1)
async function testNotionConnection() {
  const btn = document.getElementById('testNotionBtn');
  const originalText = btn.textContent;

  btn.textContent = '测试中...';
  btn.disabled = true;

  const config = {
    notionToken: document.getElementById('notionToken').value.trim(),
    notionDatabaseId: document.getElementById('notionDatabaseId').value.trim(),
    notionPropTitle: document.getElementById('notionPropTitle').value.trim() || 'Title',
    notionPropUrl: document.getElementById('notionPropUrl').value.trim() || 'URL',
    notionPropAuthor: document.getElementById('notionPropAuthor').value.trim() || 'Author',
    notionPropCategory: document.getElementById('notionPropCategory').value.trim() || 'Category',
    notionPropSavedDate: document.getElementById('notionPropSavedDate').value.trim() || 'Saved Date',
    notionPropCommentCount: document.getElementById('notionPropCommentCount').value.trim() || 'Comments'
  };

  // 验证必填项
  if (!config.notionToken) {
    showStatus('请先填写 Integration Token', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  if (!config.notionToken.startsWith('secret_') && !config.notionToken.startsWith('ntn_')) {
    showStatus('Integration Token 格式错误（应以 secret_ 或 ntn_ 开头）', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  if (!config.notionDatabaseId) {
    showStatus('请先填写 Database ID', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  try {
    // 发送消息给 background script 测试连接
    chrome.runtime.sendMessage(
      { action: 'testNotionConnection', config },
      (response) => {
        btn.textContent = originalText;
        btn.disabled = false;

        if (chrome.runtime.lastError) {
          showStatus('测试失败: ' + chrome.runtime.lastError.message, 'error');
          return;
        }

        if (response.success) {
          showStatus(response.message, 'success');
        } else {
          showStatus('连接失败: ' + response.error, 'error');
        }
      }
    );
  } catch (error) {
    btn.textContent = originalText;
    btn.disabled = false;
    showStatus('测试失败: ' + error.message, 'error');
  }
}

// 测试思源笔记连接
async function testSiyuanConnection() {
  const btn = document.getElementById('testSiyuanBtn');
  const originalText = btn.textContent;

  btn.textContent = '测试中...';
  btn.disabled = true;

  const config = {
    siyuanApiUrl: document.getElementById('siyuanApiUrl').value.trim() || 'http://127.0.0.1:6806',
    siyuanToken: document.getElementById('siyuanToken').value.trim(),
    siyuanNotebook: document.getElementById('siyuanNotebook').value.trim()
  };

  if (!config.siyuanNotebook) {
    showStatus('请先填写笔记本 ID', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  try {
    chrome.runtime.sendMessage(
      { action: 'testSiyuanConnection', config },
      (response) => {
        btn.textContent = originalText;
        btn.disabled = false;

        if (chrome.runtime.lastError) {
          showStatus('测试失败: ' + chrome.runtime.lastError.message, 'error');
          return;
        }

        if (response.success) {
          showStatus(response.message, 'success');
        } else {
          showStatus('连接失败: ' + response.error, 'error');
        }
      }
    );
  } catch (error) {
    btn.textContent = originalText;
    btn.disabled = false;
    showStatus('测试失败: ' + error.message, 'error');
  }
}

// V4.7: 测试 Obsidian Local REST API 连接
async function testRestApiConnection() {
  const btn = document.getElementById('testRestApiBtn');
  const originalText = btn.textContent;

  btn.textContent = '测试中...';
  btn.disabled = true;

  const config = {
    restApiKey: document.getElementById('restApiKey').value.trim(),
    restApiPort: parseInt(document.getElementById('restApiPort').value) || 27124
  };

  if (!config.restApiKey) {
    showStatus('请先填写 API Key', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  try {
    chrome.runtime.sendMessage(
      { action: 'testRestApiConnection', config },
      (response) => {
        btn.textContent = originalText;
        btn.disabled = false;

        if (chrome.runtime.lastError) {
          showStatus('测试失败: ' + chrome.runtime.lastError.message, 'error');
          return;
        }

        if (response.success) {
          showStatus(response.message, 'success');
        } else {
          showStatus('连接失败: ' + response.error, 'error');
        }
      }
    );
  } catch (error) {
    btn.textContent = originalText;
    btn.disabled = false;
    showStatus('测试失败: ' + error.message, 'error');
  }
}

// 显示状态
function showStatus(message, type) {
  const statusElement = document.getElementById('statusMessage');
  statusElement.textContent = message;
  statusElement.className = `status-message ${type} show`;

  setTimeout(() => {
    statusElement.classList.remove('show');
  }, 3000);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  loadOptions();

  // 初始化语言设置
  initLanguage();

  // 语言切换按钮事件
  document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh'));
  document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

  // 初始化主题
  initTheme();

  // 主题切换按钮事件
  document.querySelectorAll('#themeToggle button').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.themeVal));
  });

  // Tab 切换事件
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // 赞赏弹窗事件
  document.getElementById('coffeeBtn').addEventListener('click', openDonateModal);
  document.getElementById('donateClose').addEventListener('click', closeDonateModal);
  document.getElementById('donateOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDonateModal();
  });
  document.querySelectorAll('.donate-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchDonateTab(btn.dataset.donate));
  });

  // 表单提交
  document.getElementById('optionsForm').addEventListener('submit', saveOptions);

  // 恢复默认
  document.getElementById('resetBtn').addEventListener('click', resetOptions);

  // 测试飞书连接
  document.getElementById('testFeishuBtn').addEventListener('click', testFeishuConnection);

  // 添加自定义站点 (V3.6.0)
  document.getElementById('addSiteBtn').addEventListener('click', addSite);

  // 回车添加站点
  document.getElementById('newSiteInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSite();
    }
  });

  // 保存目标复选框变化
  document.getElementById('saveToObsidian').addEventListener('change', (e) => {
    updateObsidianSectionVisibility(e.target.checked);
  });

  document.getElementById('saveToFeishu').addEventListener('change', (e) => {
    updateFeishuOptionsVisibility(e.target.checked);
  });

  document.getElementById('saveToNotion').addEventListener('change', (e) => {
    updateNotionOptionsVisibility(e.target.checked);
  });

  document.getElementById('saveToSiyuan').addEventListener('change', (e) => {
    updateSiyuanOptionsVisibility(e.target.checked);
  });

  // 测试思源笔记连接
  document.getElementById('testSiyuanBtn').addEventListener('click', testSiyuanConnection);
  document.getElementById('testRestApiBtn').addEventListener('click', testRestApiConnection);

  // 测试 Notion 连接 (V4.0.1)
  document.getElementById('testNotionBtn').addEventListener('click', testNotionConnection);

  // 保存评论复选框控制子选项
  document.getElementById('saveComments').addEventListener('change', (e) => {
    updateCommentOptionsVisibility(e.target.checked);
  });

  // 保存全部评论复选框
  document.getElementById('saveAllComments').addEventListener('change', (e) => {
    updateSaveAllCommentsVisibility(e.target.checked);
    // V4.3.7: 启用"保存全部"时，禁用楼层范围（互斥）
    const floorRangeCheckbox = document.getElementById('useFloorRange');
    if (e.target.checked && floorRangeCheckbox.checked) {
      floorRangeCheckbox.checked = false;
      updateFloorRangeVisibility(false);
      showStatus('已关闭"楼层范围"，使用保存全部模式', 'info');
    }
  });

  // V4.3.7: 楼层范围选择
  document.getElementById('useFloorRange').addEventListener('change', (e) => {
    updateFloorRangeVisibility(e.target.checked);
    // 启用楼层范围时，禁用"保存全部"（互斥）
    const saveAllCheckbox = document.getElementById('saveAllComments');
    if (e.target.checked && saveAllCheckbox.checked) {
      saveAllCheckbox.checked = false;
      updateSaveAllCommentsVisibility(false);
      showStatus('已关闭"保存全部"，使用楼层范围模式', 'info');
    }
    // 显示楼层范围模式说明
    if (e.target.checked) {
      showStatus('楼层范围模式：将自动获取足够的评论以覆盖指定楼层', 'info');
    }
  });

  // 图片嵌入设置 (V3.6.0)
  document.getElementById('embedImages').addEventListener('change', (e) => {
    updateImageSettingsVisibility(e.target.checked);

    // 启用图片嵌入时，自动启用 Advanced URI（必需）
    if (e.target.checked) {
      const advancedUriCheckbox = document.getElementById('useAdvancedUri');
      if (advancedUriCheckbox && !advancedUriCheckbox.checked) {
        advancedUriCheckbox.checked = true;
        showStatus('已自动启用 Advanced URI（图片嵌入必需）', 'info');
      }
      // 互斥：关闭图片下载
      const downloadCheckbox = document.getElementById('downloadImages');
      if (downloadCheckbox && downloadCheckbox.checked) {
        downloadCheckbox.checked = false;
        updateDownloadImagesVisibility(false);
        showStatus('已关闭"下载图片到本地"（与 Base64 嵌入互斥）', 'info');
      }
    }
  });

  // 图片/视频下载到本地 (V4.7)
  document.getElementById('downloadImages').addEventListener('change', (e) => {
    updateDownloadImagesVisibility(e.target.checked);

    // 互斥：关闭 Base64 嵌入
    if (e.target.checked) {
      const embedCheckbox = document.getElementById('embedImages');
      if (embedCheckbox && embedCheckbox.checked) {
        embedCheckbox.checked = false;
        updateImageSettingsVisibility(false);
        showStatus('已关闭"图片嵌入 Base64"（与下载到本地互斥）', 'info');
      }
    }
  });

});
