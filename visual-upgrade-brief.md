# 视觉升级 Brief — The Agent Company · Marketing Library Portal

> 用途：交付给视觉设计师 / 前端视觉工程师 / AI 设计工具，用于在本项目现有基础上做**视觉品质升级**。
> 版本：基于 2026-07-09 项目最新状态（品牌已统一为 The Agent Company，原 Alibaba 内容已清除，logo 已接入）。
> 重要前提：本次只做**视觉层升级**，不改动页面文案、不新增/删除功能模块、不更改信息架构。

---

## 1. 项目背景

The Agent Company 需要一个**内部/对外的营销素材库门户（Marketing Library Portal）**：按分类（AI 模型、品牌指南、客户案例、视频、文档等）浏览和检索营销素材。当前站点已用 Vite + Bootstrap + SCSS 搭建完成，功能与结构齐全，但视觉精致度、层次感、微交互与动效品质有提升空间，需要一轮专业视觉升级，达到现代科技/SaaS 品牌官网水准。

---

## 2. 技术约束（硬性，必须遵守）

| 项 | 要求 |
|----|------|
| 技术栈 | Vite 5 + Bootstrap 5.3 + SCSS + Font Awesome 6（不要引入新框架/构建工具） |
| 样式写法 | 颜色/字体/圆角/间距**必须用 CSS 变量或 SCSS 变量**，禁止在组件里硬编码颜色值 |
| 字体加载 | 仅用 Google Fonts（Inter / Sora / JetBrains Mono），中文回退 PingFang SC / Microsoft YaHei，**不得引入未授权商业字体或图片** |
| 功能保全 | 以下交互**绝对不能破坏**：暗色/亮色切换、EN/CN 双语切换、搜索过滤、分类卡片展开子面板、视频轮播、TOC 侧边栏滚动高亮、回到顶部 |
| 响应式 | 容器最大宽度 1440px；宽屏（≥1280px）显示左侧固定 TOC 目录，窄屏收为浮动按钮；所有断点必须正常 |
| 性能 | 不显著增加首屏体积；动画用 transform/opacity，避免触发重排 |

---

## 3. 设计令牌（硬约束 — 品牌色不可改主色相）

**品牌色（必须保留，可微调明度/饱和度但不可换色系）：**
- 主品牌紫 `--brand-purple: #7B2FFF`
- 辅助紫 `--brand-purple-mid: #9B59FF`、`--brand-purple-light: #C850C0`
- 蓝 `--brand-blue: #4158D0`、青 `--brand-cyan: #00B4D8`、亮青 `--brand-cyan-bright: #2EA7FF`、青绿 `--brand-teal: #13DDC4`
- 主渐变：`linear-gradient(135deg, #4158D0, #7B2FFF, #C850C0)`
- Aurora 渐变（氛围光）：`linear-gradient(135deg, #2EA7FF 0%, #7B2FFF 52%, #C850C0 100%)`

**亮色模式：**
- 页面底 `#FFFFFF`、次表面 `#F7F7F9`、卡片 `#FFFFFF`、边框 `#E8E8E8`
- 文字：主 `rgba(0,0,0,.88)`、次 `rgba(0,0,0,.65)`、弱 `rgba(0,0,0,.45)`

**暗色模式：** 现有已有一套暗色变量（data-theme="dark"），升级时**必须保留并打磨细节**（对比度、发光、分隔线在深底上的可读性）。

**圆角：** 默认 `14px`、小 `8px`、胶囊 `999px`。
**间距系统：** 栅格间距 24px，区块纵向节奏建议 80–120px。
**字体：** 正文 Inter、标题 Sora、等宽/标签 JetBrains Mono。

---

## 4. 现有页面结构（升级覆盖范围）

