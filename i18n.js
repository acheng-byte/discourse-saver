// 国际化翻译字典
const i18n = {
  zh: {
    header: {
      subtitle: '保存 Discourse 论坛帖子到 Obsidian、飞书或 Notion V4.2.2'
    },
    sections: {
      pluginStatus: '插件状态',
      siteSettings: '站点设置',
      saveTarget: '保存目标',
      obsidian: 'Obsidian 设置',
      feishu: '飞书多维表格设置',
      notion: 'Notion Database 设置',
      content: '内容设置',
      comments: '评论设置'
    },
    pluginStatus: {
      enabled: '启用插件（关闭后链接按钮恢复原功能）',
      help: '关闭后需刷新页面生效'
    },
    siteSettings: {
      customSites: '自定义站点列表',
      addSite: '添加站点',
      help: '添加私有部署或未被自动检测的 Discourse 站点域名（如 forum.example.com）',
      autoDetect: '已内置支持所有 Discourse 论坛自动检测，仅在检测失败时需要手动添加',
      autoDetectHelp: '插件会自动检测 Discourse 论坛（如 LinuxDo、Meta.discourse.org 等）。',
      manualAddHelp: '如果某个站点未被自动识别，可以手动添加。',
      newSitePlaceholder: '输入站点域名，如 forum.example.com'
    },
    saveTarget: {
      obsidian: '保存到 Obsidian',
      feishu: '保存到飞书多维表格',
      notion: '保存到 Notion Database',
      exportHtml: '导出 HTML 文件',
      multiSaveHelp: '可以同时保存到多个地方'
    },
    html: {
      folder: 'HTML 导出文件夹',
      folderPlaceholder: 'Discourse导出',
      folderHelp: '相对于浏览器下载目录，留空则直接保存到下载目录'
    },
    obsidian: {
      vaultName: 'Vault 名称',
      vaultHelp: '留空使用当前打开的 vault（推荐）',
      vaultPlaceholder: '留空自动使用当前打开的仓库',
      vaultHelpDetail: '推荐留空，会自动保存到当前打开的 Obsidian 仓库',
      folder: '保存文件夹',
      folderHelp: '文件保存到该文件夹下',
      folderPlaceholder: 'LinuxDo收集箱',
      folderHelpDetail: '文件夹不存在会自动创建',
      useUri: '使用 Advanced URI 插件',
      uriHelp: '支持保存大内容（需先在 Obsidian 中安装 Advanced URI 插件）',
      useAdvancedUri: '使用 Advanced URI 插件（支持大内容）',
      advancedUriHelp: '需先在 Obsidian 中安装 "Advanced URI" 插件'
    },
    feishu: {
      version: 'API 版本',
      versionFeishu: '飞书（国内版）',
      versionLark: 'Lark（国际版）',
      versionHelp: '根据你的飞书账号类型选择，国内用户选飞书，海外用户选 Lark',
      appId: 'App ID',
      appIdHelp: '在飞书开放平台创建应用获取',
      appIdPlaceholder: 'cli_xxxxxxxxxxxxxxxx',
      appSecret: 'App Secret',
      appSecretPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      appToken: '多维表格 app_token',
      appTokenHelp: 'URL 中 /base/ 后面到 ? 之前的字符串',
      appTokenPlaceholder: 'bascnxxxxxxxxxxxxxxxx',
      appTokenHelpDetail: '从多维表格 URL 中获取：feishu.cn/base/bascnxxx?table=...',
      tableId: '数据表 table_id',
      tableIdHelp: 'URL 中 ?table= 后面的字符串（以 tbl 开头）',
      tableIdPlaceholder: 'tblxxxxxxxxxxxxxxxx',
      tableIdHelpDetail: '从 URL 中获取：?table=tblxxx&view=...',
      uploadMd: '上传 MD 附件（需额外权限，可选）',
      uploadMdHelp: '将完整内容作为 .md 文件上传到飞书',
      uploadMdHelpDetail: '不勾选则只保存文本摘要，无需 drive 权限',
      testConnection: '测试连接',
      help: '配置教程请参考 README 中的飞书设置章节',
      perm1Title: '1. 必须的权限（均为免审）：',
      perm1Content: 'bitable:app（多维表格读写）',
      perm2Title: '2. 上传附件的权限（免审）：',
      perm2Content: 'drive:file:upload（上传文件到云空间）',
      perm3Title: '3. 多维表格字段（9个必填）：',
      perm3Content1: '标题（文本）、链接（超链接）、作者（文本）、分类（文本）、标签（文本）、保存时间（日期）、评论数（数字）',
      perm3Content2: '如勾选上传附件：附件（附件）；否则：正文（文本）'
    },
    notion: {
      token: 'Integration Token',
      tokenPlaceholder: 'ntn_xxx 或 secret_xxx',
      tokenHelp: '以 ntn_ 或 secret_ 开头，从 Notion Integration 页面获取',
      tokenHelpPre: '在',
      tokenHelpPost: '创建获取',
      detailedGuide: '详细教程',
      databaseId: 'Database ID',
      databaseIdPlaceholder: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      databaseIdHelp: '32 位十六进制字符，从 Database URL 获取',
      databaseIdHelpDetail: '从 Database 链接中复制，格式为 32 位字符（可含连字符）',
      propertyMapping: '属性映射配置',
      propertyMappingHelp: '属性名需与 Notion Database 中的列名完全匹配（区分大小写）',
      propTitleLabel: '标题属性名',
      propTitleType: '（类型：Title）',
      propTitlePlaceholder: '标题',
      propUrlLabel: '链接属性名',
      propUrlType: '（类型：URL）',
      propUrlPlaceholder: '链接',
      propAuthorLabel: '作者属性名',
      propAuthorType: '（类型：Rich Text）',
      propAuthorPlaceholder: '作者',
      propCategoryLabel: '分类属性名',
      propCategoryType: '（类型：Rich Text 或 Select）',
      propCategoryPlaceholder: '分类',
      propTagsLabel: '标签属性名',
      propTagsType: '（类型：Multi Select）',
      propSavedDateLabel: '保存日期属性名',
      propSavedDateType: '（类型：Date）',
      propSavedDatePlaceholder: '保存日期',
      propCommentCountLabel: '评论数属性名',
      propCommentCountType: '（类型：Number）',
      propCommentCountPlaceholder: '评论数',
      testConnection: '测试连接',
      help: '详细配置请参考 NOTION-GUIDE.html',
      configStepsTitle: '配置步骤：',
      configStep1: '1. 创建 Internal Integration 并复制 Token',
      configStep2: '2. 创建 Database 并添加以下属性列（名称和类型必须匹配）：',
      configStep2a: '   • 标题（Title 类型）- 必填',
      configStep2b: '   • 链接（URL 类型）- 必填',
      configStep2c: '   • 作者（Rich Text 类型）',
      configStep2d: '   • 分类（Rich Text 或 Select 类型）',
      configStep2d2: '   • 标签（Multi Select 类型）',
      configStep2e: '   • 保存日期（Date 类型）',
      configStep2f: '   • 评论数（Number 类型）',
      configStep3: '3. 在 Database 页面点击「...」→「Connections」→ 添加你的 Integration',
      configStep4: '4. 从 Database 链接中复制 ID 并填入上方',
      imageWarningTitle: '图片嵌入注意',
      imageWarningContent: '如果开启了"图片嵌入（Base64）"功能，Notion 将无法显示图片（Notion 不支持 Base64 格式）。建议关闭图片嵌入或仅用于 Obsidian。'
    },
    content: {
      addMetadata: '添加元数据（来源、作者、时间等）',
      keepImages: '保留图片链接',
      embedImages: '将图片嵌入笔记（Base64）',
      embedImagesHelp: '图片转为 Base64 嵌入 Markdown，单文件完整保存（需启用 Advanced URI）',
      embedWarning1Title: '注意：',
      embedWarning1Content: '启用后图片会以 Base64 格式嵌入 Markdown 文件中。优点是单文件完整保存，缺点是文件体积会显著增大。',
      embedWarning2Title: '⚠️ 重要：',
      embedWarning2Content: '图片嵌入会使文件变大，必须启用上方的"使用 Advanced URI 插件"选项才能正常保存到 Obsidian。',
      embedWarning3Title: '📄 HTML 导出提示：',
      embedWarning3Content: '每张图片约增加 100KB-1MB 文件大小。大文章（图片多或超长内容）建议关闭此功能，HTML 将保留原图链接，支持 10 万字以上内容流畅浏览。',
      maxWidth: '图片最大宽度',
      maxWidthHelp: '超过此宽度的图片会等比例缩小',
      maxWidthOriginal: '保持原始尺寸',
      quality: '图片质量',
      qualityHelp: '降低质量可减小文件体积',
      skipGif: '跳过 GIF 动图（保留原链接）',
      skipGifHelp: 'GIF 转 Base64 会失去动画效果，启用后保留原链接',
      skipGifHelpDetail: 'GIF 转换后会失去动画效果'
    },
    comments: {
      saveComments: '保存评论区',
      // V4.3.7: 三选一模式提示
      modeHint: '评论获取模式（三选一）：',
      commentsCount: '评论数量：',
      commentsRange: '条（0-10000）',
      commentsHelp: '设置最多保存多少条评论（0-10000）',
      saveAllComments: '保存全部',
      saveAllWarning: '⚠️ 评论较多时可能需要较长时间加载',
      collapseComments: '折叠评论（使用HTML details标签）',
      collapseHelp: '使用 <details> 标签折叠评论内容',
      // V4.3.7: 楼层范围
      useFloorRange: '指定楼层范围',
      floorFrom: '从第',
      floorTo: '楼到第',
      floorUnit: '楼',
      floorRangeHelp: '只保存指定范围内的楼层评论',
      fetchExplainTitle: '评论获取说明：',
      fetchExplain1: '• 评论数 ≤30 条：从当前页面提取（快速）',
      fetchExplain2: '• 评论数 >30 条或勾选"保存全部"：通过API获取（完整，解决懒加载问题）',
      fetchExplain3: '• 超过500条评论时会显示加载进度'
    },
    buttons: {
      save: '保存设置',
      saving: '保存中...',
      saved: '已保存',
      testConnection: '测试连接',
      testing: '测试中...',
      addSite: '添加站点',
      add: '添加',
      reset: '恢复默认'
    },
    messages: {
      saveSuccess: '设置已保存',
      saveError: '保存失败',
      feishuTestSuccess: '飞书连接测试成功！',
      feishuTestFailed: '飞书连接测试失败',
      notionTestSuccess: 'Notion 连接测试成功！',
      notionTestFailed: 'Notion 连接测试失败',
      siteAdded: '站点已添加',
      siteRemoved: '站点已删除',
      pleaseEnterDomain: '请输入域名'
    },
    badges: {
      new: '新',
      obsidian: 'Obsidian',
      feishu: '飞书',
      notion: 'Notion'
    },
    usage: {
      title: '使用方法：',
      singleClick: '- 单击链接按钮 → 保存到 Obsidian/飞书',
      doubleClick: '- 双击链接按钮 → 复制链接',
      shortcut: '- Ctrl+Shift+S（Mac: ⌘+Shift+S）→ 快捷键保存',
      feishuTutorial: '飞书配置教程：',
      feishuTutorialLink: '创建飞书自建应用'
    }
  },
  en: {
    header: {
      subtitle: 'Save Discourse Forum Posts to Obsidian, Feishu or Notion V4.2.2'
    },
    sections: {
      pluginStatus: 'Plugin Status',
      siteSettings: 'Site Settings',
      saveTarget: 'Save Target',
      obsidian: 'Obsidian Settings',
      feishu: 'Feishu Bitable Settings',
      notion: 'Notion Database Settings',
      content: 'Content Settings',
      comments: 'Comment Settings'
    },
    pluginStatus: {
      enabled: 'Enable Plugin (Link button restores original function when disabled)',
      help: 'Refresh page after changing'
    },
    siteSettings: {
      customSites: 'Custom Site List',
      addSite: 'Add Site',
      help: 'Add privately deployed or undetected Discourse site domain (e.g., forum.example.com)',
      autoDetect: 'Built-in automatic detection for all Discourse forums, only add manually if detection fails',
      autoDetectHelp: 'Plugin automatically detects Discourse forums (e.g., LinuxDo, Meta.discourse.org, etc.).',
      manualAddHelp: 'Manually add sites that are not automatically recognized.',
      newSitePlaceholder: 'Enter site domain, e.g., forum.example.com'
    },
    saveTarget: {
      obsidian: 'Save to Obsidian',
      feishu: 'Save to Feishu Bitable',
      notion: 'Save to Notion Database',
      exportHtml: 'Export HTML File',
      multiSaveHelp: 'Can save to multiple destinations simultaneously'
    },
    html: {
      folder: 'HTML Export Folder',
      folderPlaceholder: 'Discourse Export',
      folderHelp: 'Relative to browser download directory, leave empty to save directly'
    },
    obsidian: {
      vaultName: 'Vault Name',
      vaultHelp: 'Leave empty to use currently open vault (recommended)',
      vaultPlaceholder: 'Leave empty to use current vault',
      vaultHelpDetail: 'Recommended to leave empty, will automatically use current Obsidian vault',
      folder: 'Save Folder',
      folderHelp: 'Files will be saved to this folder',
      folderPlaceholder: 'LinuxDo Inbox',
      folderHelpDetail: 'Folder will be created automatically if it does not exist',
      useUri: 'Use Advanced URI Plugin',
      uriHelp: 'Support large content save (requires Advanced URI plugin installed in Obsidian)',
      useAdvancedUri: 'Use Advanced URI Plugin (supports large content)',
      advancedUriHelp: 'Requires "Advanced URI" plugin installed in Obsidian'
    },
    feishu: {
      version: 'API Version',
      versionFeishu: 'Feishu (Domestic)',
      versionLark: 'Lark (International)',
      versionHelp: 'Choose based on your account type, Feishu for domestic China, Lark for international',
      appId: 'App ID',
      appIdHelp: 'Get from Feishu Open Platform after creating an app',
      appIdPlaceholder: 'cli_xxxxxxxxxxxxxxxx',
      appSecret: 'App Secret',
      appSecretPlaceholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      appToken: 'Bitable app_token',
      appTokenHelp: 'String after /base/ and before ? in URL',
      appTokenPlaceholder: 'bascnxxxxxxxxxxxxxxxx',
      appTokenHelpDetail: 'Get from Bitable URL: feishu.cn/base/bascnxxx?table=...',
      tableId: 'Data table table_id',
      tableIdHelp: 'String after ?table= in URL (starts with tbl)',
      tableIdPlaceholder: 'tblxxxxxxxxxxxxxxxx',
      tableIdHelpDetail: 'Get from URL: ?table=tblxxx&view=...',
      uploadMd: 'Upload MD Attachment (extra permission, optional)',
      uploadMdHelp: 'Upload complete content as .md file to Feishu',
      uploadMdHelpDetail: 'If unchecked, only save text summary without drive permission',
      testConnection: 'Test Connection',
      help: 'See Feishu Settings section in README for configuration tutorial',
      perm1Title: '1. Required Permissions (no review needed):',
      perm1Content: 'bitable:app (Bitable read/write)',
      perm2Title: '2. Attachment Upload Permission (no review):',
      perm2Content: 'drive:file:upload (Upload files to cloud)',
      perm3Title: '3. Bitable Fields (9 required):',
      perm3Content1: 'Title (Text), Link (Hyperlink), Author (Text), Category (Text), Tags (Text), Save Time (Date), Comments (Number)',
      perm3Content2: 'If upload attachment checked: Attachment (Attachment); otherwise: Content (Text)'
    },
    notion: {
      token: 'Integration Token',
      tokenPlaceholder: 'ntn_xxx or secret_xxx',
      tokenHelp: 'Starts with ntn_ or secret_, get from Notion Integration page',
      tokenHelpPre: 'Create at',
      tokenHelpPost: 'to get token',
      detailedGuide: 'Detailed Guide',
      databaseId: 'Database ID',
      databaseIdPlaceholder: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
      databaseIdHelp: '32-character hexadecimal string, get from Database URL',
      databaseIdHelpDetail: 'Copy from Database link, 32-character format (may contain hyphens)',
      propertyMapping: 'Property Mapping Config',
      propertyMappingHelp: 'Property names must exactly match column names in Notion Database (case-sensitive)',
      propTitleLabel: 'Title Property Name',
      propTitleType: '(Type: Title)',
      propTitlePlaceholder: 'Title',
      propUrlLabel: 'URL Property Name',
      propUrlType: '(Type: URL)',
      propUrlPlaceholder: 'Link',
      propAuthorLabel: 'Author Property Name',
      propAuthorType: '(Type: Rich Text)',
      propAuthorPlaceholder: 'Author',
      propCategoryLabel: 'Category Property Name',
      propCategoryType: '(Type: Rich Text or Select)',
      propCategoryPlaceholder: 'Category',
      propTagsLabel: 'Tags Property Name',
      propTagsType: '(Type: Multi Select)',
      propSavedDateLabel: 'Save Date Property Name',
      propSavedDateType: '(Type: Date)',
      propSavedDatePlaceholder: 'Save Date',
      propCommentCountLabel: 'Comment Count Property Name',
      propCommentCountType: '(Type: Number)',
      propCommentCountPlaceholder: 'Comments',
      testConnection: 'Test Connection',
      help: 'See NOTION-GUIDE.html for detailed configuration',
      configStepsTitle: 'Configuration Steps:',
      configStep1: '1. Create Internal Integration and copy Token',
      configStep2: '2. Create Database and add following property columns (names and types must match):',
      configStep2a: '   • Title (Title type) - Required',
      configStep2b: '   • Link (URL type) - Required',
      configStep2c: '   • Author (Rich Text type)',
      configStep2d: '   • Category (Rich Text or Select type)',
      configStep2d2: '   • Tags (Multi Select type)',
      configStep2e: '   • Save Date (Date type)',
      configStep2f: '   • Comments (Number type)',
      configStep3: '3. Click "..." → "Connections" → Add your Integration on Database page',
      configStep4: '4. Copy ID from Database link and paste above',
      imageWarningTitle: 'Image Embedding Notice',
      imageWarningContent: 'If "Embed images (Base64)" is enabled, Notion cannot display images (Notion does not support Base64 format). Recommend disabling image embedding or using only for Obsidian.'
    },
    content: {
      addMetadata: 'Add metadata (source, author, time, etc.)',
      keepImages: 'Keep image links',
      embedImages: 'Embed images in notes (Base64)',
      embedImagesHelp: 'Convert images to Base64 embedded in Markdown, complete single-file save (requires Advanced URI)',
      embedWarning1Title: 'Note:',
      embedWarning1Content: 'Images will be embedded as Base64 in Markdown files. Benefit is complete single-file save, drawback is significantly larger file size.',
      embedWarning2Title: '⚠️ Important:',
      embedWarning2Content: 'Image embedding increases file size, you must enable "Use Advanced URI Plugin" option above for proper Obsidian saving.',
      embedWarning3Title: '📄 HTML Export Tip:',
      embedWarning3Content: 'Each image adds ~100KB-1MB to file size. For large articles (many images or long content), consider disabling this feature. HTML will keep original image links and supports 100,000+ characters smoothly.',
      maxWidth: 'Max Image Width',
      maxWidthHelp: 'Images wider than this will be proportionally resized',
      maxWidthOriginal: 'Keep original size',
      quality: 'Image Quality',
      qualityHelp: 'Lower quality reduces file size',
      skipGif: 'Skip GIF animations (keep original link)',
      skipGifHelp: 'GIF to Base64 loses animation, keep original link when enabled',
      skipGifHelpDetail: 'GIF will lose animation after conversion'
    },
    comments: {
      saveComments: 'Save Comment Section',
      // V4.3.7: Three mutually exclusive modes hint
      modeHint: 'Comment fetch mode (choose one):',
      commentsCount: 'Comment Count:',
      commentsRange: '(0-10000)',
      commentsHelp: 'Set maximum number of comments to save (0-10000)',
      saveAllComments: 'Save All',
      saveAllWarning: '⚠️ Loading may take longer for many comments',
      collapseComments: 'Collapse Comments (use HTML details tag)',
      collapseHelp: 'Use <details> tag to collapse comment content',
      // V4.3.7: Floor range
      useFloorRange: 'Specify Floor Range',
      floorFrom: 'From floor',
      floorTo: 'to floor',
      floorUnit: '',
      floorRangeHelp: 'Only save comments within the specified floor range',
      fetchExplainTitle: 'Comment Fetching:',
      fetchExplain1: '• ≤30 comments: Extract from current page (fast)',
      fetchExplain2: '• >30 comments or "Save All" checked: Fetch via API (complete, solves lazy-loading)',
      fetchExplain3: '• Shows loading progress when >500 comments'
    },
    buttons: {
      save: 'Save Settings',
      saving: 'Saving...',
      saved: 'Saved',
      testConnection: 'Test Connection',
      testing: 'Testing...',
      addSite: 'Add Site',
      add: 'Add',
      reset: 'Reset to Default'
    },
    messages: {
      saveSuccess: 'Settings saved',
      saveError: 'Save failed',
      feishuTestSuccess: 'Feishu connection test successful!',
      feishuTestFailed: 'Feishu connection test failed',
      notionTestSuccess: 'Notion connection test successful!',
      notionTestFailed: 'Notion connection test failed',
      siteAdded: 'Site added',
      siteRemoved: 'Site removed',
      pleaseEnterDomain: 'Please enter domain'
    },
    badges: {
      new: 'New',
      obsidian: 'Obsidian',
      feishu: 'Feishu',
      notion: 'Notion'
    },
    usage: {
      title: 'How to Use:',
      singleClick: '- Single click link button → Save to Obsidian/Feishu',
      doubleClick: '- Double click link button → Copy link',
      shortcut: '- Ctrl+Shift+S (Mac: ⌘+Shift+S) → Keyboard shortcut save',
      feishuTutorial: 'Feishu Configuration:',
      feishuTutorialLink: 'Create Feishu App'
    }
  }
};

// 语言切换函数
function setLanguage(lang) {
  // 保存语言偏好
  chrome.storage.local.set({ uiLanguage: lang });

  // 更新 HTML lang 属性
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  // 更新所有带 data-i18n 属性的元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const keys = key.split('.');
    let value = i18n[lang];

    for (const k of keys) {
      value = value?.[k];
    }

    if (value) {
      if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'password')) {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    }
  });

  // 更新语言切换按钮状态
  document.querySelectorAll('.language-toggle button').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

// 初始化语言
function initLanguage() {
  chrome.storage.local.get(['uiLanguage'], (result) => {
    const lang = result.uiLanguage || 'zh';
    setLanguage(lang);
  });
}

// 导出函数供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { i18n, setLanguage, initLanguage };
}
