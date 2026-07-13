// ==UserScript==
// @name         Discourse Saver (油猴版 · Raw 特别版)
// @namespace    https://github.com/discourse-saver
// @version      5.6.0-raw
// @description  通用Discourse论坛内容保存工具 Raw特别版 - 直接使用Discourse原始Markdown，表格/代码块零损耗，支持Obsidian/飞书/Notion/HTML
// @author       阿成
// @icon         https://www.google.com/s2/favicons?sz=64&domain=obsidian.md
// @match        https://linux.do/*
// @match        https://meta.discourse.org/*
// @match        https://users.rust-lang.org/*
// @match        https://forums.docker.com/*
// @match        https://community.openai.com/*
// @match        https://discuss.python.org/*
// @match        https://*.discourse.group/*
// @match        https://forum.obsidian.md/*
// @match        https://community.cloudflare.com/*
// @match        https://forum.cursor.com/*
// @match        https://community.render.com/*
// @match        https://community.fly.io/*
// @match        https://discourse.haskell.org/*
// @match        https://discourse.julialang.org/*
// @match        https://forum.rclone.org/*
// @match        https://discourse.nixos.org/*
// @match        https://discuss.kotlinlang.org/*
// @match        https://forum.gitlab.com/*
// @match        https://discuss.elastic.co/*
// @match        https://discuss.hashicorp.com/*
// @match        https://community.grafana.com/*
// @match        https://discuss.codecademy.com/*
// @match        https://community.letsencrypt.org/*
// @match        https://discuss.atom.io/*
// @match        https://forum.proxmox.com/*
// @match        https://discuss.rubyonrails.org/*
// @match        https://community.home-assistant.io/*
// @match        https://forum.unity.com/*
// @match        https://forums.unrealengine.com/*
// @match        https://discourse.llvm.org/*
// @match        https://discuss.ocaml.org/*
// @match        https://elixirforum.com/*
// @match        https://discuss.flarum.org/*
// @match        https://community.paperspace.com/*
// @match        https://forum.seafile.com/*
// @match        https://forum.syncthing.net/*
// @match        https://community.hivemq.com/*
// @match        https://forum.owncloud.com/*
// @match        https://community.bitwarden.com/*
// @match        https://discuss.emberjs.com/*
// @include      *://*discourse*/*
// @include      *://*forum*/*
// @include      *://*discuss*/*
// @include      *://*community*/*
// @require      https://cdn.jsdelivr.net/npm/turndown@7.1.2/dist/turndown.js
// @require      https://cdn.jsdelivr.net/npm/marked@9.1.0/marked.min.js
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      *
// @run-at       document-end
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js
// @updateURL    https://raw.githubusercontent.com/acheng-byte/discourse-saver/main/raw-edition/discourse-saver.user.js
// ==/UserScript==

