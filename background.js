// Discourse Saver - Background Script V4.3.5
// 处理飞书/Notion API请求（解决CORS问题）+ 动态脚本注入
// V3.5: 支持上传MD文件作为附件
// V3.5.2: 支持飞书国内版和Lark国际版
// V3.5.3: 配合 content.js 支持评论书签功能
// V4.0.1: 新增 Notion Database 保存功能
// V4.0.2: 修复 Notion 内容换行问题
// V4.0.3: Notion 支持视频嵌入（YouTube/Bilibili/Vimeo）+ 链接预览（bookmark）
// V4.0.4: 配合 content.js 修复视频封面重复问题
// V4.0.5: Notion 支持更多视频平台（优酷/TikTok/QQ视频/西瓜/Facebook），非原生平台使用bookmark
// V3.5.4: 版本同步
// V3.5.5: 修复飞书记录搜索 - 改用标题搜索（超链接字段contains不搜索URL）
// V3.5.12: 增强飞书测试连接 - 验证必需字段是否存在及类型是否正确
// V3.5.13: 增强错误提示 - 针对常见配置错误给出友好提示
// V3.6.0: 支持所有 Discourse 论坛 - 自动检测 + 自定义站点管理
// V4.2.6: 飞书HTML附件上传 + 大内容批处理优化
// V4.3.5: 版本同步

// API 域名映射
const API_DOMAINS = {
  feishu: 'https://open.feishu.cn',
  lark: 'https://open.larksuite.com'
};

// 飞书多行文本字段限制
const FEISHU_TEXT_FIELD_LIMIT = 100000;

// 值得保留的链接域名（视频、代码仓库、论坛等）
const VALUABLE_LINK_DOMAINS = [
  // Discourse 论坛
  'linux.do',
  'meta.discourse.org',
  'community.openai.com',
  'forum.cursor.com',
  'discuss.pytorch.org',
  'discuss.tensorflow.org',
  'forum.obsidian.md',
  'forum.affinity.serif.com',
  // 视频平台
  'youtube.com', 'youtu.be', 'www.youtube.com',
  'bilibili.com', 'www.bilibili.com', 'b23.tv',
  'vimeo.com', 'www.vimeo.com',
  'youku.com', 'v.youku.com',
  'iqiyi.com', 'www.iqiyi.com',
  'qq.com', 'v.qq.com',
  'douyin.com', 'www.douyin.com',
  'tiktok.com', 'www.tiktok.com',
  'ixigua.com', 'www.ixigua.com',
  // 代码仓库
  'github.com', 'www.github.com',
  'gitlab.com', 'www.gitlab.com',
  'gitee.com', 'www.gitee.com',
  'bitbucket.org', 'www.bitbucket.org',
  'codeberg.org',
  'sr.ht',
  // 技术文档/问答
  'stackoverflow.com', 'www.stackoverflow.com',
  'gist.github.com',
  'codesandbox.io',
  'codepen.io',
  'jsfiddle.net',
  'replit.com',
  // 其他有价值的链接
  'huggingface.co',
  'kaggle.com', 'www.kaggle.com',
  'arxiv.org',
  'doi.org'
];

// 检查URL是否为值得保留的链接
function isValuableLink(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    return VALUABLE_LINK_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// 清理和验证飞书多行文本内容
function sanitizeFeishuTextContent(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // 1. 移除不可见控制字符（保留换行、回车和制表符）
  let sanitized = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // 2. 移除 Unicode 特殊字符（如零宽字符、特殊换行符）
  sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF\u2028\u2029]/g, '');

  // 3. 标准化换行符（将 \r\n 或 \r 统一为 \n）
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 4. 移除图片链接（太占空间），只保留alt文本
  sanitized = sanitized.replace(/!\[([^\]]*)\]\([^)]+\)/g, (match, alt) => {
    // 如果有alt文本，显示为 [图片: alt]，否则直接移除
    const cleanAlt = alt.trim();
    return cleanAlt ? `[图片: ${cleanAlt}]` : '';
  });

  // 5. 处理普通链接 - 只保留有价值的链接
  sanitized = sanitized.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, url) => {
    const cleanUrl = url.trim();
    const cleanText = text.trim();

    if (isValuableLink(cleanUrl)) {
      // 有价值的链接：保留文本和URL
      return cleanText ? `${cleanText}: ${cleanUrl}` : cleanUrl;
    } else {
      // 普通链接：只保留文本
      return cleanText || '';
    }
  });

  // 6. 处理裸链接（没有markdown格式的URL）
  sanitized = sanitized.replace(/(?<![(\[])(https?:\/\/[^\s\[\]()]+)(?![)\]])/g, (match, url) => {
    if (isValuableLink(url)) {
      return url; // 保留有价值的链接
    } else {
      return ''; // 移除其他链接
    }
  });

  // 7. 移除连续多个换行（保留最多2个）
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');

  // 8. 移除多余的空格
  sanitized = sanitized.replace(/[ \t]+/g, ' ');
  sanitized = sanitized.replace(/^ +| +$/gm, '');

  // 9. 检查长度限制
  if (sanitized.length > FEISHU_TEXT_FIELD_LIMIT) {
    console.warn(`[Discourse Saver→飞书] 内容超过${FEISHU_TEXT_FIELD_LIMIT}字符限制，当前${sanitized.length}字符，将截断`);
    sanitized = sanitized.substring(0, FEISHU_TEXT_FIELD_LIMIT - 100) + '\n\n... (内容过长，已截断)';
  }

  return sanitized;
}

// 获取 API 基础 URL
function getApiBaseUrl(apiDomain) {
  return API_DOMAINS[apiDomain] || API_DOMAINS.feishu;
}

// 缓存 tenant_access_token（按域名分别缓存）
let feishuTokenCache = {
  feishu: { token: null, expireTime: 0 },
  lark: { token: null, expireTime: 0 }
};

// 飞书错误码映射 - 提供友好的中文提示
const FEISHU_ERROR_CODES = {
  // 认证相关
  10003: {
    msg: 'App ID 或 App Secret 错误',
    hint: '请检查飞书开放平台的应用凭证是否正确复制，注意不要包含多余空格'
  },
  10014: {
    msg: 'App Secret 错误',
    hint: '请重新复制 App Secret，注意 Secret 只显示一次，如果忘记需要重新生成'
  },
  99991663: {
    msg: 'App ID 格式错误',
    hint: 'App ID 应该是 cli_xxxxxx 格式，请检查是否完整复制'
  },
  99991664: {
    msg: 'App Secret 格式错误',
    hint: 'App Secret 格式不正确，请从飞书开放平台重新复制'
  },

  // 权限相关
  1254043: {
    msg: '应用权限不足',
    hint: '请在飞书开放平台添加 bitable:app 权限，并将应用添加为多维表格的协作者'
  },
  1254044: {
    msg: '无访问此文档的权限',
    hint: '请确保已将应用添加为多维表格的「可编辑」协作者'
  },
  1254045: {
    msg: '文档不存在或无权限',
    hint: '请检查 app_token 是否正确，或确认应用已添加为协作者'
  },
  1254607: {
    msg: '数据表不存在',
    hint: 'table_id 错误或数据表已被删除\n\n' +
          '📌 table_id 是【当前数据表】的标识\n' +
          '提取方法：从 URL「?table=」后面的部分\n\n' +
          '⚠️ 一个多维表格可以包含多个数据表：\n' +
          '• 确保你复制的是正确的数据表 ID\n' +
          '• 数据表 ID 以「tbl」开头\n' +
          '• 打开多维表格，点击你要使用的数据表，然后从 URL 复制'
  },

  // 资源相关
  1254301: {
    msg: '多维表格不存在',
    hint: 'app_token 错误\n\n' +
          '📌 app_token 是【整个多维表格文档】的标识\n' +
          '提取方法：从 URL「/base/」后面到「?」之前的部分\n\n' +
          '示例 URL：https://feishu.cn/base/VwGhbxxxxx?table=tblyyy\n' +
          'app_token 应该是：VwGhbxxxxx\n\n' +
          '⚠️ 不要复制整个 URL，只复制对应部分'
  },
  1254302: {
    msg: '数据表不存在',
    hint: 'table_id 错误\n\n' +
          '📌 table_id 是【当前数据表】的标识（以 tbl 开头）\n' +
          '提取方法：从 URL「?table=」后面的部分\n\n' +
          '示例 URL：https://feishu.cn/base/VwGhbxxxxx?table=tblyyyyyyy\n' +
          'table_id 应该是：tblyyyyyyy\n\n' +
          '⚠️ 注意：一个多维表格可以有多个数据表\n' +
          '确保复制的是你要保存数据的那个表的 ID'
  },
  1254006: {
    msg: '找不到指定的多维表格',
    hint: 'app_token 错误\n\n' +
          '📌 请检查 app_token 是否正确\n' +
          '提取方法：从 URL「/base/」后面到「?」之前的部分\n\n' +
          '常见错误：\n' +
          '• 复制了整个 URL 而不是 app_token 部分\n' +
          '• app_token 和 table_id 复制反了\n' +
          '• 复制时包含了多余空格'
  },

  // 字段相关
  1254016: {
    msg: '字段不存在',
    hint: '多维表格中缺少必需字段，请确保创建以下字段：\n' +
          '• 标题（文本）\n' +
          '• 链接（超链接）\n' +
          '• 作者（文本）\n' +
          '• 分类（文本）\n' +
          '• 标签（文本）\n' +
          '• 保存时间（日期）\n' +
          '• 评论数（数字）\n' +
          '• 附件（附件）\n' +
          '• 正文（多行文本）'
  },
  1254017: {
    msg: '字段类型不匹配',
    hint: '请检查字段类型是否正确：链接必须是「超链接」类型，保存时间必须是「日期」类型，评论数必须是「数字」类型'
  },
  1254018: {
    msg: '字段值格式错误',
    hint: '请检查多维表格的字段类型配置是否正确'
  },
  1254060: {
    msg: '多行文本字段格式错误',
    hint: '正文内容格式不正确，可能的原因：\n' +
          '1. 内容超过10万字符限制\n' +
          '2. 内容包含不支持的特殊字符\n' +
          '3.「正文」字段类型不是「多行文本」\n\n' +
          '请检查多维表格中「正文」字段的类型是否为「多行文本」'
  },

  // 应用状态相关
  10012: {
    msg: '应用未发布',
    hint: '请在飞书开放平台「版本管理与发布」中发布应用，企业自建应用必须发布后才能使用 API'
  },
  10013: {
    msg: '应用已停用',
    hint: '请在飞书开放平台检查应用状态，确保应用处于启用状态'
  },

  // 频率限制
  99991400: {
    msg: 'API 调用频率超限',
    hint: '请稍后再试，飞书 API 有调用频率限制'
  },

  // 网络/服务器相关
  99991401: {
    msg: '飞书服务暂时不可用',
    hint: '飞书服务器可能正在维护，请稍后再试'
  }
};

// ============================================
// Notion API 相关配置 (V4.0.1 新增)
// ============================================

// Notion API 版本
const NOTION_API_VERSION = '2022-06-28';