1. **Sticky Navbar** — 左侧品牌 logo（已接入 `public/images/logos/TAC.png`）+ 名称 "Marketing Library" + 闪烁光标 Tagline；右侧 4 个控件：主题切换 / 语言切换(EN·CN) / Edit / Contact。
2. **Hero** — 打字机动画标题（循环 3 条文案）+ 4 个统计计数器（如 47+ Cases / 270+ Videos）+ 搜索栏（紫色渐变按钮）+ 快捷筛选标签。
3. **Showcase** — 暗色视频展示卡片 + 3 个 CSS 动画渐变光球(blob) + 视频轮播（圆点/箭头切换）。
4. **Categories Grid** — 10 张分类卡片（auto-fill 网格），部分可点击展开**子面板**（子项列表，带图标/首字母方块回退）。
5. **TOC 侧边栏** — 宽屏固定左侧目录(滚动高亮)，窄屏浮动按钮滑出。
6. **Footer** — "TAC" 渐变字标 + Tagline + 版权。
7. **回到顶部** 浮动按钮。

> 注：AI 模型分类下的子项名称目前是**通用占位**（Foundation Models / Vision Models / Voice Models / Agent Runtime 等），后续由业务方填充真实产品名。视觉升级**无需处理这些文案**，专注视觉表现即可。

---

## 5. 视觉升级目标（要提升什么）

在**守住品牌紫 + 功能完整 + 双语/暗色/响应式**的前提下，重点提升：

- **精致度与层次感**：更克制的留白、更清晰的视觉层级、卡片不再「平」，有呼吸感。
- **玻璃态与渐变的高级感**：毛玻璃、噪点/光晕、渐变描边的处理更讲究，避免廉价感。
- **Hero 视觉冲击**：背景氛围（网格/光斑/极光）与打字机标题的融合更有记忆点。
- **微交互**：hover 抬升 + 柔光晕、图标状态过渡、按钮反馈、焦点态可访问性。
- **动效品质**：滚动进入的 fade-up、子面板展开、blob 漂浮更丝滑（cubic-bezier 缓动，时长 200–500ms）。
- **图标/视觉语言统一**：分类图标、子项图标建议建立一套统一风格的图标/插画语言（可用 FA 或自绘 SVG）。

---

## 6. 逐模块升级要求

- **Navbar**：毛玻璃更通透；滚动时可加轻微阴影/底色变化；控件 hover 有清晰反馈；品牌区在窄屏不换行挤压。
- **Hero**：打字机保留并优化光标；统计数字用更精致的样式（大字号 + 渐变描边或柔光）；搜索栏聚焦态发光；背景极光光球与网格融合自然。
- **Showcase**：视频卡片在暗底上有「影院感」（内发光/圆角/投影）；轮播切换过渡顺滑；blob 动画不喧宾夺主。
- **Categories Grid**：卡片玻璃态 + hover 抬升 + 渐变光晕描边；图标容器统一尺寸与风格；**展开子面板**有弹性展开动画与清晰分隔；子项 hover 整行高亮。
- **TOC**：侧边栏当前项高亮用品牌渐变；与内容区视觉分离但协调；窄屏 FAB 按钮符合整体调性。
- **Footer**：字标与 Tagline 更有品牌感；链接区层级清晰。

---

## 7. 暗色 / 亮色模式

- 两套都必须达到可用且精致的水准，切换无闪烁、过渡平滑。
- 暗色模式重点打磨：深底（近黑 `#0B0B12` 量级）上的卡片浮起感、渐变发光、分隔线对比、文字可读性。
- 所有新加颜色必须提供亮/暗两套变量。

---

## 8. 双语（EN / CN）

- 所有可见文案已通过 `data-en` / `data-cn` 属性驱动，由 JS 切换。**视觉改动不应触碰文案机制**。
- 注意中英文案长度差异：标题/按钮/卡片在 CN 下可能更长，布局需自适应不溢出、不换行错位。

---

## 9. 响应式断点

- 桌面 ≥1280px：TOC 固定左侧，主内容居中（max 1440px）。
- 平板 / 手机：TOC 收为浮动按钮；Grid 自动降列（auto-fill minmax）；Navbar 控件可收起或换行；Hero 统计与搜索栏纵向堆叠合理。
- 所有新增动效在低端设备不卡顿（尊重 `prefers-reduced-motion`）。

---

## 10. 动效与微交互规范

