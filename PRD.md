# Marketing Library Portal — PRD

> 一个静态多页面知识库门户，用于分类管理营销素材，团队可按类别和子类别浏览。

---

## 1. 技术栈

| 层级 | 选型 |
|------|------|
| 构建工具 | Vite 5 (vanilla，无框架) |
| CSS 框架 | Bootstrap 5.3.x |
| 预处理器 | Sass/SCSS |
| 图标 | Font Awesome 5 (kit 或 npm) |
| 字体 | Google Fonts "Inter" (主)；中文回退：PingFang SC、Microsoft YaHei |
| JS | Vanilla ES6+，无框架 |
| 部署 | 静态文件 (`dist/`) |

---

## 2. 项目结构

```
project-root/
├── index.html                    # 首页，展示所有分类
├── pages/                        # 各分类详情页
│   ├── ai-models.html
│   ├── brand-guidelines.html
│   └── ...
├── public/
│   ├── images/logos/             # 产品 Logo (PNG)
│   ├── images/                   # 通用图片、favicon
│   ├── videos/showcase/          # Hero 展示视频
│   └── search-index.json         # 预构建搜索索引
├── src/
│   ├── js/main.js                # 所有客户端逻辑
│   └── scss/
│       ├── main.scss             # 主样式表
│       └── includes/
│           ├── _variables.scss
│           └── variables/
│               ├── _colors.scss
│               └── _typography.scss
├── scripts/
│   └── update-search-index.js    # Node 脚本，重建搜索索引
├── vite.config.js
└── package.json
```

---

## 3. 设计系统

### 3.1 颜色令牌 (CSS 自定义属性)

```css
:root {
  /* Brand */
  --brand-purple: #7B2FFF;
  --brand-purple-mid: #9B59FF;
  --brand-purple-light: #C850C0;
  --brand-blue: #4158D0;
  --brand-cyan: #00B4D8;
  --brand-gradient: linear-gradient(135deg, #4158D0, #7B2FFF, #C850C0);

  /* Surfaces (Light) */
  --bg-page: #FFFFFF;
  --bg-surface: #F7F7F9;
  --bg-card: #FFFFFF;
  --bg-hover: #F0F0F2;
  --border: #E8E8E8;

  /* Text */
  --text-primary: rgba(0,0,0,0.88);
  --text-secondary: rgba(0,0,0,0.65);
  --text-tertiary: rgba(0,0,0,0.45);

  /* Radius */
  --radius: 10px;
  --radius-sm: 6px;
}

/* Dark Mode 覆盖 */
[data-theme="dark"] {
  --bg-page: #08080D;
  --bg-surface: #0E0E16;
  --bg-card: #161622;
  --bg-hover: #1E1E2C;
  --border: rgba(255,255,255,0.07);
  --text-primary: rgba(255,255,255,0.94);
  --text-secondary: rgba(255,255,255,0.68);
  --text-tertiary: rgba(255,255,255,0.42);
}
```

### 3.2 字体栈

```css
--font-body: 'Inter', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
```

---

## 4. 页面布局架构 (index.html)

从上到下依次为以下区块：

### 4.1 Sticky Navbar

- Brand 图标 + 站点名 "Marketing Library"
- 动态 Tagline：`"Ship the next"` + 闪烁光标，循环展示标语
- 右侧控件：
  - 暗色/亮色切换（月亮/太阳图标）
  - EN/CN 语言切换
  - Edit 按钮
  - Contact 链接

### 4.2 Hero Section

- 居中大标题 + 打字机动画（循环 3 条品牌标语）
- 4 个统计计数器（如 "47+ Customer Cases"、"270+ Video Assets"、"10 Categories"、"58+ Collections"）
- 搜索栏 + 渐变紫色提交按钮
- 搜索栏下方快捷筛选标签 (tag chips)

### 4.3 Showcase Section

- 深色卡片 + CSS 动画浮动渐变 blob（`@keyframes`，18-25s 循环）
- 左侧：品牌标语文字
- 右侧：视频轮播，含圆点导航和 prev/next 控件