// Notion 错误码映射 - 提供友好的中文提示
const NOTION_ERROR_CODES = {
  400: {
    msg: '请求参数错误',
    hint: '请检查 Database 属性配置：\n\n' +
          '📌 必需属性（名称需完全匹配）：\n' +
          '• 标题（Title 类型）\n' +
          '• 链接（URL 类型）\n' +
          '• 作者（Text 类型）\n' +
          '• 分类（Select 类型）\n' +
          '• 标签（Multi-select 类型）\n' +
          '• 保存日期（Date 类型）\n' +
          '• 评论数（Number 类型）\n\n' +
          '⚠️ 属性名称区分大小写'
  },
  401: {
    msg: 'Integration Token 无效',
    hint: 'Token 错误或已过期，请在 Notion Settings → Integrations 中重新获取\n\n' +
          '📌 Token 格式：ntn_xxx 或 secret_xxx\n' +
          '⚠️ 注意：2024年9月后创建的 Token 以 ntn_ 开头'
  },
  403: {
    msg: '无权限访问该 Database',
    hint: '请在 Notion 中将 Integration 连接到 Database：\n\n' +
          '1. 打开目标 Database 页面\n' +
          '2. 点击右上角「...」菜单\n' +
          '3. 选择「Connections」→「Connect to」\n' +
          '4. 选择你创建的 Integration'
  },
  404: {
    msg: 'Database 不存在',
    hint: 'Database ID 错误，请重新从 URL 中复制：\n\n' +
          '📌 提取方法：\n' +
          '1. 打开 Database 页面\n' +
          '2. 点击「Share」→「Copy link」\n' +
          '3. 从链接中提取 32 位 ID\n\n' +
          '示例：notion.so/xxxxx?v=yyy\n' +
          'Database ID 是中间的 32 位字符'
  },
  409: {
    msg: '数据冲突',
    hint: '可能存在重复记录，请稍后重试'
  },
  429: {
    msg: '请求过于频繁',
    hint: 'Notion API 有速率限制（每秒 3 次请求），请稍后再试'
  },
  500: {
    msg: 'Notion 服务器错误',
    hint: 'Notion 服务暂时不可用，请稍后再试'
  },
  502: {
    msg: 'Notion 网关错误',
    hint: 'Notion 服务暂时不可用，请稍后再试'
  },
  503: {
    msg: 'Notion 服务不可用',
    hint: 'Notion 正在维护或过载，请稍后再试'
  }
};

// 解析 Notion 错误，返回友好提示
function parseNotionError(status, errorData, context) {
  const errorInfo = NOTION_ERROR_CODES[status];
  const apiMessage = errorData?.message || '';
  const apiCode = errorData?.code || '';

  if (errorInfo) {
    let msg = `${context}失败：${errorInfo.msg}`;
    if (apiMessage) {
      msg += `\n\n❌ Notion 返回：${apiMessage}`;
    }
    msg += `\n\n💡 解决方法：${errorInfo.hint}`;
    return msg;
  }

  // 未知错误
  return `${context}失败：HTTP ${status}\n\n❌ Notion 返回：${apiMessage || '未知错误'}\n错误码：${apiCode}`;
}

// HTTP 错误码映射
const HTTP_ERROR_HINTS = {
  400: {
    msg: '请求参数错误',
    hint: '请检查配置信息格式是否正确'
  },
  401: {
    msg: '认证失败',
    hint: 'App ID 或 App Secret 错误，请检查飞书应用凭证'
  },
  403: {
    msg: '权限被拒绝',
    hint: '请确保应用已添加 bitable:app 权限，并将应用添加为多维表格协作者'
  },
  404: {
    msg: '多维表格或数据表不存在',
    hint: '请仔细检查 app_token 和 table_id：\n\n' +
          '📌 app_token（多维表格 token）：\n' +
          '   • 从 URL 中「/base/」后面到「?」之前的部分\n' +
          '   • 示例：VwGhbxxxxxxxxxxxxx\n' +
          '   • 这是整个多维表格文档的标识\n\n' +
          '📌 table_id（数据表 ID）：\n' +
          '   • 从 URL 中「?table=」后面的部分\n' +
          '   • 示例：tblyyyyyyyyyyy（以 tbl 开头）\n' +
          '   • 这是你要保存数据的那个具体数据表的 ID\n\n' +
          '⚠️ 常见错误：\n' +
          '   • 复制了整个 URL 而不是提取对应部分\n' +
          '   • app_token 和 table_id 复制反了\n' +
          '   • 一个多维表格有多个数据表，选错了表\n' +
          '   • 使用了 Lark 国际版但没有在设置中切换'
  },
  429: {
    msg: 'API 调用过于频繁',
    hint: '请稍后再试'
  },
  500: {
    msg: '飞书服务器错误',
    hint: '飞书服务器内部错误，请稍后再试'
  },
  502: {
    msg: '网关错误',
    hint: '飞书服务暂时不可用，请稍后再试'
  },
  503: {
    msg: '服务不可用',
    hint: '飞书服务正在维护，请稍后再试'
  }
};

// 解析飞书错误，返回友好提示
function parseFeishuError(code, originalMsg, context) {
  const errorInfo = FEISHU_ERROR_CODES[code];

  if (errorInfo) {
    return `${context}失败：${errorInfo.msg}\n\n💡 解决方法：${errorInfo.hint}`;
  }

  // 未知错误码，返回原始信息
  return `${context}失败：${originalMsg}\n（错误码: ${code}）`;
}

// 解析 HTTP 错误，返回友好提示
function parseHttpError(status, context, responseText) {
  const errorInfo = HTTP_ERROR_HINTS[status];

  if (errorInfo) {
    return `${context}失败：${errorInfo.msg}\n\n💡 可能原因：${errorInfo.hint}`;
  }

  // 未知 HTTP 错误
  return `${context}失败：HTTP ${status}\n响应内容：${responseText.substring(0, 100)}`;
}

// 安全解析 JSON 响应（增强版）
async function safeParseJson(response, context) {
  const text = await response.text();

  // 检查是否为空
  if (!text || text.trim() === '') {
    throw new Error(`${context}失败：服务器返回空响应\n\n💡 可能原因：\n• 网络连接问题\n• 飞书服务暂时不可用\n• API 地址不正确`);
  }

  // 检查 HTTP 状态
  if (!response.ok) {
    // 尝试解析 JSON 错误信息
    try {
      const errorData = JSON.parse(text);
      if (errorData.code !== undefined) {
        throw new Error(parseFeishuError(errorData.code, errorData.msg || '未知错误', context));
      }
    } catch (parseError) {
      // JSON 解析失败，使用 HTTP 错误处理
      if (parseError.message.includes('失败：')) {
        throw parseError; // 已经是格式化的错误
      }
    }

    throw new Error(parseHttpError(response.status, context, text));
  }

  // 尝试解析 JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    // 如果是 HTML，提取有用信息
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      throw new Error(`${context}失败：服务器返回了网页而不是数据\n\n💡 可能原因：\n• API 地址不正确\n• 网络代理或防火墙拦截\n• 飞书服务正在维护`);
    }
    throw new Error(`${context}失败：无法解析服务器响应\n\n响应内容：${text.substring(0, 100)}`);
  }
}

