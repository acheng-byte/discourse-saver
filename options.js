// Discourse Saver V4.2.3 - 设置页面
// 支持 Obsidian、飞书多维表格和 Notion
// V3.6.0: 支持所有 Discourse 论坛 + 自定义站点管理 + 可折叠面板
// V4.0.1: 新增 Notion Database 保存功能
// V4.0.2: 修复换行渲染问题
// V4.2.3: Notion 属性默认值根据语言自动切换

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
  feishuUploadContent: true,  // V5.3.1: 默认上传正文
  feishuUploadAttachment: false,

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

  // 评论设置
  saveComments: false,
  commentCount: 100,
  saveAllComments: false,
  foldComments: false,
  // V4.3.7: 楼层范围设置
  useFloorRange: false,
  floorFrom: 1,
  floorTo: 100,

  // 下载图片/视频到Vault
  downloadImages: false,
  downloadVideos: true,
  restApiKey: '',
  restApiPort: 27124,
  mediaFolderName: 'media',

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
  siyuanSavePath: '/Discourse收集箱'
};

// (已移除 toggleSection / expandAllSections 死代码 - HTML 中无对应元素)

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
    document.getElementById('feishuUploadContent').checked = config.feishuUploadContent !== false;  // V5.3.1: 默认true
    document.getElementById('feishuUploadAttachment').checked = config.feishuUploadAttachment;
    document.getElementById('feishuUploadHtml').checked = config.feishuUploadHtml || false;

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

    // 语雀设置
    document.getElementById('saveToYuque').checked = config.saveToYuque;
    document.getElementById('yuqueToken').value = config.yuqueToken || '';
    document.getElementById('yuqueRepoNamespace').value = config.yuqueRepoNamespace || '';
    document.getElementById('yuqueDocPublic').value = config.yuqueDocPublic || 0;

    // 思源笔记设置
    document.getElementById('saveToSiyuan').checked = config.saveToSiyuan;
    document.getElementById('siyuanApiUrl').value = config.siyuanApiUrl || 'http://127.0.0.1:6806';
    document.getElementById('siyuanToken').value = config.siyuanToken || '';
    document.getElementById('siyuanNotebook').value = config.siyuanNotebook || '';
    document.getElementById('siyuanSavePath').value = config.siyuanSavePath || '/Discourse收集箱';

    // 内容设置
    document.getElementById('addMetadata').checked = config.addMetadata;
    document.getElementById('includeImages').checked = config.includeImages;

    // 图片嵌入设置 (V3.6.0)
    document.getElementById('embedImages').checked = config.embedImages;
    document.getElementById('imageMaxWidth').value = config.imageMaxWidth;
    document.getElementById('imageQuality').value = config.imageQuality;
    document.getElementById('imageSkipGif').checked = config.imageSkipGif;
    // 下载图片/视频到Vault
    document.getElementById('downloadImages').checked = config.downloadImages;
    document.getElementById('restApiKey').value = config.restApiKey || '';
    document.getElementById('restApiPort').value = config.restApiPort || 27124;
    document.getElementById('downloadVideos').checked = config.downloadVideos !== false;
    document.getElementById('mediaFolderName').value = config.mediaFolderName || 'media';
    updateDownloadImagesVisibility();

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
    updateCommentOptionsVisibility(config.saveComments);
    updateSaveAllCommentsVisibility(config.saveAllComments);
    updateImageSettingsVisibility(config.embedImages);
    updateFloorRangeVisibility(config.useFloorRange);
    updateYuqueOptionsVisibility(config.saveToYuque);
    updateSiyuanOptionsVisibility(config.saveToSiyuan);

    // (已移除 expandAllSections 调用 - Tab 布局无需折叠展开)
    });
  });
}

