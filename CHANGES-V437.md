# Discourse Saver V4.3.7 修改清单

## 本次修改概要

### 主要功能更新

1. **Obsidian 标签格式修复** - 标签现在正确放入 frontmatter 元数据中，使用 Obsidian 标准 `tags` 字段
2. **飞书字段验证更新** - 从 7 个字段扩展为 9 个字段（新增分类、标签）
3. **评论楼层范围选择** - 新增自定义保存指定楼层范围的评论功能
4. **Notion Tags 支持** - Multi Select 类型的标签字段

---

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| content.js | 1. Obsidian frontmatter 标签格式修复<br>2. 楼层范围过滤逻辑<br>3. 三选一互斥模式获取逻辑<br>4. DEFAULT_CONFIG 添加楼层范围配置 |
| background.js | 1. 飞书 REQUIRED_FIELDS 更新为9个字段<br>2. Notion Tags multi_select 支持<br>3. 更新错误提示信息 |
| options.html | 1. 添加楼层范围选择UI<br>2. 三选一模式提示<br>3. Notion 标签配置说明 |
| options.js | 1. 楼层范围配置保存/加载<br>2. updateFloorRangeVisibility 函数<br>3. 三选一互斥逻辑（禁用评论数量输入框） |
| i18n.js | 1. 楼层范围相关中英文翻译<br>2. 飞书字段说明更新<br>3. 新增 modeHint 翻译 |
| FEISHU-FIELD-VALIDATION.md | 字段数量从7更新为9 |
| FEISHU-GUIDE.html | 字段配置说明更新为9个字段 |
| docs/feishu-guide.html | 同上 |
| README.md | 飞书字段验证说明更新 |

---

## 详细修改

### 1. Obsidian 标签格式修复 (content.js)

**修改前（错误）**：
```yaml
---
来源: url
标题: title
...
---

#linuxdo #AI #工具
```

**修改后（正确）**：
```yaml
---
来源: url
标题: title
作者: author
分类: 技术
tags: [linuxdo, AI, 工具]
保存时间: 2026-03-15 10:00:00
评论数: 50
---
```

使用 Obsidian 标准的 `tags` 字段（英文），数组格式 `[tag1, tag2]`，可被 Obsidian 自动识别。

### 2. 飞书 9 个必需字段 (background.js)

```javascript
// V4.3.7: 9个字段
const REQUIRED_FIELDS = [
  { name: '标题', type: FIELD_TYPES.TEXT, desc: '文本' },
  { name: '链接', type: FIELD_TYPES.URL, desc: '超链接' },
  { name: '作者', type: FIELD_TYPES.TEXT, desc: '文本' },
  { name: '分类', type: FIELD_TYPES.TEXT, desc: '文本' },      // 新增
  { name: '标签', type: FIELD_TYPES.TEXT, desc: '文本' },      // 新增
  { name: '保存时间', type: FIELD_TYPES.DATE, desc: '日期' },
  { name: '评论数', type: FIELD_TYPES.NUMBER, desc: '数字' },
  { name: '附件', type: FIELD_TYPES.ATTACHMENT, desc: '附件' },
  { name: '正文', type: FIELD_TYPES.TEXT, desc: '文本' }
];
```

### 3. 评论楼层范围选择 (options.html + options.js + content.js)

**UI 位置**：评论设置 → 指定楼层范围

**三选一互斥模式**：
- **自定义数量**（默认）：获取指定数量的评论
- **保存全部**：获取帖子的全部评论
- **指定楼层范围**：只保存指定楼层区间的评论

三个选项互斥，启用一个会自动禁用其他选项。

**配置项**：
- `useFloorRange`: 是否启用楼层范围
- `floorFrom`: 起始楼层（默认1）
- `floorTo`: 结束楼层（默认100）

**获取逻辑**：
```javascript
// V4.3.7: 三种互斥模式
if (config.useFloorRange) {
  // 楼层范围模式：获取到 floorTo 楼的评论
  const floorTo = config.floorTo || 100;
  effectiveCommentCount = floorTo;
}
```