// 获取飞书 tenant_access_token
async function getFeishuToken(appId, appSecret, apiDomain = 'feishu') {
  // 先验证参数
  if (!appId || !appId.trim()) {
    throw new Error('App ID 未填写\n\n💡 请在飞书开放平台「凭证与基础信息」中复制 App ID');
  }
  if (!appSecret || !appSecret.trim()) {
    throw new Error('App Secret 未填写\n\n💡 请在飞书开放平台「凭证与基础信息」中复制 App Secret');
  }

  // App ID 格式检查
  if (!appId.startsWith('cli_')) {
    throw new Error(`App ID 格式错误：${appId.substring(0, 20)}...\n\n💡 App ID 应该以「cli_」开头，请检查是否复制正确`);
  }

  const cache = feishuTokenCache[apiDomain] || feishuTokenCache.feishu;

  // 检查缓存是否有效（提前5分钟过期）
  if (cache.token && Date.now() < cache.expireTime - 300000) {
    console.log('[Discourse Saver→飞书] 使用缓存的token');
    return cache.token;
  }

  const baseUrl = getApiBaseUrl(apiDomain);
  console.log('[Discourse Saver→飞书] 获取新的tenant_access_token，API域名:', baseUrl);

  let response;
  try {
    response = await fetch(`${baseUrl}/open-apis/auth/v3/tenant_access_token/internal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        app_id: appId.trim(),
        app_secret: appSecret.trim()
      })
    });
  } catch (fetchError) {
    throw new Error(`网络连接失败\n\n💡 可能原因：\n• 无法访问飞书服务器\n• 网络连接不稳定\n• 如果使用代理，请检查代理设置\n\n原始错误：${fetchError.message}`);
  }

  const data = await safeParseJson(response, '获取访问令牌');

  if (data.code !== 0) {
    throw new Error(parseFeishuError(data.code, data.msg, '获取访问令牌'));
  }

  // 缓存token（有效期2小时）
  if (!feishuTokenCache[apiDomain]) {
    feishuTokenCache[apiDomain] = {};
  }
  feishuTokenCache[apiDomain].token = data.tenant_access_token;
  feishuTokenCache[apiDomain].expireTime = Date.now() + (data.expire * 1000);

  console.log('[Discourse Saver→飞书] 获取token成功');
  return data.tenant_access_token;
}

// V3.5: 上传MD文件到飞书素材库
async function uploadMdFile(token, appToken, title, mdContent, apiDomain = 'feishu') {
  console.log('[Discourse Saver→飞书] 开始上传MD文件...');

  // 清理文件名中的非法字符
  const safeTitle = title
    .replace(/[《》<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const fileName = `${safeTitle}.md`;

  // 创建 Blob
  const blob = new Blob([mdContent], { type: 'text/markdown' });

  // 构建 FormData
  // 注意：parent_type 对于多维表格附件应该是 'bitable_file'
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('file_name', fileName);
  formData.append('parent_type', 'bitable_file');
  formData.append('parent_node', appToken);
  formData.append('size', blob.size.toString());

  const baseUrl = getApiBaseUrl(apiDomain);
  const response = await fetch(`${baseUrl}/open-apis/drive/v1/medias/upload_all`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await safeParseJson(response, '上传文件');

  if (data.code !== 0) {
    console.error('[Discourse Saver→飞书] 上传文件失败:', data);
    throw new Error(`上传文件失败: ${data.msg}`);
  }

  console.log('[Discourse Saver→飞书] 文件上传成功，file_token:', data.data.file_token);
  return data.data.file_token;
}

// V4.2.6: 上传HTML文件到飞书素材库
async function uploadHtmlFile(token, appToken, title, htmlContent, apiDomain = 'feishu') {
  console.log('[Discourse Saver→飞书] 开始上传HTML文件...');

  // 清理文件名中的非法字符
  const safeTitle = title
    .replace(/[《》<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);

  const fileName = `${safeTitle}.html`;

  // 创建 Blob
  const blob = new Blob([htmlContent], { type: 'text/html' });

  // 构建 FormData
  const formData = new FormData();
  formData.append('file', blob, fileName);
  formData.append('file_name', fileName);
  formData.append('parent_type', 'bitable_file');
  formData.append('parent_node', appToken);
  formData.append('size', blob.size.toString());

  const baseUrl = getApiBaseUrl(apiDomain);
  const response = await fetch(`${baseUrl}/open-apis/drive/v1/medias/upload_all`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  const data = await safeParseJson(response, '上传HTML文件');

  if (data.code !== 0) {
    console.error('[Discourse Saver→飞书] 上传HTML文件失败:', data);
    throw new Error(`上传HTML文件失败: ${data.msg}`);
  }

  console.log('[Discourse Saver→飞书] HTML文件上传成功，file_token:', data.data.file_token);
  return data.data.file_token;
}

// 保存到飞书多维表格（可选MD/HTML附件）
async function saveToFeishu(config, postData) {
  const { apiDomain, appId, appSecret, appToken, tableId, uploadAttachment, uploadHtmlAttachment } = config;
  const domain = apiDomain || 'feishu';

  // 验证必填参数
  validateFeishuConfig(config);

  // 获取token
  const token = await getFeishuToken(appId, appSecret, domain);

  // 构建记录数据
  // V4.3.7: 新增分类和标签字段
  const fields = {
    '标题': postData.title,
    '链接': {
      link: postData.url,
      text: postData.title
    },
    '作者': postData.author,
    '分类': postData.category || '',
    '标签': postData.tags && postData.tags.length > 0 ? postData.tags.join(', ') : '',
    '保存时间': Date.now(),
    '评论数': postData.commentCount || 0
  };

  // V4.2.6: 收集所有附件
  const attachments = [];

  // 根据配置决定是否上传MD附件
  if (uploadAttachment) {
    // 上传MD文件
    try {
      const mdFileToken = await uploadMdFile(token, appToken, postData.title, postData.content, domain);
      attachments.push({ file_token: mdFileToken });
      console.log('[Discourse Saver→飞书] MD附件上传成功');
    } catch (uploadError) {
      console.warn('[Discourse Saver→飞书] MD文件上传失败:', uploadError.message);
    }
  }

  // V4.2.6: 根据配置决定是否上传HTML附件
  if (uploadHtmlAttachment && postData.htmlContent) {
    try {
      const htmlFileToken = await uploadHtmlFile(token, appToken, postData.title, postData.htmlContent, domain);
      attachments.push({ file_token: htmlFileToken });
      console.log('[Discourse Saver→飞书] HTML附件上传成功');
    } catch (uploadError) {
      console.warn('[Discourse Saver→飞书] HTML文件上传失败:', uploadError.message);
    }
  }

  // 设置附件字段或正文
  if (attachments.length > 0) {
    fields['附件'] = attachments;
  }

  // 如果没有上传任何附件，或者需要保存正文
  if (attachments.length === 0) {
    const sanitizedContent = sanitizeFeishuTextContent(postData.content);
    console.log('[Discourse Saver→飞书] 正文内容长度:', sanitizedContent.length);
    fields['正文'] = sanitizedContent;
  }

  const record = { fields };

  // 调试：打印请求体信息
  console.log('[Discourse Saver→飞书] 请求字段:', Object.keys(fields));
  if (fields['正文']) {
    const contentPreview = fields['正文'].substring(0, 200);
    console.log('[Discourse Saver→飞书] 正文预览:', contentPreview);
    // 检查是否包含图片
    const imageCount = (fields['正文'].match(/!\[.*?\]\(.*?\)/g) || []).length;
    console.log('[Discourse Saver→飞书] 图片数量:', imageCount);
  }

  // 调用飞书API新增记录
  const baseUrl = getApiBaseUrl(domain);
  const apiUrl = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;

  let response;
  try {
    const requestBody = JSON.stringify(record);
    console.log('[Discourse Saver→飞书] 请求体大小:', requestBody.length, '字节');
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: requestBody
    });
  } catch (fetchError) {
    throw new Error(`网络连接失败\n\n💡 请检查网络连接后重试\n\n原始错误：${fetchError.message}`);
  }

  const data = await safeParseJson(response, '保存记录');

  if (data.code !== 0) {
    console.error('[Discourse Saver→飞书] API返回错误:', data);
    throw new Error(parseFeishuError(data.code, data.msg, '保存记录'));
  }

  console.log('[Discourse Saver→飞书] 保存成功，record_id:', data.data.record.record_id);
  return data.data.record;
}

// 验证飞书配置参数
function validateFeishuConfig(config) {
  const { appId, appSecret, appToken, tableId, apiDomain } = config;

  // 检查 App ID
  if (!appId || !appId.trim()) {
    throw new Error('App ID 未配置\n\n💡 请在插件设置中填写飞书应用的 App ID');
  }
  if (!appId.startsWith('cli_')) {
    throw new Error(`App ID 格式错误\n\n💡 App ID 应该以「cli_」开头\n当前值：${appId.substring(0, 20)}...`);
  }

  // 检查 App Secret
  if (!appSecret || !appSecret.trim()) {
    throw new Error('App Secret 未配置\n\n💡 请在插件设置中填写飞书应用的 App Secret');
  }
  if (appSecret.length < 20) {
    throw new Error('App Secret 格式错误\n\n💡 App Secret 太短，请检查是否完整复制');
  }

  // 检查 app_token（多维表格 token）
  if (!appToken || !appToken.trim()) {
    throw new Error('app_token（多维表格 token）未配置\n\n' +
                    '💡 app_token 是指【整个多维表格文档】的标识\n\n' +
                    '提取方法：从多维表格 URL 中复制\n' +
                    '示例 URL：https://feishu.cn/base/【这里是 app_token】?table=xxx\n\n' +
                    '⚠️ 注意：\n' +
                    '• 这是整个多维表格文档的 token\n' +
                    '• 不是单个数据表的 ID');
  }
  // app_token 通常是一串字母数字
  if (appToken.includes('/') || appToken.includes('?') || appToken.includes('&')) {
    throw new Error(`app_token 格式错误\n\n` +
                    `💡 app_token 不应包含「/」「?」「&」等字符\n` +
                    `当前值：${appToken.substring(0, 30)}...\n\n` +
                    `正确提取方法：\n` +
                    `从 URL「/base/」后面到「?」之前的部分\n\n` +
                    `示例：\n` +
                    `URL: https://feishu.cn/base/VwGhbxxxxx?table=tblyyy\n` +
                    `app_token 是: VwGhbxxxxx`);
  }

  // 检查 table_id（数据表 ID）
  if (!tableId || !tableId.trim()) {
    throw new Error('table_id（数据表 ID）未配置\n\n' +
                    '💡 table_id 是指多维表格中【当前数据表】的标识\n\n' +
                    '提取方法：从多维表格 URL 中复制\n' +
                    '示例 URL：https://feishu.cn/base/xxx?table=【这里是 table_id】\n\n' +
                    '⚠️ 注意：\n' +
                    '• 这是你要保存数据的那个具体数据表的 ID\n' +
                    '• 一个多维表格可以有多个数据表，确保选择正确的表\n' +
                    '• 数据表 ID 以「tbl」开头');
  }
  if (!tableId.startsWith('tbl')) {
    throw new Error(`table_id 格式错误\n\n` +
                    `💡 table_id 应该以「tbl」开头\n` +
                    `当前值：${tableId.substring(0, 20)}...\n\n` +
                    `正确提取方法：\n` +
                    `从 URL「?table=」后面的部分\n\n` +
                    `示例：\n` +
                    `URL: https://feishu.cn/base/VwGhbxxxxx?table=tblyyyyyyy\n` +
                    `table_id 是: tblyyyyyyy\n\n` +
                    `⚠️ 注意：确保复制的是当前要使用的数据表 ID，而不是其他数据表`);
  }

  // 检查 API 版本选择
  if (apiDomain && !['feishu', 'lark'].includes(apiDomain)) {
    throw new Error(`API 版本选择错误\n\n💡 请选择「飞书国内版」或「Lark 国际版」`);
  }

  return true;
}

// 检查飞书记录是否存在（通过标题搜索）
// V3.5.5: 修复搜索逻辑 - 飞书超链接字段的contains搜索的是显示文本，不是URL
// 改为按标题搜索，然后精确比对URL
async function findFeishuRecord(config, url, title) {
  const { apiDomain, appId, appSecret, appToken, tableId } = config;
  const domain = apiDomain || 'feishu';

  const token = await getFeishuToken(appId, appSecret, domain);

  // 使用筛选条件查找
  const baseUrl = getApiBaseUrl(domain);
  const apiUrl = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`;

  // V3.5.5: 改为按标题搜索（因为超链接字段的contains搜索的是text，不是link）
  // 提取基础标题（去掉楼层后缀如 " [2楼]"）
  const baseTitle = title.replace(/\s*\[\d+楼\]$/, '');

  console.log('[Discourse Saver→飞书] 搜索标题:', baseTitle);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      filter: {
        conjunction: 'and',
        conditions: [
          {
            field_name: '标题',
            operator: 'contains',
            value: [baseTitle]
          }
        ]
      },
      page_size: 20
    })
  });

  let data;
  try {
    data = await safeParseJson(response, '搜索记录');
  } catch (e) {
    console.log('[Discourse Saver→飞书] 搜索记录失败:', e.message);
    return null;
  }

  if (data.code !== 0) {
    // 搜索API可能不可用，返回null表示未找到
    console.log('[Discourse Saver→飞书] 搜索记录失败:', data.msg);
    return null;
  }

  // V3.5.5: 在结果中精确匹配 URL，确保找到正确的记录
  if (data.data.total > 0 && data.data.items) {
    console.log('[Discourse Saver→飞书] 找到', data.data.items.length, '条可能匹配的记录');

    for (const item of data.data.items) {
      const recordLink = item.fields?.['链接'];
      // 超链接字段格式: { link: "url", text: "title" } 或直接是字符串
      const recordUrl = typeof recordLink === 'object' ? recordLink.link : recordLink;

      console.log('[Discourse Saver→飞书] 比对URL:', recordUrl, 'vs', url);

      if (recordUrl === url) {
        console.log('[Discourse Saver→飞书] 找到精确匹配的记录:', item.record_id);
        return item;
      }
    }
    console.log('[Discourse Saver→飞书] 未找到精确匹配的URL，将新建记录');
  }

  return null;
}

// 更新飞书记录（可选MD/HTML附件）
async function updateFeishuRecord(config, recordId, postData) {
  const { apiDomain, appId, appSecret, appToken, tableId, uploadAttachment, uploadHtmlAttachment } = config;
  const domain = apiDomain || 'feishu';

  const token = await getFeishuToken(appId, appSecret, domain);

  // 构建记录数据
  // V4.3.7: 新增分类和标签字段
  const fields = {
    '标题': postData.title,
    '链接': {
      link: postData.url,
      text: postData.title
    },
    '作者': postData.author,
    '分类': postData.category || '',
    '标签': postData.tags && postData.tags.length > 0 ? postData.tags.join(', ') : '',
    '保存时间': Date.now(),
    '评论数': postData.commentCount || 0
  };

  // V4.2.6: 收集所有附件
  const attachments = [];

  // 根据配置决定是否上传MD附件
  if (uploadAttachment) {
    try {
      const mdFileToken = await uploadMdFile(token, appToken, postData.title, postData.content, domain);
      attachments.push({ file_token: mdFileToken });
      console.log('[Discourse Saver→飞书] MD附件更新成功');
    } catch (uploadError) {
      console.warn('[Discourse Saver→飞书] MD文件上传失败:', uploadError.message);
    }
  }

  // V4.2.6: 根据配置决定是否上传HTML附件
  if (uploadHtmlAttachment && postData.htmlContent) {
    try {
      const htmlFileToken = await uploadHtmlFile(token, appToken, postData.title, postData.htmlContent, domain);
      attachments.push({ file_token: htmlFileToken });
      console.log('[Discourse Saver→飞书] HTML附件更新成功');
    } catch (uploadError) {
      console.warn('[Discourse Saver→飞书] HTML文件上传失败:', uploadError.message);
    }
  }

  // 设置附件字段或正文
  if (attachments.length > 0) {
    fields['附件'] = attachments;
  }

  // 如果没有上传任何附件，保存正文
  if (attachments.length === 0) {
    const sanitizedContent = sanitizeFeishuTextContent(postData.content);
    console.log('[Discourse Saver→飞书] 更新正文内容长度:', sanitizedContent.length);
    fields['正文'] = sanitizedContent;
  }

  const record = { fields };

  const baseUrl = getApiBaseUrl(domain);
  const apiUrl = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`;

  let response;
  try {
    response = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(record)
    });
  } catch (fetchError) {
    throw new Error(`网络连接失败\n\n💡 请检查网络连接后重试\n\n原始错误：${fetchError.message}`);
  }

  const data = await safeParseJson(response, '更新记录');

  if (data.code !== 0) {
    throw new Error(parseFeishuError(data.code, data.msg, '更新记录'));
  }

  console.log('[Discourse Saver→飞书] 更新成功');
  return data.data.record;
}

// ============================================
// Notion API 功能函数 (V4.0.1 新增)
// ============================================