// 更新 Obsidian 区域可见性
function updateObsidianSectionVisibility(enabled) {
  const section = document.getElementById('obsidianSection');
  if (section) {
    section.style.opacity = enabled ? '1' : '0.5';
    // 只禁用 input/select，保持测试连接和查看日志按钮可用
    const inputs = section.querySelectorAll('input, select');
    inputs.forEach(el => {
      el.style.pointerEvents = enabled ? 'auto' : 'none';
    });
  }
}

// 更新飞书选项可见性
function updateFeishuOptionsVisibility(enabled) {
  const feishuOptions = document.getElementById('feishuOptions');
  if (feishuOptions) {
    feishuOptions.style.opacity = enabled ? '1' : '0.5';
    // 只禁用 input/select，保持测试连接按钮可用
    const inputs = feishuOptions.querySelectorAll('input, select');
    inputs.forEach(el => {
      el.style.pointerEvents = enabled ? 'auto' : 'none';
    });
  }
}

// 更新 Notion 区域可见性 (V4.0.1)
function updateNotionOptionsVisibility(enabled) {
  const section = document.getElementById('notionSection');
  if (section) {
    section.style.opacity = enabled ? '1' : '0.5';
    // 只禁用 input/select，保持测试连接按钮可用
    const inputs = section.querySelectorAll('input, select');
    inputs.forEach(el => {
      el.style.pointerEvents = enabled ? 'auto' : 'none';
    });
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
    feishuUploadContent: document.getElementById('feishuUploadContent').checked,  // V5.3.1
    feishuUploadAttachment: document.getElementById('feishuUploadAttachment').checked,
    feishuUploadHtml: document.getElementById('feishuUploadHtml').checked,

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

    // 语雀设置
    saveToYuque: document.getElementById('saveToYuque').checked,
    yuqueToken: document.getElementById('yuqueToken').value.trim(),
    yuqueRepoNamespace: document.getElementById('yuqueRepoNamespace').value.trim(),
    yuqueDocPublic: parseInt(document.getElementById('yuqueDocPublic').value) || 0,

    // 思源笔记设置
    saveToSiyuan: document.getElementById('saveToSiyuan').checked,
    siyuanApiUrl: document.getElementById('siyuanApiUrl').value.trim() || 'http://127.0.0.1:6806',
    siyuanToken: document.getElementById('siyuanToken').value.trim(),
    siyuanNotebook: document.getElementById('siyuanNotebook').value.trim(),
    siyuanSavePath: document.getElementById('siyuanSavePath').value.trim() || '/Discourse收集箱',

    // 内容设置
    addMetadata: document.getElementById('addMetadata').checked,
    includeImages: document.getElementById('includeImages').checked,

    // 图片嵌入设置 (V3.6.0)
    embedImages: document.getElementById('embedImages').checked,
    imageMaxWidth: parseInt(document.getElementById('imageMaxWidth').value) || 1920,
    imageQuality: parseFloat(document.getElementById('imageQuality').value) || 0.9,
    imageSkipGif: document.getElementById('imageSkipGif').checked,
    // 下载图片/视频到Vault
    downloadImages: document.getElementById('downloadImages').checked,
    downloadVideos: document.getElementById('downloadVideos').checked,
    restApiKey: document.getElementById('restApiKey').value.trim(),
    restApiPort: parseInt(document.getElementById('restApiPort').value) || 27124,
    mediaFolderName: document.getElementById('mediaFolderName').value.trim() || 'media',

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
  if (config.pluginEnabled && !config.saveToObsidian && !config.saveToFeishu && !config.saveToNotion && !config.saveToYuque && !config.saveToSiyuan && !config.exportHtml) {
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

  // 验证：如果启用语雀，检查必填项
  if (config.saveToYuque) {
    if (!config.yuqueToken) {
      showStatus('请填写语雀访问令牌 (Token)', 'error');
      return;
    }
    if (!config.yuqueRepoNamespace) {
      showStatus('请填写语雀知识库 namespace', 'error');
      return;
    }
  }

  // 验证：如果启用思源，检查必填项
  if (config.saveToSiyuan) {
    if (!config.siyuanNotebook) {
      showStatus('请填写思源笔记笔记本 ID（可先点测试连接查看列表）', 'error');
      return;
    }
  }

  // V3.6.0: 验证图片嵌入需要 Advanced URI
  if (config.embedImages && config.saveToObsidian && !config.useAdvancedUri) {
    // 自动启用 Advanced URI
    config.useAdvancedUri = true;
    document.getElementById('useAdvancedUri').checked = true;
    showStatus('已自动启用 Advanced URI（图片嵌入必需）', 'info');
  }

  chrome.storage.sync.set(config, () => {
    if (chrome.runtime.lastError) {
      showStatus('保存失败: ' + chrome.runtime.lastError.message, 'error');
      return;
    }
    showStatus('设置已保存', 'success');
  });
}

// 恢复默认（彻底清除所有数据，恢复到刚安装状态）
function resetOptions() {
  showConfirmDialog(
    '确定恢复默认设置？所有配置（飞书、Notion、语雀、自定义站点等）、运行日志、历史记录都会被清空，恢复到插件刚安装时的状态。',
    () => {
      // 先写入默认配置（保证 pluginEnabled 始终有值，避免竞态条件）
      // 先清除 background.js 内存中的日志缓冲（含定时器），再清 storage
      try {
        chrome.runtime.sendMessage({ action: 'clearLogs' }, () => {
          // 忽略 lastError（service worker 可能未就绪）
          void chrome.runtime.lastError;
          doReset();
        });
      } catch (_) {
        doReset();
      }

      function doReset() {
        chrome.storage.sync.set(DEFAULT_CONFIG, () => {
          chrome.storage.local.clear(() => {
            loadOptions();
            const sitesList = document.getElementById('customSitesList');
            if (sitesList) sitesList.innerHTML = '';
            showStatus('已恢复默认设置，所有数据已清除', 'success');
          });
        });
      }
    }
  );
}

// 自定义确认弹窗（替代浏览器原生 confirm）
function showConfirmDialog(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';

  const dialog = document.createElement('div');
  dialog.style.cssText = 'background:var(--card-bg,#fff);border-radius:12px;padding:24px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.2);';

  const msg = document.createElement('p');
  msg.textContent = message;
  msg.style.cssText = 'margin:0 0 20px;font-size:14px;line-height:1.6;color:var(--text,#333);';

  const btnGroup = document.createElement('div');
  btnGroup.style.cssText = 'display:flex;gap:12px;justify-content:flex-end;';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = '取消';
  cancelBtn.style.cssText = 'padding:8px 20px;border-radius:6px;border:1px solid var(--border,#ddd);background:var(--sub-bg,#f5f5f5);color:var(--text-secondary,#666);cursor:pointer;font-size:13px;';
  cancelBtn.onclick = () => overlay.remove();

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = '确定';
  confirmBtn.style.cssText = 'padding:8px 20px;border-radius:6px;border:none;background:#e74c3c;color:#fff;cursor:pointer;font-size:13px;font-weight:500;';
  confirmBtn.onclick = () => {
    overlay.remove();
    onConfirm();
  };

  btnGroup.appendChild(cancelBtn);
  btnGroup.appendChild(confirmBtn);
  dialog.appendChild(msg);
  dialog.appendChild(btnGroup);
  overlay.appendChild(dialog);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
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

// 更新下载图片面板可见性
function updateDownloadImagesVisibility() {
  const checked = document.getElementById('downloadImages').checked;
  const panel = document.getElementById('downloadImagesPanel');
  if (panel) {
    if (checked) {
      panel.classList.remove('disabled');
    } else {
      panel.classList.add('disabled');
    }
  }
  // downloadImages 和 embedImages 互斥
  if (checked) {
    document.getElementById('embedImages').checked = false;
  }
}

// 测试 Obsidian REST API 连接
async function testRestApiConnection() {
  const btn = document.getElementById('testRestApiBtn');
  const originalText = btn.textContent;

  btn.textContent = '测试中...';
  btn.disabled = true;

  const apiKey = document.getElementById('restApiKey').value.trim();
  const apiPort = document.getElementById('restApiPort').value.trim() || '27124';

  if (!apiKey) {
    showStatus('请先填写 REST API Key', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  try {
    const response = await fetch(`https://127.0.0.1:${apiPort}/`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      }
    });

    if (response.ok) {
      const data = await response.json();
      showStatus(`连接成功！Obsidian REST API 已就绪${data.service ? ' (' + data.service + ')' : ''}`, 'success');
    } else if (response.status === 401 || response.status === 403) {
      showStatus('API Key 无效，请检查后重试', 'error');
    } else {
      showStatus(`连接失败，HTTP ${response.status}`, 'error');
    }
  } catch (error) {
    // REST API 默认使用 HTTPS 自签名证书，浏览器可能拒绝
    // 尝试 HTTP 回退
    try {
      const response = await fetch(`http://127.0.0.1:${apiPort}/`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        showStatus(`连接成功！Obsidian REST API 已就绪${data.service ? ' (' + data.service + ')' : ''}`, 'success');
      } else if (response.status === 401 || response.status === 403) {
        showStatus('API Key 无效，请检查后重试', 'error');
      } else {
        showStatus(`连接失败，HTTP ${response.status}`, 'error');
      }
    } catch (err2) {
      showStatus('无法连接到 Obsidian REST API。请确认：1) Obsidian 已打开 2) Local REST API 插件已启用 3) 端口号正确', 'error');
    }
  }

  btn.textContent = originalText;
  btn.disabled = false;
}

// 查看 Obsidian REST API 日志
function showObsidianLogs() {
  chrome.storage.local.get({ obsidianLogs: [] }, (result) => {
    const logs = result.obsidianLogs || [];

    if (logs.length === 0) {
      showStatus('暂无日志记录。保存帖子（启用下载图片功能）后会自动生成日志。', 'info');
      return;
    }

    // 创建日志弹窗
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';

    const dialog = document.createElement('div');
    dialog.style.cssText = 'background:var(--card-bg,#fff);border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.2);';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
    header.innerHTML = '<h3 style="margin:0;font-size:16px;">下载日志</h3>';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = 'background:#555;color:#fff;border:none;padding:6px 16px;border-radius:6px;cursor:pointer;font-size:13px;';
    closeBtn.onclick = () => overlay.remove();
    header.appendChild(closeBtn);

    const content = document.createElement('div');
    content.style.cssText = 'overflow-y:auto;flex:1;font-size:13px;font-family:monospace;line-height:1.6;';

    const logHtml = logs.slice(-50).reverse().map(log => {
      const time = new Date(log.time).toLocaleString('zh-CN');
      const icon = log.success ? '✅' : '❌';
      return `<div style="padding:6px 0;border-bottom:1px solid var(--border,#eee);">${icon} <span style="color:#888;">${time}</span> ${log.file || ''} ${log.error ? '<span style="color:red;">' + log.error + '</span>' : ''}</div>`;
    }).join('');

    content.innerHTML = logHtml || '<p style="color:#888;">暂无日志</p>';

    const clearBtn = document.createElement('button');
    clearBtn.textContent = '清空日志';
    clearBtn.style.cssText = 'margin-top:12px;background:#e74c3c;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;align-self:flex-start;';
    clearBtn.onclick = () => {
      chrome.storage.local.set({ obsidianLogs: [] }, () => {
        content.innerHTML = '<p style="color:#888;">日志已清空</p>';
        showStatus('日志已清空', 'success');
      });
    };

    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(clearBtn);
    overlay.appendChild(dialog);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  });
}

// 更新语雀区域可见性
function updateYuqueOptionsVisibility(enabled) {
  const section = document.getElementById('yuqueSection');
  if (section) {
    section.style.opacity = enabled ? '1' : '0.5';
    const inputs = section.querySelectorAll('input, select, button');
    inputs.forEach(el => {
      if (!el.classList.contains('test-btn')) {
        el.style.pointerEvents = enabled ? 'auto' : 'none';
      }
    });
  }
}

// 测试语雀连接
async function testYuqueConnection() {
  const btn = document.getElementById('testYuqueBtn');
  const originalText = btn.textContent;

  btn.textContent = '测试中...';
  btn.disabled = true;

  const config = {
    yuqueToken: document.getElementById('yuqueToken').value.trim(),
    yuqueRepoNamespace: document.getElementById('yuqueRepoNamespace').value.trim()
  };

  if (!config.yuqueToken) {
    showStatus('请先填写语雀访问令牌', 'error');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  try {
    chrome.runtime.sendMessage(
      { action: 'testYuqueConnection', config },
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

// 更新思源区域可见性
function updateSiyuanOptionsVisibility(enabled) {
  const section = document.getElementById('siyuanSection');
  if (section) {
    section.style.opacity = enabled ? '1' : '0.5';
    const inputs = section.querySelectorAll('input, select, button');
    inputs.forEach(el => {
      if (!el.classList.contains('test-btn') && el.id !== 'testSiyuanBtn') {
        el.style.pointerEvents = enabled ? 'auto' : 'none';
      }
    });
  }
}

// 测试思源笔记连接
async function testSiyuanConnection() {
  const btn = document.getElementById('testSiyuanBtn');
  const originalText = btn.textContent;

  btn.textContent = '测试中...';
  btn.disabled = true;

  const apiUrl = (document.getElementById('siyuanApiUrl').value.trim() || 'http://127.0.0.1:6806').replace(/\/+$/, '');
  const token = document.getElementById('siyuanToken').value.trim();
  const notebookId = document.getElementById('siyuanNotebook').value.trim();

  try {
    // 测试版本接口
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Token ' + token;

    const versionResp = await fetch(apiUrl + '/api/system/version', {
      method: 'POST',
      headers: headers,
      body: '{}'
    });

    if (!versionResp.ok) {
      throw new Error('HTTP ' + versionResp.status);
    }

    const versionData = await versionResp.json();
    if (versionData.code !== 0) {
      throw new Error(versionData.msg || '连接失败');
    }

    let message = '连接成功！思源笔记版本: ' + versionData.data;

    // 如果填了笔记本ID，验证是否存在
    if (notebookId) {
      const nbResp = await fetch(apiUrl + '/api/notebook/lsNotebooks', {
        method: 'POST',
        headers: headers,
        body: '{}'
      });
      const nbData = await nbResp.json();
      if (nbData.code === 0 && nbData.data && nbData.data.notebooks) {
        const found = nbData.data.notebooks.find(nb => nb.id === notebookId);
        if (found) {
          message += ' | 笔记本: ' + found.name;
        } else {
          message += ' | 笔记本ID未找到，可用笔记本: ' +
            nbData.data.notebooks.filter(nb => !nb.closed).map(nb => nb.name + '(' + nb.id + ')').join(', ');
        }
      }
    } else {
      // 没填笔记本ID，列出所有可用笔记本
      const nbResp = await fetch(apiUrl + '/api/notebook/lsNotebooks', {
        method: 'POST',
        headers: headers,
        body: '{}'
      });
      const nbData = await nbResp.json();
      if (nbData.code === 0 && nbData.data && nbData.data.notebooks) {
        const openNbs = nbData.data.notebooks.filter(nb => !nb.closed);
        if (openNbs.length > 0) {
          message += ' | 可用笔记本: ' + openNbs.map(nb => nb.name + '(' + nb.id + ')').join(', ');
        }
      }
    }

    showStatus(message, 'success');
  } catch (error) {
    showStatus('无法连接到思源笔记。请确认：1) 思源笔记已启动 2) API 地址正确 3) 授权码正确。错误: ' + error.message, 'error');
  }

  btn.textContent = originalText;
  btn.disabled = false;
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

  // Tab 切换事件
  document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      // 移除所有 tab-btn 的 active
      document.querySelectorAll('.tab-btn[data-tab]').forEach(b => b.classList.remove('active'));
      // 移除所有 tab-panel 的 active
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      // 激活当前
      btn.classList.add('active');
      const panel = document.getElementById('tab-' + targetTab);
      if (panel) panel.classList.add('active');
    });
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

  // 测试 Notion 连接 (V4.0.1)
  document.getElementById('testNotionBtn').addEventListener('click', testNotionConnection);

  // 语雀相关事件
  document.getElementById('saveToYuque').addEventListener('change', (e) => {
    updateYuqueOptionsVisibility(e.target.checked);
  });
  document.getElementById('testYuqueBtn').addEventListener('click', testYuqueConnection);

  // 思源笔记相关事件
  document.getElementById('saveToSiyuan').addEventListener('change', (e) => {
    updateSiyuanOptionsVisibility(e.target.checked);
  });
  document.getElementById('testSiyuanBtn').addEventListener('click', testSiyuanConnection);

  // 下载图片到Vault复选框
  document.getElementById('downloadImages').addEventListener('change', () => {
    updateDownloadImagesVisibility();
  });

  // 测试 Obsidian REST API 连接
  document.getElementById('testRestApiBtn').addEventListener('click', testRestApiConnection);

  // 查看 Obsidian 下载日志
  document.getElementById('showObsidianLogsBtn').addEventListener('click', showObsidianLogs);

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
    }
  });

  // 移除文件夹路径首尾斜杠
  document.getElementById('folderPath').addEventListener('input', (e) => {
    let value = e.target.value.trim();
    value = value.replace(/^\/+|\/+$/g, '');
    if (e.target.value !== value) {
      e.target.value = value;
    }
  });

  // ==================== 主题切换 ====================
  document.querySelectorAll('#themeToggle button[data-theme-val]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme-val');
      document.querySelectorAll('#themeToggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (theme === 'auto') {
        document.body.removeAttribute('data-theme');
        localStorage.removeItem('ds-theme');
      } else {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('ds-theme', theme);
      }
    });
  });

  // 恢复保存的主题
  const savedTheme = localStorage.getItem('ds-theme');
  if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    document.querySelectorAll('#themeToggle button').forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`#themeToggle button[data-theme-val="${savedTheme}"]`);
    if (activeBtn) activeBtn.classList.add('active');
  }

  // ==================== 捐赠弹窗 ====================
  const coffeeBtn = document.getElementById('coffeeBtn');
  const donateOverlay = document.getElementById('donateOverlay');
  const donateClose = document.getElementById('donateClose');

  if (coffeeBtn && donateOverlay) {
    coffeeBtn.addEventListener('click', () => {
      donateOverlay.style.display = 'flex';
    });

    if (donateClose) {
      donateClose.addEventListener('click', () => {
        donateOverlay.style.display = 'none';
      });
    }

    donateOverlay.addEventListener('click', (e) => {
      if (e.target === donateOverlay) {
        donateOverlay.style.display = 'none';
      }
    });

    // 捐赠标签切换（微信/支付宝）
    document.querySelectorAll('.donate-tab-btn[data-donate]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const target = tabBtn.getAttribute('data-donate');
        document.querySelectorAll('.donate-tab-btn').forEach(b => {
          b.classList.remove('active-wechat', 'active-alipay');
        });
        tabBtn.classList.add(target === 'wechat' ? 'active-wechat' : 'active-alipay');

        document.getElementById('donate-wechat').style.display = target === 'wechat' ? 'block' : 'none';
        document.getElementById('donate-alipay').style.display = target === 'alipay' ? 'block' : 'none';
      });
    });
  }

  // ==================== Runtime Logs ====================
  const logContainer = document.getElementById('logContainer');
  const logEmpty = document.getElementById('logEmpty');
  const logCountLabel = document.getElementById('logCountLabel');
  const logLevelFilter = document.getElementById('logLevelFilter');
  const refreshLogsBtn = document.getElementById('refreshLogsBtn');
  const exportLogsBtn = document.getElementById('exportLogsBtn');
  const clearLogsBtn = document.getElementById('clearLogsBtn');

  let allLogs = [];

  function formatLogTime(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' +
           pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  function renderLogs() {
    const filter = logLevelFilter ? logLevelFilter.value : 'ALL';
    const filtered = filter === 'ALL' ? allLogs : allLogs.filter(e => e.l === filter);

    if (!logContainer) return;

    if (filtered.length === 0) {
      logContainer.innerHTML = '';
      logContainer.appendChild(logEmpty);
      logEmpty.style.display = 'block';
    } else {
      logEmpty.style.display = 'none';
      // Build HTML (newest first)
      const html = filtered.slice().reverse().map(e => {
        const time = formatLogTime(e.t);
        const lvl = e.l || 'INFO';
        const src = e.s || '?';
        const msg = (e.m || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return '<div class="log-entry">' +
          '<span class="log-time">' + time + '</span> ' +
          '<span class="log-level-' + lvl + '">[' + lvl + ']</span> ' +
          '<span class="log-source">[' + src + ']</span> ' +
          msg +
          '</div>';
      }).join('');
      logContainer.innerHTML = html;
    }

    if (logCountLabel) {
      logCountLabel.textContent = filtered.length + ' / ' + allLogs.length + ' 条';
    }
  }

  function loadLogs() {
    // 刷新按钮旋转动画
    if (refreshLogsBtn) {
      refreshLogsBtn.style.transition = 'transform 0.5s ease';
      refreshLogsBtn.style.transform = 'rotate(360deg)';
      refreshLogsBtn.disabled = true;
      setTimeout(() => {
        refreshLogsBtn.style.transition = 'none';
        refreshLogsBtn.style.transform = 'rotate(0deg)';
      }, 500);
    }
    chrome.runtime.sendMessage({ action: 'getLogs' }, (response) => {
      if (refreshLogsBtn) refreshLogsBtn.disabled = false;
      if (chrome.runtime.lastError) {
        console.error('获取日志失败:', chrome.runtime.lastError);
        return;
      }
      allLogs = (response && response.logs) || [];
      renderLogs();
    });
  }

  if (refreshLogsBtn) {
    refreshLogsBtn.addEventListener('click', loadLogs);
  }

  if (logLevelFilter) {
    logLevelFilter.addEventListener('change', renderLogs);
  }

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      showConfirmDialog('确认清空所有运行日志？', () => {
        chrome.runtime.sendMessage({ action: 'clearLogs' }, () => {
          allLogs = [];
          renderLogs();
        });
      });
    });
  }

  if (exportLogsBtn) {
    exportLogsBtn.addEventListener('click', () => {
      if (allLogs.length === 0) {
        showStatus('暂无日志可导出', 'info');
        return;
      }
      const lines = allLogs.map(e => {
        const time = new Date(e.t).toISOString();
        return time + ' [' + (e.l || 'INFO') + '] [' + (e.s || '?') + '] ' + (e.m || '');
      });
      const text = 'Discourse Saver Runtime Logs\nExported: ' + new Date().toISOString() + '\nTotal: ' + allLogs.length + ' entries\n' +
        '='.repeat(60) + '\n' + lines.join('\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'discourse-saver-logs-' + new Date().toISOString().slice(0, 10) + '.txt';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Auto-load logs when general tab is shown
  loadLogs();
});