**过滤逻辑**：
```javascript
// V4.3.7: 根据楼层范围过滤评论
if (config.useFloorRange && comments.length > 0) {
  const floorFrom = config.floorFrom || 1;
  const floorTo = config.floorTo || 100;
  comments = comments.filter(c => {
    const pos = parseInt(c.position);
    return pos >= floorFrom && pos <= floorTo;
  });
}
```

### 4. Notion Tags 支持 (background.js)

```javascript
// V4.3.7: Tags (标签) - multi_select 类型
if (config.notionPropTags && postData.tags && postData.tags.length > 0) {
  const tagsArray = Array.isArray(postData.tags) ? postData.tags : [postData.tags];
  const validTags = tagsArray
    .map(t => String(t).trim())
    .filter(t => t.length > 0);

  if (validTags.length > 0) {
    properties[config.notionPropTags] = {
      multi_select: validTags.slice(0, 10).map(t => ({ name: t.substring(0, 100) }))
    };
  }
}
```

### 5. i18n 翻译 (i18n.js)

**中文**：
```javascript
comments: {
  useFloorRange: '指定楼层范围',
  floorFrom: '从第',
  floorTo: '楼到第',
  floorUnit: '楼',
  floorRangeHelp: '只保存指定范围内的楼层评论',
}

feishu: {
  perm3Title: '3. 多维表格字段（9个必填）：',
  perm3Content1: '标题（文本）、链接（超链接）、作者（文本）、分类（文本）、标签（文本）、保存时间（日期）、评论数（数字）',
}
```

**英文**：
```javascript
comments: {
  useFloorRange: 'Specify Floor Range',
  floorFrom: 'From floor',
  floorTo: 'to floor',
  floorUnit: '',
  floorRangeHelp: 'Only save comments within the specified floor range',
}

feishu: {
  perm3Title: '3. Bitable Fields (9 required):',
  perm3Content1: 'Title (Text), Link (Hyperlink), Author (Text), Category (Text), Tags (Text), Save Time (Date), Comments (Number)',
}
```

---

## 数据库配置

### Notion Database 属性

| 属性名 | 类型 | 说明 |
|-------|------|------|
| 标题 | Title | 必填 |
| 链接 | URL | 必填 |
| 作者 | Rich Text | 可选 |
| 分类 | Select/Rich Text | 可选 |
| 标签 | Multi Select | 可选（新增） |
| 保存日期 | Date | 可选 |
| 评论数 | Number | 可选 |

### 飞书多维表格字段

| 字段名 | 类型 | 说明 |
|-------|------|------|
| 标题 | 文本 | 必填 |
| 链接 | 超链接 | 必填 |
| 作者 | 文本 | 必填 |
| 分类 | 文本 | 必填（新增） |
| 标签 | 文本 | 必填（新增） |
| 保存时间 | 日期 | 必填 |
| 评论数 | 数字 | 必填 |
| 附件 | 附件 | 可选 |
| 正文 | 多行文本 | 可选 |

---

## 验证方法

1. **Obsidian 标签**：保存帖子后在 Obsidian 中检查 frontmatter，确认 `tags` 字段格式正确
2. **飞书字段验证**：点击"测试连接"，确认提示"9个必需字段"
3. **评论模式互斥**：
   - 打开设置，勾选"保存评论区"
   - 设置评论数量为 50
   - 勾选"保存全部"，评论数量输入框应变灰禁用
   - 取消"保存全部"，勾选"指定楼层范围"，评论数量输入框应仍保持禁用
   - 取消"指定楼层范围"，评论数量输入框恢复可用
4. **楼层范围**：
   - 启用"指定楼层范围"
   - 设置如 10-50 楼
   - 保存后检查只包含指定范围的评论
5. **Notion Tags**：保存到 Notion 后检查标签是否正确显示为 Multi Select 格式