// 验证 Notion 配置
function validateNotionConfig(config) {
  const errors = [];

  // 检查 Token
  if (!config.notionToken || !config.notionToken.trim()) {
    errors.push('Integration Token 不能为空');
  } else if (!config.notionToken.trim().startsWith('secret_') && !config.notionToken.trim().startsWith('ntn_')) {
    errors.push('Integration Token 格式错误（应以 secret_ 或 ntn_ 开头）');
  } else if (config.notionToken.trim().length < 20) {
    errors.push('Integration Token 长度不正确');
  }

  // 检查 Database ID
  if (!config.notionDatabaseId || !config.notionDatabaseId.trim()) {
    errors.push('Database ID 不能为空');
  } else {
    // 移除可能的连字符，验证是否为 32 位 hex
    const cleanId = config.notionDatabaseId.replace(/-/g, '').trim();
    if (!/^[a-f0-9]{32}$/i.test(cleanId)) {
      errors.push('Database ID 格式错误（应为 32 位十六进制字符，可含连字符）');
    }
  }

  // 检查必填属性映射
  const requiredProps = [
    { key: 'notionPropTitle', name: '标题属性名' },
    { key: 'notionPropUrl', name: '链接属性名' }
  ];

  for (const prop of requiredProps) {
    if (!config[prop.key] || !config[prop.key].trim()) {
      errors.push(`${prop.name} 不能为空`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 格式化 Database ID（移除连字符）
function formatNotionDatabaseId(id) {
  return id.replace(/-/g, '').trim();
}

// V4.2.3: 搜索 Notion 现有记录（通过 URL 查找）
// V4.2.3: 规范化 URL（移除末尾斜杠、统一协议等）
function normalizeUrl(url) {
  if (!url) return url;
  let normalized = url.trim();
  // 移除末尾斜杠
  normalized = normalized.replace(/\/+$/, '');
  // 移除常见的追踪参数
  try {
    const urlObj = new URL(normalized);
    // 移除一些常见的追踪参数，但保留重要的参数
    const paramsToRemove = ['utm_source', 'utm_medium', 'utm_campaign', 'ref', 'source'];
    paramsToRemove.forEach(param => urlObj.searchParams.delete(param));
    // 如果没有其他参数了，移除问号
    normalized = urlObj.toString();
  } catch (e) {
    // URL 解析失败，返回原始值
  }
  return normalized;
}

async function searchNotionRecord(token, databaseId, url, urlPropName) {
  const normalizedUrl = normalizeUrl(url);
  console.log('[Discourse Saver→Notion] 搜索现有记录，URL:', normalizedUrl);

  try {
    // 先尝试精确匹配
    let response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: urlPropName,
          url: {
            equals: normalizedUrl
          }
        },
        page_size: 1
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        console.log('[Discourse Saver→Notion] 找到现有记录（精确匹配）:', data.results[0].id);
        return data.results[0];
      }
    }

    // 如果精确匹配失败，尝试带末尾斜杠的 URL
    const urlWithSlash = normalizedUrl + '/';
    response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: urlPropName,
          url: {
            equals: urlWithSlash
          }
        },
        page_size: 1
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        console.log('[Discourse Saver→Notion] 找到现有记录（带斜杠）:', data.results[0].id);
        return data.results[0];
      }
    }

    // 如果原始 URL 有查询参数，也尝试不带参数的版本
    if (url.includes('?')) {
      const urlWithoutParams = url.split('?')[0].replace(/\/+$/, '');
      response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': NOTION_API_VERSION,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            property: urlPropName,
            url: {
              contains: urlWithoutParams
            }
          },
          page_size: 5
        })
      });

      if (response.ok) {
        const data = await response.json();
        // 找到包含该 URL 的记录，返回第一个
        if (data.results && data.results.length > 0) {
          console.log('[Discourse Saver→Notion] 找到现有记录（模糊匹配）:', data.results[0].id);
          return data.results[0];
        }
      }
    }

    console.log('[Discourse Saver→Notion] 未找到现有记录');
    return null;
  } catch (error) {
    console.warn('[Discourse Saver→Notion] 搜索异常:', error);
    return null;
  }
}

