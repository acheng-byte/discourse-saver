#!/usr/bin/env node
/**
 * Discourse Saver - 版本号统一更新脚本
 * 用法: node update-version.js <新版本号>
 * 示例: node update-version.js 1.1.3
 *
 * 自动更新以下文件中的版本号：
 * - manifest.json
 * - background.js (日志注释)
 * - i18n.js (中英文 subtitle)
 * - options.html (subtitle + footer)
 * - README.md / README_EN.md (标题)
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = __dirname;

// 从 manifest.json 读取当前版本号
function getCurrentVersion() {
  const manifestPath = path.join(RAW_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return manifest.version;
}

// 替换文件中的版本号
function replaceInFile(filePath, oldVersion, newVersion, patterns) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { pattern, replacement } of patterns) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ ${path.basename(filePath)}`);
  } else {
    console.log(`  ️  ${path.basename(filePath)} (未找到匹配)`);
  }
}

function main() {
  const newVersion = process.argv[2];

  if (!newVersion) {
    console.error('用法: node update-version.js <新版本号>');
    console.error('示例: node update-version.js 1.1.3');
    process.exit(1);
  }

  // 验证版本号格式
  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    console.error('错误: 版本号格式应为 X.Y.Z（如 1.1.3）');
    process.exit(1);
  }

  const oldVersion = getCurrentVersion();
  console.log(`\n📦 Discourse Saver 版本更新: ${oldVersion} → ${newVersion}\n`);

  // 1. background.js
  replaceInFile(
    path.join(RAW_DIR, 'background.js'),
    oldVersion, newVersion,
    [
      { pattern: new RegExp(`V${oldVersion.replace(/\./g, '\\.')}`, 'g'), replacement: `V${newVersion}` }
    ]
  );

  // 2. i18n.js (中英文 subtitle)
  replaceInFile(
    path.join(RAW_DIR, 'i18n.js'),
    oldVersion, newVersion,
    [
      { pattern: new RegExp(`V${oldVersion.replace(/\./g, '\\.')}`, 'g'), replacement: `V${newVersion}` }
    ]
  );

  // 3. options.html (subtitle + footer)
  replaceInFile(
    path.join(RAW_DIR, 'options.html'),
    oldVersion, newVersion,
    [
      { pattern: new RegExp(`V${oldVersion.replace(/\./g, '\\.')}`, 'g'), replacement: `V${newVersion}` },
      { pattern: new RegExp(`v${oldVersion.replace(/\./g, '\\.')}`, 'g'), replacement: `v${newVersion}` }
    ]
  );

  // 4. README.md
  replaceInFile(
    path.join(RAW_DIR, 'README.md'),
    oldVersion, newVersion,
    [
      { pattern: new RegExp(`v${oldVersion.replace(/\./g, '\\.')}`, 'g'), replacement: `v${newVersion}` }
    ]
  );

  // 5. README_EN.md
  replaceInFile(
    path.join(RAW_DIR, 'README_EN.md'),
    oldVersion, newVersion,
    [
      { pattern: new RegExp(`v${oldVersion.replace(/\./g, '\\.')}`, 'g'), replacement: `v${newVersion}` }
    ]
  );

  // 6. manifest.json（最后更新，因为 getCurrentVersion() 依赖它读取旧版本）
  const manifestPath = path.join(RAW_DIR, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = newVersion;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log('  ✅ manifest.json');

  console.log(`\n✅ 版本已更新为 ${newVersion}`);
  console.log('   请记得 git commit + push + 创建 Release\n');
}

main();
