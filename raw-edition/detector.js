// Discourse Saver - 站点检测器 V4.0.3
// 自动检测 Discourse 论坛并加载主脚本

(function() {
  'use strict';

  // 运行日志辅助（发送到 background.js 日志管理器）
  function rlog(level, message) {
    try {
      chrome.runtime.sendMessage({ action: 'log', level, source: 'detector', message });
    } catch (_) { /* 扩展上下文失效时忽略 */ }
  }

  // 已知 Discourse 论坛域名列表（快速匹配，无需等待 DOM 检测）
  const KNOWN_DISCOURSE_HOSTS = [
    // 热门论坛
    'linux.do',
    'meta.discourse.org',
    'community.openai.com',
    'forum.obsidian.md',
    'forum.cursor.com',
    'community.cloudflare.com',
    'forums.docker.com',
    'discuss.python.org',
    'forum.gitlab.com',
    'discuss.hashicorp.com',
    'discuss.elastic.co',
    'community.home-assistant.io',
    'community.bitwarden.com',
    'forum.proxmox.com',
    'forum.unity.com',
    'forums.unrealengine.com',
    'community.letsencrypt.org',
    'forum.seafile.com',
    'forum.syncthing.net',
    'forum.owncloud.com',
    // 编程语言/框架
    'users.rust-lang.org',
    'discourse.haskell.org',
    'discourse.julialang.org',
    'discourse.nixos.org',
    'discourse.llvm.org',
    'discuss.rubyonrails.org',
    'discuss.ocaml.org',
    'discuss.kotlinlang.org',
    'discuss.flarum.org',
    'discuss.emberjs.com',
    'elixirforum.com',
    'discourse.naaln.com',
    'discuss.grin.mw',
    // 开发者工具/平台
    'discourse.mozilla.org',
    'forums.swift.org',
    'forum.rclone.org',
    'community.fly.io',
    'community.render.com',
    'community.grafana.com',
    'community.hivemq.com',
    'community.paperspace.com',
    'discuss.codecademy.com',
    'discuss.atom.io',
    'forum.taichi-lang.org',
    // Trae
    'trae.ai',
    'www.trae.ai',
    'trae.com.cn',
    'www.trae.com.cn'
  ];

  // 通配符匹配的域名模式
  const KNOWN_DISCOURSE_PATTERNS = [
    /\.discourse\.group$/i  // 所有 *.discourse.group 子域名
  ];

  // 快速检查是否是已知的 Discourse 论坛
  function isKnownDiscourseHost() {
    const host = window.location.hostname.toLowerCase();
    // 精确匹配
    if (KNOWN_DISCOURSE_HOSTS.includes(host)) {
      console.log('[Discourse Saver] 已知 Discourse 论坛: ' + host);
      rlog('INFO', '已知Discourse站点命中: ' + host);
      return true;
    }
    // 通配符匹配
    for (const pattern of KNOWN_DISCOURSE_PATTERNS) {
      if (pattern.test(host)) {
        console.log('[Discourse Saver] 匹配 Discourse 域名模式: ' + host);
        rlog('INFO', 'Discourse域名模式命中: ' + host);
        return true;
      }
    }
    return false;
  }

  // 检测当前站点是否是 Discourse 论坛
  function isDiscourseSite() {
    // 方法1: 检测 meta generator 标签
    const metaGenerator = document.querySelector('meta[name="generator"]');
    if (metaGenerator && metaGenerator.content && metaGenerator.content.includes('Discourse')) {
      console.log('[Discourse Saver] 通过 meta generator 检测到 Discourse');
      rlog('INFO', '检测命中: meta generator (' + window.location.hostname + ')');
      return true;
    }

    // 方法2: 检测 Discourse 特有的 DOM 结构
    if (document.querySelector('#discourse-main') ||
        document.querySelector('.topic-list') ||
        document.querySelector('.topic-post') ||
        document.querySelector('[data-discourse-helper]')) {
      console.log('[Discourse Saver] 通过 DOM 结构检测到 Discourse');
      rlog('INFO', '检测命中: DOM结构 (' + window.location.hostname + ')');
      return true;
    }

    // 方法3: 检测 Discourse 特有的 CSS 类
    if (document.body.classList.contains('discourse') ||
        document.documentElement.classList.contains('discourse-ember')) {
      console.log('[Discourse Saver] 通过 CSS 类检测到 Discourse');
      rlog('INFO', '检测命中: CSS类 (' + window.location.hostname + ')');
      return true;
    }

    // 方法4: 检测 Discourse 的 Ember.js 应用标识
    if (document.querySelector('#ember-testing-container') ||
        document.querySelector('.ember-view.application') ||
        document.querySelector('[id^="ember"]')) {
      // 需要进一步确认是 Discourse 而不是其他 Ember 应用
      if (document.querySelector('.topic-body') ||
          document.querySelector('.post-stream') ||
          document.querySelector('.category-list')) {
        console.log('[Discourse Saver] 通过 Ember + Discourse 特征检测到');
        rlog('INFO', '检测命中: Ember+Discourse (' + window.location.hostname + ')');
        return true;
      }
    }

    return false;
  }

  // 检查当前站点是否在用户的自定义站点列表中
  async function isInCustomSiteList() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ customSites: [] }, (config) => {
        const currentHost = window.location.hostname;
        const isCustomSite = config.customSites.some(site => {
          try {
            const siteHost = new URL(site.startsWith('http') ? site : 'https://' + site).hostname;
            return currentHost === siteHost || currentHost.endsWith('.' + siteHost);
          } catch {
            return currentHost.includes(site);
          }
        });
        resolve(isCustomSite);
      });
    });
  }

  // 检查插件是否启用
  async function isPluginEnabled() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ pluginEnabled: true }, (config) => {
        resolve(config.pluginEnabled);
      });
    });
  }

  // 加载主脚本
  function loadMainScripts() {
    console.log('[Discourse Saver] 正在加载主脚本...');
    rlog('INFO', '请求注入主脚本: ' + window.location.href.substring(0, 80));

    // 通知 background script 注入主脚本
    chrome.runtime.sendMessage({
      action: 'injectContentScript',
      tabUrl: window.location.href
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Discourse Saver] 加载主脚本失败:', chrome.runtime.lastError);
        rlog('ERROR', '注入请求失败: ' + chrome.runtime.lastError.message);
        return;
      }
      if (response && response.success) {
        console.log('[Discourse Saver] 主脚本加载成功');
        rlog('INFO', '主脚本注入成功');
      } else {
        rlog('WARN', '主脚本注入响应异常: ' + JSON.stringify(response));
      }
    });
  }

  // 防止同一页面重复注入
  let injectedUrl = null;

  // 主检测逻辑
  async function detect() {
    // 检查插件是否启用
    const enabled = await isPluginEnabled();
    if (!enabled) {
      console.log('[Discourse Saver] 插件已禁用');
      rlog('INFO', '插件已禁用，跳过检测');
      return;
    }

    // 同一URL不重复注入
    if (injectedUrl === location.href) {
      return;
    }

    // 快速匹配已知 Discourse 论坛（无需等待 DOM 加载）
    const isKnown = isKnownDiscourseHost();

    // 检查是否是 Discourse 站点（DOM 检测）
    const isDiscourse = isKnown || isDiscourseSite();

    // 检查是否在自定义站点列表中
    const isCustom = await isInCustomSiteList();

    if (isDiscourse || isCustom) {
      const reason = isDiscourse ? '自动检测' : '自定义站点';
      console.log(`[Discourse Saver] 检测到 Discourse 论坛 (${reason}): ${window.location.hostname}`);
      rlog('INFO', '确认Discourse站点 (' + reason + '): ' + window.location.hostname);
      injectedUrl = location.href;
      loadMainScripts();
    } else {
      console.log('[Discourse Saver] 非 Discourse 站点，跳过');
      rlog('DEBUG', '非Discourse站点: ' + window.location.hostname);
    }
  }

  // 延迟检测，等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(detect, 100);
    });
  } else {
    setTimeout(detect, 100);
  }

  // 监听 SPA 导航
  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      injectedUrl = null; // URL变了，允许新页面注入
      setTimeout(detect, 500);
    }
  });
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }

})();