// V4.2.3: 删除 Notion 页面的所有子块（支持分页）
async function deleteNotionPageChildren(token, pageId) {
  let totalDeleted = 0;
  let hasMore = true;
  let startCursor = undefined;

  try {
    while (hasMore) {
      // 获取子块（分页）
      let url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`;
      if (startCursor) {
        url += `&start_cursor=${startCursor}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Notion-Version': NOTION_API_VERSION
        }
      });

      if (!response.ok) {
        console.warn('[Discourse Saver→Notion] 获取子块失败:', response.status);
        break;
      }

      const data = await response.json();
      const blocks = data.results || [];
      hasMore = data.has_more;
      startCursor = data.next_cursor;

      // 逐个删除
      for (const block of blocks) {
        try {
          await fetch(`https://api.notion.com/v1/blocks/${block.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Notion-Version': NOTION_API_VERSION
            }
          });
          totalDeleted++;
        } catch (e) {
          console.warn('[Discourse Saver→Notion] 删除块失败:', e);
        }
      }

      // 防止请求过快
      if (hasMore) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    console.log(`[Discourse Saver→Notion] 已删除 ${totalDeleted} 个旧块`);
  } catch (error) {
    console.warn('[Discourse Saver→Notion] 删除子块异常:', error);
  }
}

// V4.2.5: 归档（删除）Notion 页面 - 单次 API 调用，速度快
async function archiveNotionPage(token, pageId) {
  console.log('[Discourse Saver→Notion] 归档旧页面:', pageId);

  try {
    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        archived: true
      })
    });

    if (!response.ok) {
      console.warn('[Discourse Saver→Notion] 归档页面失败:', response.status);
      return false;
    }

    console.log('[Discourse Saver→Notion] 旧页面已归档');
    return true;
  } catch (e) {
    console.warn('[Discourse Saver→Notion] 归档页面异常:', e);
    return false;
  }
}

// V4.2.5: 更新 Notion 页面（方案C：创建新页面，删除旧页面）
// 优点：速度快，只需要 1 次创建 + 1 次归档
async function updateNotionPage(token, pageId, pageData) {
  // 旧的更新逻辑已废弃，改为在 saveToNotion 中实现方案 C
  // 这个函数保留但不再使用逐块删除的方式
  console.log('[Discourse Saver→Notion] 准备更新页面（方案C）');
  return { id: pageId };
}

// V4.2.3: 预处理文本，处理特殊 Markdown 格式
function preprocessMarkdownText(text) {
  let processed = text;

  // 0. 不再在这里处理 Discourse 风格的 admonition 块
  // 改为在 buildNotionPageData 中作为多行块处理

  // 1. 处理图片链接 [![alt](img-url)](link-url) -> [alt](link-url)
  // 这种格式是可点击的图片，转换为普通链接
  processed = processed.replace(/\[!\[([^\]]*)\]\([^)]+\)\]\((https?:\/\/[^)]+)\)/g, '[$1]($2)');

  // 2. 处理 HTML 表格 - 提取表格内容为文本
  // 匹配整个 table 标签
  processed = processed.replace(/<table[\s\S]*?<\/table>/gi, (tableHtml) => {
    // 提取表头
    const headers = [];
    const headerMatch = tableHtml.match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
    if (headerMatch) {
      headerMatch.forEach(th => {
        const content = th.replace(/<[^>]+>/g, '').trim();
        if (content) headers.push(content);
      });
    }

    // 提取表格行
    const rows = [];
    const rowMatches = tableHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
    if (rowMatches) {
      rowMatches.forEach((tr, index) => {
        if (index === 0 && headerMatch) return; // 跳过表头行
        const cells = [];
        const cellMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
        if (cellMatches) {
          cellMatches.forEach(td => {
            // 保留链接格式
            let content = td.replace(/<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, '[$2]($1)');
            content = content.replace(/<[^>]+>/g, '').trim();
            if (content) cells.push(content);
          });
        }
        if (cells.length > 0) rows.push(cells.join(' | '));
      });
    }

    // 构建文本表格
    let result = '';
    if (headers.length > 0) {
      result += '| ' + headers.join(' | ') + ' |\n';
      result += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
    }
    if (rows.length > 0) {
      result += rows.map(r => '| ' + r + ' |').join('\n');
    }
    return result || '[表格内容]';
  });

  // 3. 清理其他 HTML 标签但保留内容
  // 保留链接
  processed = processed.replace(/<a[^>]+href="([^"]+)"[^>]*>([^<]*)<\/a>/gi, '[$2]($1)');
  // 保留加粗
  processed = processed.replace(/<(strong|b)>([^<]*)<\/(strong|b)>/gi, '**$2**');
  // 保留斜体
  processed = processed.replace(/<(em|i)>([^<]*)<\/(em|i)>/gi, '*$2*');
  // 保留代码
  processed = processed.replace(/<code>([^<]*)<\/code>/gi, '`$1`');
  // 移除其他 HTML 标签
  processed = processed.replace(/<[^>]+>/g, '');

  // 4. 清理 HTML 实体
  processed = processed.replace(/&nbsp;/g, ' ');
  processed = processed.replace(/&lt;/g, '<');
  processed = processed.replace(/&gt;/g, '>');
  processed = processed.replace(/&amp;/g, '&');
  processed = processed.replace(/&quot;/g, '"');

  return processed;
}

// V4.2.3: 解析 Markdown 格式为 Notion rich_text 格式
// 支持链接 [text](url)、裸URL、加粗 **text**、斜体 *text*、行内代码 `code`
// V4.3.9: 增加裸URL支持 + 相对路径URL转换（需传入siteOrigin）
function parseMarkdownToRichText(text, siteOrigin = '') {
  // 先预处理文本
  const processedText = preprocessMarkdownText(text);
  const richTextArray = [];

  // 综合正则：匹配链接（包含相对路径）、裸URL、加粗、斜体、行内代码
  // V4.3.9: 链接正则扩展为支持相对路径 [text](/path) 和 [text](path)
  const combinedRegex = /\[([^\]]+)\]\(([^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|(https?:\/\/[^\s<>\[\]()]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(processedText)) !== null) {
    // 添加匹配前的普通文本
    if (match.index > lastIndex) {
      const plainText = processedText.substring(lastIndex, match.index);
      if (plainText) {
        richTextArray.push({
          type: 'text',
          text: { content: plainText.substring(0, 2000) }
        });
      }
    }

    if (match[1] !== undefined && match[2] !== undefined) {
      // 链接: [text](url) - 支持完整URL和相对路径
      let linkUrl = match[2];
      // V4.3.9: 处理相对路径URL
      if (siteOrigin && !linkUrl.startsWith('http://') && !linkUrl.startsWith('https://')) {
        // 相对路径，需要拼接站点origin
        if (linkUrl.startsWith('/')) {
          linkUrl = siteOrigin + linkUrl;
        } else {
          linkUrl = siteOrigin + '/' + linkUrl;
        }
      }
      // 只有有效的URL才添加链接
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        richTextArray.push({
          type: 'text',
          text: {
            content: match[1].substring(0, 2000),
            link: { url: linkUrl }
          },
          annotations: {
            color: 'blue'  // 链接显示为蓝色
          }
        });
      } else {
        // URL无效，作为普通文本显示
        richTextArray.push({
          type: 'text',
          text: { content: match[1].substring(0, 2000) }
        });
      }
    } else if (match[3] !== undefined) {
      // 加粗: **text**
      richTextArray.push({
        type: 'text',
        text: { content: match[3].substring(0, 2000) },
        annotations: {
          bold: true
        }
      });
    } else if (match[4] !== undefined) {
      // 斜体: *text*
      richTextArray.push({
        type: 'text',
        text: { content: match[4].substring(0, 2000) },
        annotations: {
          italic: true
        }
      });
    } else if (match[5] !== undefined) {
      // 行内代码: `code`
      richTextArray.push({
        type: 'text',
        text: { content: match[5].substring(0, 2000) },
        annotations: {
          code: true
        }
      });
    } else if (match[6] !== undefined) {
      // V4.3.9: 裸URL: https://xxx
      try {
        // 清理URL末尾可能的标点符号
        let cleanUrl = match[6].replace(/[,.:;!?）)]+$/, '');
        // 提取域名作为显示文本
        const displayText = cleanUrl.replace(/^https?:\/\//, '').split('/')[0];
        richTextArray.push({
          type: 'text',
          text: {
            content: displayText.substring(0, 2000),
            link: { url: cleanUrl }
          },
          annotations: {
            color: 'blue'
          }
        });
      } catch (e) {
        // URL无效，作为普通文本
        richTextArray.push({
          type: 'text',
          text: { content: match[6].substring(0, 2000) }
        });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // 添加最后剩余的普通文本
  if (lastIndex < processedText.length) {
    const remainingText = processedText.substring(lastIndex);
    if (remainingText) {
      richTextArray.push({
        type: 'text',
        text: { content: remainingText.substring(0, 2000) }
      });
    }
  }

  // 如果没有匹配到任何格式，返回原始文本
  if (richTextArray.length === 0) {
    return [{
      type: 'text',
      text: { content: processedText.substring(0, 2000) }
    }];
  }

  return richTextArray;
}

// V4.2.3: 将常见语言名称映射到 Notion 支持的语言标识符
function mapLanguageToNotion(lang) {
  const languageMap = {
    // 常见语言
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'sh': 'bash',
    'shell': 'bash',
    'zsh': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'htm': 'html',
    'dockerfile': 'docker',
    'objc': 'objective-c',
    'objective-c': 'objective-c',
    'cs': 'c#',
    'csharp': 'c#',
    'cpp': 'c++',
    'c++': 'c++',
    'golang': 'go',
    'rs': 'rust',
    'kt': 'kotlin',
    'vb': 'visual basic',
    'asm': 'assembly',
    'tex': 'latex',
    'text': 'plain text',
    'txt': 'plain text',
    '': 'plain text'
  };

  const normalized = (lang || '').toLowerCase().trim();

  // 如果有直接映射则使用
  if (languageMap[normalized]) {
    return languageMap[normalized];
  }

  // Notion 支持的语言列表（直接返回）
  const notionLanguages = [
    'abap', 'arduino', 'bash', 'basic', 'c', 'clojure', 'coffeescript',
    'c++', 'c#', 'css', 'dart', 'diff', 'docker', 'elixir', 'elm',
    'erlang', 'flow', 'fortran', 'f#', 'gherkin', 'glsl', 'go', 'graphql',
    'groovy', 'haskell', 'html', 'java', 'javascript', 'json', 'julia',
    'kotlin', 'latex', 'less', 'lisp', 'livescript', 'lua', 'makefile',
    'markdown', 'markup', 'matlab', 'mermaid', 'nix', 'objective-c',
    'ocaml', 'pascal', 'perl', 'php', 'plain text', 'powershell',
    'prolog', 'protobuf', 'python', 'r', 'reason', 'ruby', 'rust',
    'sass', 'scala', 'scheme', 'scss', 'shell', 'sql', 'swift',
    'typescript', 'vb.net', 'verilog', 'vhdl', 'visual basic',
    'webassembly', 'xml', 'yaml', 'java/c/c++/c#'
  ];

  if (notionLanguages.includes(normalized)) {
    return normalized;
  }

  // 默认返回 plain text
  return 'plain text';
}

// 构建 Notion Page 数据
function buildNotionPageData(postData, config) {
  const properties = {};

  // Title (标题) - Notion 的 title 类型
  if (config.notionPropTitle) {
    properties[config.notionPropTitle] = {
      title: [{
        text: { content: (postData.title || '未命名帖子').substring(0, 2000) }
      }]
    };
  }

  // URL (链接) - Notion 的 url 类型
  if (config.notionPropUrl && postData.url) {
    properties[config.notionPropUrl] = {
      url: postData.url
    };
  }

  // Author (作者) - rich_text 类型
  if (config.notionPropAuthor && postData.author) {
    properties[config.notionPropAuthor] = {
      rich_text: [{
        text: { content: postData.author.substring(0, 2000) }
      }]
    };
  }

  // Category (分类) - V4.2.4: 支持多分类，用 # 分隔
  // 支持 rich_text、select、multi_select 类型
  if (config.notionPropCategory && postData.category) {
    // 处理多分类：支持逗号、斜杠、空格分隔的输入
    const categoryInput = postData.category.toString().trim();
    // 分割并清理分类
    const categories = categoryInput
      .split(/[,，\/、\s]+/)  // 支持逗号、中文逗号、斜杠、顿号、空格分隔
      .map(c => c.trim())
      .filter(c => c.length > 0);

    if (categories.length > 0) {
      // 根据配置的属性类型选择格式
      if (config.notionCategoryType === 'multi_select') {
        // multi_select 类型：创建多个选项
        properties[config.notionPropCategory] = {
          multi_select: categories.slice(0, 10).map(c => ({ name: c.substring(0, 100) }))
        };
      } else if (config.notionCategoryType === 'select') {
        // select 类型：只取第一个分类
        properties[config.notionPropCategory] = {
          select: { name: categories[0].substring(0, 100) }
        };
      } else {
        // rich_text 类型（默认）：用 # 分隔显示所有分类
        const formattedCategories = categories.join(' # ');
        properties[config.notionPropCategory] = {
          rich_text: [{
            text: { content: formattedCategories.substring(0, 2000) }
          }]
        };
      }
    }
  }

  // V4.3.7: Tags (标签) - multi_select 类型
  // 支持多标签，使用 multi_select 属性
  if (config.notionPropTags && postData.tags && postData.tags.length > 0) {
    // 确保 tags 是数组
    const tagsArray = Array.isArray(postData.tags) ? postData.tags : [postData.tags];
    const validTags = tagsArray
      .map(t => String(t).trim())
      .filter(t => t.length > 0);

    if (validTags.length > 0) {
      // Notion multi_select 限制：最多10个选项，每个选项最多100字符
      properties[config.notionPropTags] = {
        multi_select: validTags.slice(0, 10).map(t => ({ name: t.substring(0, 100) }))
      };
    }
  }

  // Saved Date (保存日期) - date 类型
  if (config.notionPropSavedDate) {
    properties[config.notionPropSavedDate] = {
      date: {
        start: new Date().toISOString()
      }
    };
  }

  // Comment Count (评论数) - number 类型
  if (config.notionPropCommentCount && postData.commentCount !== undefined) {
    properties[config.notionPropCommentCount] = {
      number: parseInt(postData.commentCount) || 0
    };
  }

  // 构建 Page 内容 (children blocks)
  const children = [];

  // V4.3.9: 提取站点origin，用于将相对路径URL转换为完整URL
  let siteOrigin = '';
  if (postData.url) {
    try {
      const urlObj = new URL(postData.url);
      siteOrigin = urlObj.origin; // 例如 https://linux.do
    } catch (e) {
      console.log('[Discourse Saver→Notion] 无法解析URL origin:', postData.url);
    }
  }

  // 添加内容
  // V4.0.2: 改进换行处理，确保单换行也能正确显示
  // V4.2.3: 添加内容预处理（HTML表格、图片链接等）+ 代码块支持
  if (postData.content) {
    // 预处理内容：处理 HTML 表格和特殊格式
    let preprocessedContent = preprocessMarkdownText(postData.content);
    let blockCount = 0;
    const maxBlocks = 500; // V4.2.5: 增加到500块，支持更长的帖子。Notion API每次只能发100块，但saveToNotion已有分页处理

    // V4.2.3: 先提取并处理围栏代码块 ```language ... ```
    // 使用占位符替换代码块，稍后再恢复
    const codeBlocks = [];
    preprocessedContent = preprocessedContent.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push({
        language: lang || 'plain text',
        code: code.trim()
      });
      return placeholder;
    });

    // V4.2.6: 处理折叠内容 <details><summary>...</summary>...</details> 和 [details="..."]...[/details]
    const toggleBlocks = [];

    // 处理 HTML 格式: <details><summary>标题</summary>内容</details>
    preprocessedContent = preprocessedContent.replace(/<details[^>]*>\s*<summary>([^<]*)<\/summary>([\s\S]*?)<\/details>/gi, (match, title, content) => {
      const placeholder = `__TOGGLE_BLOCK_${toggleBlocks.length}__`;
      toggleBlocks.push({
        title: title.trim() || '展开',
        content: content.trim()
      });
      return placeholder;
    });

    // 处理 BBCode 格式: [details="标题"]内容[/details] 或 [details]内容[/details]
    preprocessedContent = preprocessedContent.replace(/\[details(?:="([^"]*)")?\]([\s\S]*?)\[\/details\]/gi, (match, title, content) => {
      const placeholder = `__TOGGLE_BLOCK_${toggleBlocks.length}__`;
      toggleBlocks.push({
        title: title ? title.trim() : '展开',
        content: content.trim()
      });
      return placeholder;
    });

    // V4.2.4: 改进的多行块收集和处理逻辑
    // 先收集所有行，然后按块类型分组处理
    const allLines = preprocessedContent.split('\n');

    // 辅助函数：解析 callout 类型和配置
    const getCalloutConfig = (typeLine) => {
      const admonitionTypes = ['warning', 'note', 'info', 'tip', 'important', 'caution', 'danger', 'success'];
      // 检查 Discourse 风格: > **warning**
      const discourseMatch = typeLine.match(/^>\s*\*\*(\w+)\*\*\s*$/i);
      if (discourseMatch && admonitionTypes.includes(discourseMatch[1].toLowerCase())) {
        return discourseMatch[1].toUpperCase();
      }
      // 检查 GitHub 风格: > [!WARNING]
      const githubMatch = typeLine.match(/^>\s*\[!(WARNING|NOTE|INFO|TIP|IMPORTANT|CAUTION|DANGER|SUCCESS)\]/i);
      if (githubMatch) {
        return githubMatch[1].toUpperCase();
      }
      return null;
    };

    // 辅助函数：获取 callout 配置（emoji和颜色）
    const getCalloutStyle = (type) => {
      const typeConfig = {
        'WARNING': { emoji: '⚠️', color: 'yellow_background' },
        'NOTE': { emoji: '📝', color: 'blue_background' },
        'TIP': { emoji: '💡', color: 'green_background' },
        'IMPORTANT': { emoji: '❗', color: 'red_background' },
        'CAUTION': { emoji: '⛔', color: 'orange_background' },
        'INFO': { emoji: 'ℹ️', color: 'blue_background' },
        'DANGER': { emoji: '🚨', color: 'red_background' },
        'SUCCESS': { emoji: '✅', color: 'green_background' }
      };
      return typeConfig[type] || { emoji: '💡', color: 'gray_background' };
    };

    // 辅助函数：处理多行 callout 内容
    const processCalloutLines = (lines, calloutType) => {
      const style = getCalloutStyle(calloutType);
      const contentLines = [];
      const childrenBlocks = [];

      for (let i = 0; i < lines.length; i++) {
        let lineContent = lines[i].replace(/^>\s*/, '').trim();
        // 跳过类型标识行
        if (i === 0 && (lineContent.match(/^\*\*\w+\*\*$/) || lineContent.match(/^\[!\w+\]/))) {
          continue;
        }
        if (!lineContent) continue;

        // 检查是否是列表项
        if (lineContent.startsWith('- ') || lineContent.startsWith('* ')) {
          // 如果有累积的内容，先添加为段落
          if (contentLines.length > 0) {
            childrenBlocks.push({
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: parseMarkdownToRichText(contentLines.join(' '), siteOrigin)
              }
            });
            contentLines.length = 0;
          }
          // 添加列表项
          childrenBlocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: parseMarkdownToRichText(lineContent.substring(2), siteOrigin)
            }
          });
        } else if (/^\d+\.\s/.test(lineContent)) {
          // 有序列表
          if (contentLines.length > 0) {
            childrenBlocks.push({
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: parseMarkdownToRichText(contentLines.join(' '), siteOrigin)
              }
            });
            contentLines.length = 0;
          }
          childrenBlocks.push({
            object: 'block',
            type: 'numbered_list_item',
            numbered_list_item: {
              rich_text: parseMarkdownToRichText(lineContent.replace(/^\d+\.\s/, ''), siteOrigin)
            }
          });
        } else {
          // 普通内容行
          contentLines.push(lineContent);
        }
      }

      // 处理剩余内容
      if (contentLines.length > 0) {
        childrenBlocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: parseMarkdownToRichText(contentLines.join(' '), siteOrigin)
          }
        });
      }

      // 创建 callout 块
      // 如果只有一个简单段落，直接放在 callout 的 rich_text 中
      // 如果有多个块或列表，使用 children
      if (childrenBlocks.length === 1 && childrenBlocks[0].type === 'paragraph') {
        return {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: childrenBlocks[0].paragraph.rich_text,
            icon: { type: 'emoji', emoji: style.emoji },
            color: style.color
          }
        };
      } else if (childrenBlocks.length > 0) {
        // Notion callout 支持 children，但需要分开处理
        // 第一段作为 callout 的主内容
        const firstContent = childrenBlocks[0].type === 'paragraph'
          ? childrenBlocks[0].paragraph.rich_text
          : [{ type: 'text', text: { content: calloutType } }];

        return {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: firstContent,
            icon: { type: 'emoji', emoji: style.emoji },
            color: style.color,
            children: childrenBlocks.slice(1)
          }
        };
      } else {
        return {
          object: 'block',
          type: 'callout',
          callout: {
            rich_text: [{ type: 'text', text: { content: calloutType } }],
            icon: { type: 'emoji', emoji: style.emoji },
            color: style.color
          }
        };
      }
    };

    // 辅助函数：处理表格行（保留markdown格式，让parseMarkdownToRichText处理链接）
    // V4.3.9: 不再剥离链接，保留完整markdown格式
    const processTableRow = (row) => {
      // 分割单元格，清理空白，但保留markdown格式（包括链接）
      const cells = row.split('|').filter(cell => cell.trim());
      const processedCells = cells.map(cell => cell.trim());
      return processedCells.join(' | ');
    };

    // 遍历所有行，收集块
    let i = 0;
    while (i < allLines.length && blockCount < maxBlocks) {
      const line = allLines[i];
      const trimmedLine = line.trim();

      // 跳过空行
      if (!trimmedLine) {
        i++;
        continue;
      }

      // 检查是否是代码块占位符
      const codeBlockMatch = trimmedLine.match(/^__CODE_BLOCK_(\d+)__$/);
      if (codeBlockMatch) {
        const codeIndex = parseInt(codeBlockMatch[1]);
        const codeData = codeBlocks[codeIndex];
        if (codeData) {
          children.push({
            object: 'block',
            type: 'code',
            code: {
              rich_text: [{
                type: 'text',
                text: { content: codeData.code.substring(0, 2000) }
              }],
              language: mapLanguageToNotion(codeData.language)
            }
          });
          blockCount++;
        }
        i++;
        continue;
      }

      // V4.2.6: 检查是否是折叠块占位符
      const toggleBlockMatch = trimmedLine.match(/^__TOGGLE_BLOCK_(\d+)__$/);
      if (toggleBlockMatch) {
        const toggleIndex = parseInt(toggleBlockMatch[1]);
        const toggleData = toggleBlocks[toggleIndex];
        if (toggleData) {
          // 解析折叠内容为子块
          const toggleChildren = [];
          const contentLines = toggleData.content.split('\n').filter(l => l.trim());

          for (const contentLine of contentLines) {
            const trimmedContent = contentLine.trim();
            if (trimmedContent) {
              toggleChildren.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: parseMarkdownToRichText(trimmedContent, siteOrigin)
                }
              });
            }
          }

          children.push({
            object: 'block',
            type: 'toggle',
            toggle: {
              rich_text: [{ type: 'text', text: { content: toggleData.title } }],
              children: toggleChildren.length > 0 ? toggleChildren : [{
                object: 'block',
                type: 'paragraph',
                paragraph: { rich_text: [] }
              }]
            }
          });
          blockCount++;
        }
        i++;
        continue;
      }

      // 检查是否是多行引用块的开始（可能是callout）
      if (trimmedLine.startsWith('>')) {
        const quoteLines = [trimmedLine];
        let j = i + 1;
        // 收集所有连续的引用行
        while (j < allLines.length && allLines[j].trim().startsWith('>')) {
          quoteLines.push(allLines[j].trim());
          j++;
        }

        // 检查是否是 callout 类型
        const calloutType = getCalloutConfig(quoteLines[0]);
        if (calloutType) {
          // 创建 callout 块
          const calloutBlock = processCalloutLines(quoteLines, calloutType);
          children.push(calloutBlock);
          blockCount++;
        } else {
          // 普通引用块 - 合并所有引用内容
          const quoteContent = quoteLines
            .map(l => l.replace(/^>\s*/, '').trim())
            .filter(l => l)
            .join(' ');
          if (quoteContent) {
            children.push({
              object: 'block',
              type: 'quote',
              quote: {
                rich_text: parseMarkdownToRichText(quoteContent, siteOrigin)
              }
            });
            blockCount++;
          }
        }
        i = j;
        continue;
      }

      // 检查是否是表格行
      // V4.3.9: 转换为 Notion 原生表格
      if (/^\|.+\|$/.test(trimmedLine)) {
        const tableLines = [trimmedLine];
        let j = i + 1;
        // 收集所有连续的表格行
        while (j < allLines.length && /^\|.+\|$/.test(allLines[j].trim())) {
          tableLines.push(allLines[j].trim());
          j++;
        }

        // 过滤掉分隔行（如 |---|---|），只保留内容行
        const contentRows = tableLines.filter(line => !/^\|[\s-:|]+\|$/.test(line));

        if (contentRows.length > 0) {
          // 解析第一行确定列数
          // 使用 slice(1, -1) 去掉首尾空字符串，保留中间的空单元格
          const firstRowCells = contentRows[0].split('|').slice(1, -1);
          const tableWidth = firstRowCells.length;

          // 创建表格行
          const tableRows = contentRows.map((row, rowIndex) => {
            // 使用 slice(1, -1) 正确处理单元格，保留空单元格
            const cells = row.split('|').slice(1, -1);
            // 确保每行的单元格数量与表头一致
            const paddedCells = [...cells];
            while (paddedCells.length < tableWidth) {
              paddedCells.push('');
            }
            // 每个单元格转换为 rich_text 数组
            const cellsRichText = paddedCells.slice(0, tableWidth).map(cell => {
              const trimmedCell = cell.trim();
              // 使用 parseMarkdownToRichText 解析单元格内容（支持链接等）
              return parseMarkdownToRichText(trimmedCell, siteOrigin);
            });
            return {
              object: 'block',
              type: 'table_row',
              table_row: {
                cells: cellsRichText
              }
            };
          });

          // 创建 Notion 表格块
          children.push({
            object: 'block',
            type: 'table',
            table: {
              table_width: tableWidth,
              has_column_header: true,  // 第一行作为表头
              has_row_header: false,
              children: tableRows
            }
          });
          blockCount++;
        }

        i = j;
        continue;
      }

      // 单行处理
      // 检查是否是标题（以 # 开头）
      // V4.3.9: 标题也支持markdown链接解析
      if (trimmedLine.startsWith('# ')) {
        children.push({
          object: 'block',
          type: 'heading_1',
          heading_1: {
            rich_text: parseMarkdownToRichText(trimmedLine.substring(2), siteOrigin)
          }
        });
        blockCount++;
      } else if (trimmedLine.startsWith('## ')) {
        children.push({
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: parseMarkdownToRichText(trimmedLine.substring(3), siteOrigin)
          }
        });
        blockCount++;
      } else if (trimmedLine.startsWith('### ')) {
        children.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: parseMarkdownToRichText(trimmedLine.substring(4), siteOrigin)
          }
        });
        blockCount++;
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        // V4.2.4: 支持无序列表（含链接解析）
        const listText = trimmedLine.substring(2);
        children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: parseMarkdownToRichText(listText, siteOrigin)
          }
        });
        blockCount++;
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        // V4.2.4: 支持有序列表（含链接解析）
        const listContent = trimmedLine.replace(/^\d+\.\s/, '');
        children.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: parseMarkdownToRichText(listContent, siteOrigin)
          }
        });
        blockCount++;
      } else if (trimmedLine === '---' || trimmedLine === '***') {
        // V4.2.4: 支持分割线
        children.push({
          object: 'block',
          type: 'divider',
          divider: {}
        });
        blockCount++;
      } else if (/^!\[.*?\]\((https?:\/\/[^)]+)\)$/.test(trimmedLine)) {
        // V4.2.4: 支持图片 ![alt](url)，包括 GitHub 图片 URL 修复
        const imgMatch = trimmedLine.match(/^!\[.*?\]\((https?:\/\/[^)]+)\)$/);
        if (imgMatch && imgMatch[1]) {
          let imgUrl = imgMatch[1];
          // 修复 GitHub 图片 URL：将 blob URL 转换为 raw URL
          if (imgUrl.includes('github.com') && imgUrl.includes('/blob/')) {
            imgUrl = imgUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
          }
          children.push({
            object: 'block',
            type: 'image',
            image: {
              type: 'external',
              external: {
                url: imgUrl
              }
            }
          });
          blockCount++;
        }
      } else if (/<iframe[^>]+src="([^"]+)"[^>]*>/i.test(trimmedLine)) {
        // V4.2.4: 支持 iframe 视频嵌入 (多平台)
        const iframeMatch = trimmedLine.match(/<iframe[^>]+src="([^"]+)"[^>]*>/i);
        if (iframeMatch && iframeMatch[1]) {
          const embedUrl = iframeMatch[1];
          let videoUrl = embedUrl;
          let useVideoBlock = false;

          if (embedUrl.includes('youtube.com/embed/')) {
            const videoId = embedUrl.match(/youtube\.com\/embed\/([^?&]+)/)?.[1];
            if (videoId) videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
            useVideoBlock = true;
          } else if (embedUrl.includes('player.vimeo.com')) {
            const vimeoId = embedUrl.match(/vimeo\.com\/video\/(\d+)/)?.[1];
            if (vimeoId) videoUrl = 'https://vimeo.com/' + vimeoId;
            useVideoBlock = true;
          } else if (embedUrl.includes('player.bilibili.com')) {
            const bvid = embedUrl.match(/bvid=([^&]+)/)?.[1];
            if (bvid) videoUrl = 'https://www.bilibili.com/video/' + bvid;
          } else if (embedUrl.includes('player.youku.com')) {
            const youkuId = embedUrl.match(/embed\/([^?&/]+)/)?.[1];
            if (youkuId) videoUrl = 'https://v.youku.com/v_show/id_' + youkuId + '.html';
          } else if (embedUrl.includes('tiktok.com/embed/')) {
            const tiktokId = embedUrl.match(/embed\/(\d+)/)?.[1];
            if (tiktokId) videoUrl = 'https://www.tiktok.com/video/' + tiktokId;
          } else if (embedUrl.includes('v.qq.com')) {
            const qqVid = embedUrl.match(/vid=([^&]+)/)?.[1];
            if (qqVid) videoUrl = 'https://v.qq.com/x/cover/' + qqVid + '.html';
          } else if (embedUrl.includes('ixigua.com/iframe/')) {
            const xiguaId = embedUrl.match(/iframe\/(\d+)/)?.[1];
            if (xiguaId) videoUrl = 'https://www.ixigua.com/' + xiguaId;
          } else if (embedUrl.includes('facebook.com/plugins/video')) {
            const fbMatch = embedUrl.match(/href=([^&]+)/);
            if (fbMatch) videoUrl = decodeURIComponent(fbMatch[1]);
          }

          if (useVideoBlock) {
            children.push({
              object: 'block',
              type: 'video',
              video: { type: 'external', external: { url: videoUrl } }
            });
          } else {
            children.push({
              object: 'block',
              type: 'bookmark',
              bookmark: { url: videoUrl }
            });
          }
          blockCount++;
        }
      } else if (/^\[.+\]\((https?:\/\/[^)]+)\)$/.test(trimmedLine)) {
        // V4.2.4: 纯链接行智能转换（根据链接类型选择最佳块类型）
        const linkMatch = trimmedLine.match(/^\[.+\]\((https?:\/\/[^)]+)\)$/);
        if (linkMatch && linkMatch[1]) {
          const linkUrl = linkMatch[1].toLowerCase();

          if (/\.(mp4|webm|mov|avi|mkv)(\?.*)?$/i.test(linkUrl)) {
            children.push({ object: 'block', type: 'video', video: { type: 'external', external: { url: linkMatch[1] } } });
          } else if (/\.(mp3|wav|ogg|m4a|flac|aac)(\?.*)?$/i.test(linkUrl)) {
            children.push({ object: 'block', type: 'audio', audio: { type: 'external', external: { url: linkMatch[1] } } });
          } else if (/youtube\.com\/watch|youtu\.be\/|vimeo\.com\/\d+/i.test(linkUrl)) {
            children.push({ object: 'block', type: 'video', video: { type: 'external', external: { url: linkMatch[1] } } });
          } else if (/bilibili\.com\/video|b23\.tv|v\.youku\.com|youku\.com\/v_show|v\.qq\.com|weixin\.qq\.com\/sph|ixigua\.com|toutiao\.com\/video|douyin\.com|tiktok\.com/i.test(linkUrl)) {
            children.push({ object: 'block', type: 'bookmark', bookmark: { url: linkMatch[1] } });
          } else if (/drive\.google\.com|docs\.google\.com|onedrive\.live\.com|1drv\.ms|dropbox\.com|pan\.baidu\.com|aliyundrive\.com|cloud\.189\.cn|weiyun\.com/i.test(linkUrl)) {
            children.push({ object: 'block', type: 'bookmark', bookmark: { url: linkMatch[1] } });
          } else if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|svg)(\?.*)?$/i.test(linkUrl)) {
            children.push({ object: 'block', type: 'bookmark', bookmark: { url: linkMatch[1] } });
          } else if (/github\.com\/[^/]+\/[^/]+/i.test(linkUrl)) {
            children.push({ object: 'block', type: 'bookmark', bookmark: { url: linkMatch[1] } });
          } else {
            children.push({ object: 'block', type: 'bookmark', bookmark: { url: linkMatch[1] } });
          }
          blockCount++;
        }
      } else {
        // V4.2.4: 普通段落（可能包含内联图片和链接）
        const textWithLinks = trimmedLine.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
          let fixedUrl = url;
          if (url.includes('github.com') && url.includes('/blob/')) {
            fixedUrl = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
          }
          return `[图片: ${alt}](${fixedUrl})`;
        });
        children.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: parseMarkdownToRichText(textWithLinks, siteOrigin)
          }
        });
        blockCount++;
      }

      i++; // V4.2.4: 移动到下一行
    }
  }

  return { properties, children };
}

// 保存到 Notion
// V4.0.6: 支持分批创建children（Notion API限制每次最多100个块）
// V4.2.3: 支持更新现有记录（通过URL查找，避免重复）
async function saveToNotion(postData, config) {
  console.log('[Discourse Saver→Notion] 开始保存...');
  console.log('[Discourse Saver→Notion] 标题:', postData.title);

  // 验证配置
  const validation = validateNotionConfig(config);
  if (!validation.valid) {
    throw new Error('配置错误：\n• ' + validation.errors.join('\n• '));
  }

  const token = config.notionToken.trim();
  const databaseId = formatNotionDatabaseId(config.notionDatabaseId);

  // 构建页面数据
  const pageData = buildNotionPageData(postData, config);

  // V4.2.5: 搜索现有记录（通过URL查找）
  const urlPropName = config.notionPropUrl || '链接';
  const existingPage = await searchNotionRecord(token, databaseId, postData.url, urlPropName);

  // V4.2.5 方案C：如果找到现有记录，先创建新页面，再归档旧页面
  // 这比逐块删除快得多（1次创建 + 1次归档 vs N次删除）
  const isUpdate = !!existingPage;
  if (isUpdate) {
    console.log('[Discourse Saver→Notion] 检测到重复链接，使用方案C更新...');
    console.log('[Discourse Saver→Notion] 旧页面ID:', existingPage.id);
  } else {
    console.log('[Discourse Saver→Notion] 创建新记录...');
  }

  // Notion API 每次最多100个children，需要分批处理
  const NOTION_CHILDREN_LIMIT = 100;
  const allChildren = pageData.children || [];
  const firstBatch = allChildren.slice(0, NOTION_CHILDREN_LIMIT);
  const remainingChildren = allChildren.slice(NOTION_CHILDREN_LIMIT);

  console.log(`[Discourse Saver→Notion] 总块数: ${allChildren.length}, 首批: ${firstBatch.length}, 剩余: ${remainingChildren.length}`);

  // 1. 创建页面（带首批children）
  let response;
  try {
    response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties: pageData.properties,
        children: firstBatch
      })
    });
  } catch (fetchError) {
    throw new Error(`网络连接失败\n\n💡 请检查网络连接后重试\n\n原始错误：${fetchError.message}`);
  }

  // 处理响应
  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // 忽略 JSON 解析错误
    }
    throw new Error(parseNotionError(response.status, errorData, '保存到 Notion'));
  }

  const result = await response.json();
  const pageId = result.id;
  console.log('[Discourse Saver→Notion] 页面创建成功，ID:', pageId);

  // 2. 如果有剩余children，分批追加
  if (remainingChildren.length > 0) {
    console.log(`[Discourse Saver→Notion] 开始追加剩余 ${remainingChildren.length} 个块...`);

    for (let i = 0; i < remainingChildren.length; i += NOTION_CHILDREN_LIMIT) {
      const batch = remainingChildren.slice(i, i + NOTION_CHILDREN_LIMIT);
      const batchNum = Math.floor(i / NOTION_CHILDREN_LIMIT) + 2;

      try {
        const appendResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': NOTION_API_VERSION,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ children: batch })
        });

        if (!appendResponse.ok) {
          console.warn(`[Discourse Saver→Notion] 批次${batchNum}追加失败:`, appendResponse.status);
          // 继续处理其他批次，不中断
        } else {
          console.log(`[Discourse Saver→Notion] 批次${batchNum}追加成功 (${batch.length}个块)`);
        }

        // 防止请求过快
        if (i + NOTION_CHILDREN_LIMIT < remainingChildren.length) {
          await new Promise(r => setTimeout(r, 200));
        }
      } catch (appendError) {
        console.warn(`[Discourse Saver→Notion] 批次${batchNum}追加异常:`, appendError);
      }
    }
  }

  // V4.2.5 方案C：新页面创建成功后，归档旧页面
  if (isUpdate && existingPage) {
    console.log('[Discourse Saver→Notion] 新页面创建成功，开始归档旧页面...');
    const archived = await archiveNotionPage(token, existingPage.id);
    if (archived) {
      console.log('[Discourse Saver→Notion] 更新完成（方案C：创建新页面 + 归档旧页面）');
    } else {
      console.warn('[Discourse Saver→Notion] 旧页面归档失败，但新页面已创建');
    }
    return {
      success: true,
      action: 'updated',
      pageId: result.id,
      url: result.url,
      oldPageArchived: archived
    };
  }

  console.log('[Discourse Saver→Notion] 保存完成');

  return {
    success: true,
    action: 'created',
    pageId: result.id,
    url: result.url
  };
}

// 测试 Notion 连接
async function testNotionConnection(config) {
  console.log('[Discourse Saver→Notion] 测试连接...');

  // 验证配置
  const validation = validateNotionConfig(config);
  if (!validation.valid) {
    return {
      success: false,
      error: '配置验证失败：\n• ' + validation.errors.join('\n• ')
    };
  }

  const token = config.notionToken.trim();
  const databaseId = formatNotionDatabaseId(config.notionDatabaseId);

  // 查询 Database 信息
  let response;
  try {
    response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': NOTION_API_VERSION
      }
    });
  } catch (fetchError) {
    return {
      success: false,
      error: `网络连接失败：${fetchError.message}`
    };
  }

  if (!response.ok) {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // 忽略
    }
    return {
      success: false,
      error: parseNotionError(response.status, errorData, '连接 Database')
    };
  }

  const database = await response.json();
  const dbTitle = database.title?.[0]?.plain_text || '未命名 Database';
  const dbProperties = Object.keys(database.properties);

  // V4.0.2: 严格验证属性映射（包括类型检查）
  const propMappings = [
    { configKey: 'notionPropTitle', label: '标题', required: true, expectedType: 'title' },
    { configKey: 'notionPropUrl', label: '链接', required: true, expectedType: 'url' },
    { configKey: 'notionPropAuthor', label: '作者', required: false, expectedType: 'rich_text' },
    { configKey: 'notionPropCategory', label: '分类', required: false, expectedType: ['rich_text', 'select', 'multi_select'] },
    { configKey: 'notionPropSavedDate', label: '保存日期', required: false, expectedType: 'date' },
    { configKey: 'notionPropCommentCount', label: '评论数', required: false, expectedType: 'number' }
  ];

  const errors = [];
  const warnings = [];
  const foundProps = [];

  for (const mapping of propMappings) {
    const configValue = config[mapping.configKey];
    if (configValue && configValue.trim()) {
      const propName = configValue.trim();
      const propInfo = database.properties[propName];

      if (!propInfo) {
        // 属性不存在
        if (mapping.required) {
          errors.push(`❌ ${mapping.label}「${propName}」：Database 中不存在此属性`);
        } else {
          warnings.push(`⚠️ ${mapping.label}「${propName}」：Database 中不存在（可选，保存时将跳过）`);
        }
      } else {
        // 属性存在，检查类型
        const actualType = propInfo.type;
        const expectedTypes = Array.isArray(mapping.expectedType) ? mapping.expectedType : [mapping.expectedType];

        if (expectedTypes.includes(actualType)) {
          foundProps.push(`✓ ${mapping.label}「${propName}」→ ${actualType} 类型`);
        } else {
          const expectedTypeStr = expectedTypes.join(' 或 ');
          if (mapping.required) {
            errors.push(`❌ ${mapping.label}「${propName}」：类型错误，当前是 ${actualType}，应为 ${expectedTypeStr}`);
          } else {
            warnings.push(`⚠️ ${mapping.label}「${propName}」：类型不匹配，当前是 ${actualType}，建议使用 ${expectedTypeStr}`);
          }
        }
      }
    } else if (mapping.required) {
      errors.push(`❌ ${mapping.label}：未配置属性名`);
    }
  }

  // 构建结果消息
  const hasErrors = errors.length > 0;
  let message = '';

  if (hasErrors) {
    message = `❌ 验证失败\n\n` +
      `📋 Database: ${dbTitle}\n\n` +
      `🔴 错误（必须修复）：\n${errors.join('\n')}\n`;
    if (warnings.length > 0) {
      message += `\n🟡 警告（可选）：\n${warnings.join('\n')}\n`;
    }
    message += `\n📊 Database 现有属性：\n`;
    for (const [propName, propInfo] of Object.entries(database.properties)) {
      message += `  • ${propName}（${propInfo.type}）\n`;
    }
    message += `\n💡 提示：请确保 Database 中的属性名和类型与配置完全匹配`;
  } else {
    message = `✅ 连接成功！\n\n` +
      `📋 Database: ${dbTitle}\n\n` +
      `🟢 已验证的属性：\n${foundProps.join('\n')}\n`;
    if (warnings.length > 0) {
      message += `\n🟡 警告（不影响保存）：\n${warnings.join('\n')}\n`;
    }
    message += `\n📊 Database 所有属性：\n`;
    for (const [propName, propInfo] of Object.entries(database.properties)) {
      message += `  • ${propName}（${propInfo.type}）\n`;
    }
  }

  return {
    success: !hasErrors,
    databaseName: dbTitle,
    properties: dbProperties,
    foundMappings: foundProps,
    errors: errors,
    warnings: warnings,
    message: message
  };
}

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // V4.3.6: 处理 HTML 文件下载请求
  if (request.action === 'downloadHtml') {
    (async () => {
      try {
        console.log('[Discourse Saver] 收到 HTML 下载请求:', request.filename);

        // 清理文件名（Chrome downloads API 对文件名有严格要求）
        let safeFilename = request.filename
          .replace(/[<>:"|?*]/g, '')           // 移除Windows非法字符
          .replace(/\\/g, '/')                  // 统一使用正斜杠
          .replace(/\/+/g, '/')                 // 合并多个斜杠
          .replace(/^\//, '')                   // 移除开头的斜杠
          .replace(/\.\./g, '')                 // 移除 ..
          .trim();

        // 确保文件名不为空
        if (!safeFilename || safeFilename === '.html') {
          safeFilename = 'discourse-export.html';
        }

        console.log('[Discourse Saver] 清理后的文件名:', safeFilename);

        // 使用 data URL（Service Worker 不支持 URL.createObjectURL）
        const base64Content = btoa(unescape(encodeURIComponent(request.content)));
        const dataUrl = 'data:text/html;charset=utf-8;base64,' + base64Content;

        // 使用 chrome.downloads API 下载
        const downloadId = await chrome.downloads.download({
          url: dataUrl,
          filename: safeFilename,
          saveAs: false  // 不弹出保存对话框
        });

        console.log('[Discourse Saver] HTML 下载已启动, downloadId:', downloadId);

        sendResponse({ success: true, downloadId });
      } catch (error) {
        console.error('[Discourse Saver] HTML 下载失败:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true; // 保持消息通道开放
  }

  // V3.6.0: 处理动态脚本注入请求（来自 detector.js）
  if (request.action === 'injectContentScript') {
    console.log('[Discourse Saver] 收到脚本注入请求，URL:', request.tabUrl);

    (async () => {
      try {
        const tabId = sender.tab?.id;
        if (!tabId) {
          console.error('[Discourse Saver] 无法获取标签页ID');
          sendResponse({ success: false, error: '无法获取标签页ID' });
          return;
        }

        // 检查是否已经注入过（防止重复注入）
        try {
          const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => window.__discourseSaverInjected
          });

          if (result[0]?.result === true) {
            console.log('[Discourse Saver] 脚本已注入，跳过');
            sendResponse({ success: true, skipped: true });
            return;
          }
        } catch (checkError) {
          // 忽略检查错误，继续注入
          console.log('[Discourse Saver] 检查注入状态失败，继续注入');
        }

        // 注入 turndown 库
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['lib/turndown.min.js']
        });
        console.log('[Discourse Saver] turndown.min.js 注入成功');

        // V4.2.6: 注入 marked 库（用于 Markdown → HTML 转换）
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['lib/marked.min.js']
        });
        console.log('[Discourse Saver] marked.min.js 注入成功');

        // 注入主脚本
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js']
        });
        console.log('[Discourse Saver] content.js 注入成功');

        // 标记已注入
        await chrome.scripting.executeScript({
          target: { tabId },
          func: () => { window.__discourseSaverInjected = true; }
        });

        sendResponse({ success: true });
      } catch (error) {
        console.error('[Discourse Saver] 脚本注入失败:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true; // 异步响应
  }

  if (request.action === 'saveToFeishu') {
    console.log('[Discourse Saver→飞书] 收到保存请求');
    console.log('[Discourse Saver→飞书] 标题:', request.postData.title);
    console.log('[Discourse Saver→飞书] URL:', request.postData.url);

    (async () => {
      try {
        const { config, postData } = request;

        // V3.5.5: 传入标题用于搜索（因为飞书超链接字段的contains不搜索URL）
        const existingRecord = await findFeishuRecord(config, postData.url, postData.title);

        let result;
        if (existingRecord) {
          // 更新现有记录
          console.log('[Discourse Saver→飞书] 找到现有记录，更新中...');
          result = await updateFeishuRecord(config, existingRecord.record_id, postData);
          sendResponse({ success: true, action: 'updated', record: result });
        } else {
          // 新增记录
          result = await saveToFeishu(config, postData);
          sendResponse({ success: true, action: 'created', record: result });
        }
      } catch (error) {
        console.error('[Discourse Saver→飞书] 保存失败:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    // 返回true表示异步响应
    return true;
  }

  if (request.action === 'testFeishuConnection') {
    console.log('[Discourse Saver→飞书] 测试连接');

    (async () => {
      try {
        const { apiDomain, appId, appSecret, appToken, tableId } = request.config;
        const domain = apiDomain || 'feishu';
        const baseUrl = getApiBaseUrl(domain);

        // 步骤0: 验证配置参数格式
        console.log('[Discourse Saver→飞书] 步骤0: 验证配置参数...');
        try {
          validateFeishuConfig(request.config);
        } catch (validationError) {
          sendResponse({ success: false, error: validationError.message });
          return;
        }

        // 步骤1: 测试获取 token
        console.log('[Discourse Saver→飞书] 步骤1: 获取 token...');
        const token = await getFeishuToken(appId, appSecret, domain);
        console.log('[Discourse Saver→飞书] Token 获取成功');

        // 步骤2: 获取表格字段列表
        console.log('[Discourse Saver→飞书] 步骤2: 获取表格字段列表...');
        const fieldsUrl = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/fields`;
        console.log('[Discourse Saver→飞书] 字段列表 API URL:', fieldsUrl);

        let fieldsResponse;
        try {
          fieldsResponse = await fetch(fieldsUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (fetchError) {
          throw new Error(`网络连接失败\n\n💡 可能原因：\n• 无法访问飞书服务器\n• 网络连接不稳定\n\n原始错误：${fetchError.message}`);
        }

        const fieldsData = await safeParseJson(fieldsResponse, '获取字段列表');

        if (fieldsData.code !== 0) {
          throw new Error(parseFeishuError(fieldsData.code, fieldsData.msg, '获取字段列表'));
        }

        // 步骤3: 验证字段
        console.log('[Discourse Saver→飞书] 步骤3: 验证字段配置...');
        const fields = fieldsData.data?.items || [];

        // 飞书字段类型映射
        const FIELD_TYPES = {
          TEXT: 1,        // 文本
          NUMBER: 2,      // 数字
          DATE: 5,        // 日期
          URL: 15,        // 超链接
          ATTACHMENT: 17  // 附件
        };

        // 必需字段配置（V4.3.7: 9个字段，新增分类和标签）
        const REQUIRED_FIELDS = [
          { name: '标题', type: FIELD_TYPES.TEXT, desc: '文本' },
          { name: '链接', type: FIELD_TYPES.URL, desc: '超链接' },
          { name: '作者', type: FIELD_TYPES.TEXT, desc: '文本' },
          { name: '分类', type: FIELD_TYPES.TEXT, desc: '文本' },
          { name: '标签', type: FIELD_TYPES.TEXT, desc: '文本' },
          { name: '保存时间', type: FIELD_TYPES.DATE, desc: '日期' },
          { name: '评论数', type: FIELD_TYPES.NUMBER, desc: '数字' },
          { name: '附件', type: FIELD_TYPES.ATTACHMENT, desc: '附件' },
          { name: '正文', type: FIELD_TYPES.TEXT, desc: '文本' }
        ];

        // 构建字段映射
        const fieldMap = {};
        fields.forEach(field => {
          fieldMap[field.field_name] = {
            type: field.type,
            typeName: getFieldTypeName(field.type)
          };
        });

        // 验证字段
        const missingFields = [];
        const wrongTypeFields = [];

        REQUIRED_FIELDS.forEach(required => {
          const existing = fieldMap[required.name];

          if (!existing) {
            // 字段不存在
            missingFields.push(`「${required.name}」(类型: ${required.desc})`);
          } else if (existing.type !== required.type) {
            // 字段类型不匹配
            wrongTypeFields.push(
              `「${required.name}」(期望: ${required.desc}, 实际: ${existing.typeName})`
            );
          }
        });

        // 如果有错误，返回详细提示
        if (missingFields.length > 0 || wrongTypeFields.length > 0) {
          let errorMsg = '字段配置有误：\n\n';

          if (missingFields.length > 0) {
            errorMsg += `❌ 缺失字段（${missingFields.length}个）：\n`;
            errorMsg += missingFields.map(f => `  • ${f}`).join('\n');
            errorMsg += '\n\n';
          }

          if (wrongTypeFields.length > 0) {
            errorMsg += `⚠️ 字段类型错误（${wrongTypeFields.length}个）：\n`;
            errorMsg += wrongTypeFields.map(f => `  • ${f}`).join('\n');
            errorMsg += '\n\n';
          }

          errorMsg += '请在飞书多维表格中创建或修正这些字段。\n';
          errorMsg += '详细要求请参考 README.md 的「飞书配置教程」。';

          throw new Error(errorMsg);
        }

        // 步骤4: 测试访问记录
        console.log('[Discourse Saver→飞书] 步骤4: 测试访问表格记录...');
        const recordsUrl = `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?page_size=1`;

        let recordsResponse;
        try {
          recordsResponse = await fetch(recordsUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (fetchError) {
          throw new Error(`网络连接失败\n\n💡 请检查网络连接后重试\n\n原始错误：${fetchError.message}`);
        }

        const recordsData = await safeParseJson(recordsResponse, '访问表格记录');

        if (recordsData.code !== 0) {
          throw new Error(parseFeishuError(recordsData.code, recordsData.msg, '访问表格记录'));
        }

        const recordCount = recordsData.data?.total || 0;
        const domainName = domain === 'lark' ? 'Lark 国际版' : '飞书国内版';

        // 显示检测到的字段列表
        const detectedFields = fields.map(f => f.field_name).join('、');
        const requiredFieldNames = REQUIRED_FIELDS.map(f => f.name).join('、');

        sendResponse({
          success: true,
          message: `✅ 连接成功！\n\n` +
                   `📋 配置验证通过：\n` +
                   `  • API 版本：${domainName}\n` +
                   `  • 应用认证：通过\n` +
                   `  • 表格访问：正常\n` +
                   `  • 现有记录：${recordCount} 条\n\n` +
                   `📝 字段验证通过（9个必需字段）：\n` +
                   `  ${requiredFieldNames}\n\n` +
                   `📊 当前数据表的所有字段：\n` +
                   `  ${detectedFields}`
        });
      } catch (error) {
        console.error('[Discourse Saver→飞书] 测试连接失败:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }

  // ============================================
  // Notion 消息处理 (V4.0.1 新增)
  // ============================================

  // 保存到 Notion
  if (request.action === 'saveToNotion') {
    console.log('[Discourse Saver→Notion] 收到保存请求');

    (async () => {
      try {
        const { config, postData } = request;
        const result = await saveToNotion(postData, config);
        sendResponse(result);
      } catch (error) {
        console.error('[Discourse Saver→Notion] 保存失败:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }

  // 测试 Notion 连接
  if (request.action === 'testNotionConnection') {
    console.log('[Discourse Saver→Notion] 收到测试连接请求');

    (async () => {
      try {
        const result = await testNotionConnection(request.config);
        sendResponse(result);
      } catch (error) {
        console.error('[Discourse Saver→Notion] 测试连接失败:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;
  }
});

// 辅助函数：获取字段类型名称
function getFieldTypeName(typeCode) {
  const typeNames = {
    1: '文本',
    2: '数字',
    3: '单选',
    4: '多选',
    5: '日期',
    7: '复选框',
    11: '人员',
    13: '电话号码',
    15: '超链接',
    17: '附件',
    18: '单向关联',
    21: '查找引用',
    22: '公式',
    23: '双向关联'
  };
  return typeNames[typeCode] || `未知类型(${typeCode})`;
}

console.log('[Discourse Saver] Background script 已加载 (V4.2.1)');