### 4.4 Categories Grid（主内容区）

- CSS Grid：`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- 每个分类卡片包含：渐变图标、标题、描述、素材数量
- 两种卡片行为：
  - **Linked Cards**（`card-linked`）：点击跳转到详情页
  - **Expandable Cards**（`expandable`）：点击展开子面板

### 4.5 Sub-panels（可展开卡片的子面板）

- 占满网格宽度：`grid-column: 1 / -1`
- 展开动画：`max-height` + `opacity` + `translateY`
- 内含子网格 `.sub-item` 卡片，每张展示：产品 Logo/图标、标题、描述、链接箭头
- Logo 两种尺寸：
  - `.sub-logo`：宽/横版 Logo（`height: 28px; max-width: 80px`）
  - `.sub-logo-square`：方形图标（`28x28px; border-radius: 5px`）

### 4.6 Floating TOC 侧边栏

- 宽屏（≥1280px）：左侧固定导航，列出所有分类标题，滚动高亮当前区块
- 窄屏（<1280px）：FAB 切换按钮 + 滑出侧边栏 + 遮罩层

### 4.7 Footer

- 品牌名、Tagline、版权信息
- 回到顶部按钮（滚动超过 300px 后显示）

---

## 5. JavaScript 功能 (src/js/main.js)

所有逻辑封装在单个 `DOMContentLoaded` 事件处理函数中：

| 功能 | 行为 |
|------|------|
| **Dark/Light 主题** | 切换 `<html>` 上的 `data-theme`，持久化到 `localStorage`，交换月亮/太阳图标 |
| **打字机动画** | 循环 3 条标语数组，输入速度 50ms/字，擦除速度 30ms/字，暂停 2s |
| **语言切换** | EN/CN 切换，所有文本元素使用 `data-en` + `data-cn` 属性，JS 遍历 `[data-en]` 并交换 `textContent` |
| **搜索** | (1) 本地卡片过滤：匹配 `data-title-en/cn`、`data-desc-en/cn`；(2) 全局搜索：fetch `search-index.json`，过滤后渲染下拉列表（最多 12 条） |
| **可展开卡片** | 点击切换 `expanded` class，显示/隐藏 `#panel-{section}`，同时只展开一个面板 |
| **Hero 统计** | 动态统计 `.category-card` 数量和素材总数 |
| **TOC 同步** | 从卡片标题构建列表，根据滚动位置高亮 |
| **视频轮播** | 视频源数组，`ended` 事件自动播放下一个，支持圆点 + 箭头导航 |
| **编辑模式** | 切换 `.edit-only` 元素显示，Bootstrap Modal 编辑卡片 `data-attributes` |
| **回到顶部** | 滚动超过 300px 后显示，平滑滚动 |

---

## 6. 双语系统 (i18n)

所有用户可见文本元素使用双 `data-` 属性：

```html
<h3 data-en="AI Models and MaaS Products" data-cn="AI 模型与 MaaS 产品">
  AI Models and MaaS Products
</h3>
```

语言切换时遍历所有 `[data-en]` 元素，将 `textContent` 设置为当前语言对应的属性值。搜索框 placeholder 使用 `data-placeholder-en` / `data-placeholder-cn`。

---

## 7. 关键 CSS 模式

### 7.1 卡片悬停效果

```css
.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(123, 47, 255, 0.12);
}
```

### 7.2 动画渐变 Blob

```css
@keyframes heroFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -20px) scale(1.05); }
  66% { transform: translate(-15px, 15px) scale(0.97); }
}
/* 应用于伪元素，使用大面积径向渐变背景 */
/* 时长：18-25s，infinite */
```

### 7.3 子面板展开动画

```css
@keyframes panelExpand {
  from { opacity: 0; max-height: 0; transform: translateY(-10px); }
  to   { opacity: 1; max-height: 2000px; transform: translateY(0); }
}
```

---

## 8. 响应式断点

| 范围 | 布局 |
|------|------|
| ≤ 768px | 单列，Hero 缩小，侧边栏宽度 80vw |
| 769px - 1024px | 两列网格 |
| ≥ 1280px | 浮动 TOC 可见，主内容区 `padding-left: 220px` |

