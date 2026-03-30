// Discourse Saver - 站点检测器 V4.0.2
// 自动检测 Discourse 论坛并加载主脚本

(function() {
  'use strict';

  // 检测当前站点是否是 Discourse 论坛
  function isDiscourseSite() {
    // 方法1: 检测 meta generator 标签
    const metaGenerator = document.querySelector('meta[name="generator"]');
    if (metaGenerator && metaGenerator.content && metaGenerator.content.includes('Discourse')) {
      console.log('[Discourse Saver] 通过 meta generator 检测到 Discourse');
      return true;
    }

    // 方法2: 检测 Discourse 特有的 DOM 结构
    if (document.querySelector('#discourse-main') ||
        document.querySelector('.topic-list') ||
        document.querySelector('.topic-post') ||
        document.querySelector('[data-discourse-helper]')) {
      console.log('[Discourse Saver] 通过 DOM 结构检测到 Discourse');
      return true;
    }

    // 方法3: 检测 Discourse 特有的 CSS 类
    if (document.body.classList.contains('discourse') ||
        document.documentElement.classList.contains('discourse-ember')) {
      console.log('[Discourse Saver] 通过 CSS 类检测到 Discourse');
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

    // 通知 background script 注入主脚本
    chrome.runtime.sendMessage({
      action: 'injectContentScript',
      tabUrl: window.location.href
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[Discourse Saver] 加载主脚本失败:', chrome.runtime.lastError);
        return;
      }
      if (response && response.success) {
        console.log('[Discourse Saver] 主脚本加载成功');
      }
    });
  }

  // 主检测逻辑
  async function detect() {
    // 检查插件是否启用
    const enabled = await isPluginEnabled();
    if (!enabled) {
      console.log('[Discourse Saver] 插件已禁用');
      return;
    }

    // 检查是否是 Discourse 站点
    const isDiscourse = isDiscourseSite();

    // 检查是否在自定义站点列表中
    const isCustom = await isInCustomSiteList();

    if (isDiscourse || isCustom) {
      const reason = isDiscourse ? '自动检测' : '自定义站点';
      console.log(`[Discourse Saver] 检测到 Discourse 论坛 (${reason}): ${window.location.hostname}`);
      loadMainScripts();
    } else {
      console.log('[Discourse Saver] 非 Discourse 站点，跳过');
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
      setTimeout(detect, 500);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

})();