(function() {
  'use strict';

  // ============================================================
  // 模块1: 配置管理 (ConfigModule)
  // ============================================================
  const ConfigModule = (function() {
    const DEFAULT_CONFIG = {
      // 保存目标
      saveToObsidian: true,
      saveToNotion: false,
      saveToFeishu: false,
      exportHtml: false,

      // Obsidian 设置
      vaultName: '',
      folderPath: 'Discourse收集箱',
      useAdvancedUri: true,

      // Notion 设置
      notionToken: '',
      notionDatabaseId: '',
      notionPropTitle: '标题',
      notionPropUrl: '链接',
      notionPropAuthor: '作者',
      notionPropCategory: '分类',
      notionPropTags: '标签',
      notionPropSavedDate: '保存日期',
      notionPropCommentCount: '评论数',

      // 飞书设置
      feishuApiDomain: 'feishu',
      feishuAppId: '',
      feishuAppSecret: '',
      feishuAppToken: '',
      feishuTableId: '',
      feishuUploadContent: true,
      feishuUploadAttachment: false,
      feishuUploadHtml: false,

      // HTML 导出设置
      htmlExportFolder: 'Discourse导出',

      // 内容设置
      addMetadata: true,
      includeImages: true,
      embedImages: false,  // 将图片嵌入为 Base64（解决手机端图片无法显示问题）

      // 下载图片/视频到本地 Vault（通过 Obsidian Local REST API 插件）
      downloadImages: false,
      downloadVideos: true,
      restApiKey: '',
      restApiPort: 27123,
      mediaFolderName: 'media',

      // 评论设置
      saveComments: false,
      commentCount: 100,
      saveAllComments: false,  // 与 useFloorRange 互斥
      foldComments: false,

      // 楼层范围（与 saveAllComments 互斥）
      useFloorRange: false,
      floorFrom: 1,
      floorTo: 100,

      // 自定义站点（逗号分隔的域名列表，用于检测不到的自建 Discourse）
      customSites: ''
    };

    function get(key) {
      if (key) {
        const value = GM_getValue(key, DEFAULT_CONFIG[key]);
        console.log(`[Discourse Saver] Config.get('${key}') = '${value}'`);
        return value;
      }
      // 获取全部配置
      const config = {};
      for (const k in DEFAULT_CONFIG) {
        config[k] = GM_getValue(k, DEFAULT_CONFIG[k]);
      }
      console.log('[Discourse Saver] Config loaded:', JSON.stringify({
        vaultName: config.vaultName,
        folderPath: config.folderPath,
        saveToObsidian: config.saveToObsidian,
        useAdvancedUri: config.useAdvancedUri
      }));
      return config;
    }

    function set(key, value) {
      console.log(`[Discourse Saver] Config.set('${key}', '${value}')`);
      GM_setValue(key, value);
    }

    function setAll(config) {
      console.log('[Discourse Saver] Config.setAll:', JSON.stringify({
        vaultName: config.vaultName,
        folderPath: config.folderPath
      }));
      for (const k in config) {
        GM_setValue(k, config[k]);
      }
      // 立即验证保存是否成功
      const savedVault = GM_getValue('vaultName', '');
      console.log(`[Discourse Saver] 验证保存: vaultName = '${savedVault}'`);
    }

    function getDefault() {
      return { ...DEFAULT_CONFIG };
    }

    return { get, set, setAll, getDefault };
  })();

  // ============================================================
  // 模块2: 工具函数 (UtilModule)
  // ============================================================
  const UtilModule = (function() {
    // 获取北京时间
    function getBeijingTime() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const beijing = new Date(utc + 8 * 3600000);
      const year = beijing.getFullYear();
      const month = String(beijing.getMonth() + 1).padStart(2, '0');
      const day = String(beijing.getDate()).padStart(2, '0');
      const hours = String(beijing.getHours()).padStart(2, '0');
      const minutes = String(beijing.getMinutes()).padStart(2, '0');
      const seconds = String(beijing.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    // 清理文件名
    function sanitizeFileName(name) {
      return name
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 100);
    }

    // 显示通知
    function showNotification(message, type = 'info') {
      // 移除旧通知
      const old = document.querySelector('.ds-notification');
      if (old) old.remove();

      const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
      };

      const div = document.createElement('div');
      div.className = 'ds-notification';
      div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 8px;
        font-size: 14px;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: dsSlideIn 0.3s ease;
      `;
      div.textContent = message;
      document.body.appendChild(div);

      setTimeout(() => div.remove(), 3000);
    }

    // 图片嵌入限制常量
    const IMAGE_LIMITS = {
      MAX_SINGLE_SIZE: 15 * 1024 * 1024,    // 单张图片最大 15MB
      MAX_TOTAL_SIZE: 100 * 1024 * 1024,    // 总大小最大 100MB
      MAX_IMAGE_COUNT: 50                    // 最多嵌入 50 张图片
    };

    // 下载图片并转换为 Base64（带大小检测）
    function fetchImageAsBase64(url, maxSize = IMAGE_LIMITS.MAX_SINGLE_SIZE) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url: url,
          responseType: 'blob',
          timeout: 30000,
          onload: function(response) {
            if (response.status >= 200 && response.status < 300) {
              const blob = response.response;

              // 检查图片大小
              if (blob.size > maxSize) {
                reject(new Error(`图片过大 (${(blob.size/1024/1024).toFixed(1)}MB > ${(maxSize/1024/1024).toFixed(0)}MB限制)`));
                return;
              }

              const reader = new FileReader();
              reader.onloadend = () => resolve({
                data: reader.result,
                size: blob.size
              });
              reader.onerror = () => reject(new Error('Failed to read blob'));
              reader.readAsDataURL(blob);
            } else {
              reject(new Error(`HTTP ${response.status}`));
            }
          },
          onerror: function() {
            reject(new Error('Network error'));
          },
          ontimeout: function() {
            reject(new Error('Timeout'));
          }
        });
      });
    }

    // 批量将 Markdown 中的图片 URL 替换为 Base64
    async function embedImagesInMarkdown(markdown, onProgress = null) {
      // 参数验证
      if (!markdown || typeof markdown !== 'string') {
        console.warn('[Discourse Saver] embedImagesInMarkdown: 无效的 markdown 参数');
        return markdown || '';
      }

      // 匹配 Markdown 图片语法: ![alt](url)
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let matches;
      try {
        matches = [...markdown.matchAll(imageRegex)];
      } catch (regexError) {
        console.error('[Discourse Saver] 正则匹配失败:', regexError);
        return markdown;
      }

      if (matches.length === 0) {
        return markdown;
      }

      console.log(`[Discourse Saver] 发现 ${matches.length} 张图片`);

      // 收集所有图片 URL（去重）
      const urlList = [];
      const seenUrls = new Set();
      for (const match of matches) {
        const url = match[2];
        // 跳过已经是 base64 的图片和无效 URL
        if (url && !url.startsWith('data:') && url.startsWith('http') && !seenUrls.has(url)) {
          seenUrls.add(url);
          urlList.push(url);
        }
      }

      if (urlList.length === 0) {
        console.log('[Discourse Saver] 没有需要嵌入的图片');
        return markdown;
      }

      // 应用图片数量限制
      const effectiveUrls = urlList.slice(0, IMAGE_LIMITS.MAX_IMAGE_COUNT);
      if (urlList.length > IMAGE_LIMITS.MAX_IMAGE_COUNT) {
        console.warn(`[Discourse Saver] 图片数量 (${urlList.length}) 超过限制 (${IMAGE_LIMITS.MAX_IMAGE_COUNT})，只嵌入前 ${IMAGE_LIMITS.MAX_IMAGE_COUNT} 张`);
        showNotification(`图片过多，只嵌入前 ${IMAGE_LIMITS.MAX_IMAGE_COUNT} 张`, 'warning');
      }

      console.log(`[Discourse Saver] 开始嵌入 ${effectiveUrls.length} 张图片...`);

      // 用于存储结果和追踪总大小
      const urlMap = new Map();
      let totalSize = 0;
      let completed = 0;
      let skippedCount = 0;
      const total = effectiveUrls.length;
      const OVERALL_TIMEOUT = 180000; // 3分钟总超时（增加到3分钟以支持更多图片）

      try {
        await Promise.race([
          Promise.all(effectiveUrls.map(async (url) => {
            try {
              // 检查是否已超过总大小限制
              if (totalSize >= IMAGE_LIMITS.MAX_TOTAL_SIZE) {
                console.warn(`[Discourse Saver] 总大小已达限制，跳过: ${url.substring(0, 50)}...`);
                urlMap.set(url, null);
                skippedCount++;
                completed++;
                if (onProgress) onProgress(completed, total);
                return;
              }

              const result = await fetchImageAsBase64(url);
              const imageSize = result.size;

              // 检查添加此图片后是否超过总大小限制
              if (totalSize + imageSize > IMAGE_LIMITS.MAX_TOTAL_SIZE) {
                console.warn(`[Discourse Saver] 添加此图片将超过总大小限制，跳过 (${(imageSize/1024/1024).toFixed(1)}MB)`);
                urlMap.set(url, null);
                skippedCount++;
              } else {
                urlMap.set(url, result.data);
                totalSize += imageSize;
                console.log(`[Discourse Saver] 图片嵌入 ${completed+1}/${total}: ${(imageSize/1024).toFixed(0)}KB, 总计: ${(totalSize/1024/1024).toFixed(1)}MB`);
              }

              completed++;
              if (onProgress) onProgress(completed, total);
            } catch (error) {
              console.warn(`[Discourse Saver] 图片下载失败: ${url}`, error.message);
              urlMap.set(url, null);
              skippedCount++;
              completed++;
              if (onProgress) onProgress(completed, total);
            }
          })),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('图片嵌入总超时')), OVERALL_TIMEOUT)
          )
        ]);
      } catch (timeoutError) {
        console.warn('[Discourse Saver] 图片嵌入超时，部分图片可能未嵌入:', timeoutError.message);
      }

      // 替换 Markdown 中的图片 URL
      let result = markdown;
      try {
        for (const [url, base64] of urlMap.entries()) {
          if (base64 && typeof base64 === 'string') {
            result = result.split(`](${url})`).join(`](${base64})`);
          }
        }
      } catch (replaceError) {
        console.error('[Discourse Saver] 图片 URL 替换失败:', replaceError);
        return markdown;
      }

      const successCount = [...urlMap.values()].filter(v => v !== null).length;
      console.log(`[Discourse Saver] 图片嵌入完成: ${successCount}/${total} 成功, ${skippedCount} 跳过, 总大小: ${(totalSize/1024/1024).toFixed(1)}MB`);

      if (skippedCount > 0) {
        showNotification(`已嵌入 ${successCount} 张图片，${skippedCount} 张因过大或超限跳过`, 'info');
      }

      return result;
    }

    // 验证 URL 是否有效
    function isValidUrl(url) {
      if (!url || typeof url !== 'string') return false;
      try {
        // 去除空白字符
        url = url.trim();
        if (!url) return false;
        // 检查是否包含无效字符
        if (/[\s<>"{}|\\^`\[\]]/.test(url)) return false;
        // 尝试构造 URL 对象
        new URL(url);
        return true;
      } catch (e) {
        return false;
      }
    }

    // 构建安全的 URL
    function buildSafeUrl(url, baseUrl = window.location.origin) {
      if (!url || typeof url !== 'string') return '';
      try {
        url = url.trim();
        if (!url) return '';
        // 如果已经是完整 URL
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return isValidUrl(url) ? url : '';
        }
        // 相对 URL
        if (url.startsWith('/')) {
          const fullUrl = baseUrl + url;
          return isValidUrl(fullUrl) ? fullUrl : '';
        }
        // 不是有效的 URL 格式
        return '';
      } catch (e) {
        console.warn('[Discourse Saver] URL 构建失败:', url, e.message);
        return '';
      }
    }

    // 清理 HTML 内容，防止崩溃
    function sanitizeHtml(html) {
      if (!html || typeof html !== 'string') return '';
      try {
        // 移除可能导致解析问题的字符
        html = html.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
        // 修复未闭合的标签
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.innerHTML;
      } catch (e) {
        console.warn('[Discourse Saver] HTML 清理失败:', e.message);
        // 返回纯文本版本
        return html.replace(/<[^>]*>/g, '');
      }
    }

    // V5.1: 收集 Markdown 中的媒体文件 URL（图片+视频）
    function collectMediaUrls(markdown, downloadVideos) {
      const mediaUrls = [];
      const seenUrls = new Set();

      // 匹配图片 ![alt](url)
      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      let match;
      while ((match = imageRegex.exec(markdown)) !== null) {
        const url = match[2];
        if (!seenUrls.has(url) && url.startsWith('http')) {
          seenUrls.add(url);
          mediaUrls.push({ url, type: 'image', alt: match[1] });
        }
      }

      // 匹配视频链接
      if (downloadVideos) {
        const videoRegex = /\[([^\]]*)\]\((https?:\/\/[^)]+\.(?:mp4|webm|mov|avi|mkv|m4v)[^)]*)\)/gi;
        while ((match = videoRegex.exec(markdown)) !== null) {
          const url = match[2];
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            mediaUrls.push({ url, type: 'video', alt: match[1] });
          }
        }
        // 独立的视频 URL 行
        const videoLineRegex = /^(https?:\/\/\S+\.(?:mp4|webm|mov|avi|mkv|m4v)\S*)$/gim;
        while ((match = videoLineRegex.exec(markdown)) !== null) {
          const url = match[1];
          if (!seenUrls.has(url)) {
            seenUrls.add(url);
            mediaUrls.push({ url, type: 'video', alt: '' });
          }
        }
      }

      return mediaUrls;
    }

    // V5.1: 通过 Obsidian Local REST API 下载媒体文件到 Vault 并替换路径
    async function downloadAndReplaceMedia(markdown, config, siteFolderPath) {
      if (!config.downloadImages) {
        return markdown;
      }

      const mediaUrls = collectMediaUrls(markdown, config.downloadVideos);
      if (mediaUrls.length === 0) {
        console.log('[Discourse Saver] 没有找到需要下载的媒体文件');
        return markdown;
      }

      console.log(`[Discourse Saver] 找到 ${mediaUrls.length} 个媒体文件，开始通过 REST API 写入...`);
      showNotification(`正在下载 ${mediaUrls.length} 个媒体文件到 Vault...`, 'info');

      // 媒体文件夹路径：{siteFolderPath}/{mediaFolderName}
      const mediaFolderName = config.mediaFolderName || 'media';
      const vaultPath = siteFolderPath ? `${siteFolderPath}/${mediaFolderName}` : mediaFolderName;

      // 优先使用 HTTP (27123) 避免自签名证书问题，失败时自动升级到 HTTPS (27124)
      const configPort = config.restApiPort || 27123;
      let apiBase = `http://127.0.0.1:${configPort}`;
      try {
        await new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: 'GET', url: `${apiBase}/`, timeout: 5000,
            headers: { 'Authorization': `Bearer ${config.restApiKey}` },
            onload: (r) => r.status >= 200 && r.status < 500 ? resolve() : reject(new Error()),
            onerror: () => reject(new Error())
          });
        });
      } catch (e) {
        const httpsPort = configPort === 27123 ? 27124 : configPort + 1;
        apiBase = `https://127.0.0.1:${httpsPort}`;
        console.log('[Discourse Saver] HTTP 失败，升级到 HTTPS:', apiBase);
      }

      const results = [];

      for (let i = 0; i < mediaUrls.length; i++) {
        const media = mediaUrls[i];
        try {
          // 1. 通过 GM_xmlhttpRequest 获取图片/视频的二进制数据
          const binaryData = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
              method: 'GET',
              url: media.url,
              responseType: 'arraybuffer',
              timeout: 30000,
              onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                  resolve(response.response);
                } else {
                  reject(new Error(`HTTP ${response.status}`));
                }
              },
              onerror: function(error) {
                reject(new Error('网络错误'));
              },
              ontimeout: function() {
                reject(new Error('下载超时'));
              }
            });
          });

          // 2. 从 URL 提取文件名
          let fileName;
          try {
            const urlObj = new URL(media.url);
            fileName = urlObj.pathname.split('/').pop() || `media_${i}`;
          } catch(e) {
            fileName = `media_${i}`;
          }
          fileName = fileName.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, '_');
          if (!fileName.includes('.')) {
            fileName += media.type === 'video' ? '.mp4' : '.jpg';
          }

          // 去重
          const existingNames = results.map(r => r.localName);
          let finalName = fileName;
          let counter = 1;
          while (existingNames.includes(finalName)) {
            const dotIdx = fileName.lastIndexOf('.');
            if (dotIdx > 0) {
              finalName = fileName.substring(0, dotIdx) + `_${counter}` + fileName.substring(dotIdx);
            } else {
              finalName = fileName + `_${counter}`;
            }
            counter++;
          }

          // 3. 通过 REST API 写入 Vault
          const filePath = `${vaultPath}/${finalName}`;
          const putResult = await new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
              method: 'PUT',
              url: `${apiBase}/vault/${encodeURIComponent(filePath)}`,
              headers: {
                'Authorization': `Bearer ${config.restApiKey}`,
                'Content-Type': 'application/octet-stream'
              },
              data: binaryData,
              responseType: 'text',
              timeout: 30000,
              onload: function(response) {
                if (response.status >= 200 && response.status < 300) {
                  resolve(true);
                } else {
                  reject(new Error(`REST API ${response.status}: ${response.responseText}`));
                }
              },
              onerror: function() {
                reject(new Error('REST API 连接失败'));
              },
              ontimeout: function() {
                reject(new Error('REST API 超时'));
              }
            });
          });

          console.log(`[Discourse Saver] 写入 Vault [${i + 1}/${mediaUrls.length}]: ${filePath}`);
          showNotification(`下载媒体文件 ${i + 1}/${mediaUrls.length}...`, 'info');

          results.push({
            originalUrl: media.url,
            localName: finalName,
            relativePath: `${mediaFolderName}/${finalName}`,
            success: true
          });
        } catch (dlError) {
          console.warn(`[Discourse Saver] 写入媒体失败: ${media.url}`, dlError);
          results.push({
            originalUrl: media.url,
            localName: null,
            relativePath: null,
            success: false,
            error: dlError.message
          });
        }
      }

      // 替换 Markdown 中的 URL 为相对路径
      let processedMarkdown = markdown;
      let successCount = 0;

      for (const result of results) {
        if (result.success && result.relativePath) {
          const escapedUrl = result.originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          processedMarkdown = processedMarkdown.replace(
            new RegExp(escapedUrl, 'g'),
            result.relativePath
          );
          successCount++;
        }
      }

      console.log(`[Discourse Saver] 媒体路径替换完成: ${successCount}/${mediaUrls.length} 成功`);
      if (successCount > 0) {
        showNotification(`已下载 ${successCount} 个媒体文件到 Vault`, 'success');
      }

      return processedMarkdown;
    }

    // V5.1: 测试 Obsidian Local REST API 连接
    async function testRestApiConnection(apiKey, apiPort) {
      const port = apiPort || 27123;

      function tryConnect(baseUrl) {
        return new Promise((resolve, reject) => {
          GM_xmlhttpRequest({
            method: 'GET',
            url: `${baseUrl}/`,
            headers: { 'Authorization': `Bearer ${apiKey}` },
            timeout: 5000,
            onload: function(response) {
              if (response.status >= 200 && response.status < 300) {
                resolve({ success: true, message: '连接成功' });
              } else if (response.status === 401 || response.status === 403) {
                resolve({ success: false, message: 'API Key 错误' });
              } else {
                resolve({ success: false, message: `HTTP ${response.status}` });
              }
            },
            onerror: () => reject(new Error('connection_failed')),
            ontimeout: () => reject(new Error('timeout'))
          });
        });
      }

      // 先试 HTTP，失败再试 HTTPS
      try {
        return await tryConnect(`http://127.0.0.1:${port}`);
      } catch (e) {
        const httpsPort = port === 27123 ? 27124 : port + 1;
        try {
          return await tryConnect(`https://127.0.0.1:${httpsPort}`);
        } catch (e2) {
          return { success: false, message: '无法连接，请确认 Obsidian 已启动且已安装 Local REST API 插件' };
        }
      }
    }

    return { getBeijingTime, sanitizeFileName, showNotification, fetchImageAsBase64, embedImagesInMarkdown, isValidUrl, buildSafeUrl, sanitizeHtml, collectMediaUrls, downloadAndReplaceMedia, testRestApiConnection };
  })();

  // ============================================================
  // 模块3: 内容提取 (ExtractModule)
  // ============================================================
  const ExtractModule = (function() {
    // 检测是否是 Discourse 论坛 - v4.6.5 增强版（支持自定义站点）
    function isDiscourseForumPage() {
      // 首先检查自定义站点列表
      const config = ConfigModule.get();
      const customSites = (config.customSites || '').split(',').map(s => s.trim().toLowerCase()).filter(s => s);
      const currentHost = window.location.hostname.toLowerCase();

      if (customSites.some(site => currentHost.includes(site) || site.includes(currentHost))) {
        console.log('[Discourse Saver] 匹配自定义站点:', currentHost);
        return true;
      }

      // 多种检测方式
      const checks = [
        // 检查 Discourse 特有的 meta 标签
        () => document.querySelector('meta[name="discourse_theme_id"]') !== null,
        () => document.querySelector('meta[name="discourse_current_homepage"]') !== null,
        () => document.querySelector('meta[name="generator"][content*="Discourse"]') !== null,
        // 检查 Discourse 特有的 DOM 结构
        () => document.querySelector('#ember-basic-dropdown-wormhole') !== null,
        () => document.querySelector('.ember-application') !== null,
        () => document.querySelector('#main-outlet') !== null,
        () => document.querySelector('.post-stream') !== null,
        () => document.querySelector('.topic-list') !== null,
        () => document.querySelector('.d-header') !== null,
        () => document.querySelector('.discourse-root') !== null,
        // 检查 Discourse 特有的 CSS 类
        () => document.body.classList.contains('discourse-touch') ||
              document.body.classList.contains('docked') ||
              document.body.classList.contains('logged-in') ||
              document.body.classList.contains('navigation-topics') ||
              document.body.classList.contains('categories-list') ||
              document.body.classList.contains('archetype-regular'),
        // 检查 HTML 标签
        () => document.documentElement.classList.contains('discourse-no-hierarchical-menu') ||
              document.documentElement.classList.contains('discourse-hierarchical-menu'),
        // 检查 Discourse 特有的脚本
        () => typeof window.Discourse !== 'undefined',
        () => typeof window.Ember !== 'undefined',
        // 检查 Discourse 特有的预加载数据
        () => document.getElementById('data-preloaded') !== null,
        // 检查 Discourse 特有的 API 端点（通过已加载的脚本）
        () => {
          const scripts = document.querySelectorAll('script[src*="discourse"]');
          return scripts.length > 0;
        },
        // 检查页面上是否有 Discourse 特有的元素
        () => document.querySelector('.category-breadcrumb') !== null,
        () => document.querySelector('.topic-post') !== null,
        () => document.querySelector('.crawler-post') !== null
      ];

      const result = checks.some(check => {
        try {
          return check();
        } catch (e) {
          return false;
        }
      });

      if (result) {
        console.log('[Discourse Saver] 检测到 Discourse 论坛');
      }

      return result;
    }

    // 检查是否在帖子页面 - 增强版
    function isTopicPage() {
      // URL 模式检查
      const urlPattern = /\/t\/[^/]+\/\d+/;
      if (!urlPattern.test(window.location.pathname)) {
        return false;
      }

      // 多种选择器检测
      const titleSelectors = [
        '#topic-title h1',
        '.topic-title h1',
        '#topic-title .fancy-title',
        '.fancy-title',
        'h1.topic-title',
        '.topic-header h1',
        'h1[itemprop="headline"]',
        'article header h1'
      ];

      for (const selector of titleSelectors) {
        if (document.querySelector(selector)) {
          return true;
        }
      }

      // 如果有帖子内容区域也算
      const contentSelectors = [
        '.topic-body .cooked',
        '.topic-post .cooked',
        '.post-stream .cooked',
        'article .cooked',
        '[itemprop="articleBody"]'
      ];

      for (const selector of contentSelectors) {
        if (document.querySelector(selector)) {
          return true;
        }
      }

      return false;
    }

    // 提取主帖内容 - 增强版
    function extractContent() {
      // 多种标题选择器
      const titleSelectors = [
        '#topic-title h1',
        '.topic-title h1',
        '#topic-title .fancy-title',
        '.fancy-title',
        'h1.topic-title',
        '.topic-header h1',
        'h1[itemprop="headline"]',
        'article header h1'
      ];

      let titleElement = null;
      for (const selector of titleSelectors) {
        titleElement = document.querySelector(selector);
        if (titleElement) break;
      }

      // 多种内容选择器
      const contentSelectors = [
        '.topic-body .cooked',
        '.topic-post:first-of-type .cooked',
        '.post-stream .topic-post:first-child .cooked',
        '#post_1 .cooked',
        'article:first-of-type .cooked',
        '[itemprop="articleBody"]'
      ];

      let contentElement = null;
      for (const selector of contentSelectors) {
        contentElement = document.querySelector(selector);
        if (contentElement) break;
      }

      // 多种作者选择器
      const authorSelectors = [
        '.topic-meta-data .creator a',
        '.names .first a',
        '.topic-post:first-of-type .username a',
        '.topic-avatar a[data-user-card]',
        '[itemprop="author"] a',
        '.first-post .username'
      ];

      let authorElement = null;
      for (const selector of authorSelectors) {
        authorElement = document.querySelector(selector);
        if (authorElement) break;
      }

      // 如果没有标题，尝试从页面标题提取
      if (!titleElement) {
        const pageTitle = document.title;
        // 通常格式是 "帖子标题 - 论坛名称"
        const titlePart = pageTitle.split(' - ')[0] || pageTitle;
        if (titlePart && contentElement) {
          // 创建一个虚拟元素来获取标题
          titleElement = { textContent: titlePart };
        }
      }

      if (!titleElement || !contentElement) {
        console.log('[Discourse Saver] 无法找到标题或内容元素');
        console.log('[Discourse Saver] titleElement:', titleElement);
        console.log('[Discourse Saver] contentElement:', contentElement);
        return null;
      }

      const title = titleElement.textContent.trim();
      const contentHTML = contentElement.innerHTML;
      const url = window.location.href;
      const author = authorElement ? authorElement.textContent.trim() : '未知作者';
      const topicId = window.location.pathname.match(/\/t\/[^/]+\/(\d+)/)?.[1];

      // 提取分类 - v4.6.0 终极增强版（过滤图标）
      let category = '';

      // 辅助函数：从元素中提取纯文本（过滤SVG图标）
      function extractTextWithoutIcons(element) {
        if (!element) return '';
        // 克隆元素以避免修改原始 DOM
        const clone = element.cloneNode(true);
        // 删除所有 SVG 和图标元素
        clone.querySelectorAll('svg, .d-icon, .svg-icon, [class*="icon"], use').forEach(el => el.remove());
        // 获取纯文本
        return clone.textContent.trim();
      }

      // 方法0（最优先）: Linux.do 专用 - 查找第一个分类徽章
      console.log('[Discourse Saver] 开始提取分类...');
      const badgeCategoryContainers = document.querySelectorAll('.badge-category-parent-box, .badge-category-bg, .badge-category, .topic-category .badge-wrapper');
      for (const container of badgeCategoryContainers) {
        // 优先查找专门的名称元素
        const nameEl = container.querySelector('.badge-category__name, .badge-category-name, .category-name');
        if (nameEl) {
          const text = nameEl.textContent.trim();
          if (text && text.length > 0 && text.length < 100) {
            category = text;
            console.log(`[Discourse Saver] 方法0找到分类: "${category}" (从badge名称元素)`);
            break;
          }
        }
        // 如果没有名称元素，提取过滤图标后的文本
        if (!category) {
          const text = extractTextWithoutIcons(container);
          if (text && text.length > 0 && text.length < 100) {
            category = text;
            console.log(`[Discourse Saver] 方法0找到分类: "${category}" (从badge容器过滤图标后)`);
            break;
          }
        }
      }

      // 方法1: DOM 选择器 - 覆盖各种可能的情况
      if (!category) {
        const categorySelectors = [
          // Discourse 标准选择器
          '.topic-category .badge-category__name',
          '.badge-category-bg .badge-category__name',
          '.category-name',
          '.badge-wrapper .badge-category-name',
          '[itemprop="articleSection"]',
          // 更多变体
          '.topic-category .badge-category-name',
          '.topic-header-extra .badge-category__name',
          '.topic-header-extra .badge-category-name',
          '#topic-title .badge-category__name',
          '#topic-title .badge-category-name',
          '.title-wrapper .badge-category__name',
          '.title-wrapper .badge-category-name',
          // Linux.do 更多选择器
          '.extra-info-wrapper .badge-category__name',
          '.extra-info-wrapper .badge-category-name',
          '.extra-info .badge-category__name',
          '.extra-info .badge-category-name',
          // 分类链接内的文本
          'a[href*="/c/"] .badge-category__name',
          'a[href*="/c/"] .badge-category-name',
          'a[href*="/c/"] span.category-name'
        ];

        for (const selector of categorySelectors) {
          try {
            const categoryBadge = document.querySelector(selector);
            if (categoryBadge) {
              const text = categoryBadge.textContent.trim();
              if (text && text.length > 0 && text.length < 100) {
                category = text;
                console.log(`[Discourse Saver] 方法1找到分类: "${category}" (选择器: ${selector})`);
                break;
              }
            }
          } catch (e) {
            // 忽略选择器错误
          }
        }
      }

      // 方法2: 查找 topic-category 容器并过滤图标
      if (!category) {
        const topicCategoryContainers = [
          '.topic-category',
          '.extra-info-wrapper .topic-category',
          '#topic-title .topic-category',
          '.title-wrapper .topic-category'
        ];

        for (const selector of topicCategoryContainers) {
          const container = document.querySelector(selector);
          if (container) {
            // 优先找第一个链接
            const firstLink = container.querySelector('a[href*="/c/"]');
            if (firstLink) {
              const text = extractTextWithoutIcons(firstLink);
              if (text && text.length > 0 && text.length < 100) {
                category = text;
                console.log(`[Discourse Saver] 方法2找到分类: "${category}" (从topic-category链接)`);
                break;
              }
            }
            // 如果没有链接，从容器提取
            if (!category) {
              const text = extractTextWithoutIcons(container);
              if (text && text.length > 0 && text.length < 100) {
                // 可能包含多个分类/标签，取第一个
                const firstPart = text.split(/[\s,，、]+/)[0];
                if (firstPart && firstPart.length > 0) {
                  category = firstPart;
                  console.log(`[Discourse Saver] 方法2找到分类: "${category}" (从topic-category容器)`);
                  break;
                }
              }
            }
          }
        }
      }

      // 方法3: 查找所有指向分类的链接（过滤图标版）
      if (!category) {
        const categoryLinks = document.querySelectorAll('a[href*="/c/"]');
        for (const link of categoryLinks) {
          // 检查链接是否在标题区域
          const isInTitleArea = link.closest('#topic-title') ||
                                link.closest('.topic-category') ||
                                link.closest('.extra-info') ||
                                link.closest('.title-wrapper') ||
                                link.closest('.topic-header');
          if (isInTitleArea) {
            const text = extractTextWithoutIcons(link);
            if (text && text.length > 0 && text.length < 100) {
              category = text;
              console.log(`[Discourse Saver] 方法3找到分类: "${category}" (从分类链接过滤图标后)`);
              break;
            }
          }
        }
      }

      // 方法4: 从 Discourse 预加载数据提取
      if (!category) {
        try {
          // 尝试从页面的 preloaded data 获取
          const preloadedData = document.getElementById('data-preloaded');
          if (preloadedData) {
            const data = preloadedData.dataset.preloaded;
            if (data) {
              const parsed = JSON.parse(data);
              // 查找 topic 数据
              for (const key in parsed) {
                if (key.includes('topic')) {
                  try {
                    const topicData = JSON.parse(parsed[key]);
                    if (topicData && topicData.category_id) {
                      // 从 categories 数据中查找名称
                      const categoriesKey = Object.keys(parsed).find(k => k.includes('categories'));
                      if (categoriesKey) {
                        const categoriesData = JSON.parse(parsed[categoriesKey]);
                        const cat = categoriesData?.category_list?.categories?.find(
                          c => c.id === topicData.category_id
                        );
                        if (cat && cat.name) {
                          category = cat.name;
                          console.log(`[Discourse Saver] 方法4找到分类: "${category}" (从preloaded data categories)`);
                          break;
                        }
                      }
                    }
                    // 直接从 topic 数据获取 category
                    if (!category && topicData && topicData.category) {
                      if (typeof topicData.category === 'string') {
                        category = topicData.category;
                        console.log(`[Discourse Saver] 方法4找到分类: "${category}" (从topic.category字符串)`);
                      } else if (topicData.category.name) {
                        category = topicData.category.name;
                        console.log(`[Discourse Saver] 方法4找到分类: "${category}" (从topic.category.name)`);
                      }
                    }
                  } catch (e) {
                    // 忽略解析错误
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log('[Discourse Saver] 方法4解析preloaded data失败:', e.message);
        }
      }

      // 方法5: 从 Discourse 全局对象提取（多种方式）
      if (!category) {
        try {
          // 方式1: Discourse.Topic.current
          if (typeof window.Discourse !== 'undefined') {
            const topic = window.Discourse?.Topic?.current ||
                          window.Discourse?.__container__?.lookup('controller:topic')?.model ||
                          window.Discourse?.__container__?.lookup('route:topic')?.modelFor('topic');
            if (topic && topic.category) {
              category = topic.category.name || topic.category;
              console.log(`[Discourse Saver] 方法5找到分类: "${category}" (从Discourse.Topic)`);
            }
          }

          // 方式2: Ember 路由
          if (!category && typeof window.Ember !== 'undefined') {
            const appInstance = window.Ember?.Namespace?.NAMESPACES?.find(n => n.toString() === 'Discourse');
            if (appInstance) {
              const router = appInstance.__container__?.lookup('router:main');
              const topicController = appInstance.__container__?.lookup('controller:topic');
              if (topicController?.model?.category) {
                category = topicController.model.category.name;
                console.log(`[Discourse Saver] 方法5找到分类: "${category}" (从Ember controller)`);
              }
            }
          }

          // 方式3: 页面上的隐藏数据
          if (!category) {
            const topicData = document.querySelector('[data-topic-id]');
            if (topicData && topicData.dataset.categoryId) {
              // 通过 category ID 查找名称
              const categoryId = parseInt(topicData.dataset.categoryId);
              const categoryLink = document.querySelector(`a[href*="/c/"][data-category-id="${categoryId}"]`);
              if (categoryLink) {
                category = extractTextWithoutIcons(categoryLink);
                console.log(`[Discourse Saver] 方法5找到分类: "${category}" (从data-category-id)`);
              }
            }
          }
        } catch (e) {
          console.log('[Discourse Saver] 方法5访问Discourse对象失败:', e.message);
        }
      }

      // 方法5.5: 从页面 script 标签中的 JSON 数据提取
      if (!category) {
        try {
          const scripts = document.querySelectorAll('script[type="application/json"], script:not([src])');
          for (const script of scripts) {
            const content = script.textContent;
            if (content && content.includes('category') && content.includes('name')) {
              try {
                // 尝试解析 JSON
                const data = JSON.parse(content);
                if (data.category?.name) {
                  category = data.category.name;
                  console.log(`[Discourse Saver] 方法5.5找到分类: "${category}" (从script JSON)`);
                  break;
                }
              } catch (e) {
                // 尝试从文本中提取
                const match = content.match(/"category":\s*\{[^}]*"name":\s*"([^"]+)"/);
                if (match) {
                  category = match[1];
                  console.log(`[Discourse Saver] 方法5.5找到分类: "${category}" (从script文本匹配)`);
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.log('[Discourse Saver] 方法5.5解析script失败:', e.message);
        }
      }

      // 方法6: 从 URL 路径提取（最后的 fallback）
      if (!category) {
        // 标准 /c/category/subcategory 路径
        const categoryMatch = window.location.pathname.match(/\/c\/([^/]+)/);
        if (categoryMatch) {
          category = decodeURIComponent(categoryMatch[1]).replace(/-/g, ' ');
          console.log(`[Discourse Saver] 方法6找到分类: "${category}" (从URL /c/ 路径)`);
        }
      }

      // 方法7: 遍历所有带有特定样式的元素（过滤图标版）
      if (!category) {
        // 查找带有背景色样式的 span（分类通常有颜色）
        const allSpans = document.querySelectorAll('span[style*="background"], span[style*="color"]');
        for (const span of allSpans) {
          const isInTitleArea = span.closest('#topic-title') ||
                                span.closest('.topic-category') ||
                                span.closest('.extra-info');
          if (isInTitleArea) {
            const text = span.textContent.trim();
            if (text && text.length > 0 && text.length < 50 && !/^[\s\u200b]*$/.test(text)) {
              // 排除一些明显不是分类的文本
              if (!/^\d+$/.test(text) && !text.includes('http') && text !== '×') {
                category = text;
                console.log(`[Discourse Saver] 方法7找到分类: "${category}" (从带样式的span)`);
                break;
              }
            }
          }
        }
      }

      if (category) {
        console.log(`[Discourse Saver] 最终分类: "${category}"`);
      } else {
        console.log('[Discourse Saver] 所有方法都未能提取到分类');
        // 输出调试信息
        console.log('[Discourse Saver] 调试 - topic-category 元素:', document.querySelector('.topic-category'));
        console.log('[Discourse Saver] 调试 - 分类链接:', document.querySelectorAll('a[href*="/c/"]'));
      }

      // 提取标签 - v4.5.10 超级增强版
      const tags = [];
      const tagSelectors = [
        // Discourse 标准选择器
        '.discourse-tags .discourse-tag',
        '.list-tags .discourse-tag',
        '.topic-header-extra .discourse-tag',
        '.tag-drop .discourse-tag',
        // 更多变体
        '.topic-tags .discourse-tag',
        '.tags-wrapper .discourse-tag',
        'a.discourse-tag',
        '.tag-list .tag',
        '.topic-map .tag',
        // Linux.do 特殊选择器
        '.extra-info-wrapper .discourse-tag',
        '.extra-info .discourse-tag',
        '#topic-title .discourse-tag',
        '.title-wrapper .discourse-tag',
        // 链接形式的标签
        'a[href*="/tag/"]',
        'a[href*="/tags/"]',
        // 带 data 属性的标签
        '[data-tag-name]',
        '.tag-badge'
      ];

      for (const selector of tagSelectors) {
        try {
          const tagElements = document.querySelectorAll(selector);
          tagElements.forEach(tag => {
            let tagText = tag.textContent.trim();
            // 如果有 data-tag-name 属性，优先使用
            if (tag.dataset && tag.dataset.tagName) {
              tagText = tag.dataset.tagName;
            }
            // 从 href 提取标签名
            if (!tagText && tag.href) {
              const tagMatch = tag.href.match(/\/tags?\/([^/?]+)/);
              if (tagMatch) {
                tagText = decodeURIComponent(tagMatch[1]);
              }
            }
            if (tagText && !tags.includes(tagText) && tagText.length < 50) {
              // 过滤一些明显不是标签的内容
              if (!/^[\d\s]+$/.test(tagText) && !tagText.includes('http')) {
                tags.push(tagText);
              }
            }
          });
        } catch (e) {
          // 忽略选择器错误
        }
      }

      if (tags.length > 0) {
        console.log(`[Discourse Saver] 找到 ${tags.length} 个标签:`, tags);
      } else {
        console.log('[Discourse Saver] 未找到标签');
      }

      return { title, contentHTML, url, author, topicId, category, tags };
    }

    // 提取评论（DOM方式）- v4.5.10 增强版
    function extractComments(maxCount = 100) {
      const comments = [];
      const baseUrl = window.location.origin;

      // 多种评论容器选择器
      const containerSelectors = [
        'div.crawler-post',
        '.topic-post',
        '.post-stream .post',
        'article.post',
        '[itemtype*="Comment"]',
        '.reply'
      ];

      let commentElements = [];
      for (const selector of containerSelectors) {
        commentElements = document.querySelectorAll(selector);
        if (commentElements.length > 0) {
          console.log(`[Discourse Saver] 使用选择器 "${selector}" 找到 ${commentElements.length} 个评论元素`);
          break;
        }
      }

      const commentNodes = Array.from(commentElements).slice(1, maxCount + 1);

      for (const el of commentNodes) {
        // 增强的用户名选择器
        const usernameSelectors = [
          '.creator span[itemprop="name"]',
          '.names .first a',
          '.username a',
          '.author-name',
          '[itemprop="author"] [itemprop="name"]',
          '.post-user a',
          '.user-info .name'
        ];

        let usernameEl = null;
        for (const selector of usernameSelectors) {
          usernameEl = el.querySelector(selector);
          if (usernameEl) break;
        }
        const username = usernameEl ? usernameEl.textContent.trim() : '匿名用户';

        // 提取用户主页链接
        let userUrl = '';
        const userLinkSelectors = [
          '.creator a[href*="/u/"]',
          '.names .first a[href*="/u/"]',
          '.username a[href*="/u/"]',
          'a[data-user-card]',
          '.author-name a',
          '.post-user a[href*="/u/"]'
        ];

        for (const selector of userLinkSelectors) {
          const userLinkEl = el.querySelector(selector);
          if (userLinkEl) {
            userUrl = userLinkEl.href;
            break;
          }
        }

        if (!userUrl && username && username !== '匿名用户') {
          userUrl = `${baseUrl}/u/${username}`;
        }

        // 增强的内容选择器
        const contentSelectors = [
          '.post[itemprop="text"]',
          '.cooked',
          '.post-content',
          '.post-body',
          '[itemprop="text"]',
          '.content'
        ];

        let contentEl = null;
        for (const selector of contentSelectors) {
          contentEl = el.querySelector(selector);
          if (contentEl) break;
        }
        const contentHTML = contentEl ? contentEl.innerHTML : '';

        // 增强的楼层选择器
        const positionSelectors = [
          'span[itemprop="position"]',
          '.post-number',
          '.post-count',
          '[data-post-number]'
        ];

        let positionEl = null;
        for (const selector of positionSelectors) {
          positionEl = el.querySelector(selector);
          if (positionEl) break;
        }
        let position = (comments.length + 2).toString();
        if (positionEl) {
          position = positionEl.textContent.trim() || positionEl.dataset?.postNumber || position;
        }
        // 尝试从元素属性获取
        if (el.dataset && el.dataset.postNumber) {
          position = el.dataset.postNumber;
        }

        // 增强的时间选择器
        const timeSelectors = [
          'time.post-time',
          '.relative-date',
          'time[datetime]',
          '.post-date',
          '[itemprop="datePublished"]'
        ];

        let timeEl = null;
        for (const selector of timeSelectors) {
          timeEl = el.querySelector(selector);
          if (timeEl) break;
        }
        const time = timeEl ? (timeEl.getAttribute('datetime') || timeEl.textContent) : '';

        // 增强的点赞选择器
        const likesSelectors = [
          'meta[itemprop="userInteractionCount"]',
          '.post-likes',
          '.like-count',
          '.likes',
          '[data-likes]'
        ];

        let likesEl = null;
        for (const selector of likesSelectors) {
          likesEl = el.querySelector(selector);
          if (likesEl) break;
        }
        let likes = '0';
        if (likesEl) {
          likes = likesEl.getAttribute('content') ||
                  likesEl.dataset?.likes ||
                  likesEl.textContent.replace(/[^\d]/g, '') ||
                  '0';
        }

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

    // 使用API获取评论
    async function extractCommentsViaAPI(topicId, maxCount, saveAll = false, progressCallback = null) {
      const comments = [];
      const baseUrl = window.location.origin;
      let fetchErrors = 0;

      try {
        if (progressCallback) progressCallback('正在获取帖子信息...');
        console.log(`[Discourse Saver] API提取评论: topicId=${topicId}, maxCount=${maxCount}, saveAll=${saveAll}`);

        const topicUrl = `${baseUrl}/t/${topicId}.json`;
        const topicResponse = await fetch(topicUrl, { credentials: 'include' });

        if (!topicResponse.ok) {
          throw new Error(`获取帖子信息失败: ${topicResponse.status}`);
        }

        const topicData = await topicResponse.json();
        const stream = topicData.post_stream?.stream || [];
        const totalPosts = stream.length;
        console.log(`[Discourse Saver] 帖子流长度: ${totalPosts}`);

        if (totalPosts === 0) {
          console.log('[Discourse Saver] 帖子流为空，无评论');
          return comments;
        }

        const commentIds = stream.slice(1); // 排除主帖
        const targetCount = saveAll ? commentIds.length : Math.min(maxCount, commentIds.length);
        const idsToFetch = commentIds.slice(0, targetCount);
        console.log(`[Discourse Saver] 需要获取 ${idsToFetch.length} 条评论 (目标: ${targetCount})`);

        // 分批获取
        const batchSize = 20;
        for (let i = 0; i < idsToFetch.length; i += batchSize) {
          const batch = idsToFetch.slice(i, i + batchSize);
          const params = batch.map(id => `post_ids[]=${id}`).join('&');
          const postsUrl = `${baseUrl}/t/${topicId}/posts.json?${params}`;

          if (progressCallback) {
            const progress = Math.min(i + batchSize, idsToFetch.length);
            progressCallback(`正在加载评论 ${progress}/${targetCount}...`);
          }

          try {
            const postsResponse = await fetch(postsUrl, { credentials: 'include' });
            if (!postsResponse.ok) {
              console.warn(`[Discourse Saver] 批次 ${Math.floor(i/batchSize)+1} 请求失败: ${postsResponse.status}`);
              fetchErrors++;
              continue;
            }

            const postsData = await postsResponse.json();
            const posts = postsData.post_stream?.posts || [];
            console.log(`[Discourse Saver] 批次 ${Math.floor(i/batchSize)+1}: 获取 ${posts.length} 个帖子`);

            for (const post of posts) {
              if (post.post_number === 1) continue;

              try {
                const postUsername = post.username || post.display_username || '匿名用户';
                const userUrl = postUsername !== '匿名用户' ? `${baseUrl}/u/${postUsername}` : '';

                comments.push({
                  username: postUsername,
                  userUrl,
                  contentHTML: post.cooked || '',
                  position: String(post.post_number),
                  time: post.created_at || '',
                  likes: String(post.like_count || 0)
                });
              } catch (postError) {
                console.warn(`[Discourse Saver] 解析帖子 ${post.post_number} 失败:`, postError.message);
              }
            }
          } catch (batchError) {
            console.warn(`[Discourse Saver] 批次 ${Math.floor(i/batchSize)+1} 处理失败:`, batchError.message);
            fetchErrors++;
          }

          if (i + batchSize < idsToFetch.length) {
            await new Promise(r => setTimeout(r, 100));
          }
        }

        comments.sort((a, b) => parseInt(a.position) - parseInt(b.position));
        console.log(`[Discourse Saver] API评论提取完成: 成功 ${comments.length} 条, 失败批次 ${fetchErrors}`);

        // 即使有部分失败，也返回已获取的评论
        return comments;

      } catch (error) {
        console.error('[Discourse Saver] API获取评论失败:', error);
        // 如果已经获取了一些评论，返回它们而不是抛出错误
        if (comments.length > 0) {
          console.log(`[Discourse Saver] 部分成功，返回 ${comments.length} 条评论`);
          return comments;
        }
        throw error;
      }
    }

    // 提取单条评论
    function extractSingleComment(postNumber) {
      const commentElements = document.querySelectorAll('.topic-post, article[data-post-id]');
      const baseUrl = window.location.origin;

      for (const el of commentElements) {
        const posNum = el.getAttribute('data-post-number') ||
                       el.querySelector('[data-post-number]')?.getAttribute('data-post-number');

        if (posNum === postNumber) {
          const usernameEl = el.querySelector('.creator span[itemprop="name"]') ||
                             el.querySelector('.names .first a') ||
                             el.querySelector('.username a');
          const username = usernameEl ? usernameEl.textContent.trim() : '匿名用户';

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

          const contentEl = el.querySelector('.post[itemprop="text"]') ||
                            el.querySelector('.cooked');
          const contentHTML = contentEl ? contentEl.innerHTML : '';

          const timeEl = el.querySelector('time.post-time') ||
                         el.querySelector('.relative-date');
          const time = timeEl ? (timeEl.getAttribute('datetime') || timeEl.textContent) : '';

          const likesEl = el.querySelector('meta[itemprop="userInteractionCount"]') ||
                          el.querySelector('.post-likes');
          const likes = likesEl ?
                        (likesEl.getAttribute('content') || likesEl.textContent.replace(/[^\d]/g, '')) : '0';

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
      return null;
    }

    return {
      isDiscourseForumPage,
      isTopicPage,
      extractContent,
      extractComments,
      extractCommentsViaAPI,
      extractSingleComment
    };
  })();

  // ============================================================
  // 模块4: Markdown转换 (ConvertModule)
  // ============================================================
  const ConvertModule = (function() {
    let turndownService = null;

    // 解析视频URL
    function parseVideoUrl(href) {
      // YouTube
      const ytMatch = href.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
      if (ytMatch) {
        return { embedUrl: 'https://www.youtube.com/embed/' + ytMatch[1], isVideo: true, platform: 'youtube' };
      }
      // Bilibili（包含 b23.tv 短链 - 返回原链接让用户点击跳转）
      const biliMatch = href.match(/bilibili\.com\/video\/(BV[a-zA-Z0-9]+|av\d+)/i);
      if (biliMatch) {
        const vid = biliMatch[1];
        if (vid.toLowerCase().startsWith('bv')) {
          return { embedUrl: '//player.bilibili.com/player.html?bvid=' + vid, isVideo: true, platform: 'bilibili' };
        } else {
          return { embedUrl: '//player.bilibili.com/player.html?aid=' + vid.replace(/^av/i, ''), isVideo: true, platform: 'bilibili' };
        }
      }
      // b23.tv 短链（Bilibili）- 无法直接解析，作为视频链接显示
      if (/b23\.tv/i.test(href)) {
        return { embedUrl: '', isVideo: true, platform: 'bilibili-short', originalUrl: href };
      }
      // Vimeo
      const vimeoMatch = href.match(/vimeo\.com\/(\d+)/);
      if (vimeoMatch) {
        return { embedUrl: 'https://player.vimeo.com/video/' + vimeoMatch[1], isVideo: true, platform: 'vimeo' };
      }
      // 优酷
      const youkuMatch = href.match(/v\.youku\.com\/v_show\/id_([a-zA-Z0-9=]+)/);
      if (youkuMatch) {
        return { embedUrl: 'https://player.youku.com/embed/' + youkuMatch[1], isVideo: true, platform: 'youku' };
      }
      // 腾讯视频
      const qqMatch = href.match(/v\.qq\.com\/x\/(?:cover\/[^\/]+\/|page\/|play\/)([a-zA-Z0-9]+)/);
      if (qqMatch) {
        return { embedUrl: 'https://v.qq.com/txp/iframe/player.html?vid=' + qqMatch[1], isVideo: true, platform: 'qq' };
      }
      return { embedUrl: '', isVideo: false, platform: '' };
    }

    // 解析网盘链接
    function parseCloudUrl(href) {
      // 百度网盘
      if (/pan\.baidu\.com|yun\.baidu\.com/i.test(href)) {
        return { isCloud: true, platform: 'baidu', name: '百度网盘', icon: '📦' };
      }
      // 夸克网盘
      if (/pan\.quark\.cn/i.test(href)) {
        return { isCloud: true, platform: 'quark', name: '夸克网盘', icon: '📦' };
      }
      // 123云盘
      if (/123pan\.com|123云盘/i.test(href)) {
        return { isCloud: true, platform: '123pan', name: '123云盘', icon: '📦' };
      }
      // 蓝奏云
      if (/lanzou[a-z]*\.(com|cn)|lanzoui\.com|lanzoux\.com/i.test(href)) {
        return { isCloud: true, platform: 'lanzou', name: '蓝奏云', icon: '📦' };
      }
      // 阿里云盘
      if (/aliyundrive\.com|alipan\.com/i.test(href)) {
        return { isCloud: true, platform: 'aliyun', name: '阿里云盘', icon: '📦' };
      }
      // 天翼云盘
      if (/cloud\.189\.cn/i.test(href)) {
        return { isCloud: true, platform: 'tianyi', name: '天翼云盘', icon: '📦' };
      }
      return { isCloud: false, platform: '', name: '', icon: '' };
    }

    // 生成视频嵌入
    function generateVideoEmbed(videoInfo, originalUrl) {
      if (videoInfo.embedUrl) {
        return '\n\n<div style="position:relative;width:100%;padding-bottom:56.25%;"><iframe src="' + videoInfo.embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;" allowfullscreen></iframe></div>\n\n';
      }
      // 无法嵌入的视频链接（如 b23.tv 短链），使用视频图标显示
      if (videoInfo.isVideo) {
        return '\n\n> 🎬 **视频链接**: [点击观看](' + originalUrl + ')\n\n';
      }
      return '\n\n' + originalUrl + '\n\n';
    }

    // 生成网盘链接块
    function generateCloudBlock(cloudInfo, originalUrl, linkText) {
      return '\n\n> ' + cloudInfo.icon + ' **' + cloudInfo.name + '**: [' + (linkText || '点击下载') + '](' + originalUrl + ')\n\n';
    }

    // 初始化Turndown
    function initTurndown() {
      if (turndownService) return turndownService;

      turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced',
        emDelimiter: '*'
      });

      // HTML 表格转 Markdown 表格
      turndownService.addRule('tables', {
        filter: 'table',
        replacement: (content, node) => {
          try {
            const rows = node.querySelectorAll('tr');
            if (rows.length === 0) return content;

            const tableData = [];
            let maxCols = 0;

            // 收集所有行的数据
            rows.forEach(row => {
              const cells = row.querySelectorAll('th, td');
              const rowData = [];
              cells.forEach(cell => {
                // 获取单元格文本，处理内部链接
                let cellText = '';
                const links = cell.querySelectorAll('a');
                if (links.length > 0) {
                  // 处理带链接的单元格
                  const parts = [];
                  cell.childNodes.forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                      parts.push(child.textContent.trim());
                    } else if (child.nodeName === 'A') {
                      const linkText = child.textContent.trim();
                      const linkHref = child.href || '';
                      if (linkHref) {
                        parts.push(`[${linkText}](${linkHref})`);
                      } else {
                        parts.push(linkText);
                      }
                    } else {
                      parts.push(child.textContent.trim());
                    }
                  });
                  cellText = parts.join(' ').trim();
                } else {
                  cellText = cell.textContent.trim();
                }
                // 清理单元格内容（移除换行、多余空格）
                cellText = cellText.replace(/\s+/g, ' ').trim();
                rowData.push(cellText);
              });
              if (rowData.length > maxCols) maxCols = rowData.length;
              tableData.push(rowData);
            });

            if (tableData.length === 0 || maxCols === 0) return content;

            // 构建 Markdown 表格
            let markdown = '\n\n';

            // 第一行作为表头
            const headerRow = tableData[0];
            while (headerRow.length < maxCols) headerRow.push('');
            markdown += '| ' + headerRow.join(' | ') + ' |\n';

            // 分隔行
            markdown += '| ' + headerRow.map(() => '---').join(' | ') + ' |\n';

            // 数据行
            for (let i = 1; i < tableData.length; i++) {
              const row = tableData[i];
              while (row.length < maxCols) row.push('');
              markdown += '| ' + row.join(' | ') + ' |\n';
            }

            markdown += '\n';
            console.log(`[Discourse Saver] 转换表格: ${tableData.length} 行, ${maxCols} 列`);
            return markdown;
          } catch (e) {
            console.warn('[Discourse Saver] 表格转换失败:', e.message);
            return content;
          }
        }
      });

      // 保留颜色样式
      turndownService.addRule('coloredText', {
        filter: (node) => {
          if (node.nodeName !== 'SPAN') return false;
          const style = node.getAttribute('style') || '';
          return style.includes('color');
        },
        replacement: (content, node) => {
          const style = node.getAttribute('style') || '';
          const colorMatch = style.match(/color:\s*([^;]+)/i);
          if (colorMatch && content.trim()) {
            const color = colorMatch[1].trim();
            return `<span style="color:${color}">${content}</span>`;
          }
          return content;
        }
      });

      // 处理代码块
      turndownService.addRule('codeBlocks', {
        filter: (node) => {
          return node.nodeName === 'PRE' && node.querySelector('code');
        },
        replacement: (content, node) => {
          const codeNode = node.querySelector('code');
          if (!codeNode) return content;

          const clonedCode = codeNode.cloneNode(true);
          const brTags = clonedCode.querySelectorAll('br');
          brTags.forEach(br => br.replaceWith('\n'));
          const code = clonedCode.textContent;

          const langFromClass = codeNode.className.match(/lang-(\w+)/);
          const langFromData = node.getAttribute('data-code-wrap');
          const lang = langFromClass ? langFromClass[1] : (langFromData || '');

          return '\n\n```' + lang + '\n' + code + '\n```\n\n';
        }
      });

      // 处理lightbox图片
      turndownService.addRule('lightboxImages', {
        filter: (node) => {
          return node.nodeName === 'A' &&
                 node.classList.contains('lightbox') &&
                 node.querySelector('img');
        },
        replacement: (content, node) => {
          const img = node.querySelector('img');
          if (!img) return '';

          const src = node.href || img.src;
          const fullSrc = src.startsWith('http') ? src : window.location.origin + src;
          // 清理 alt：去掉 |WxH 尺寸标注、末尾数字下划线
          const rawAlt = img.getAttribute('data-base62-sha1') || img.alt || '';
          const alt = rawAlt.replace(/\|[^\]|]+/g, '').replace(/[_\d]+$/, '').replace(/[\r\n]+/g, ' ').trim() || 'image';

          return '\n\n![' + alt + '](' + fullSrc + ')\n\n';
        }
      });

      // 处理普通图片
      turndownService.addRule('images', {
        filter: (node) => {
          if (node.nodeName !== 'IMG') return false;
          if (node.classList.contains('emoji')) return false;
          if (node.parentNode?.classList?.contains('lightbox')) return false;
          return true;
        },
        replacement: (content, node) => {
          const src = node.src;
          if (!src) return '';

          const fullSrc = src.startsWith('http') ? src : window.location.origin + src;
          // 清理 alt：去掉 |WxH 尺寸标注、末尾数字下划线
          const rawAlt = node.alt || '';
          const alt = rawAlt.replace(/\|[^\]|]+/g, '').replace(/[_\d]+$/, '').replace(/[\r\n]+/g, ' ').trim() || 'image';

          return '\n\n![' + alt + '](' + fullSrc + ')\n\n';
        }
      });

      // 移除emoji
      turndownService.addRule('emojiImages', {
        filter: (node) => {
          if (node.nodeName !== 'IMG') return false;
          const className = node.className || '';
          const src = node.src || '';
          const alt = node.alt || '';
          if (className.includes('emoji') ||
              src.includes('/emoji/') ||
              src.includes('twemoji') ||
              /^:[^:]+:$/.test(alt)) return true;
          return false;
        },
        replacement: () => ''
      });

      // 视频链接转iframe
      turndownService.addRule('onlineVideoEmbed', {
        filter: (node) => {
          if (node.nodeName !== 'A') return false;
          const href = node.href || '';
          const videoInfo = parseVideoUrl(href);
          return videoInfo.isVideo;
        },
        replacement: (content, node) => {
          const href = node.href || '';
          const videoInfo = parseVideoUrl(href);
          if (videoInfo.isVideo) {
            return generateVideoEmbed(videoInfo, href);
          }
          return '[' + content + '](' + href + ')';
        }
      });

      // 网盘链接特殊处理
      turndownService.addRule('cloudStorageLink', {
        filter: (node) => {
          if (node.nodeName !== 'A') return false;
          const href = node.href || '';
          const cloudInfo = parseCloudUrl(href);
          return cloudInfo.isCloud;
        },
        replacement: (content, node) => {
          const href = node.href || '';
          const cloudInfo = parseCloudUrl(href);
          if (cloudInfo.isCloud) {
            return generateCloudBlock(cloudInfo, href, content);
          }
          return '[' + content + '](' + href + ')';
        }
      });

      // 文档链接
      turndownService.addRule('documentEmbed', {
        filter: (node) => {
          if (node.nodeName !== 'A') return false;
          if (node.classList?.contains('lightbox')) return false;
          const href = (node.href || '').toLowerCase();
          return /\.(pdf|docx?|xlsx?|pptx?|svg|csv|txt)(\?|$)/i.test(href);
        },
        replacement: (content, node) => {
          const href = node.href || '';
          const hrefLower = href.toLowerCase();

          let fileName = content.trim().replace(/[\r\n]+/g, ' ').trim();
          const imgMatch = fileName.match(/^!\[([^\]]*)\]\([^)]+\)$/);
          if (imgMatch) {
            fileName = imgMatch[1] || '';
          }
          fileName = fileName || href.split('/').pop().split('?')[0] || '文档';

          if (/\.svg(\?|$)/i.test(hrefLower)) {
            return '\n\n![' + fileName + '](' + href + ')\n\n';
          }
          if (/\.pdf(\?|$)/i.test(hrefLower)) {
            return '\n\n📄 **' + fileName + '**\n📥 [下载 PDF](' + href + ')\n\n';
          }
          return '\n\n📎 **' + fileName + '**\n📥 [下载文件](' + href + ')\n\n';
        }
      });

      return turndownService;
    }

    // 清理Markdown
    function cleanupMarkdown(markdown) {
      // 移除空锚点链接
      markdown = markdown.replace(/\[\s*\]\(#[^)]*\)/g, '');
      // 移除emoji图片语法
      markdown = markdown.replace(/!\[:[a-z_]+:\]\([^)]+\)/gi, '');
      // 移除图片尺寸信息行
      markdown = markdown.replace(/^\s*\d+×\d+\s+\d+(?:\.\d+)?\s*(?:KB|MB|GB)\s*$/gim, '');
      // 移除转义下划线
      markdown = markdown.replace(/\\_/g, '_');
      // 清理嵌套图片链接
      markdown = markdown.replace(/\[!\[([^\]]*)\]\([^)]+\)\]\(([^)]+)\)/g, '![$1]($2)');
      markdown = markdown.replace(/!\[!\[([^\]]*)\]\([^)]+\)\]\(([^)]+)\)/g, '![$1]($2)');
      markdown = markdown.replace(/!!\[/g, '![');
      // 移除GIF
      markdown = markdown.replace(/!\[[^\]]*\]\([^)]*\.gif[^)]*\)/gi, '');
      // 清理 Discourse 图片 alt 中的尺寸标注 ![name|230x500](url) → ![name](url)
      markdown = markdown.replace(/!\[([^\]]*?)\|[^\]]+\]/g, '![$1]');
      // 处理 [spoiler]...[/spoiler] BBCode：保留内容，去掉标签
      markdown = markdown.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, (_, content) => {
        return '\n\n' + content.trim() + '\n\n';
      });
      // 处理单独的未闭合 [spoiler] / [/spoiler] 标签
      markdown = markdown.replace(/\[\/?spoiler\]/gi, '');
      // 移除多余空行
      markdown = markdown.replace(/\n{3,}/g, '\n\n');

      return markdown;
    }

    // 转换为带评论的Markdown
    function convertToMarkdownWithComments(contentHTML, metadata, comments, config) {
      const td = initTurndown();

      // 安全地转换主内容
      let mainContent = '';
      try {
        const cleanedMainHtml = UtilModule.sanitizeHtml(contentHTML || '');
        mainContent = td.turndown(cleanedMainHtml);
        mainContent = cleanupMarkdown(mainContent);
      } catch (mainContentError) {
        console.error('[Discourse Saver] 主内容转换失败:', mainContentError.message);
        // 备选方案：使用纯文本
        mainContent = (contentHTML || '').replace(/<[^>]*>/g, '').trim() || '*[主内容转换失败]*';
      }

      let markdown = '';

      // 添加元数据
      if (config.addMetadata) {
        const timeStr = UtilModule.getBeijingTime();
        const allTags = ['discourse'];
        if (metadata.tags && metadata.tags.length > 0) {
          metadata.tags.forEach(tag => {
            const cleanTag = String(tag).trim();
            if (cleanTag && !allTags.includes(cleanTag)) {
              allTags.push(cleanTag);
            }
          });
        }
        // 生成 YAML 列表格式的 tags
        const tagsYaml = allTags
          .map(t => t.replace(/[,\[\]#]/g, '').trim())
          .filter(t => t)
          .map(t => `  - ${t}`)
          .join('\n');

        markdown += `---
来源: ${metadata.url}
标题: "${metadata.title.replace(/"/g, '\\"')}"
作者: ${metadata.author}
分类: ${metadata.category || '未分类'}
tags:
${tagsYaml}
保存时间: ${timeStr}
评论数: ${comments.length}
---

`;
      }

      // 添加标题和正文
      markdown += `# ${metadata.title}\n\n`;
      markdown += mainContent;

      // 添加评论区
      if (config.saveComments && comments.length > 0) {
        markdown += '\n\n---\n\n';
        markdown += `## 评论区（共${comments.length}条）\n\n`;
        console.log(`[Discourse Saver] 开始处理 ${comments.length} 条评论`);

        let processedCount = 0;
        let errorCount = 0;

        for (const comment of comments) {
          try {
            // 清理 HTML 内容，防止解析崩溃
            const cleanedHtml = UtilModule.sanitizeHtml(comment.contentHTML || '');

            // 安全地转换为 Markdown
            let commentContent = '';
            try {
              commentContent = td.turndown(cleanedHtml);
              commentContent = cleanupMarkdown(commentContent);
              commentContent = commentContent.trim();
            } catch (turndownError) {
              console.warn(`[Discourse Saver] Turndown 转换失败 (第${comment.position}楼):`, turndownError.message);
              // 备选方案：使用纯文本
              commentContent = cleanedHtml.replace(/<[^>]*>/g, '').trim() || '*[内容转换失败]*';
            }

            // 构建安全的用户 URL
            const safeUserUrl = UtilModule.buildSafeUrl(comment.userUrl);
            const safeUsername = (comment.username || '用户').replace(/[[\]]/g, '');

            const usernameDisplay = safeUserUrl
              ? `[${safeUsername}](${safeUserUrl})`
              : safeUsername;
            const usernameDisplayHtml = safeUserUrl
              ? `<a href="${safeUserUrl}"><b>${safeUsername}</b></a>`
              : `<b>${safeUsername}</b>`;

            if (config.foldComments) {
              // 折叠模式：转换Markdown为HTML
              let htmlContent = commentContent.trim();
              htmlContent = htmlContent.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
              htmlContent = htmlContent.replace(/~~(.+?)~~/g, '<del>$1</del>');
              htmlContent = htmlContent.replace(/`([^`]+)`/g, '<code>$1</code>');

              // 保护图片，转换链接
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
              markdown += `### ${comment.position}楼 - ${usernameDisplay}\n\n`;
              markdown += commentContent;
              markdown += '\n\n';
            }
            processedCount++;
          } catch (e) {
            console.error(`[Discourse Saver] 处理第 ${comment.position || '?'} 楼评论失败:`, e.message);
            console.error('[Discourse Saver] 失败评论数据:', {
              position: comment.position,
              username: comment.username,
              contentLength: (comment.contentHTML || '').length,
              userUrl: comment.userUrl
            });
            errorCount++;
            // 尝试保存基本信息
            const fallbackUsername = (comment.username || '用户').replace(/[[\]<>]/g, '');
            const fallbackPosition = comment.position || '?';
            markdown += `### ${fallbackPosition}楼 - ${fallbackUsername}\n\n`;
            // 尝试保存纯文本内容
            try {
              const plainText = (comment.contentHTML || '').replace(/<[^>]*>/g, '').trim();
              if (plainText) {
                markdown += plainText.substring(0, 2000) + '\n\n';
              } else {
                markdown += `*[评论内容处理失败]*\n\n`;
              }
            } catch (fallbackError) {
              markdown += `*[评论内容处理失败]*\n\n`;
            }
          }
        }

        console.log(`[Discourse Saver] 评论处理完成: 成功 ${processedCount} 条, 失败 ${errorCount} 条`);
      }

      return markdown;
    }

    return {
      initTurndown,
      cleanupMarkdown,
      convertToMarkdownWithComments
    };
  })();

  // ============================================================
  // 模块5: 保存功能 (SaveModule)
  // ============================================================
  const SaveModule = (function() {
    const NOTION_API_VERSION = '2022-06-28';

    // 通用：提取内容和评论
    async function extractData(config, targetPostNumber = null) {
      const extracted = ExtractModule.extractContent();
      if (!extracted) {
        throw new Error('无法提取帖子内容');
      }

      const { title, contentHTML, url, author, topicId, category, tags } = extracted;
      let comments = [];
      let isSingleCommentMode = targetPostNumber && targetPostNumber !== '1';

      if (isSingleCommentMode) {
        UtilModule.showNotification(`正在提取第${targetPostNumber}楼评论...`, 'info');
        const singleComment = ExtractModule.extractSingleComment(targetPostNumber);
        if (singleComment) {
          comments = [singleComment];
        } else {
          throw new Error(`未找到第${targetPostNumber}楼评论`);
        }
      } else if (config.saveComments) {
        let effectiveCommentCount = config.commentCount;
        let effectiveSaveAll = config.saveAllComments;

        console.log('[Discourse Saver] 评论配置:', {
          saveComments: config.saveComments,
          saveAllComments: config.saveAllComments,
          commentCount: config.commentCount,
          useFloorRange: config.useFloorRange
        });

        if (config.useFloorRange) {
          effectiveCommentCount = config.floorTo || 100;
        }

        const useAPI = effectiveSaveAll || effectiveCommentCount > 30;
        console.log(`[Discourse Saver] 使用API: ${useAPI}, topicId: ${topicId}, saveAll: ${effectiveSaveAll}`);

        if (useAPI && topicId) {
          UtilModule.showNotification('正在通过API加载评论...', 'info');
          try {
            comments = await ExtractModule.extractCommentsViaAPI(
              topicId,
              effectiveCommentCount,
              effectiveSaveAll,
              (msg) => UtilModule.showNotification(msg, 'info')
            );
            console.log(`[Discourse Saver] API获取评论成功: ${comments.length} 条`);
          } catch (apiError) {
            console.warn('[Discourse Saver] API获取失败，回退到DOM方式:', apiError);
            comments = ExtractModule.extractComments(effectiveCommentCount);
            console.log(`[Discourse Saver] DOM获取评论: ${comments.length} 条`);
          }
        } else {
          UtilModule.showNotification('正在提取评论...', 'info');
          comments = ExtractModule.extractComments(effectiveCommentCount);
          console.log(`[Discourse Saver] DOM提取评论: ${comments.length} 条`);
        }
      } else {
        console.log('[Discourse Saver] 评论保存未启用 (saveComments=false)');
      }

      // 楼层范围过滤
      if (config.useFloorRange && comments.length > 0) {
        const floorFrom = config.floorFrom || 1;
        const floorTo = config.floorTo || 100;
        comments = comments.filter(c => {
          const pos = parseInt(c.position);
          return pos >= floorFrom && pos <= floorTo;
        });
      }

      return {
        title, contentHTML, url, author, topicId, category, tags,
        comments, isSingleCommentMode
      };
    }

    // 下载 Markdown 文件（备选方案：当剪贴板模式失败时使用）
    function downloadMarkdownFile(markdown, fileName, folderPath) {
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 提示用户
      const vaultPath = folderPath || 'Discourse收集箱';
      UtilModule.showNotification(`文件已下载，请手动放入 Obsidian: ${vaultPath}/`, 'info');
      console.log(`[Discourse Saver] 备选方案：已下载为文件: ${fileName}.md`);
      console.log(`[Discourse Saver] 请将文件移动到 Obsidian vault 的 "${vaultPath}" 文件夹`);
    }

    // 存储最后一次大文件保存的信息（用于备选下载）
    let lastLargeFileSave = null;

    // 保存到 Obsidian（使用 v4.3.8 验证过的方式：始终用剪贴板模式）
    async function sendToObsidian(markdown, fileName, config) {
      // 读取配置
      const vaultName = GM_getValue('vaultName', '') || config.vaultName || '';
      const folderPath = GM_getValue('folderPath', 'Discourse收集箱') || config.folderPath || 'Discourse收集箱';
      const encode = (str) => encodeURIComponent(str);

      console.log('[Discourse Saver] ========== Obsidian 保存 ==========');
      console.log('[Discourse Saver] Vault:', vaultName || '(默认)');
      console.log('[Discourse Saver] 文件夹:', folderPath);

      // 清理文件名（与 v4.3.8 完全一致）
      const sanitizedTitle = fileName
        .replace(/[《》<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^[\s-]+|[\s-]+$/g, '')
        .substring(0, 80) || 'Discourse-' + Date.now();

      // 构建文件路径（不含 .md 后缀，Advanced URI 会自动加）
      const filePath = folderPath ? `${folderPath}/${sanitizedTitle}` : sanitizedTitle;

      // 构建 vault 参数
      const vaultParam = vaultName && vaultName.trim() !== ''
        ? 'vault=' + encode(vaultName.trim()) + '&'
        : '';

      console.log('[Discourse Saver] 文件路径:', filePath + '.md');
      console.log('[Discourse Saver] 内容大小:', Math.round(markdown.length / 1024) + 'KB');

      // ===== 核心：始终使用剪贴板模式（v4.3.8 验证过的方式）=====
      try {
        // 步骤1：写入剪贴板
        // 优先使用原生 Clipboard API（v4.3.8 方式）
        if (navigator.clipboard && navigator.clipboard.writeText) {
          console.log('[Discourse Saver] 使用原生 Clipboard API');
          await navigator.clipboard.writeText(markdown);
        } else {
          // 回退到 GM_setClipboard
          console.log('[Discourse Saver] 回退到 GM_setClipboard');
          GM_setClipboard(markdown, 'text');
        }

        // 步骤2：构建 Advanced URI（始终用 clipboard=true，不传 data）
        let advancedUri = 'obsidian://advanced-uri?' + vaultParam;
        advancedUri += 'filepath=' + encode(filePath + '.md') + '&';
        advancedUri += 'clipboard=true&';
        advancedUri += 'mode=overwrite';

        console.log('[Discourse Saver] URI:', advancedUri);

        // 步骤3：打开 Obsidian
        window.location.href = advancedUri;
        return true;

      } catch (clipboardError) {
        console.error('[Discourse Saver] 剪贴板失败:', clipboardError);

        // 备用方案：使用普通 URI（带 content 参数，有长度限制）
        console.log('[Discourse Saver] 尝试备用方案...');
        const encodedContent = encode(markdown);

        if (encodedContent.length > 100000) {
          UtilModule.showNotification('内容过大，剪贴板不可用，请手动复制', 'error');
          // 提供下载选项
          downloadMarkdownFile(markdown, sanitizedTitle, folderPath);
          return false;
        }

        try {
          let basicUri = 'obsidian://new?' + vaultParam;
          basicUri += 'file=' + encode(filePath) + '&';
          basicUri += 'overwrite=true&';
          basicUri += 'content=' + encodedContent;

          window.location.href = basicUri;
          return true;
        } catch (e) {
          console.error('[Discourse Saver] 备用方案失败:', e);
          UtilModule.showNotification('保存失败，已下载文件', 'warning');
          downloadMarkdownFile(markdown, sanitizedTitle, folderPath);
          return false;
        }
      }
    }

    // 备选方案：下载上次大文件（供油猴菜单调用）
    function downloadLastLargeFile() {
      if (lastLargeFileSave) {
        downloadMarkdownFile(
          lastLargeFileSave.markdown,
          lastLargeFileSave.fileName,
          lastLargeFileSave.folderPath
        );
      } else {
        UtilModule.showNotification('没有待下载的大文件', 'warning');
      }
    }

    // 保存为 HTML 文件下载
    function downloadAsHtml(markdown, metadata, fileName, config) {
      const htmlContent = generateHtmlContent(markdown, metadata);
      const folder = config.htmlExportFolder || 'Discourse导出';
      const fullFileName = `${folder}/${fileName}.html`;

      // 创建 Blob 并下载
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    }

    // 生成 HTML 内容（V5.6.0：5主题切换、PDF导出、代码复制、图片 Lightbox）
    function generateHtmlContent(markdown, metadata) {
      // 去掉 YAML frontmatter（---...---）
      const cleanMarkdown = markdown.replace(/^---\n[\s\S]*?\n---\n?/, '').trimStart();

      // 使用 marked.js 转换（未加载则降级为基础转换）
      let htmlContent;
      if (typeof marked !== 'undefined') {
        marked.setOptions({ breaks: true, gfm: true });
        htmlContent = marked.parse(cleanMarkdown);
      } else {
        let h = cleanMarkdown
          .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
          .replace(/^### (.+)$/gm, '<h3>$1</h3>')
          .replace(/^## (.+)$/gm, '<h2>$1</h2>')
          .replace(/^# (.+)$/gm, '<h1>$1</h1>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>');
        htmlContent = '<p>' + h + '</p>';
      }

      function esc(t) {
        if (!t) return '';
        return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
      }
      const exportTime = new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit',
        day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      const safeTitle = esc(metadata.title || '');
      const tagsHtml = metadata.tags && metadata.tags.length > 0 ? metadata.tags.map(t => esc(t)).join(', ') : '无';

      return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="linuxdo">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    :root { --transition-speed: 0.3s; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
      max-width: 800px; margin: 0 auto; padding: 20px; padding-top: 70px;
      line-height: 1.75; background: var(--bg-page); color: var(--text-primary);
      transition: background var(--transition-speed), color var(--transition-speed);
      -webkit-font-smoothing: antialiased; min-height: 100vh;
    }
    [data-theme="linuxdo"] {
      --bg-page: #ffffff; --bg-card: #ffffff; --bg-code: #f4f4f4; --bg-quote: #e8f4fc;
      --bg-table-header: #f8f9fa; --bg-details: #f8f9fa; --bg-details-hover: #e9ecef;
      --bg-tip: linear-gradient(135deg, #4b9ed9 0%, #3a8bc9 100%);
      --text-primary: #222222; --text-secondary: #555555; --text-muted: #999999; --text-code: #333333;
      --border-color: #e9e9e9; --accent-color: #4b9ed9; --accent-hover: #3a8bc9;
      --quote-border: #4b9ed9; --shadow: 0 1px 3px rgba(0,0,0,0.08); --radius: 4px; --radius-lg: 8px;
    }
    [data-theme="dark-geek"] {
      --bg-page: #0d1117; --bg-card: #161b22; --bg-code: #1f2428; --bg-quote: #1f2937;
      --bg-table-header: #21262d; --bg-details: #21262d; --bg-details-hover: #30363d;
      --bg-tip: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
      --text-primary: #e6edf3; --text-secondary: #8b949e; --text-muted: #6e7681; --text-code: #79c0ff;
      --border-color: #30363d; --accent-color: #00ff88; --accent-hover: #00cc6a;
      --quote-border: #00ff88; --shadow: 0 4px 20px rgba(0,255,136,0.08); --radius: 6px; --radius-lg: 10px;
    }
    [data-theme="business"] {
      --bg-page: #f8fafc; --bg-card: #ffffff; --bg-code: #1e293b; --bg-quote: #f1f5f9;
      --bg-table-header: #e2e8f0; --bg-details: #f1f5f9; --bg-details-hover: #e2e8f0;
      --bg-tip: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      --text-primary: #0f172a; --text-secondary: #475569; --text-muted: #94a3b8; --text-code: #e2e8f0;
      --border-color: #e2e8f0; --accent-color: #3b82f6; --accent-hover: #2563eb;
      --quote-border: #3b82f6; --shadow: 0 1px 2px rgba(0,0,0,0.05); --radius: 6px; --radius-lg: 8px;
    }
    [data-theme="sakura"] {
      --bg-page: #fef7f8; --bg-card: #ffffff; --bg-code: #3d3d3d; --bg-quote: #fff0f3;
      --bg-table-header: #ffeef1; --bg-details: #fff5f7; --bg-details-hover: #ffecef;
      --bg-tip: linear-gradient(135deg, #ff7eb3 0%, #ff5c8a 100%);
      --text-primary: #4a4a4a; --text-secondary: #777777; --text-muted: #aaaaaa; --text-code: #ffb3c6;
      --border-color: #ffd6de; --accent-color: #ff7eb3; --accent-hover: #ff5c8a;
      --quote-border: #ff7eb3; --shadow: 0 4px 15px rgba(255,126,179,0.12); --radius: 12px; --radius-lg: 16px;
    }
    [data-theme="lavender"] {
      --bg-page: #faf8ff; --bg-card: #ffffff; --bg-code: #2d2a3e; --bg-quote: #f5f0ff;
      --bg-table-header: #efe8ff; --bg-details: #f5f2ff; --bg-details-hover: #ede6ff;
      --bg-tip: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
      --text-primary: #2e2942; --text-secondary: #5c5672; --text-muted: #9f96b8; --text-code: #d4bcff;
      --border-color: #e2d9f3; --accent-color: #a78bfa; --accent-hover: #8b5cf6;
      --quote-border: #a78bfa; --shadow: 0 4px 15px rgba(167,139,250,0.12); --radius: 10px; --radius-lg: 14px;
    }
    .toolbar {
      position: fixed; top: 0; left: 0; right: 0; background: var(--bg-card);
      border-bottom: 1px solid var(--border-color); z-index: 1000; box-shadow: var(--shadow);
      transition: transform var(--transition-speed), background var(--transition-speed);
    }
    .toolbar-inner {
      display: flex; gap: 6px; padding: 10px 16px; flex-wrap: wrap;
      justify-content: center; max-width: 900px; margin: 0 auto;
    }
    .toolbar-btn {
      padding: 6px 12px; border: 1px solid var(--border-color); border-radius: var(--radius);
      background: var(--bg-card); color: var(--text-primary); font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all 0.2s ease; white-space: nowrap; touch-action: manipulation;
    }
    .toolbar-btn:hover, .toolbar-btn:active { background: var(--accent-color); color: white; border-color: var(--accent-color); transform: translateY(-1px); }
    .toolbar-btn.active { background: var(--accent-color); color: white; border-color: var(--accent-color); }
    .toolbar-btn.pdf-btn { background: var(--bg-tip); color: white; border: none; }
    .toolbar-btn.pdf-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .article-container { display: flex; flex-direction: column; gap: 20px; }
    .metadata {
      background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg);
      box-shadow: var(--shadow); border: 1px solid var(--border-color);
    }
    .metadata h1 { font-size: 20px; color: var(--text-primary); margin-bottom: 14px; line-height: 1.4; font-weight: 600; cursor: pointer; }
    .meta-info { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-bottom: 8px; }
    .meta-item { font-size: 13px; color: var(--text-secondary); }
    .meta-item strong { color: var(--text-primary); font-weight: 500; }
    .meta-link { font-size: 13px; color: var(--text-secondary); margin: 0; word-break: break-all; }
    .meta-link strong { color: var(--text-primary); font-weight: 500; }
    .metadata a { color: var(--accent-color); text-decoration: none; }
    .metadata a:hover { text-decoration: underline; }
    .content {
      background: var(--bg-card); padding: 24px 20px; border-radius: var(--radius-lg);
      box-shadow: var(--shadow); border: 1px solid var(--border-color);
      overflow-wrap: break-word; word-wrap: break-word;
    }
    .content h1, .content h2, .content h3, .content h4, .content h5, .content h6 { margin: 20px 0 10px 0; color: var(--text-primary); font-weight: 600; line-height: 1.3; }
    .content h1 { font-size: 24px; }
    .content h2 { font-size: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; }
    .content h3 { font-size: 18px; }
    .content h4 { font-size: 16px; }
    .content p { margin: 12px 0; color: var(--text-primary); }
    .content img { max-width: 100%; height: auto; border-radius: var(--radius); margin: 12px 0; display: block; cursor: zoom-in; transition: transform 0.2s, box-shadow 0.2s; }
    .content img:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    .lightbox-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; cursor: zoom-out; }
    .lightbox-overlay.active { display: flex; align-items: center; justify-content: center; }
    .lightbox-overlay img { max-width: 95%; max-height: 95%; object-fit: contain; border-radius: var(--radius); box-shadow: 0 10px 50px rgba(0,0,0,0.5); cursor: default; }
    .lightbox-close { position: fixed; top: 20px; right: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.2); border: none; border-radius: 50%; color: white; font-size: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .lightbox-close:hover { background: rgba(255,255,255,0.3); }
    .lightbox-caption { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); color: white; font-size: 14px; padding: 8px 16px; background: rgba(0,0,0,0.6); border-radius: var(--radius); max-width: 80%; text-align: center; }
    .content video { width: 100%; max-width: 800px; border-radius: var(--radius); margin: 16px 0; }
    .content audio { width: 100%; max-width: 500px; margin: 12px 0; border-radius: var(--radius); }
    .content pre { position: relative; background: var(--bg-code); color: var(--text-code); padding: 14px; padding-top: 38px; border-radius: var(--radius); overflow-x: auto; margin: 14px 0; font-family: "SF Mono","Fira Code",Consolas,monospace; font-size: 13px; line-height: 1.5; }
    .copy-btn { position: absolute; top: 6px; right: 6px; padding: 4px 10px; font-size: 12px; background: var(--bg-details); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: var(--radius); cursor: pointer; opacity: 0.7; transition: all 0.2s; z-index: 10; }
    .copy-btn:hover { opacity: 1; background: var(--accent-color); color: white; border-color: var(--accent-color); }
    .copy-btn.copied { background: #22c55e; color: white; border-color: #22c55e; opacity: 1; }
    .copy-link-btn { display: inline-flex; align-items: center; padding: 2px 8px; margin-left: 8px; font-size: 12px; background: var(--bg-details); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; vertical-align: middle; }
    .copy-link-btn:hover { background: var(--accent-color); color: white; border-color: var(--accent-color); }
    .copy-link-btn.copied { background: #22c55e; color: white; border-color: #22c55e; }
    .toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px); padding: 10px 20px; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-size: 14px; opacity: 0; transition: all 0.3s; z-index: 10000; pointer-events: none; }
    .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    .content code { background: var(--bg-details); padding: 2px 6px; border-radius: 3px; font-family: "SF Mono","Fira Code",Consolas,monospace; font-size: 0.88em; color: var(--accent-color); }
    .content pre code { background: none; padding: 0; color: inherit; font-size: inherit; }
    .content blockquote { border-left: 4px solid var(--quote-border); padding: 12px 16px; margin: 14px 0; background: var(--bg-quote); border-radius: 0 var(--radius) var(--radius) 0; color: var(--text-secondary); }
    .content ul, .content ol { margin: 12px 0; padding-left: 20px; }
    .content li { margin: 6px 0; color: var(--text-primary); }
    .content a { color: var(--accent-color); text-decoration: none; }
    .content a:hover { text-decoration: underline; }
    .content hr { border: none; border-top: 1px solid var(--border-color); margin: 20px 0; }
    .content .table-wrapper { position: relative; margin: 16px 0; border: 1px solid var(--border-color); border-radius: var(--radius); overflow: hidden; }
    .content .table-toolbar { display: flex; gap: 6px; padding: 8px 12px; background: var(--bg-details); border-bottom: 1px solid var(--border-color); }
    .content .table-btn { padding: 4px 10px; font-size: 12px; background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: var(--radius); cursor: pointer; transition: all 0.2s; }
    .content .table-btn:hover { background: var(--bg-details-hover); color: var(--text-primary); }
    .content .table-btn.copied { background: var(--accent-color); color: white; border-color: var(--accent-color); }
    .content .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .content table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .content th, .content td { border: 1px solid var(--border-color); padding: 10px 12px; text-align: left; }
    .content th { background: var(--bg-table-header); font-weight: 600; color: var(--text-primary); }
    .content tr:nth-child(even) td { background: var(--bg-details); }
    .content tr:hover td { background: var(--bg-details-hover); }
    .table-fullscreen { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; margin: 0 !important; border-radius: 0 !important; z-index: 9999 !important; background: var(--bg-card) !important; }
    .table-fullscreen .table-scroll { max-height: calc(100vh - 60px); }
    .content .table-scroll-hint { display: none; font-size: 12px; color: var(--text-muted); text-align: center; padding: 6px; background: var(--bg-details); border-top: 1px solid var(--border-color); }
    .content details { margin: 14px 0; border: 1px solid var(--border-color); border-radius: var(--radius); overflow: hidden; }
    .content summary { cursor: pointer; padding: 12px 14px; background: var(--bg-details); font-weight: 500; user-select: none; color: var(--text-primary); transition: background 0.2s; }
    .content summary:hover { background: var(--bg-details-hover); }
    .content details[open] summary { border-bottom: 1px solid var(--border-color); }
    .content details > div { padding: 14px; }
    .footer { text-align: center; margin-top: 24px; padding: 16px; font-size: 12px; color: var(--text-muted); }
    .footer a { color: var(--accent-color); text-decoration: underline; }
    @media (min-width: 768px) { body { padding: 30px; padding-top: 80px; } .toolbar-btn { padding: 8px 16px; font-size: 14px; } .metadata { padding: 24px; } .metadata h1 { font-size: 24px; } .content { padding: 32px; } }
    @media (min-width: 1024px) { body { max-width: 900px; padding: 40px; padding-top: 90px; } .content { padding: 40px; } }
    @media (max-width: 768px) { .content .table-scroll-hint { display: block; } }
    @media (max-width: 375px) { body { padding: 12px; padding-top: 65px; } .toolbar-btn { padding: 5px 8px; font-size: 11px; } .metadata h1 { font-size: 17px; } .content { padding: 16px 14px; } }
    @media print { .toolbar { display: none !important; } body { padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .metadata, .content { box-shadow: none; border: 1px solid #ddd; } .content pre { white-space: pre-wrap; } .content img { max-width: 100% !important; } }
  </style>
</head>
<body>
  <div class="toolbar" id="toolbar">
    <div class="toolbar-inner">
      <button class="toolbar-btn active" data-theme="linuxdo" title="L站原风格">L站</button>
      <button class="toolbar-btn" data-theme="dark-geek" title="暗夜极客">极客</button>
      <button class="toolbar-btn" data-theme="business" title="商务精英">商务</button>
      <button class="toolbar-btn" data-theme="sakura" title="樱花粉">樱花</button>
      <button class="toolbar-btn" data-theme="lavender" title="薰衣草">薰衣草</button>
      <button class="toolbar-btn pdf-btn" id="pdf-btn" title="导出PDF">PDF</button>
    </div>
  </div>
  <article class="article-container">
    <header class="metadata">
      <h1 title="点击复制标题">${safeTitle}</h1>
      <div class="meta-info">
        <span class="meta-item"><strong>作者：</strong>${esc(metadata.author)}</span>
        <span class="meta-item"><strong>分类：</strong>${esc(metadata.category || '未分类')}</span>
        <span class="meta-item"><strong>标签：</strong>${tagsHtml}</span>
        <span class="meta-item"><strong>导出时间：</strong>${exportTime}</span>
      </div>
      <p class="meta-link"><strong>原文链接：</strong><a href="${esc(metadata.url)}" target="_blank" rel="noopener">${esc(metadata.url)}</a></p>
    </header>
    <main class="content">
      ${htmlContent}
    </main>
  </article>
  <footer class="footer">
    <p>由 <a href="https://github.com/acheng-byte/discourse-saver" target="_blank" rel="noopener">Discourse Saver</a> 导出</p>
  </footer>
  <script>
    // 主题切换
    const themeButtons = document.querySelectorAll('.toolbar-btn[data-theme]');
    const htmlEl = document.documentElement;
    const savedTheme = localStorage.getItem('discourse-saver-theme') || 'linuxdo';
    htmlEl.setAttribute('data-theme', savedTheme);
    (function updateActive(t) { themeButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-theme') === t)); })(savedTheme);
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-theme');
        htmlEl.setAttribute('data-theme', t);
        localStorage.setItem('discourse-saver-theme', t);
        themeButtons.forEach(b => b.classList.toggle('active', b.getAttribute('data-theme') === t));
      });
    });
    // PDF 导出
    const pdfBtn = document.getElementById('pdf-btn');
    if (pdfBtn) pdfBtn.addEventListener('click', () => window.print());
    // 滚动隐藏/显示工具栏
    let lastScrollY = 0;
    const toolbar = document.querySelector('.toolbar');
    window.addEventListener('scroll', () => {
      const cy = window.scrollY;
      toolbar.style.transform = (cy > lastScrollY && cy > 100) ? 'translateY(-100%)' : 'translateY(0)';
      lastScrollY = cy;
    }, { passive: true });
    // Toast
    const toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
    function showToast(msg) { toast.textContent = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2000); }
    // 代码块复制
    document.querySelectorAll('.content pre').forEach(pre => {
      const btn = document.createElement('button');
      btn.className = 'copy-btn'; btn.textContent = '复制'; btn.title = '复制代码';
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;
        try { await navigator.clipboard.writeText(text); } catch (e) {
          const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        btn.textContent = '已复制'; btn.classList.add('copied'); showToast('代码已复制');
        setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('copied'); }, 2000);
      });
      pre.appendChild(btn);
    });
    // 原文链接复制
    const metaLink = document.querySelector('.meta-link a');
    if (metaLink) {
      const clBtn = document.createElement('button');
      clBtn.className = 'copy-link-btn'; clBtn.textContent = '复制链接'; clBtn.title = '复制原文链接';
      clBtn.addEventListener('click', async e => {
        e.preventDefault();
        try { await navigator.clipboard.writeText(metaLink.href); } catch (err) {
          const ta = document.createElement('textarea'); ta.value = metaLink.href; ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        clBtn.textContent = '已复制'; clBtn.classList.add('copied'); showToast('链接已复制');
        setTimeout(() => { clBtn.textContent = '复制链接'; clBtn.classList.remove('copied'); }, 2000);
      });
      metaLink.parentNode.appendChild(clBtn);
    }
    // 标题点击复制
    const titleEl = document.querySelector('.metadata h1');
    if (titleEl) {
      titleEl.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(titleEl.textContent); } catch (e) {
          const ta = document.createElement('textarea'); ta.value = titleEl.textContent; ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        showToast('标题已复制');
      });
    }
    // Lightbox 图片放大
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-overlay';
    lightbox.innerHTML = '<button class="lightbox-close">&times;<\\/button><img src="" alt=""><div class="lightbox-caption"></div>';
    document.body.appendChild(lightbox);
    const lbImg = lightbox.querySelector('img');
    const lbCap = lightbox.querySelector('.lightbox-caption');
    function closeLb() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
    lightbox.addEventListener('click', e => { if (e.target === lightbox || e.target.classList.contains('lightbox-close')) closeLb(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLb(); });
    document.querySelectorAll('.content img').forEach(img => {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        const w = img.naturalWidth || img.width;
        if (w < 50 || img.classList.contains('emoji')) return;
        lbImg.src = img.src; lbCap.textContent = img.alt || img.title || '';
        lbCap.style.display = lbCap.textContent ? 'block' : 'none';
        lightbox.classList.add('active'); document.body.style.overflow = 'hidden';
      });
      img.addEventListener('error', () => { img.classList.add('error'); img.style.cursor = 'default'; });
    });
    // 表格增强
    document.querySelectorAll('.content table').forEach(table => {
      if (table.parentElement.classList.contains('table-scroll')) return;
      const wrapper = document.createElement('div'); wrapper.className = 'table-wrapper';
      const tb = document.createElement('div'); tb.className = 'table-toolbar';
      const copyBtn = document.createElement('button'); copyBtn.className = 'table-btn'; copyBtn.textContent = '复制表格';
      copyBtn.addEventListener('click', async () => {
        const text = Array.from(table.querySelectorAll('tr')).map(r => Array.from(r.querySelectorAll('th,td')).map(c => c.textContent.trim()).join('\\t')).join('\\n');
        try { await navigator.clipboard.writeText(text); } catch (e) {
          const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
          document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
        }
        copyBtn.textContent = '已复制'; copyBtn.classList.add('copied'); showToast('表格已复制');
        setTimeout(() => { copyBtn.textContent = '复制表格'; copyBtn.classList.remove('copied'); }, 2000);
      });
      const fsBtn = document.createElement('button'); fsBtn.className = 'table-btn'; fsBtn.textContent = '全屏';
      fsBtn.addEventListener('click', () => {
        if (wrapper.classList.contains('table-fullscreen')) { wrapper.classList.remove('table-fullscreen'); fsBtn.textContent = '全屏'; document.body.style.overflow = ''; }
        else { wrapper.classList.add('table-fullscreen'); fsBtn.textContent = '退出全屏'; document.body.style.overflow = 'hidden'; }
      });
      tb.appendChild(copyBtn); tb.appendChild(fsBtn);
      const sc = document.createElement('div'); sc.className = 'table-scroll';
      const hint = document.createElement('div'); hint.className = 'table-scroll-hint'; hint.textContent = '左右滑动查看完整表格';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(tb); wrapper.appendChild(sc); sc.appendChild(table); wrapper.appendChild(hint);
    });
  </script>
</body>
</html>`;
    }

    // 获取 Notion 数据库属性
    async function getDatabaseProperties(token, databaseId) {
      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url: `https://api.notion.com/v1/databases/${databaseId}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': NOTION_API_VERSION
          },
          onload: function(response) {
            if (response.status >= 200 && response.status < 300) {
              const data = JSON.parse(response.responseText);
              resolve(data.properties || {});
            } else {
              const error = JSON.parse(response.responseText);
              reject(new Error(error.message || '获取数据库属性失败'));
            }
          },
          onerror: function() {
            reject(new Error('网络请求失败'));
          }
        });
      });
    }

    // 查找匹配的属性名（支持模糊匹配）
    function findMatchingProperty(dbProps, targetName, expectedType = null) {
      if (!targetName) return null;

      const normalizedTarget = targetName.toLowerCase().trim();

      for (const [propName, propInfo] of Object.entries(dbProps)) {
        const normalizedProp = propName.toLowerCase().trim();

        // 精确匹配或模糊匹配
        if (normalizedProp === normalizedTarget ||
            propName === targetName ||
            normalizedProp.includes(normalizedTarget) ||
            normalizedTarget.includes(normalizedProp)) {

          // 如果指定了类型，检查类型是否匹配
          if (expectedType && propInfo.type !== expectedType) {
            console.warn(`[Discourse Saver] 属性 "${propName}" 类型不匹配: 期望 ${expectedType}, 实际 ${propInfo.type}`);
            continue;
          }

          return { name: propName, type: propInfo.type };
        }
      }

      return null;
    }

    // 根据 URL 查找已存在的 Notion 页面（去重）
    async function findExistingPageByUrl(token, databaseId, url, urlPropName) {
      return new Promise((resolve, reject) => {
        const filter = {
          property: urlPropName,
          url: { equals: url }
        };

        GM_xmlhttpRequest({
          method: 'POST',
          url: `https://api.notion.com/v1/databases/${databaseId}/query`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': NOTION_API_VERSION,
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({ filter, page_size: 1 }),
          onload: function(response) {
            if (response.status >= 200 && response.status < 300) {
              const data = JSON.parse(response.responseText);
              if (data.results && data.results.length > 0) {
                console.log(`[Discourse Saver] 找到已存在的页面: ${data.results[0].id}`);
                resolve(data.results[0]);
              } else {
                resolve(null);
              }
            } else {
              console.warn('[Discourse Saver] 查询已存在页面失败:', response.responseText);
              resolve(null); // 查询失败时继续创建新页面
            }
          },
          onerror: function() {
            resolve(null); // 网络错误时继续创建新页面
          }
        });
      });
    }

    // 归档（删除）已存在的 Notion 页面
    async function archiveNotionPage(token, pageId) {
      return new Promise((resolve) => {
        GM_xmlhttpRequest({
          method: 'PATCH',
          url: `https://api.notion.com/v1/pages/${pageId}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': NOTION_API_VERSION,
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({ archived: true }),
          onload: function(response) {
            if (response.status >= 200 && response.status < 300) {
              console.log('[Discourse Saver] 已归档旧页面:', pageId);
              resolve(true);
            } else {
              console.warn('[Discourse Saver] 归档页面失败:', response.responseText);
              resolve(false);
            }
          },
          onerror: function() {
            resolve(false);
          }
        });
      });
    }

    // 保存到 Notion（使用 GM_xmlhttpRequest 解决 CORS）
    async function saveToNotion(markdown, metadata, config) {
      const token = config.notionToken;
      const databaseId = config.notionDatabaseId.replace(/-/g, '');

      if (!token || !databaseId) {
        throw new Error('请先配置 Notion Token 和 Database ID');
      }

      // 先获取数据库属性
      console.log('[Discourse Saver] 正在获取数据库属性...');
      let dbProps;
      try {
        dbProps = await getDatabaseProperties(token, databaseId);
        console.log('[Discourse Saver] 数据库属性:', Object.keys(dbProps));
      } catch (e) {
        throw new Error('获取数据库属性失败: ' + e.message);
      }

      // 构建 Notion 页面属性（只使用数据库中存在的属性）
      const properties = {};

      // 标题（必需）- 查找 title 类型的属性
      const titleProp = findMatchingProperty(dbProps, config.notionPropTitle || '标题', 'title') ||
                        findMatchingProperty(dbProps, 'Name', 'title') ||
                        findMatchingProperty(dbProps, '名称', 'title');

      if (!titleProp) {
        // 如果没找到，使用数据库中第一个 title 类型的属性
        for (const [propName, propInfo] of Object.entries(dbProps)) {
          if (propInfo.type === 'title') {
            console.log(`[Discourse Saver] 使用 "${propName}" 作为标题属性`);
            properties[propName] = {
              title: [{ text: { content: metadata.title.substring(0, 2000) } }]
            };
            break;
          }
        }
        if (Object.keys(properties).length === 0) {
          throw new Error('数据库中没有找到标题属性（title 类型）');
        }
      } else {
        console.log(`[Discourse Saver] 标题属性: "${titleProp.name}"`);
        properties[titleProp.name] = {
          title: [{ text: { content: metadata.title.substring(0, 2000) } }]
        };
      }

      // URL - 查找 url 类型的属性
      const urlProp = findMatchingProperty(dbProps, config.notionPropUrl || '链接', 'url');
      if (urlProp) {
        console.log(`[Discourse Saver] URL属性: "${urlProp.name}"`);
        properties[urlProp.name] = { url: metadata.url };
      }

      // 作者 - 查找 rich_text 类型的属性
      const authorProp = findMatchingProperty(dbProps, config.notionPropAuthor || '作者', 'rich_text');
      if (authorProp) {
        console.log(`[Discourse Saver] 作者属性: "${authorProp.name}"`);
        properties[authorProp.name] = {
          rich_text: [{ text: { content: metadata.author || '未知' } }]
        };
      }

      // 分类 - 支持多种类型（select、multi_select、rich_text）
      console.log(`[Discourse Saver] metadata.category = "${metadata.category || '(空)'}"`);
      // 先尝试 select 类型
      let categoryProp = findMatchingProperty(dbProps, config.notionPropCategory || '分类', 'select');
      // 再尝试 multi_select 类型
      if (!categoryProp) {
        categoryProp = findMatchingProperty(dbProps, config.notionPropCategory || '分类', 'multi_select');
      }
      // 再尝试 rich_text 类型
      if (!categoryProp) {
        categoryProp = findMatchingProperty(dbProps, config.notionPropCategory || '分类', 'rich_text');
      }
      // 最后不限类型查找
      if (!categoryProp) {
        categoryProp = findMatchingProperty(dbProps, config.notionPropCategory || '分类', null);
      }

      if (categoryProp && metadata.category && metadata.category.trim()) {
        console.log(`[Discourse Saver] 分类属性: "${categoryProp.name}" (类型: ${categoryProp.type})`);
        const categoryValue = metadata.category.trim();

        // 根据属性类型设置值
        switch (categoryProp.type) {
          case 'select':
            properties[categoryProp.name] = {
              select: { name: categoryValue }
            };
            break;
          case 'multi_select':
            properties[categoryProp.name] = {
              multi_select: [{ name: categoryValue }]
            };
            break;
          case 'rich_text':
            properties[categoryProp.name] = {
              rich_text: [{ text: { content: categoryValue } }]
            };
            break;
          default:
            // 尝试作为 rich_text 处理
            properties[categoryProp.name] = {
              rich_text: [{ text: { content: categoryValue } }]
            };
        }
        console.log(`[Discourse Saver] 分类值已设置: "${categoryValue}" (类型: ${categoryProp.type})`);
      } else if (!categoryProp) {
        console.log('[Discourse Saver] 未找到分类属性');
        // 尝试查找任何包含"分类"的属性
        for (const [propName, propInfo] of Object.entries(dbProps)) {
          if (propName.includes('分类') || propName.toLowerCase().includes('category')) {
            console.log(`[Discourse Saver] 发现可能的分类属性: "${propName}" (类型: ${propInfo.type})`);
          }
        }
      } else {
        console.log('[Discourse Saver] 分类为空，跳过设置');
      }

      // 标签 - 查找 multi_select 类型的属性
      if (metadata.tags && metadata.tags.length > 0) {
        const tagsProp = findMatchingProperty(dbProps, config.notionPropTags || '标签', 'multi_select');
        if (tagsProp) {
          console.log(`[Discourse Saver] 标签属性: "${tagsProp.name}"`);
          properties[tagsProp.name] = {
            multi_select: metadata.tags.slice(0, 10).map(tag => ({ name: tag.substring(0, 100) }))
          };
        }
      }

      // 保存日期 - 查找 date 类型的属性
      const dateProp = findMatchingProperty(dbProps, config.notionPropSavedDate || '保存日期', 'date');
      if (dateProp) {
        console.log(`[Discourse Saver] 日期属性: "${dateProp.name}"`);
        properties[dateProp.name] = {
          date: { start: new Date().toISOString().split('T')[0] }
        };
      }

      // 评论数 - 查找 number 类型的属性
      const commentCountProp = findMatchingProperty(dbProps, config.notionPropCommentCount || '评论数', 'number');
      if (commentCountProp) {
        console.log(`[Discourse Saver] 评论数属性: "${commentCountProp.name}"`);
        properties[commentCountProp.name] = {
          number: metadata.commentCount || 0
        };
      }

      console.log('[Discourse Saver] 最终属性:', Object.keys(properties));

      // 将 Markdown 转换为 Notion blocks
      const children = markdownToNotionBlocks(markdown);

      // 去重检查：根据 URL 查找已存在的页面
      let existingPage = null;
      if (urlProp) {
        console.log('[Discourse Saver] 检查是否已存在相同 URL 的页面...');
        existingPage = await findExistingPageByUrl(token, databaseId, metadata.url, urlProp.name);
      }

      if (existingPage) {
        // 归档已存在的页面，然后创建新页面
        console.log('[Discourse Saver] 找到已存在的页面，正在归档后重新创建...');
        await archiveNotionPage(token, existingPage.id);
      }

      // 创建新页面（先添加前100个块）
      console.log(`[Discourse Saver] 总块数: ${children.length}`);

      const pageData = await new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'POST',
          url: 'https://api.notion.com/v1/pages',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': NOTION_API_VERSION,
            'Content-Type': 'application/json'
          },
          data: JSON.stringify({
            parent: { database_id: databaseId },
            properties: properties,
            children: children.slice(0, 100)
          }),
          onload: function(response) {
            try {
              if (response.status >= 200 && response.status < 300) {
                const data = JSON.parse(response.responseText);
                console.log('[Discourse Saver] Notion 页面创建成功:', data.id);
                resolve(data);
              } else {
                let errorMessage = `HTTP ${response.status}`;
                try {
                  const error = JSON.parse(response.responseText);
                  console.error('[Discourse Saver] Notion 错误:', error);
                  errorMessage = error.message || errorMessage;
                  // 打印失败的块信息便于调试
                  if (error.code === 'validation_error') {
                    console.error('[Discourse Saver] 验证错误，前3个块:', JSON.stringify(children.slice(0, 3), null, 2));
                  }
                } catch (parseErr) {
                  console.error('[Discourse Saver] Notion 响应:', response.responseText);
                }
                console.error('[Discourse Saver] 请求数据:', { properties, childrenCount: children.length });
                reject(new Error(errorMessage));
              }
            } catch (e) {
              console.error('[Discourse Saver] 处理Notion响应失败:', e);
              reject(new Error('处理Notion响应失败: ' + e.message));
            }
          },
          onerror: function(error) {
            console.error('[Discourse Saver] Notion 网络错误:', error);
            reject(new Error('网络请求失败'));
          }
        });
      });

      // 如果有超过100个块，分批追加剩余的块
      if (children.length > 100) {
        const pageId = pageData.id;
        const remainingChildren = children.slice(100);
        const totalBatches = Math.ceil(remainingChildren.length / 100);
        console.log(`[Discourse Saver] 需要追加 ${remainingChildren.length} 个块，分 ${totalBatches} 批`);

        let successBatches = 0;
        let failedBatches = 0;

        // 每批最多100个块
        for (let i = 0; i < remainingChildren.length; i += 100) {
          const batchNum = Math.floor(i/100) + 1;
          const batch = remainingChildren.slice(i, i + 100);
          console.log(`[Discourse Saver] 追加第 ${batchNum}/${totalBatches} 批，${batch.length} 个块`);

          // 重试机制
          let retries = 3;
          let success = false;

          while (retries > 0 && !success) {
            try {
              await new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                  method: 'PATCH',
                  url: `https://api.notion.com/v1/blocks/${pageId}/children`,
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Notion-Version': NOTION_API_VERSION,
                    'Content-Type': 'application/json'
                  },
                  data: JSON.stringify({ children: batch }),
                  onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                      success = true;
                      resolve();
                    } else if (response.status === 429) {
                      // API 限流，等待后重试
                      console.warn(`[Discourse Saver] 批次 ${batchNum} API 限流，等待重试...`);
                      reject(new Error('rate_limited'));
                    } else {
                      console.warn(`[Discourse Saver] 批次 ${batchNum} 失败 (${response.status}):`, response.responseText.substring(0, 500));
                      reject(new Error(`HTTP ${response.status}`));
                    }
                  },
                  onerror: function(error) {
                    console.warn(`[Discourse Saver] 批次 ${batchNum} 网络错误`);
                    reject(new Error('network_error'));
                  }
                });
              });
            } catch (batchError) {
              retries--;
              if (retries > 0) {
                // 等待后重试（限流情况等待更长时间）
                const waitTime = batchError.message === 'rate_limited' ? 2000 : 500;
                console.log(`[Discourse Saver] 批次 ${batchNum} 重试中... (剩余 ${retries} 次)`);
                await new Promise(r => setTimeout(r, waitTime));
              }
            }
          }

          if (success) {
            successBatches++;
          } else {
            failedBatches++;
            console.error(`[Discourse Saver] 批次 ${batchNum} 最终失败，跳过`);
          }

          // 避免 API 限流，稍微延迟
          if (i + 100 < remainingChildren.length) {
            await new Promise(r => setTimeout(r, 400));
          }
        }

        console.log(`[Discourse Saver] 块追加完成: 成功 ${successBatches}/${totalBatches} 批`);
        if (failedBatches > 0) {
          console.warn(`[Discourse Saver] ${failedBatches} 批追加失败，部分内容可能丢失`);
        }
      }

      return pageData;
    }

    // Markdown 转 Notion Blocks（v4.6.0 增强版 - 支持更多内容类型）
    function markdownToNotionBlocks(markdown) {
      const blocks = [];
      const lines = markdown.split('\n');
      let i = 0;

      // 辅助函数：检测URL类型
      function getUrlType(url) {
        // 视频链接（YouTube、Bilibili、Vimeo、优酷、腾讯视频）
        if (/youtube\.com|youtu\.be|vimeo\.com|bilibili\.com|b23\.tv|v\.youku\.com|v\.qq\.com/i.test(url)) {
          return 'video';
        }
        // 网盘链接
        if (/pan\.baidu\.com|yun\.baidu\.com|pan\.quark\.cn|123pan\.com|lanzou[a-z]*\.(com|cn)|lanzoui\.com|lanzoux\.com|aliyundrive\.com|alipan\.com|cloud\.189\.cn/i.test(url)) {
          return 'cloud';
        }
        // 音频链接
        if (/\.mp3|\.wav|\.ogg|\.m4a|\.aac|soundcloud\.com|spotify\.com|music\./i.test(url)) {
          return 'audio';
        }
        // 图片链接
        if (/\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?|$)/i.test(url)) {
          return 'image';
        }
        // PDF 链接
        if (/\.pdf(\?|$)/i.test(url)) {
          return 'pdf';
        }
        return 'link';
      }

      // 辅助函数：获取网盘名称
      function getCloudName(url) {
        if (/pan\.baidu\.com|yun\.baidu\.com/i.test(url)) return '百度网盘';
        if (/pan\.quark\.cn/i.test(url)) return '夸克网盘';
        if (/123pan\.com/i.test(url)) return '123云盘';
        if (/lanzou[a-z]*\.(com|cn)|lanzoui\.com|lanzoux\.com/i.test(url)) return '蓝奏云';
        if (/aliyundrive\.com|alipan\.com/i.test(url)) return '阿里云盘';
        if (/cloud\.189\.cn/i.test(url)) return '天翼云盘';
        return '网盘';
      }

      // 辅助函数：验证并补全 URL
      function normalizeUrl(url) {
        if (!url) return null;
        let normalized = url.trim();
        // 如果是相对路径，补全为完整 URL
        if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
          if (normalized.startsWith('/')) {
            normalized = window.location.origin + normalized;
          } else if (normalized.startsWith('#')) {
            normalized = window.location.href.split('#')[0] + normalized;
          } else if (!normalized.includes(':')) {
            // 不是特殊协议（如 mailto:, tel:），添加 https://
            normalized = 'https://' + normalized;
          }
        }
        // 验证 URL 是否有效
        try {
          new URL(normalized);
          return normalized;
        } catch {
          return null;
        }
      }

      // 辅助函数：解析富文本（支持加粗、斜体、链接、代码）- 增强错误处理
      function parseRichText(text) {
        // 确保输入有效
        if (!text || typeof text !== 'string') {
          return [{ text: { content: ' ' } }];
        }

        const safeText = text.substring(0, 2000); // Notion 限制
        const richText = [];

        try {
          // 检测链接 [text](url)
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
          let lastIndex = 0;
          let match;

          while ((match = linkRegex.exec(safeText)) !== null) {
            // 添加链接前的文本
            if (match.index > lastIndex) {
              const before = safeText.substring(lastIndex, match.index);
              if (before && before.trim()) {
                const formatted = parseInlineFormatting(before);
                if (formatted && formatted.length > 0) {
                  richText.push(...formatted);
                }
              }
            }

            // 处理链接
            const linkText = match[1] || '链接';
            const linkUrl = normalizeUrl(match[2]);

            if (linkUrl) {
              richText.push({
                text: { content: linkText.substring(0, 2000), link: { url: linkUrl } }
              });
            } else {
              // URL 无效，只显示文本
              richText.push({
                text: { content: linkText.substring(0, 2000) }
              });
            }
            lastIndex = match.index + match[0].length;
          }

          // 添加剩余文本
          if (lastIndex < safeText.length) {
            const remaining = safeText.substring(lastIndex);
            if (remaining && remaining.trim()) {
              const formatted = parseInlineFormatting(remaining);
              if (formatted && formatted.length > 0) {
                richText.push(...formatted);
              }
            }
          }
        } catch (e) {
          console.warn('[Discourse Saver] parseRichText 错误:', e.message);
          return [{ text: { content: safeText || ' ' } }];
        }

        // 确保不返回空数组
        if (richText.length === 0) {
          return [{ text: { content: safeText || ' ' } }];
        }

        return richText;
      }

      // 辅助函数：解析内联格式（加粗、斜体、代码）- 修复顺序问题
      function parseInlineFormatting(text) {
        if (!text || text.trim() === '') {
          return [{ text: { content: ' ' } }]; // Notion 不允许空 rich_text
        }

        const parts = [];
        // 使用正则分割并保持顺序
        const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
          // 添加匹配前的普通文本
          if (match.index > lastIndex) {
            const before = text.substring(lastIndex, match.index);
            if (before) {
              parts.push({ text: { content: before.substring(0, 2000) } });
            }
          }

          const matched = match[1];
          // 加粗 **text**
          if (matched.startsWith('**') && matched.endsWith('**')) {
            const content = matched.slice(2, -2);
            if (content) {
              parts.push({ text: { content: content.substring(0, 2000) }, annotations: { bold: true } });
            }
          }
          // 行内代码 `text`
          else if (matched.startsWith('`') && matched.endsWith('`')) {
            const content = matched.slice(1, -1);
            if (content) {
              parts.push({ text: { content: content.substring(0, 2000) }, annotations: { code: true } });
            }
          }
          // 斜体 *text*
          else if (matched.startsWith('*') && matched.endsWith('*')) {
            const content = matched.slice(1, -1);
            if (content) {
              parts.push({ text: { content: content.substring(0, 2000) }, annotations: { italic: true } });
            }
          }

          lastIndex = match.index + match[0].length;
        }

        // 添加剩余文本
        if (lastIndex < text.length) {
          const remaining = text.substring(lastIndex);
          if (remaining) {
            parts.push({ text: { content: remaining.substring(0, 2000) } });
          }
        }

        // 确保不返回空数组
        return parts.length > 0 ? parts : [{ text: { content: text.substring(0, 2000) || ' ' } }];
      }

      while (i < lines.length) {
        const line = lines[i];

        // 跳过 YAML frontmatter
        if (line === '---' && i === 0) {
          i++;
          while (i < lines.length && lines[i] !== '---') i++;
          i++;
          continue;
        }

        // 标题
        if (line.startsWith('# ')) {
          blocks.push({
            type: 'heading_1',
            heading_1: { rich_text: parseRichText(line.substring(2)) }
          });
        } else if (line.startsWith('## ')) {
          blocks.push({
            type: 'heading_2',
            heading_2: { rich_text: parseRichText(line.substring(3)) }
          });
        } else if (line.startsWith('### ')) {
          blocks.push({
            type: 'heading_3',
            heading_3: { rich_text: parseRichText(line.substring(4)) }
          });
        }
        // 代码块
        else if (line.startsWith('```')) {
          // Notion 支持的语言映射
          const notionLanguageMap = {
            'plaintext': 'plain text',
            'text': 'plain text',
            'txt': 'plain text',
            'sh': 'bash',
            'shell': 'bash',
            'zsh': 'bash',
            'ps1': 'powershell',
            'ps': 'powershell',
            'yml': 'yaml',
            'js': 'javascript',
            'ts': 'typescript',
            'py': 'python',
            'rb': 'ruby',
            'cs': 'c#',
            'cpp': 'c++',
            'objc': 'objective-c',
            'kt': 'kotlin',
            'rs': 'rust',
            'md': 'markdown',
            'htm': 'html',
            'dockerfile': 'docker',
            'make': 'makefile',
            'asm': 'assembly',
            '': 'plain text'
          };
          const rawLang = line.substring(3).trim().toLowerCase();
          const lang = notionLanguageMap[rawLang] || rawLang || 'plain text';
          let code = '';
          i++;
          while (i < lines.length && !lines[i].startsWith('```')) {
            code += lines[i] + '\n';
            i++;
          }
          blocks.push({
            type: 'code',
            code: {
              language: lang,
              rich_text: [{ text: { content: code.trimEnd().substring(0, 2000) } }]
            }
          });
        }
        // Obsidian callout / 折叠块
        else if (line.startsWith('> [!')) {
          const calloutMatch = line.match(/^> \[!([^\]]+)\]([+-])?\s*(.*)$/);
          if (calloutMatch) {
            const calloutType = calloutMatch[1];
            const isCollapsed = calloutMatch[2] === '-';
            const title = calloutMatch[3] || calloutType;

            // 收集 callout 内容
            let content = '';
            i++;
            while (i < lines.length && lines[i].startsWith('> ')) {
              content += lines[i].substring(2) + '\n';
              i++;
            }
            i--; // 回退一行

            // 使用 callout 块
            blocks.push({
              type: 'callout',
              callout: {
                rich_text: [{ text: { content: title + '\n' + content.trim() } }],
                icon: { type: 'emoji', emoji: calloutType === 'note' ? '📝' : calloutType === 'warning' ? '⚠️' : '💡' }
              }
            });
          }
        }
        // HTML <details> 块（折叠评论）- 转换为 Notion toggle 块
        else if (line.startsWith('<details>') || line.match(/^<details\s/)) {
          try {
            // 提取 summary 标题
            let summaryTitle = '展开';
            let detailsContent = '';
            const startIndex = i;
            i++;

            // 查找 summary 行
            while (i < lines.length) {
              const currentLine = lines[i];
              if (currentLine.includes('<summary>')) {
                // 提取 summary 内容
                const summaryMatch = currentLine.match(/<summary>(.+?)<\/summary>/);
                if (summaryMatch) {
                  // 移除 HTML 标签
                  summaryTitle = summaryMatch[1].replace(/<[^>]+>/g, '').trim() || '展开';
                }
                i++;
                continue;
              }
              if (currentLine.includes('</details>')) {
                break;
              }
              if (currentLine.trim()) {
                detailsContent += currentLine + '\n';
              }
              i++;
            }

            // 创建 toggle 块
            const safeTitle = (summaryTitle || '展开').substring(0, 2000);
            const safeContent = (detailsContent.trim() || ' ').substring(0, 2000);

            blocks.push({
              type: 'toggle',
              toggle: {
                rich_text: [{ text: { content: safeTitle } }],
                children: [{
                  type: 'paragraph',
                  paragraph: {
                    rich_text: parseRichText(safeContent)
                  }
                }]
              }
            });
          } catch (detailsError) {
            console.warn('[Discourse Saver] details 块解析失败:', detailsError.message);
            // 作为普通段落处理
            blocks.push({
              type: 'paragraph',
              paragraph: { rich_text: [{ text: { content: line.replace(/<[^>]+>/g, '') } }] }
            });
          }
        }
        // 跳过 </details> 结束标签
        else if (line.includes('</details>')) {
          // 已在上面处理，跳过
        }
        // 引用块
        else if (line.startsWith('> ')) {
          let quoteContent = line.substring(2);
          i++;
          while (i < lines.length && lines[i].startsWith('> ')) {
            quoteContent += '\n' + lines[i].substring(2);
            i++;
          }
          i--; // 回退一行
          blocks.push({
            type: 'quote',
            quote: { rich_text: parseRichText(quoteContent) }
          });
        }
        // 列表项（无序）
        else if (line.match(/^[-*]\s+/)) {
          const content = line.replace(/^[-*]\s+/, '');
          blocks.push({
            type: 'bulleted_list_item',
            bulleted_list_item: { rich_text: parseRichText(content) }
          });
        }
        // 列表项（有序）
        else if (line.match(/^\d+\.\s+/)) {
          const content = line.replace(/^\d+\.\s+/, '');
          blocks.push({
            type: 'numbered_list_item',
            numbered_list_item: { rich_text: parseRichText(content) }
          });
        }
        // 任务列表
        else if (line.match(/^[-*]\s+\[[ x]\]\s+/)) {
          const isChecked = line.includes('[x]');
          const content = line.replace(/^[-*]\s+\[[ x]\]\s+/, '');
          blocks.push({
            type: 'to_do',
            to_do: {
              rich_text: parseRichText(content),
              checked: isChecked
            }
          });
        }
        // Markdown 表格
        else if (line.startsWith('|') && line.endsWith('|')) {
          try {
            // 收集所有表格行
            const tableRows = [];
            let tableIndex = i;

            while (tableIndex < lines.length) {
              const tableLine = lines[tableIndex];
              if (tableLine.startsWith('|') && tableLine.endsWith('|')) {
                // 跳过分隔行 (|---|---|)
                if (!tableLine.match(/^\|[\s\-:]+\|$/)) {
                  // 解析单元格
                  const cells = tableLine
                    .slice(1, -1) // 移除首尾的 |
                    .split('|')
                    .map(cell => cell.trim());
                  if (cells.length > 0) {
                    tableRows.push(cells);
                  }
                }
                tableIndex++;
              } else {
                break;
              }
            }

            // 如果有有效的表格行，创建 Notion table
            if (tableRows.length > 0 && tableRows.some(row => row.length > 0)) {
              const columnCount = Math.max(1, ...tableRows.map(row => row.length || 1));

              // 创建表格行
              const notionRows = tableRows.map((row, rowIndex) => {
                // 补齐单元格数量
                while (row.length < columnCount) {
                  row.push('');
                }

                return {
                  type: 'table_row',
                  table_row: {
                    cells: row.slice(0, columnCount).map(cellContent => {
                      // 解析单元格内容中的链接和格式
                      try {
                        return parseRichText((cellContent || '').substring(0, 2000) || ' ');
                      } catch (e) {
                        return [{ text: { content: cellContent || ' ' } }];
                      }
                    })
                  }
                };
              });

              // 创建表格块
              blocks.push({
                type: 'table',
                table: {
                  table_width: columnCount,
                  has_column_header: true,
                  has_row_header: false,
                  children: notionRows
                }
              });

              // 更新索引，跳过已处理的表格行
              i = tableIndex - 1; // -1 因为循环末尾会 i++
              console.log(`[Discourse Saver] 解析表格: ${tableRows.length} 行, ${columnCount} 列`);
            } else {
              // 表格解析失败，作为普通段落处理
              blocks.push({
                type: 'paragraph',
                paragraph: { rich_text: [{ text: { content: line } }] }
              });
            }
          } catch (tableError) {
            console.warn('[Discourse Saver] 表格解析失败:', tableError.message);
            // 作为普通段落处理
            blocks.push({
              type: 'paragraph',
              paragraph: { rich_text: [{ text: { content: line } }] }
            });
          }
        }
        // 分割线
        else if (line === '---' || line === '***' || line === '___') {
          blocks.push({ type: 'divider', divider: {} });
        }
        // 图片（支持带链接的图片）
        else if (line.match(/^!\[.*\]\(.+\)$/)) {
          const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
          if (match) {
            const rawUrl = match[2];
            // 检查是否是 base64 数据（太大不支持）
            if (rawUrl.startsWith('data:')) {
              blocks.push({
                type: 'paragraph',
                paragraph: { rich_text: [{ text: { content: '[内嵌图片 - Notion 不支持 Base64]' } }] }
              });
            } else {
              const imageUrl = normalizeUrl(rawUrl);
              if (imageUrl) {
                blocks.push({
                  type: 'image',
                  image: { type: 'external', external: { url: imageUrl } }
                });
              } else {
                blocks.push({
                  type: 'paragraph',
                  paragraph: { rich_text: [{ text: { content: '[图片链接无效]' } }] }
                });
              }
            }
          }
        }
        // 独立链接行（可能是视频/音频/书签）
        else if (line.match(/^https?:\/\/[^\s]+$/)) {
          const url = line.trim();
          const urlType = getUrlType(url);

          switch (urlType) {
            case 'video':
              blocks.push({
                type: 'video',
                video: { type: 'external', external: { url } }
              });
              break;
            case 'cloud':
              // 网盘链接：使用 callout 块突出显示
              blocks.push({
                type: 'callout',
                callout: {
                  icon: { emoji: '📦' },
                  rich_text: [{
                    text: { content: getCloudName(url) + ': ', link: null },
                    annotations: { bold: true }
                  }, {
                    text: { content: '点击下载', link: { url } }
                  }]
                }
              });
              break;
            case 'audio':
              // Notion 不直接支持音频块，使用书签
              blocks.push({
                type: 'bookmark',
                bookmark: { url }
              });
              break;
            case 'image':
              blocks.push({
                type: 'image',
                image: { type: 'external', external: { url } }
              });
              break;
            case 'pdf':
              blocks.push({
                type: 'pdf',
                pdf: { type: 'external', external: { url } }
              });
              break;
            default:
              // 普通链接，使用书签预览
              blocks.push({
                type: 'bookmark',
                bookmark: { url }
              });
          }
        }
        // Markdown 链接行 [text](url)
        else if (line.match(/^\[.+\]\(.+\)$/)) {
          const match = line.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
          if (match) {
            const text = match[1];
            const url = normalizeUrl(match[2]);

            if (!url) {
              // URL 无效，只显示文本
              blocks.push({
                type: 'paragraph',
                paragraph: { rich_text: [{ text: { content: text } }] }
              });
            } else {
              const urlType = getUrlType(url);

              // 视频链接使用 embed
              if (urlType === 'video') {
                blocks.push({
                  type: 'video',
                  video: { type: 'external', external: { url } }
                });
              } else if (urlType === 'cloud') {
                // 网盘链接：使用 callout 块
                blocks.push({
                  type: 'callout',
                  callout: {
                    icon: { emoji: '📦' },
                    rich_text: [{
                      text: { content: getCloudName(url) + ': ', link: null },
                      annotations: { bold: true }
                    }, {
                      text: { content: text || '点击下载', link: { url } }
                    }]
                  }
                });
              } else if (urlType === 'image') {
                blocks.push({
                  type: 'image',
                  image: { type: 'external', external: { url } }
                });
              } else {
                // 普通链接
                blocks.push({
                  type: 'paragraph',
                  paragraph: {
                    rich_text: [{
                      text: { content: text, link: { url } }
                    }]
                  }
                });
              }
            }
          }
        }
        // 普通段落（带格式解析）
        else if (line.trim()) {
          blocks.push({
            type: 'paragraph',
            paragraph: { rich_text: parseRichText(line) }
          });
        }

        i++;
      }

      // 辅助函数：验证并修复 rich_text 数组
      function validateRichText(richText) {
        if (!Array.isArray(richText) || richText.length === 0) {
          return [{ text: { content: ' ' } }];
        }

        const validated = [];
        for (const item of richText) {
          try {
            if (!item || typeof item !== 'object') {
              validated.push({ text: { content: ' ' } });
              continue;
            }

            if (!item.text || typeof item.text !== 'object') {
              validated.push({ text: { content: ' ' } });
              continue;
            }

            // 确保 content 是字符串且不为空
            let content = item.text.content;
            if (content === null || content === undefined || content === '') {
              content = ' ';
            } else if (typeof content !== 'string') {
              content = String(content);
            }
            // Notion 限制内容长度为 2000
            content = content.substring(0, 2000);

            const validItem = {
              text: { content: content }
            };

            // 验证链接
            if (item.text.link && item.text.link.url) {
              try {
                const url = item.text.link.url.trim();
                if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                  new URL(url); // 验证 URL 格式
                  validItem.text.link = { url: url };
                }
              } catch (urlError) {
                // URL 无效，不添加链接
              }
            }

            // 保留格式注解
            if (item.annotations && typeof item.annotations === 'object') {
              validItem.annotations = {};
              if (item.annotations.bold === true) validItem.annotations.bold = true;
              if (item.annotations.italic === true) validItem.annotations.italic = true;
              if (item.annotations.code === true) validItem.annotations.code = true;
              if (item.annotations.strikethrough === true) validItem.annotations.strikethrough = true;
              if (item.annotations.underline === true) validItem.annotations.underline = true;
            }

            validated.push(validItem);
          } catch (itemError) {
            console.warn('[Discourse Saver] rich_text 项验证失败:', itemError.message);
            validated.push({ text: { content: ' ' } });
          }
        }

        return validated.length > 0 ? validated : [{ text: { content: ' ' } }];
      }

      // 过滤并验证所有块，确保每个块都有效
      const validBlocks = blocks.filter(block => {
        try {
          if (!block || !block.type) return false;

          // 检查需要 rich_text 的块类型
          const richTextTypes = ['paragraph', 'heading_1', 'heading_2', 'heading_3',
                                 'bulleted_list_item', 'numbered_list_item', 'quote',
                                 'to_do', 'callout', 'code'];

          if (richTextTypes.includes(block.type)) {
            const content = block[block.type];
            if (!content) return false;

            // 检查并修复 rich_text
            if (content.rich_text) {
              content.rich_text = validateRichText(content.rich_text);
            }
          }

          // 检查图片/视频/PDF 块
          if (['image', 'video', 'pdf'].includes(block.type)) {
            const content = block[block.type];
            if (!content || !content.external || !content.external.url) {
              return false;
            }
          }

          // 检查书签块
          if (block.type === 'bookmark') {
            if (!block.bookmark || !block.bookmark.url) {
              return false;
            }
          }

          // 检查表格块
          if (block.type === 'table') {
            if (!block.table || !block.table.children || block.table.children.length === 0) {
              return false;
            }
            // 验证每个表格行
            const tableWidth = block.table.table_width || 1;
            block.table.children = block.table.children.filter(row => {
              if (!row || row.type !== 'table_row' || !row.table_row || !row.table_row.cells) {
                return false;
              }
              // 确保每行有正确数量的单元格，每个单元格都是有效的 rich_text
              while (row.table_row.cells.length < tableWidth) {
                row.table_row.cells.push([{ text: { content: ' ' } }]);
              }
              row.table_row.cells = row.table_row.cells.slice(0, tableWidth).map(cell => {
                return validateRichText(cell);
              });
              return true;
            });
            if (block.table.children.length === 0) return false;
          }

          // 检查 toggle 块
          if (block.type === 'toggle') {
            if (!block.toggle) return false;
            block.toggle.rich_text = validateRichText(block.toggle.rich_text);
            // 验证 children
            if (block.toggle.children && Array.isArray(block.toggle.children)) {
              block.toggle.children = block.toggle.children.filter(child => {
                if (!child || !child.type) return false;
                if (child.type === 'paragraph' && child.paragraph) {
                  child.paragraph.rich_text = validateRichText(child.paragraph.rich_text);
                }
                return true;
              });
            }
          }

          return true;
        } catch (e) {
          console.warn('[Discourse Saver] 块验证失败:', e.message);
          return false;
        }
      });

      console.log(`[Discourse Saver] Notion 块: 总计 ${blocks.length}, 有效 ${validBlocks.length}`);
      return validBlocks;
    }

    // 测试 Notion 连接（支持两种调用方式）
    async function testNotionConnection(tokenOrConfig, dbId = null) {
      let token, databaseId;

      // 支持两种调用方式：testNotionConnection(config) 或 testNotionConnection(token, dbId)
      if (typeof tokenOrConfig === 'object') {
        token = tokenOrConfig.notionToken;
        databaseId = tokenOrConfig.notionDatabaseId;
      } else {
        token = tokenOrConfig;
        databaseId = dbId;
      }

      databaseId = databaseId.replace(/-/g, '');

      return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
          method: 'GET',
          url: `https://api.notion.com/v1/databases/${databaseId}`,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': NOTION_API_VERSION
          },
          onload: function(response) {
            if (response.status >= 200 && response.status < 300) {
              const data = JSON.parse(response.responseText);
              resolve({ success: true, title: data.title?.[0]?.plain_text || 'Database' });
            } else {
              const error = JSON.parse(response.responseText);
              reject(new Error(error.message || 'Connection failed'));
            }
          },
          onerror: function() {
            reject(new Error('网络请求失败'));
          }
        });
      });
    }

    // ============================================================
    // 飞书多维表格功能（从 background.js 移植，使用 GM_xmlhttpRequest）
    // ============================================================

    // GM_xmlhttpRequest 的 fetch 兼容包装（用于跨域请求）
    function gmFetch(url, options = {}) {
      return new Promise((resolve, reject) => {
        const details = {
          method: options.method || 'GET',
          url: url,
          headers: options.headers || {},
          timeout: 30000,
          onload: function(resp) {
            const text = resp.responseText;
            const status = resp.status;
            resolve({
              ok: status >= 200 && status < 300,
              status: status,
              text: () => Promise.resolve(text),
              json: () => {
                try { return Promise.resolve(JSON.parse(text)); }
                catch(e) { return Promise.reject(e); }
              }
            });
          },
          onerror: function() { reject(new Error('网络请求失败: ' + url)); },
          ontimeout: function() { reject(new Error('请求超时: ' + url)); }
        };
        if (options.body) {
          details.data = options.body;
        }
        GM_xmlhttpRequest(details);
      });
    }

    const FEISHU_API_DOMAINS = { feishu: 'https://open.feishu.cn', lark: 'https://open.larksuite.com' };
    const FEISHU_TEXT_LIMIT = 100000;
    let feishuTokenCache = { feishu: { token: null, expireTime: 0 }, lark: { token: null, expireTime: 0 } };

    const FEISHU_ERR = {
      10003: { msg: 'App ID 或 App Secret 错误', hint: '请检查飞书开放平台的应用凭证是否正确复制' },
      10014: { msg: 'App Secret 错误', hint: '请重新复制 App Secret' },
      99991663: { msg: 'App ID 格式错误', hint: 'App ID 应该以「cli_」开头' },
      99991664: { msg: 'App Secret 格式错误', hint: 'App Secret 格式不正确，请重新复制' },
      1254043: { msg: '应用权限不足', hint: '请在飞书开放平台添加 bitable:app 权限，并将应用添加为多维表格的协作者' },
      1254044: { msg: '无访问此文档的权限', hint: '请确保已将应用添加为多维表格的「可编辑」协作者' },
      1254045: { msg: '文档不存在或无权限', hint: '请检查 app_token 是否正确' },
      1254607: { msg: '数据表不存在', hint: 'table_id 错误，请从 URL「?table=」后面复制（以 tbl 开头）' },
      1254301: { msg: '多维表格不存在', hint: 'app_token 错误，请从 URL「/base/」后到「?」之间复制' },
      1254016: { msg: '字段不存在', hint: '请确保多维表格有：标题、链接、作者、分类、标签、保存时间、评论数、附件、正文 字段' },
      1254017: { msg: '字段类型不匹配', hint: '链接字段必须是「超链接」类型，保存时间必须是「日期」类型，评论数必须是「数字」类型' },
      1254060: { msg: '多行文本字段格式错误', hint: '「正文」字段类型需为「多行文本」，或内容超过10万字符' },
      99991400: { msg: 'API 调用频率超限', hint: '请稍后再试' }
    };

    function feishuParseError(code, msg, ctx) {
      const e = FEISHU_ERR[code];
      return e ? `${ctx}失败：${e.msg}\n💡 ${e.hint}` : `${ctx}失败：${msg}（错误码: ${code}）`;
    }

    async function feishuSafeJson(response, ctx) {
      const text = await response.text();
      if (!text || text.trim() === '') throw new Error(`${ctx}失败：服务器返回空响应`);
      if (!response.ok) {
        try {
          const d = JSON.parse(text);
          if (d.code !== undefined) throw new Error(feishuParseError(d.code, d.msg || '未知错误', ctx));
        } catch(pe) {
          if (pe.message.includes('失败：')) throw pe;
        }
        throw new Error(`${ctx}失败：HTTP ${response.status}`);
      }
      try { return JSON.parse(text); }
      catch(e) { throw new Error(`${ctx}失败：无法解析服务器响应\n${text.substring(0, 100)}`); }
    }

    async function getFeishuToken(appId, appSecret, domain = 'feishu') {
      if (!appId || !appId.trim()) throw new Error('App ID 未填写');
      if (!appSecret || !appSecret.trim()) throw new Error('App Secret 未填写');
      if (!appId.startsWith('cli_')) throw new Error(`App ID 格式错误，应以「cli_」开头`);

      const cache = feishuTokenCache[domain] || feishuTokenCache.feishu;
      if (cache.token && Date.now() < cache.expireTime - 300000) return cache.token;

      const baseUrl = FEISHU_API_DOMAINS[domain] || FEISHU_API_DOMAINS.feishu;
      let response;
      try {
        response = await gmFetch(`${baseUrl}/open-apis/auth/v3/tenant_access_token/internal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_id: appId.trim(), app_secret: appSecret.trim() })
        });
      } catch(err) {
        throw new Error(`无法访问飞书服务器，请检查网络：${err.message}`);
      }

      const data = await feishuSafeJson(response, '获取访问令牌');
      if (data.code !== 0) throw new Error(feishuParseError(data.code, data.msg, '获取访问令牌'));

      if (!feishuTokenCache[domain]) feishuTokenCache[domain] = {};
      feishuTokenCache[domain].token = data.tenant_access_token;
      feishuTokenCache[domain].expireTime = Date.now() + (data.expire * 1000);
      return data.tenant_access_token;
    }

    function feishuSanitizeContent(content) {
      if (!content || typeof content !== 'string') return '';
      let s = content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      s = s.replace(/[\u200B-\u200D\uFEFF\u2028\u2029]/g, '');
      s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      s = s.replace(/!\[([^\]]*)\]\([^)]+\)/g, (m, alt) => alt.trim() ? `[图片: ${alt.trim()}]` : '');
      s = s.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (m, text, url) => text.trim() || '');
      s = s.replace(/\n{3,}/g, '\n\n');
      s = s.replace(/[ \t]+/g, ' ');
      s = s.replace(/^ +| +$/gm, '');
      if (s.length > FEISHU_TEXT_LIMIT) {
        s = s.substring(0, FEISHU_TEXT_LIMIT - 100) + '\n\n... (内容过长，已截断)';
      }
      return s;
    }

    async function feishuUploadMd(token, appToken, title, content, domain) {
      const safeTitle = title.replace(/[《》<>:"/\\|?*]/g, '').replace(/\s+/g, '-').substring(0, 50);
      const fileName = `${safeTitle}.md`;
      const blob = new Blob([content], { type: 'text/markdown' });
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('file_name', fileName);
      formData.append('parent_type', 'bitable_file');
      formData.append('parent_node', appToken);
      formData.append('size', blob.size.toString());

      const baseUrl = FEISHU_API_DOMAINS[domain] || FEISHU_API_DOMAINS.feishu;
      const response = await gmFetch(`${baseUrl}/open-apis/drive/v1/medias/upload_all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await feishuSafeJson(response, '上传MD文件');
      if (data.code !== 0) throw new Error(`上传MD文件失败: ${data.msg}`);
      return data.data.file_token;
    }

    async function feishuUploadHtmlFile(token, appToken, title, htmlContent, domain) {
      const safeTitle = title.replace(/[《》<>:"/\\|?*]/g, '').replace(/\s+/g, '-').substring(0, 50);
      const fileName = `${safeTitle}.html`;
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('file_name', fileName);
      formData.append('parent_type', 'bitable_file');
      formData.append('parent_node', appToken);
      formData.append('size', blob.size.toString());
      const baseUrl = FEISHU_API_DOMAINS[domain] || FEISHU_API_DOMAINS.feishu;
      const response = await gmFetch(`${baseUrl}/open-apis/drive/v1/medias/upload_all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await feishuSafeJson(response, '上传HTML文件');
      if (data.code !== 0) throw new Error(`上传HTML文件失败: ${data.msg}`);
      return data.data.file_token;
    }

    async function feishuBuildAndSaveRecord(token, appToken, tableId, domain, postData, uploadContent, uploadAttachment, uploadHtml = false, isUpdate = false, recordId = null) {
      const baseUrl = FEISHU_API_DOMAINS[domain] || FEISHU_API_DOMAINS.feishu;
      const fields = {
        '标题': postData.title,
        '链接': { link: postData.url, text: postData.title },
        '作者': postData.author,
        '分类': postData.category || '',
        '标签': postData.tags && postData.tags.length > 0 ? postData.tags.join(', ') : '',
        '保存时间': Date.now(),
        '评论数': postData.commentCount || 0
      };

      const attachments = [];
      const uploadErrors = [];

      if (uploadAttachment && postData.content) {
        try {
          const fileToken = await feishuUploadMd(token, appToken, postData.title, postData.content, domain);
          attachments.push({ file_token: fileToken });
        } catch(e) {
          uploadErrors.push('MD附件: ' + e.message);
        }
      }

      if (uploadHtml && postData.content && postData.metadata) {
        try {
          const htmlContent = generateHtmlContent(postData.content, postData.metadata);
          const fileToken = await feishuUploadHtmlFile(token, appToken, postData.title, htmlContent, domain);
          attachments.push({ file_token: fileToken });
        } catch(e) {
          uploadErrors.push('HTML附件: ' + e.message);
        }
      }

      if (attachments.length > 0) fields['附件'] = attachments;

      if (uploadContent !== false) {
        fields['正文'] = feishuSanitizeContent(postData.content);
      }

      const url = isUpdate
        ? `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`
        : `${baseUrl}/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`;

      const response = await gmFetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ fields })
      });

      const data = await feishuSafeJson(response, isUpdate ? '更新记录' : '保存记录');
      if (data.code !== 0) throw new Error(feishuParseError(data.code, data.msg, isUpdate ? '更新记录' : '保存记录'));

      const result = data.data.record;
      if (uploadErrors.length > 0) result._uploadWarnings = uploadErrors;
      return result;
    }

    async function feishuFindRecord(config, url, title) {
      const { feishuApiDomain, feishuAppId, feishuAppSecret, feishuAppToken, feishuTableId } = config;
      const domain = feishuApiDomain || 'feishu';
      const token = await getFeishuToken(feishuAppId, feishuAppSecret, domain);
      const baseUrl = FEISHU_API_DOMAINS[domain] || FEISHU_API_DOMAINS.feishu;
      const baseTitle = title.replace(/\s*\[\d+楼\]$/, '');

      const response = await gmFetch(`${baseUrl}/open-apis/bitable/v1/apps/${feishuAppToken}/tables/${feishuTableId}/records/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          filter: { conjunction: 'and', conditions: [{ field_name: '标题', operator: 'contains', value: [baseTitle] }] },
          page_size: 20
        })
      });

      const data = await feishuSafeJson(response, '搜索记录');
      if (data.code !== 0) throw new Error(`飞书搜索失败(${data.code}): ${data.msg}`);

      if (data.data.total > 0 && data.data.items) {
        for (const item of data.data.items) {
          const recordLink = item.fields?.['链接'];
          const recordUrl = typeof recordLink === 'object' ? recordLink.link : recordLink;
          if (recordUrl === url) return item;
        }
      }
      return null;
    }

    async function saveToFeishu(markdown, metadata, config) {
      const domain = config.feishuApiDomain || 'feishu';
      if (!config.feishuAppId || !config.feishuAppSecret || !config.feishuAppToken || !config.feishuTableId) {
        throw new Error('飞书配置不完整，请检查 App ID/Secret/Token/Table ID');
      }

      const token = await getFeishuToken(config.feishuAppId, config.feishuAppSecret, domain);
      const postData = {
        title: metadata.title,
        url: metadata.url,
        author: metadata.author || '',
        category: metadata.category || '',
        tags: metadata.tags || [],
        commentCount: metadata.commentCount || 0,
        content: markdown,
        metadata: metadata  // 用于生成 HTML 附件
      };

      const uploadHtml = !!config.feishuUploadHtml;

      // 搜索是否已存在，决定新建还是更新
      let existingRecord = null;
      try {
        existingRecord = await feishuFindRecord(config, metadata.url, metadata.title);
      } catch(e) {
        console.warn('[Discourse Saver→飞书] 搜索已有记录失败，将新建:', e.message);
      }

      if (existingRecord) {
        console.log('[Discourse Saver→飞书] 更新已有记录:', existingRecord.record_id);
        return await feishuBuildAndSaveRecord(token, config.feishuAppToken, config.feishuTableId, domain, postData,
          config.feishuUploadContent !== false, config.feishuUploadAttachment, uploadHtml, true, existingRecord.record_id);
      } else {
        console.log('[Discourse Saver→飞书] 新建记录');
        return await feishuBuildAndSaveRecord(token, config.feishuAppToken, config.feishuTableId, domain, postData,
          config.feishuUploadContent !== false, config.feishuUploadAttachment, uploadHtml, false);
      }
    }

    async function testFeishuConnection(appId, appSecret, domain) {
      try {
        const token = await getFeishuToken(appId, appSecret, domain || 'feishu');
        return { success: true, token: token.substring(0, 8) + '...' };
      } catch(e) {
        return { success: false, error: e.message };
      }
    }

    // 独立导出：仅保存到飞书
    async function saveToFeishuOnly(targetPostNumber = null) {
      try {
        const config = ConfigModule.get();
        if (!config.feishuAppId || !config.feishuAppSecret || !config.feishuAppToken || !config.feishuTableId) {
          throw new Error('请先配置飞书 App ID/Secret/Token/Table ID');
        }

        UtilModule.showNotification('正在准备保存到飞书...', 'info');
        const { markdown, metadata, comments } = await prepareData(targetPostNumber);
        await saveToFeishu(markdown, metadata, config);
        const commentInfo = comments.length > 0 ? `（含${comments.length}条评论）` : '';
        UtilModule.showNotification(`已保存到飞书${commentInfo}`, 'success');
        return { success: true, target: '飞书' };
      } catch (error) {
        console.error('[Discourse Saver] 飞书保存失败:', error);
        UtilModule.showNotification('飞书保存失败: ' + error.message, 'error');
        return { success: false, target: '飞书', error: error.message };
      }
    }

    // 准备保存数据（公共函数）
    async function prepareData(targetPostNumber = null) {
      const config = ConfigModule.get();
      const data = await extractData(config, targetPostNumber);
      const { title, contentHTML, url, author, topicId, category, tags, comments, isSingleCommentMode } = data;

      const effectiveConfig = isSingleCommentMode
        ? { ...config, saveComments: true, foldComments: false }
        : config;

      let markdown = ConvertModule.convertToMarkdownWithComments(
        contentHTML,
        { title, url, author, topicId, category, tags },
        comments,
        effectiveConfig
      );

      // rawMarkdown：外链版本，用于飞书/Notion/HTML
      const rawMarkdown = markdown;

      let fileName = UtilModule.sanitizeFileName(title);
      let displayTitle = title;

      if (isSingleCommentMode) {
        fileName += `-${targetPostNumber}楼`;
        displayTitle = `${title} #${targetPostNumber}楼`;
      }

      const metadata = { title: displayTitle, url, author, category, tags, commentCount: comments.length };

      return { markdown: rawMarkdown, rawMarkdown, fileName, metadata, comments, config, isSingleCommentMode, targetPostNumber };
    }

    // 独立导出：仅保存到 Obsidian
    async function saveToObsidianOnly(targetPostNumber = null) {
      try {
        UtilModule.showNotification('正在准备保存到 Obsidian...', 'info');
        const { rawMarkdown, fileName, comments, config } = await prepareData(targetPostNumber);
        let obsidianMarkdown = rawMarkdown;
        if (config.embedImages) {
          try {
            const result = await UtilModule.embedImagesInMarkdown(rawMarkdown);
            if (result && result.length > 0) obsidianMarkdown = result;
          } catch (e) { console.error('[Discourse Saver] 图片嵌入失败，使用外链:', e); }
        } else if (config.downloadImages && config.restApiKey) {
          try {
            const siteName = window.location.hostname.replace(/\./g, '_');
            const siteFolderPath = config.folderPath ? `${config.folderPath}/${siteName}` : siteName;
            obsidianMarkdown = await UtilModule.downloadAndReplaceMedia(rawMarkdown, config, siteFolderPath);
          } catch (e) { console.error('[Discourse Saver] 媒体下载失败，使用外链:', e); }
        }
        await sendToObsidian(obsidianMarkdown, fileName, config);
        const commentInfo = comments.length > 0 ? `（含${comments.length}条评论）` : '';
        UtilModule.showNotification(`已保存到 Obsidian${commentInfo}`, 'success');
        return { success: true, target: 'Obsidian' };
      } catch (error) {
        console.error('[Discourse Saver] Obsidian 保存失败:', error);
        UtilModule.showNotification('Obsidian 保存失败: ' + error.message, 'error');
        return { success: false, target: 'Obsidian', error: error.message };
      }
    }

    // 独立导出：仅保存到 Notion
    async function saveToNotionOnly(targetPostNumber = null) {
      try {
        const config = ConfigModule.get();
        if (!config.notionToken || !config.notionDatabaseId) {
          throw new Error('请先配置 Notion Token 和 Database ID');
        }

        UtilModule.showNotification('正在准备保存到 Notion...', 'info');
        const { markdown, metadata, comments } = await prepareData(targetPostNumber);
        await saveToNotion(markdown, metadata, config);
        const commentInfo = comments.length > 0 ? `（含${comments.length}条评论）` : '';
        UtilModule.showNotification(`已保存到 Notion${commentInfo}`, 'success');
        return { success: true, target: 'Notion' };
      } catch (error) {
        console.error('[Discourse Saver] Notion 保存失败:', error);
        UtilModule.showNotification('Notion 保存失败: ' + error.message, 'error');
        return { success: false, target: 'Notion', error: error.message };
      }
    }

    // 独立导出：仅导出为 HTML
    async function exportHtmlOnly(targetPostNumber = null) {
      try {
        UtilModule.showNotification('正在准备导出 HTML...', 'info');
        const { markdown, fileName, metadata, comments, config } = await prepareData(targetPostNumber);
        downloadAsHtml(markdown, metadata, fileName, config);
        const commentInfo = comments.length > 0 ? `（含${comments.length}条评论）` : '';
        UtilModule.showNotification(`已导出 HTML${commentInfo}`, 'success');
        return { success: true, target: 'HTML' };
      } catch (error) {
        console.error('[Discourse Saver] HTML 导出失败:', error);
        UtilModule.showNotification('HTML 导出失败: ' + error.message, 'error');
        return { success: false, target: 'HTML', error: error.message };
      }
    }

    // 主保存函数（并行处理所有选中的目标，Obsidian 最后执行）
    async function save(targetPostNumber = null) {
      try {
        const config = ConfigModule.get();
        console.log('[Discourse Saver] 配置:', config);

        // 检查是否至少选择了一个保存目标
        if (!config.saveToObsidian && !config.saveToNotion && !config.saveToFeishu && !config.exportHtml) {
          UtilModule.showNotification('请在设置中至少选择一个保存目标', 'warning');
          return;
        }

        // 提取数据（只提取一次）
        UtilModule.showNotification('正在提取内容...', 'info');
        const { rawMarkdown, fileName, metadata, comments } = await prepareData(targetPostNumber);

        // 构建任务列表（Obsidian 单独处理，因为会跳转页面）
        const tasks = [];
        const taskNames = [];
        let shouldSaveToObsidian = false;

        // Notion 和 HTML 先执行（不会跳转页面），始终使用外链版 rawMarkdown
        if (config.saveToNotion && config.notionToken && config.notionDatabaseId) {
          tasks.push(
            saveToNotion(rawMarkdown, metadata, config)
              .then(() => ({ success: true, target: 'Notion' }))
              .catch(e => ({ success: false, target: 'Notion', error: e.message }))
          );
          taskNames.push('Notion');
        }

        if (config.exportHtml) {
          tasks.push(
            Promise.resolve()
              .then(() => {
                downloadAsHtml(rawMarkdown, metadata, fileName, config);
                return { success: true, target: 'HTML' };
              })
              .catch(e => ({ success: false, target: 'HTML', error: e.message }))
          );
          taskNames.push('HTML');
        }

        if (config.saveToFeishu && config.feishuAppId && config.feishuAppSecret && config.feishuAppToken && config.feishuTableId) {
          tasks.push(
            saveToFeishu(rawMarkdown, metadata, config)
              .then(() => ({ success: true, target: '飞书' }))
              .catch(e => ({ success: false, target: '飞书', error: e.message }))
          );
          taskNames.push('飞书');
        }

        // 记录是否需要保存到 Obsidian（最后执行）
        if (config.saveToObsidian) {
          shouldSaveToObsidian = true;
          taskNames.push('Obsidian');
        }

        if (taskNames.length === 0) {
          UtilModule.showNotification('没有可执行的保存任务', 'warning');
          return;
        }

        // 显示正在保存
        UtilModule.showNotification(`正在保存到 ${taskNames.join('、')}...`, 'info');

        // 先并行执行 Notion 和 HTML 任务
        let results = [];
        if (tasks.length > 0) {
          results = await Promise.allSettled(tasks);
        }

        // 统计结果
        const succeeded = [];
        const failed = [];

        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            succeeded.push(result.value.target);
          } else {
            // 注意：taskNames 不包含 Obsidian（如果有的话），所以 index 对应的是非 Obsidian 任务
            const nonObsidianTaskNames = taskNames.filter(t => t !== 'Obsidian');
            const target = result.status === 'fulfilled' ? result.value.target : nonObsidianTaskNames[index];
            const error = result.status === 'fulfilled' ? result.value.error : result.reason?.message;
            failed.push({ target, error });
            console.error(`[Discourse Saver] ${target} 保存失败:`, error);
          }
        });

        // 显示 Notion/HTML 结果（如果有）
        const commentInfo = comments.length > 0 ? `（含${comments.length}条评论）` : '';

        if (succeeded.length > 0 && !shouldSaveToObsidian) {
          // 没有 Obsidian 任务，直接显示最终结果
          if (failed.length === 0) {
            UtilModule.showNotification(`已保存到 ${succeeded.join('、')}${commentInfo}`, 'success');
          } else {
            UtilModule.showNotification(
              `已保存到 ${succeeded.join('、')}${commentInfo}，${failed.map(f => f.target).join('、')} 失败`,
              'warning'
            );
          }
        } else if (failed.length > 0 && !shouldSaveToObsidian) {
          UtilModule.showNotification(`${failed.map(f => f.target).join('、')} 保存失败`, 'error');
        }

        // 执行 Obsidian 保存（会跳转页面，所以放在最后）
        if (shouldSaveToObsidian) {
          // 先显示其他任务的结果
          if (succeeded.length > 0) {
            const msg = `${succeeded.join('、')} 已完成${commentInfo}，正在打开 Obsidian...`;
            UtilModule.showNotification(msg, 'info');
          } else if (failed.length > 0) {
            const msg = `${failed.map(f => f.target).join('、')} 失败，正在打开 Obsidian...`;
            UtilModule.showNotification(msg, 'warning');
          } else {
            UtilModule.showNotification('正在打开 Obsidian...', 'info');
          }

          // OB 专属图片处理（embedImages / downloadImages），失败则 fallback 外链
          let obsidianMarkdown = rawMarkdown;
          if (config.embedImages) {
            try {
              UtilModule.showNotification('正在嵌入图片...', 'info');
              const result = await UtilModule.embedImagesInMarkdown(rawMarkdown, (c, t) => {
                UtilModule.showNotification(`正在嵌入图片 ${c}/${t}...`, 'info');
              });
              if (result && result.length > 0) obsidianMarkdown = result;
            } catch (e) {
              console.error('[Discourse Saver] 图片嵌入失败，使用外链:', e);
              UtilModule.showNotification('图片嵌入失败，使用外链', 'warning');
            }
          } else if (config.downloadImages && config.restApiKey) {
            try {
              const siteName = window.location.hostname.replace(/\./g, '_');
              const siteFolderPath = config.folderPath ? `${config.folderPath}/${siteName}` : siteName;
              obsidianMarkdown = await UtilModule.downloadAndReplaceMedia(rawMarkdown, config, siteFolderPath);
            } catch (e) {
              console.error('[Discourse Saver] 媒体下载失败，使用外链:', e);
              UtilModule.showNotification('媒体下载失败，使用外链', 'warning');
            }
          }

          // 等待一段时间让用户看到通知
          await new Promise(resolve => setTimeout(resolve, 1500));

          try {
            await sendToObsidian(obsidianMarkdown, fileName, config);
            succeeded.push('Obsidian');
          } catch (e) {
            failed.push({ target: 'Obsidian', error: e.message });
            console.error('[Discourse Saver] Obsidian 保存失败:', e);
            UtilModule.showNotification('Obsidian 打开失败: ' + e.message, 'error');
          }
        }

        return { succeeded, failed };

      } catch (error) {
        console.error('[Discourse Saver] 保存失败:', error);
        UtilModule.showNotification('保存失败: ' + error.message, 'error');
        return { succeeded: [], failed: [{ target: 'all', error: error.message }] };
      }
    }

    // 导出所有函数
    return {
      save,                    // 根据配置保存（并行）
      saveToObsidianOnly,      // 仅保存到 Obsidian
      saveToNotionOnly,        // 仅保存到 Notion
      saveToFeishuOnly,        // 仅保存到飞书
      exportHtmlOnly,          // 仅导出 HTML
      testNotionConnection,    // 测试 Notion 连接
      testFeishuConnection,    // 测试飞书连接
      downloadLastLargeFile    // 备选：下载大文件
    };
  })();

  // ============================================================
  // 模块6: 用户界面 (UIModule)
  // ============================================================
  const UIModule = (function() {
    // 注入样式
    function injectStyles() {
      GM_addStyle(`
        @keyframes dsSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .ds-settings-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999998;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ds-settings-panel {
          background: white;
          border-radius: 12px;
          padding: 24px;
          width: 480px;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }

        .ds-settings-panel h2 {
          margin: 0 0 20px 0;
          font-size: 20px;
          color: #1f2937;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 12px;
        }

        .ds-form-group {
          margin-bottom: 16px;
        }

        .ds-form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .ds-form-group input[type="text"],
        .ds-form-group input[type="number"] {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .ds-form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .ds-checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ds-checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .ds-checkbox-group label {
          margin: 0;
          cursor: pointer;
        }

        .ds-btn-group {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }

        .ds-btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ds-btn-primary {
          background: #3b82f6;
          color: white;
        }

        .ds-btn-primary:hover {
          background: #2563eb;
        }

        .ds-btn-secondary {
          background: #f3f4f6;
          color: #374151;
        }

        .ds-btn-secondary:hover {
          background: #e5e7eb;
        }

        .ds-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          margin: 20px 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ds-hint {
          font-size: 12px;
          color: #9ca3af;
          margin-top: 4px;
        }
      `);
    }

    // V5.5.3: 悬浮保存按钮（支持拖拽、移动端）
    function createFloatingButton() {
      if (document.getElementById('ds-float-btn')) return;
      const btn = document.createElement('div');
      btn.id = 'ds-float-btn';
      btn.title = '保存帖子（长按更多选项）';
      btn.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
      const savedPos = (() => { try { return JSON.parse(GM_getValue('ds_float_pos', 'null')); } catch(e) { return null; } })();
      Object.assign(btn.style, {
        position: 'fixed', zIndex: '999999',
        right: savedPos ? 'auto' : '18px', bottom: savedPos ? 'auto' : '80px',
        left: savedPos ? savedPos.left : 'auto', top: savedPos ? savedPos.top : 'auto',
        width: '48px', height: '48px', borderRadius: '50%',
        background: 'linear-gradient(135deg,#667eea,#764ba2)',
        boxShadow: '0 4px 15px rgba(102,126,234,.55)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none', touchAction: 'none', transition: 'transform .1s,box-shadow .1s',
      });
      let dragging = false, moved = false, longPressed = false, startX, startY, startL, startT, longTimer;
      function gp(e) { const t = e.touches ? e.touches[0] : e; return { x: t.clientX, y: t.clientY }; }
      function onStart(e) {
        dragging = true; moved = false; longPressed = false;
        const p = gp(e); startX = p.x; startY = p.y;
        const r = btn.getBoundingClientRect(); startL = r.left; startT = r.top;
        btn.style.transition = 'none';
        longTimer = setTimeout(() => {
          if (!moved) { longPressed = true; showFloatMenu(); }
        }, 600);
        e.preventDefault();
      }
      function onMove(e) {
        if (!dragging) return;
        const p = gp(e), dx = p.x - startX, dy = p.y - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) { moved = true; clearTimeout(longTimer); }
        if (!moved) return;
        btn.style.left = Math.max(0, Math.min(window.innerWidth - 48, startL + dx)) + 'px';
        btn.style.top  = Math.max(0, Math.min(window.innerHeight - 48, startT + dy)) + 'px';
        btn.style.right = btn.style.bottom = 'auto';
        e.preventDefault();
      }
      function onEnd() {
        if (!dragging) return;
        dragging = false; clearTimeout(longTimer);
        btn.style.transition = 'transform .1s,box-shadow .1s';
        if (moved) {
          GM_setValue('ds_float_pos', JSON.stringify({ left: btn.style.left, top: btn.style.top }));
        } else if (!longPressed) {
          btn.style.transform = 'scale(.88)'; setTimeout(() => btn.style.transform = '', 120);
          SaveModule.save(null);
        }
        moved = false; longPressed = false;
      }
      btn.addEventListener('mousedown', onStart);
      btn.addEventListener('touchstart', onStart, { passive: false });
      window.addEventListener('mousemove', onMove);
      window.addEventListener('touchmove', onMove, { passive: false });
      window.addEventListener('mouseup', onEnd);
      window.addEventListener('touchend', onEnd);
      document.body.appendChild(btn);
    }

    function showFloatMenu() {
      const ex = document.getElementById('ds-float-menu');
      if (ex) { ex.remove(); return; }
      const btn = document.getElementById('ds-float-btn');
      const r = btn.getBoundingClientRect();
      const menu = document.createElement('div');
      menu.id = 'ds-float-menu';

      // 解析楼层字符串："5" / "2,5,8" / "2-8" / "1-5,8,10-12"
      function parseFloors(str) {
        const floors = new Set();
        for (const part of str.replace(/\s/g, '').split(',')) {
          if (!part) continue;
          const m = part.match(/^(\d+)-(\d+)$/);
          if (m) {
            const a = +m[1], b = +m[2];
            if (a > b || b - a > 500) return null;
            for (let i = a; i <= b; i++) floors.add(i);
          } else if (/^\d+$/.test(part)) {
            floors.add(+part);
          } else return null;
        }
        return floors.size > 0 ? Array.from(floors).sort((a, b) => a - b) : null;
      }

      menu.innerHTML = `
        <div style="padding:10px 14px 6px;font-weight:600;font-size:13px;color:#667eea;border-bottom:1px solid #f0f0f0;">Discourse Saver</div>
        <div id="dsm-save-all" style="padding:10px 14px;cursor:pointer;font-size:14px;border-bottom:1px solid #f0f0f0;">💾 保存整个帖子</div>
        <div style="padding:8px 14px 4px;font-size:12px;color:#999;">指定楼层（如: 5 或 2-8 或 1,3,5-7）</div>
        <div style="padding:4px 14px 10px;display:flex;gap:6px;align-items:center;">
          <input id="dsm-floor-input" type="text" placeholder="楼层范围" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:6px;font-size:13px;outline:none;min-width:0;">
          <button id="dsm-floor-go" style="padding:6px 12px;background:#667eea;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;white-space:nowrap;">保存</button>
        </div>
        <div id="dsm-floor-hint" style="padding:0 14px 8px;font-size:11px;color:#999;min-height:16px;"></div>
      `;

      // 定位：按钮左侧弹出，不够则右侧
      const menuW = 220;
      let left = r.left - menuW - 10;
      let top = r.top;
      if (left < 8) left = r.right + 10;
      if (top + 180 > window.innerHeight) top = window.innerHeight - 185;
      Object.assign(menu.style, {
        position: 'fixed', zIndex: '1000000', left: left + 'px', top: top + 'px',
        background: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,.18)',
        width: menuW + 'px', fontSize: '14px',
      });

      document.body.appendChild(menu);

      function closeMenu() { menu.remove(); document.removeEventListener('click', outsideClick); }
      function outsideClick(e) { if (!menu.contains(e.target) && e.target !== btn) closeMenu(); }

      // 保存整帖
      menu.querySelector('#dsm-save-all').addEventListener('click', () => { closeMenu(); SaveModule.save(null); });
      menu.querySelector('#dsm-save-all').addEventListener('pointerover', e => e.currentTarget.style.background = '#f5f5f5');
      menu.querySelector('#dsm-save-all').addEventListener('pointerout', e => e.currentTarget.style.background = '');

      // 楼层输入实时提示
      const input = menu.querySelector('#dsm-floor-input');
      const hint = menu.querySelector('#dsm-floor-hint');
      input.addEventListener('input', () => {
        const v = input.value.trim();
        if (!v) { hint.textContent = ''; return; }
        const floors = parseFloors(v);
        if (!floors) { hint.style.color = '#ef4444'; hint.textContent = '格式错误'; }
        else { hint.style.color = '#22c55e'; hint.textContent = `共 ${floors.length} 楼: ${floors.slice(0, 6).join(', ')}${floors.length > 6 ? '...' : ''}`; }
      });

      // 执行楼层保存
      function doFloorSave() {
        const v = input.value.trim();
        if (!v) { input.style.borderColor = '#ef4444'; input.focus(); return; }
        const floors = parseFloors(v);
        if (!floors) { input.style.borderColor = '#ef4444'; hint.style.color = '#ef4444'; hint.textContent = '格式错误'; return; }
        closeMenu();
        if (floors.length === 1) {
          SaveModule.save(floors[0] === 1 ? null : String(floors[0]));
        } else {
          SaveModule.save(floors);
        }
      }

      menu.querySelector('#dsm-floor-go').addEventListener('click', doFloorSave);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') doFloorSave(); if (e.key === 'Escape') closeMenu(); });

      setTimeout(() => { document.addEventListener('click', outsideClick); input.focus(); }, 100);
    }

    // 显示设置面板
    function showSettingsPanel() {
      const config = ConfigModule.get();

      const overlay = document.createElement('div');
      overlay.className = 'ds-settings-overlay';
      overlay.innerHTML = `
        <div class="ds-settings-panel">
          <h2>📝 Discourse Saver 设置 (V5.5.9)</h2>

          <div class="ds-section-title">自定义站点</div>

          <div class="ds-form-group">
            <label>自定义 Discourse 站点</label>
            <input type="text" id="ds-custom-sites" value="${config.customSites || ''}" placeholder="example.com, forum.test.com">
            <div class="ds-hint">逗号分隔的域名，用于检测不到的自建 Discourse 站点</div>
          </div>

          <div class="ds-section-title">保存目标</div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-save-obsidian" ${config.saveToObsidian ? 'checked' : ''}>
            <label for="ds-save-obsidian">保存到 Obsidian</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-save-notion" ${config.saveToNotion ? 'checked' : ''}>
            <label for="ds-save-notion">保存到 Notion</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-save-feishu" ${config.saveToFeishu ? 'checked' : ''}>
            <label for="ds-save-feishu">保存到飞书多维表格</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-export-html" ${config.exportHtml ? 'checked' : ''}>
            <label for="ds-export-html">导出为 HTML 文件</label>
          </div>

          <div class="ds-section-title">Obsidian 设置</div>

          <div class="ds-form-group">
            <label>Vault 名称</label>
            <input type="text" id="ds-vault" value="${config.vaultName}" placeholder="你的Vault名称">
            <div class="ds-hint">必须与 Obsidian 中的库名完全一致</div>
            <button type="button" id="ds-test-ob" style="margin-top:8px;padding:6px 12px;background:#7c3aed;color:white;border:none;border-radius:4px;cursor:pointer;">测试 Obsidian 连接</button>
          </div>

          <div class="ds-form-group">
            <label>保存文件夹路径</label>
            <input type="text" id="ds-folder" value="${config.folderPath}" placeholder="Discourse收集箱">
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-metadata" ${config.addMetadata ? 'checked' : ''}>
            <label for="ds-metadata">添加元数据 (YAML frontmatter)</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-advanced-uri" ${config.useAdvancedUri ? 'checked' : ''}>
            <label for="ds-advanced-uri">使用 Advanced URI 插件</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-embed-images" ${config.embedImages ? 'checked' : ''}>
            <label for="ds-embed-images">嵌入图片 (Base64)</label>
            <div class="ds-hint" style="margin-left: 26px; margin-top: 2px;">解决手机端图片无法显示问题，会增加文件大小</div>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-download-images" ${config.downloadImages ? 'checked' : ''}>
            <label for="ds-download-images">下载图片/视频到 Vault 文件夹</label>
            <div class="ds-hint" style="margin-left: 26px; margin-top: 2px; color: #ef4444;">需要安装 Obsidian 社区插件「Local REST API」</div>
          </div>
          <div id="ds-download-images-panel" style="margin-left: 26px; ${config.downloadImages ? '' : 'display:none;'}">
            <div class="ds-form-group">
              <label>API Key</label>
              <input type="password" id="ds-rest-api-key" value="${config.restApiKey}" placeholder="粘贴你的 API Key">
            </div>
            <div class="ds-form-group">
              <label>端口</label>
              <input type="number" id="ds-rest-api-port" value="${config.restApiPort}" min="1" max="65535" style="width: 100px;">
              <span class="ds-hint" style="margin-left: 8px;">默认 27123</span>
            </div>
            <div class="ds-form-group" style="display: flex; gap: 8px;">
              <button class="ds-btn ds-btn-secondary" id="ds-test-rest-api" style="flex: none; padding: 6px 12px;">测试连接</button>
              <span id="ds-rest-api-status" style="line-height: 30px; color: #6b7280; font-size: 13px;"></span>
            </div>
            <div class="ds-form-group ds-checkbox-group">
              <input type="checkbox" id="ds-download-videos" ${config.downloadVideos ? 'checked' : ''}>
              <label for="ds-download-videos">同时下载视频文件</label>
            </div>
            <div class="ds-form-group">
              <label>媒体文件夹名称</label>
              <input type="text" id="ds-media-folder-name" value="${config.mediaFolderName || 'media'}" placeholder="media">
              <span class="ds-hint">媒体文件保存到 Vault 中此文件夹下，默认 media</span>
            </div>
          </div>

          <div class="ds-section-title">Notion 设置</div>

          <div class="ds-form-group">
            <label>Notion API Token</label>
            <input type="text" id="ds-notion-token" value="${config.notionToken}" placeholder="secret_xxx...">
            <div class="ds-hint">从 Notion 集成页面获取</div>
          </div>

          <div class="ds-form-group">
            <label>Database ID</label>
            <input type="text" id="ds-notion-db" value="${config.notionDatabaseId}" placeholder="32位数据库ID">
          </div>

          <div class="ds-form-group" style="display: flex; gap: 8px;">
            <button class="ds-btn ds-btn-secondary" id="ds-test-notion" style="flex: none; padding: 8px 16px;">测试连接</button>
            <span id="ds-notion-status" style="line-height: 36px; color: #6b7280; font-size: 13px;"></span>
          </div>

          <div class="ds-section-title">飞书设置</div>

          <div class="ds-form-group">
            <label>API 版本</label>
            <select id="ds-feishu-domain" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;">
              <option value="feishu" ${config.feishuApiDomain !== 'lark' ? 'selected' : ''}>飞书国内版 (feishu.cn)</option>
              <option value="lark" ${config.feishuApiDomain === 'lark' ? 'selected' : ''}>Lark 国际版 (larksuite.com)</option>
            </select>
          </div>

          <div class="ds-form-group">
            <label>App ID</label>
            <input type="text" id="ds-feishu-app-id" value="${config.feishuAppId}" placeholder="cli_xxxxxxxxxxxxxxxx">
          </div>

          <div class="ds-form-group">
            <label>App Secret</label>
            <input type="password" id="ds-feishu-app-secret" value="${config.feishuAppSecret}" placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx">
          </div>

          <div class="ds-form-group">
            <label>多维表格 app_token</label>
            <input type="text" id="ds-feishu-app-token" value="${config.feishuAppToken}" placeholder="bascnxxxxxxxxxxxxxxxx">
            <div class="ds-hint">从多维表格 URL 中 /base/ 后到 ? 之前的部分</div>
          </div>

          <div class="ds-form-group">
            <label>数据表 table_id</label>
            <input type="text" id="ds-feishu-table-id" value="${config.feishuTableId}" placeholder="tblxxxxxxxxxxxxxxxx">
            <div class="ds-hint">从多维表格 URL 中 ?table= 后面的部分（以 tbl 开头）</div>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-feishu-upload-content" ${config.feishuUploadContent !== false ? 'checked' : ''}>
            <label for="ds-feishu-upload-content">上传正文到「正文」字段</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-feishu-upload-attachment" ${config.feishuUploadAttachment ? 'checked' : ''}>
            <label for="ds-feishu-upload-attachment">上传 MD 文件作为附件</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-feishu-upload-html" ${config.feishuUploadHtml ? 'checked' : ''}>
            <label for="ds-feishu-upload-html">上传 HTML 文件作为附件</label>
          </div>

          <div class="ds-form-group" style="display: flex; gap: 8px;">
            <button class="ds-btn ds-btn-secondary" id="ds-test-feishu" style="flex: none; padding: 8px 16px;">测试连接</button>
            <span id="ds-feishu-status" style="line-height: 36px; color: #6b7280; font-size: 13px;"></span>
          </div>

          <div class="ds-section-title">HTML 导出设置</div>

          <div class="ds-form-group">
            <label>导出文件夹名</label>
            <input type="text" id="ds-html-folder" value="${config.htmlExportFolder}" placeholder="Discourse导出">
            <div class="ds-hint">下载的HTML文件将使用此前缀</div>
          </div>

          <div class="ds-section-title">评论设置</div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-comments" ${config.saveComments ? 'checked' : ''}>
            <label for="ds-comments">保存评论</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-fold" ${config.foldComments ? 'checked' : ''}>
            <label for="ds-fold">折叠评论 (使用 details 标签)</label>
          </div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-all-comments" ${config.saveAllComments ? 'checked' : ''}>
            <label for="ds-all-comments">保存全部评论</label>
            <div class="ds-hint" style="margin-left: 26px; margin-top: 2px;">与"楼层范围"互斥</div>
          </div>

          <div class="ds-form-group">
            <label>评论数量上限</label>
            <input type="number" id="ds-comment-count" value="${config.commentCount}" min="1" max="9999">
            <div class="ds-hint">当不勾选"保存全部"时生效</div>
          </div>

          <div class="ds-section-title">楼层范围</div>

          <div class="ds-form-group ds-checkbox-group">
            <input type="checkbox" id="ds-floor-range" ${config.useFloorRange ? 'checked' : ''}>
            <label for="ds-floor-range">启用楼层范围过滤</label>
            <div class="ds-hint" style="margin-left: 26px; margin-top: 2px;">与"保存全部评论"互斥</div>
          </div>

          <div class="ds-form-group" style="display: flex; gap: 12px;">
            <div style="flex: 1;">
              <label>起始楼层</label>
              <input type="number" id="ds-floor-from" value="${config.floorFrom}" min="1">
            </div>
            <div style="flex: 1;">
              <label>结束楼层</label>
              <input type="number" id="ds-floor-to" value="${config.floorTo}" min="1">
            </div>
          </div>

          <div class="ds-btn-group" style="flex-wrap:wrap;gap:8px;">
            <button class="ds-btn ds-btn-secondary" id="ds-cancel" style="flex:1;min-width:80px;">取消</button>
            <button class="ds-btn ds-btn-secondary" id="ds-export-config" style="flex:1;min-width:80px;">导出配置</button>
            <label class="ds-btn ds-btn-secondary" id="ds-import-config-label" style="flex:1;min-width:80px;text-align:center;cursor:pointer;margin:0;">导入配置<input type="file" id="ds-import-config" accept=".json" style="display:none;"></label>
            <button class="ds-btn ds-btn-primary" id="ds-save" style="flex:2;min-width:120px;">保存设置</button>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      // 互斥逻辑：saveAllComments 和 useFloorRange
      const allCommentsCheckbox = overlay.querySelector('#ds-all-comments');
      const floorRangeCheckbox = overlay.querySelector('#ds-floor-range');

      allCommentsCheckbox.addEventListener('change', () => {
        if (allCommentsCheckbox.checked) {
          floorRangeCheckbox.checked = false;
        }
      });

      floorRangeCheckbox.addEventListener('change', () => {
        if (floorRangeCheckbox.checked) {
          allCommentsCheckbox.checked = false;
        }
      });

      // 测试Notion连接
      overlay.querySelector('#ds-test-notion').addEventListener('click', async () => {
        const token = overlay.querySelector('#ds-notion-token').value.trim();
        const dbId = overlay.querySelector('#ds-notion-db').value.trim();
        const statusEl = overlay.querySelector('#ds-notion-status');

        if (!token || !dbId) {
          statusEl.textContent = '请填写Token和Database ID';
          statusEl.style.color = '#ef4444';
          return;
        }

        statusEl.textContent = '测试中...';
        statusEl.style.color = '#6b7280';

        try {
          const result = await SaveModule.testNotionConnection(token, dbId);
          if (result.success) {
            statusEl.textContent = '连接成功!';
            statusEl.style.color = '#22c55e';
          } else {
            statusEl.textContent = '连接失败: ' + result.error;
            statusEl.style.color = '#ef4444';
          }
        } catch (e) {
          statusEl.textContent = '测试出错: ' + e.message;
          statusEl.style.color = '#ef4444';
        }
      });

      // 测试飞书连接
      overlay.querySelector('#ds-test-feishu').addEventListener('click', async () => {
        const appId = overlay.querySelector('#ds-feishu-app-id').value.trim();
        const appSecret = overlay.querySelector('#ds-feishu-app-secret').value.trim();
        const domain = overlay.querySelector('#ds-feishu-domain').value;
        const statusEl = overlay.querySelector('#ds-feishu-status');

        if (!appId || !appSecret) {
          statusEl.textContent = '请先填写 App ID 和 App Secret';
          statusEl.style.color = '#ef4444';
          return;
        }

        statusEl.textContent = '测试中...';
        statusEl.style.color = '#6b7280';

        try {
          const result = await SaveModule.testFeishuConnection(appId, appSecret, domain);
          if (result.success) {
            statusEl.textContent = '连接成功，Token 已获取';
            statusEl.style.color = '#22c55e';
          } else {
            statusEl.textContent = '连接失败: ' + result.error;
            statusEl.style.color = '#ef4444';
          }
        } catch (e) {
          statusEl.textContent = '测试出错: ' + e.message;
          statusEl.style.color = '#ef4444';
        }
      });

      // 下载图片 checkbox 显隐
      overlay.querySelector('#ds-download-images').addEventListener('change', (e) => {
        overlay.querySelector('#ds-download-images-panel').style.display = e.target.checked ? '' : 'none';
      });

      // 测试 REST API 连接
      overlay.querySelector('#ds-test-rest-api').addEventListener('click', async () => {
        const statusEl = overlay.querySelector('#ds-rest-api-status');
        const apiKey = overlay.querySelector('#ds-rest-api-key').value.trim();
        const apiPort = parseInt(overlay.querySelector('#ds-rest-api-port').value) || 27123;

        statusEl.textContent = '正在测试...';
        statusEl.style.color = '#6b7280';

        try {
          const result = await UtilModule.testRestApiConnection(apiKey, apiPort);
          if (result.success) {
            statusEl.textContent = '连接成功';
            statusEl.style.color = '#10b981';
          } else {
            statusEl.textContent = result.message;
            statusEl.style.color = '#ef4444';
          }
        } catch (e) {
          statusEl.textContent = '测试失败: ' + e.message;
          statusEl.style.color = '#ef4444';
        }
      });

      // OB 测试按钮（使用 v4.3.8 验证过的剪贴板方式）
      overlay.querySelector('#ds-test-ob').addEventListener('click', async () => {
        const vaultName = overlay.querySelector('#ds-vault').value.trim();
        const folderPath = overlay.querySelector('#ds-folder').value.trim() || 'Discourse收集箱';
        const encode = (str) => encodeURIComponent(str);

        console.log('[Discourse Saver] OB 测试: vault=' + vaultName + ', folder=' + folderPath);

        // 测试内容
        const testContent = '# Discourse Saver 测试\n\n如果你看到这个文件，说明连接成功！\n\n时间: ' + new Date().toISOString();

        try {
          // 步骤1：写入剪贴板（v4.3.8 方式）
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(testContent);
            console.log('[Discourse Saver] 测试内容已写入剪贴板 (原生API)');
          } else {
            GM_setClipboard(testContent, 'text');
            console.log('[Discourse Saver] 测试内容已写入剪贴板 (GM API)');
          }

          // 步骤2：构建 URI（始终用 clipboard=true）
          const vaultParam = vaultName ? 'vault=' + encode(vaultName) + '&' : '';
          const testUri = 'obsidian://advanced-uri?' + vaultParam +
            'filepath=' + encode(folderPath + '/DS-测试文件.md') + '&' +
            'clipboard=true&' +
            'mode=overwrite';

          console.log('[Discourse Saver] 测试 URI:', testUri);

          alert('测试内容已复制到剪贴板。\n\n即将打开 Obsidian，如果成功会在 "' + folderPath + '" 文件夹中看到 "DS-测试文件.md"');

          window.location.href = testUri;
        } catch (e) {
          console.error('[Discourse Saver] 测试失败:', e);
          alert('测试失败: ' + e.message + '\n\n请确保浏览器允许剪贴板访问。');
        }
      });

      // 取消按钮
      overlay.querySelector('#ds-cancel').addEventListener('click', () => {
        overlay.remove();
      });

      // 导出配置
      overlay.querySelector('#ds-export-config').addEventListener('click', () => {
        const cfg = ConfigModule.get();
        const json = JSON.stringify(cfg, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'discourse-saver-config.json';
        a.click();
        URL.revokeObjectURL(url);
        UtilModule.showNotification('配置已导出', 'success');
      });

      // 导入配置
      overlay.querySelector('#ds-import-config').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const imported = JSON.parse(ev.target.result);
            ConfigModule.setAll(imported);
            overlay.remove();
            UtilModule.showNotification('配置已导入，重新打开设置即可看到', 'success');
          } catch (err) {
            UtilModule.showNotification('导入失败：JSON 格式不正确', 'error');
          }
        };
        reader.readAsText(file);
      });

      // 保存按钮
      overlay.querySelector('#ds-save').addEventListener('click', () => {
        const newConfig = {
          // 自定义站点
          customSites: overlay.querySelector('#ds-custom-sites').value.trim(),
          // 保存目标
          saveToObsidian: overlay.querySelector('#ds-save-obsidian').checked,
          saveToNotion: overlay.querySelector('#ds-save-notion').checked,
          saveToFeishu: overlay.querySelector('#ds-save-feishu').checked,
          exportHtml: overlay.querySelector('#ds-export-html').checked,
          // Obsidian设置
          vaultName: overlay.querySelector('#ds-vault').value.trim(),
          folderPath: overlay.querySelector('#ds-folder').value.trim() || 'Discourse收集箱',
          addMetadata: overlay.querySelector('#ds-metadata').checked,
          useAdvancedUri: overlay.querySelector('#ds-advanced-uri').checked,
          embedImages: overlay.querySelector('#ds-embed-images').checked,
          // 下载图片到本地
          downloadImages: overlay.querySelector('#ds-download-images').checked,
          downloadVideos: overlay.querySelector('#ds-download-videos').checked,
          restApiKey: overlay.querySelector('#ds-rest-api-key').value.trim(),
          restApiPort: parseInt(overlay.querySelector('#ds-rest-api-port').value) || 27123,
          mediaFolderName: overlay.querySelector('#ds-media-folder-name').value.trim() || 'media',
          // Notion设置
          notionToken: overlay.querySelector('#ds-notion-token').value.trim(),
          notionDatabaseId: overlay.querySelector('#ds-notion-db').value.trim(),
          // 飞书设置
          feishuApiDomain: overlay.querySelector('#ds-feishu-domain').value,
          feishuAppId: overlay.querySelector('#ds-feishu-app-id').value.trim(),
          feishuAppSecret: overlay.querySelector('#ds-feishu-app-secret').value.trim(),
          feishuAppToken: overlay.querySelector('#ds-feishu-app-token').value.trim(),
          feishuTableId: overlay.querySelector('#ds-feishu-table-id').value.trim(),
          feishuUploadContent: overlay.querySelector('#ds-feishu-upload-content').checked,
          feishuUploadAttachment: overlay.querySelector('#ds-feishu-upload-attachment').checked,
          feishuUploadHtml: overlay.querySelector('#ds-feishu-upload-html').checked,
          // HTML设置
          htmlExportFolder: overlay.querySelector('#ds-html-folder').value.trim() || 'Discourse导出',
          // 评论设置
          saveComments: overlay.querySelector('#ds-comments').checked,
          foldComments: overlay.querySelector('#ds-fold').checked,
          saveAllComments: overlay.querySelector('#ds-all-comments').checked,
          commentCount: parseInt(overlay.querySelector('#ds-comment-count').value) || 100,
          // 楼层范围
          useFloorRange: overlay.querySelector('#ds-floor-range').checked,
          floorFrom: parseInt(overlay.querySelector('#ds-floor-from').value) || 1,
          floorTo: parseInt(overlay.querySelector('#ds-floor-to').value) || 100
        };

        ConfigModule.setAll(newConfig);
        overlay.remove();
        UtilModule.showNotification('设置已保存', 'success');
      });

      // 点击遮罩关闭
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.remove();
        }
      });
    }

    // 初始化
    function init() {
      // 检测是否是 Discourse 论坛
      const isDiscourse = ExtractModule.isDiscourseForumPage();
      const isTopicPageNow = ExtractModule.isTopicPage();

      console.log('[Discourse Saver] 检测结果:');
      console.log('[Discourse Saver] - 是否 Discourse 论坛:', isDiscourse);
      console.log('[Discourse Saver] - 是否帖子页面:', isTopicPageNow);
      console.log('[Discourse Saver] - 当前 URL:', window.location.href);

      injectStyles();
      createFloatingButton();

      // 注册油猴菜单
      GM_registerMenuCommand('⚙️ 设置', showSettingsPanel);
      GM_registerMenuCommand('📥 保存当前帖子（全部目标）', () => SaveModule.save(null));
      GM_registerMenuCommand('📝 仅保存到 Obsidian', () => SaveModule.saveToObsidianOnly(null));
      GM_registerMenuCommand('📑 仅保存到 Notion', () => SaveModule.saveToNotionOnly(null));
      GM_registerMenuCommand('🐦 仅保存到飞书', () => SaveModule.saveToFeishuOnly(null));
      GM_registerMenuCommand('📄 仅导出为 HTML', () => SaveModule.exportHtmlOnly(null));
      GM_registerMenuCommand('💾 下载大文件（备选）', () => SaveModule.downloadLastLargeFile());
      GM_registerMenuCommand('🔍 调试信息', () => {
        const info = {
          isDiscourse: ExtractModule.isDiscourseForumPage(),
          isTopicPage: ExtractModule.isTopicPage(),
          url: window.location.href,
          title: document.title,
          hasTopicTitle: !!document.querySelector('#topic-title h1, .fancy-title'),
          hasCooked: !!document.querySelector('.cooked'),
          hasPostStream: !!document.querySelector('.post-stream, .topic-post')
        };
        console.log('[Discourse Saver] 调试信息:', info);
        alert('调试信息已输出到控制台 (F12)\n\n' +
              '是否 Discourse: ' + info.isDiscourse + '\n' +
              '是否帖子页面: ' + info.isTopicPage + '\n' +
              '找到标题: ' + info.hasTopicTitle + '\n' +
              '找到内容: ' + info.hasCooked + '\n' +
              '找到帖子流: ' + info.hasPostStream);
      });

      console.log('[Discourse Saver] 油猴脚本已加载 (V5.5.9)');
    }

    return { init, showSettingsPanel };
  })();

  // ============================================================
  // 启动脚本
  // ============================================================
  UIModule.init();

})();