---

## 9. Dark Mode 实现

切换时在 `<html>` 上设置 `data-theme="dark"`。所有颜色引用 CSS 自定义属性，`[data-theme="dark"]` 下自动覆盖。主要元素添加以下过渡实现平滑切换：

```css
transition: background 0.3s, color 0.3s, border-color 0.3s;
```

---

## 10. Vite 配置

```js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // 逐个添加 pages/ 下的页面
        'pages/ai-models': resolve(__dirname, 'pages/ai-models.html'),
        // ... 更多页面
      }
    }
  }
});
```

---

## 11. 搜索索引生成

Node.js 脚本 `scripts/update-search-index.js` 解析所有 HTML 文件，提取分类卡片和子项（标题、描述、区块、URL），输出扁平 JSON 数组到 `public/search-index.json`。客户端 fetch 该文件并在 `keyup` 事件中过滤。

---

## 12. 定制指南

| 定制项 | 操作 |
|--------|------|
| 替换分类 | 编辑 `index.html` 中的分类卡片（标题、描述、图标、链接） |
| 替换 Logo | 将 PNG 放入 `public/images/logos/`，在子项 `<img>` 标签中引用 |
| 更新子面板链接 | 修改 `.sub-item` 的 `<a>` 指向你的文档 URL |
| 更换品牌色 | 修改 `:root` 中的 `--brand-purple` 和渐变色值 |
| 增减页面 | 在 `pages/` 下新建 HTML 文件，添加到 `vite.config.js` 的 `input` |
| 重建搜索索引 | 运行 `node scripts/update-search-index.js` |

---

## 13. 示例 HTML

### 分类卡片

```html
<div class="category-card expandable" data-category="ai-models"
  data-title-en="AI Models and MaaS Products"
  data-title-cn="AI 模型与 MaaS 产品"
  data-desc-en="Latest branding materials for our AI models, and more."
  data-desc-cn="我们 AI 模型等最新品牌素材。">
  <div class="card-icon"><i class="fas fa-robot"></i></div>
  <h3 data-en="AI Models and MaaS Products" data-cn="AI 模型与 MaaS 产品">
    AI Models and MaaS Products
  </h3>
  <p data-en="Latest branding materials..." data-cn="最新品牌素材...">
    Latest branding materials...
  </p>
  <div class="card-footer">
    <span class="meta-count" data-en="8 assets" data-cn="8 个素材">8 assets</span>
    <i class="fas fa-chevron-down expand-icon"></i>
  </div>
</div>
```

### 子面板

```html
<div class="sub-panel" id="panel-ai-models">
  <div class="sub-panel-header">
    <span class="sub-panel-title" data-en="Sub-categories" data-cn="子分类">
      Sub-categories
    </span>
  </div>
  <div class="sub-grid">
    <a href="https://..." class="sub-item" target="_blank">
      <img class="sub-icon sub-logo" src="./images/logos/foundation.png" alt="Foundation Models">
      <div class="sub-info">
        <div class="sub-title" data-en="Foundation Models" data-cn="基础模型">Foundation Models</div>
        <div class="sub-desc" data-en="Branding materials..." data-cn="品牌素材...">
          Branding materials...
        </div>
      </div>
      <i class="fas fa-arrow-right sub-arrow"></i>
    </a>
    <!-- 更多子项... -->
  </div>
</div>
```

---

## 14. 交付检查清单

- [ ] 所有分类卡片展开/收起正常
- [ ] Dark Mode 平滑切换，无闪烁
- [ ] 语言切换更新所有可见文本
- [ ] 搜索过滤卡片并展示下拉结果
- [ ] TOC 根据滚动位置高亮当前区块
- [ ] 响应式：375px / 768px / 1024px / 1440px 均正常
- [ ] 所有产品 Logo 尺寸约束正确
- [ ] 回到顶部按钮正常显示和工作
- [ ] Vite 构建产出干净的 `dist/` 目录
- [ ] `search-index.json` 与当前内容一致
