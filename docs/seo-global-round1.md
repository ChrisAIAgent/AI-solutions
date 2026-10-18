# TAC 全球 SEO 第一轮交付与验收

日期：2026-10-18。状态：实现及发布前验收完成；本次已获授权提交部署。最终生产状态以对应 Git 提交的 Cloudflare 构建结果及线上检查为准；搜索平台尚未提交。

## 实现

- 正式域名：`https://aisolution.worldtoolx.com`。首页为 `/`，其他页面采用 `/pages/name`。
- Vite 构建插件集中定义逐页 title、description、canonical、robots、Open Graph 与 Twitter 元数据；配置源为 `scripts/seo-build.js`。Organization 和 WebSite JSON-LD 仅输出在首页，不包含评分、价格或站内搜索功能。
- 首页与目录通过共用模板在构建时生成真实 HTML。浏览器保留现有交互，初次加载复用静态首页和目录卡片。Skills 使用构建时的真实托管 manifest 初始化，随后仍可刷新 manifest。
- 英文首页解释适用的 individuals、teams、businesses、solo founders；移除默认应用介绍中未有依据的 regulation-approved 表述。Workspaces 仍明确为概念，导入限制不变。
- Rive 单独拆包，空闲时加载，加载失败保留 CSS 示意；视频使用 preload=none，并继续只在可见时播放。现有媒体容器已有尺寸或比例，不改变布局。
- `robots.txt` 与 `sitemap.xml` 在构建时生成到 dist；robots 允许爬虫读取 noindex 页面。无修改日期证据时不伪造 sitemap lastmod。
- Cloudflare 显式采用 drop-trailing-slash 和 404-page；新增独立 404.html。Vite 预览设为多页面模式，并兼容旧 .html 地址跳转。

## 页面收录清单

以下均相对于正式域名；每页都有独立标题、描述与指向自身正式 URL 的 canonical。

| 正式路径 | 收录 | sitemap |
| --- | --- | --- |
| `/` | index,follow | 是 |
| `/pages/tacwork-download` | index,follow | 是 |
| `/pages/tac-harness` | index,follow | 是 |
| `/pages/tac-workspaces` | index,follow | 是 |
| `/pages/skills` | index,follow | 是 |
| `/pages/tac-plugins` | index,follow | 是 |
| `/pages/contact-us` | index,follow | 是 |
| `/pages/tac-cli` | noindex,follow | 否 |
| `/pages/tac-assistant-assets` | noindex,follow | 否 |
| `/pages/marketing-library` | noindex,follow | 否 |
| `/pages/brand-guidelines` | noindex,follow | 否 |
| `/pages/ai-models` | noindex,follow | 否 |

## 验证结果

- `npm run build` 通过；`node --test tests/*.test.js` 36/36 通过，包含现有助手/检索/工作区测试与新增 SEO 测试。
- 桌面 Edge 浏览器验证：首页产品切换、行业切换、示例工作流、助手打开/关闭；Skills 搜索、选中及详情；插件搜索、排序和 npm 筛选；Workspaces 搜索、详情弹窗和 Escape 关闭；下载及联系链接存在。
- 当前目录真实输出：40 个 Skills、110 个插件、5 个工作区概念。未捕获页面脚本异常。
- 禁用 JavaScript 后，在 390px 和 1440px 宽度检查首页与上述目录，正文和卡片可见，无水平溢出；首页下拉导航的链接仍可见，Skills 另提供原始仓库链接。筛选、标签与弹窗需要 JavaScript。
- 390px 启用 JavaScript 时移动导航可展开；桌面与移动截图已检查。
- 本地生产预览：首页、无扩展名产品地址、robots、sitemap 返回 200；旧产品 .html 地址返回 307 并跳转到正式路径；随机不存在的路径返回 404。
- 开发服务器首页和无扩展名目录地址返回 200。
- 助手检查覆盖 UI 与现有模拟后端测试，未连接生产模型进行真实问答；本地浏览器检查不证明真实下载完成或真实邮件送达。

## 性能测量

同机 Edge headless、1440×900、无网络限速、新浏览器上下文，每版三次；比较当前 Git HEAD 的隔离构建与本轮构建，观测到导航后至少三秒。表中为中位数。系统字体/磁盘缓存和本地服务器会影响结果，不是 Lighthouse、CrUX 或全球网络实测。

| 首页指标 | HEAD 基线 | 本轮 |
| --- | ---: | ---: |
| FCP | 352 ms | 276 ms |
| LCP | 536 ms | 284 ms |
| CLS | 0.4240 | 0.0012 |
| 观测期 JS 响应体传输量 | 123400 bytes | 124784 bytes |
| 主首页 JS 块（未压缩） | 362.20 kB | 173.28 kB |

静态 HTML 让正文提前可用，Rive 延后加载；观测期总 JS 传输没有下降，不将拆包描述为总下载量减少。CLS 基线三次约为 0.4251、0.4240、0.0011，存在明显波动。现有营销素材页的大 JS 块警告与 Sass 旧 API 警告仍存在。

本地证据：`tmp/seo-performance.json`、`tmp/seo-browser-results.json` 和 `tmp/seo-*.png`。tmp 为忽略目录，不随 Git 发布。

## 发布与后续检查

1. 提交前审核代码与上述收录清单。本轮仅提交 SEO 相关改动；无关滚动逻辑、.opencode 和本地安装包保留原状。
2. 发布必须执行完整 `npm run build` 后部署 dist，并等待 Cloudflare 构建成功。不要只生成助手知识索引而跳过前端构建。
3. 生产逐一检查七个 sitemap URL 的 200 状态和 canonical，验证 .html 跳转、随机 404、robots、sitemap，以及五个 noindex 页面。
4. 由站点所有者在 Google Search Console 与 Bing Webmaster Tools 验证正式域名，提交 `/sitemap.xml`。没有账户验证信息时不添加占位验证标签。
5. Search Console URL Inspection 检查首页和代表性目录的渲染内容；依据真实收录、非品牌词曝光与点击逐步评估。
6. 真实用户性能数据需发布后积累。下载入口点击与咨询入口点击分别记录为行为指标，不当成安装完成和有效线索。本轮未加入新的第三方分析 SDK 或转化事件。

Cloudflare 路由配置依据：[HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/) 与 [SSG / 404](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)。