- 统一缓动：`cubic-bezier(0.22, 1, 0.36, 1)`（easeOutQuint 风格）。
- 时长：micro 120–200ms，模块进入 300–500ms。
- 滚动进入用 IntersectionObserver 触发 fade-up（现有 JS 已有，视觉层配合即可）。
- 尊重 `prefers-reduced-motion: reduce` —— 关闭非必要动画。

---

## 11. 交付物要求

- **方案 A（设计稿）**：提供 Figma / 设计稿，含亮色 + 暗色、桌面 + 移动、主要模块的高保真页面，以及更新后的设计令牌（颜色/字体/圆角/间距/阴影/动效参数）。
- **方案 B（直接改代码）**：提交基于现有 SCSS 的改动（保持变量化、功能与响应式完好），并说明改了哪些文件/变量。
- 无论哪种，请**附带一份"设计令牌变更清单"**，便于研发对齐。

---

## 12. 红线（禁止）

- ❌ 更换主品牌色系（必须保持紫色调）。
- ❌ 破坏任何现有交互功能或响应式布局。
- ❌ 在组件内硬编码颜色（必须走 CSS/SCSS 变量）。
- ❌ 引入未授权字体、图片、图标库或 npm 包。
- ❌ 大幅改动信息架构或删减模块。
- ❌ 让首屏体积或 Lighthouse 性能明显退化。

---

## 附：可直接发给 AI 设计工具的浓缩 Prompt

> 下面这段可直接复制给 v0 / Claude / 设计类 AI 使用（已含关键约束，省略了冗长背景）。

```
You are upgrading the visual design of an existing marketing asset library portal
("Marketing Library Portal" for the brand "The Agent Company"). It is already built
with Vite 5 + Bootstrap 5.3 + SCSS + Font Awesome 6, fully functional.

HARD CONSTRAINTS (do not violate):
- Keep the brand purple as the primary color. Palette: #7B2FFF (main), #9B59FF,
  #C850C0, #4158D0, #00B4D8. Main gradient: linear-gradient(135deg,#4158D0,#7B2FFF,#C850C0).
  Aurora gradient: linear-gradient(135deg,#2EA7FF,#7B2FFF,#C850C0). Do NOT change the hue family.
- Fonts: Inter (body), Sora (headings), JetBrains Mono (mono/labels). CN fallback:
  PingFang SC / Microsoft YaHei. No unauthorized fonts/images.
- Must keep BOTH light and dark themes polished (dark uses near-black surfaces with
  glow/glass effects). All new colors need light+dark variables.
- Preserve ALL existing interactions: theme toggle, EN/CN language switch, search
  filter, expandable category sub-panels, video carousel, sticky TOC sidebar with
  scroll-spy, back-to-top. Do not break responsive layout (container max 1440px;
  TOC fixed on >=1280px, floating button below).
- Use CSS/SCSS variables for every color — no hardcoded colors in components.
- Respect prefers-reduced-motion.

CURRENT STRUCTURE (upgrade visuals only, do not change copy/IA):
1) Sticky navbar: logo (public/images/logos/TAC.png) + "Marketing Library" + blinking
   cursor tagline; right controls: theme / language(EN·CN) / Edit / Contact.
2) Hero: typewriter headline (3 rotating lines) + 4 stat counters + search bar
   (purple gradient button) + filter tags.
3) Showcase: dark video card + 3 animated gradient blobs + video carousel.
4) Categories grid: 10 glass cards (auto-fill), some expandable into sub-panels
   with icon/letter-avatar items.
5) TOC sidebar (fixed on desktop, FAB on mobile).
6) Footer: "TAC" gradient wordmark + tagline + copyright.

UPGRADE GOALS: elevate visual polish, hierarchy, whitespace, premium glassmorphism
and gradients (subtle noise/glow, gradient borders), stronger Hero impact, refined
micro-interactions (hover lift + soft glow, focus states), smoother motion
(IntersectionObserver fade-up, elastic sub-panel expand, floating blobs; easing
cubic-bezier(0.22,1,0.36,1), 120–500ms), and a unified icon/illustration language.

DELIVER: high-fidelity designs (light+dark, desktop+mobile) OR SCSS/CSS changes that
keep variables/functionality/responsiveness intact, plus a short "design token change
list". Do NOT rewrite the app, remove modules, or degrade performance.
```
