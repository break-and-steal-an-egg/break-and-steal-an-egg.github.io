# Adsterra 接入与验收记录

日期：2026-10-11（Asia/Shanghai）

最终状态：**【代码接入已验证，真实广告/后台数据待线上确认】**

源码和本地静态构建已完成。本次未推送或部署；目标线上站仍是旧部署，不包含本次四个广告单元。真实浏览器已对本地构建发起原始广告请求，但得到 403，未看到真实广告素材。尚未验证后台是否已有 impression。

## A. 网站及代码核对

- 目标站：[https://break-and-steal-an-egg.github.io](https://break-and-steal-an-egg.github.io/)。项目配置的站点 URL 相同，basePath 为空。
- 实际安装版本：Next.js 16.3.2、React 19.2.8。App Router，`output: "export"`、`trailingSlash: true`，GitHub Actions 部署 `out/` 到 GitHub Pages；这些设置未改变。
- 唯一广告配置来源：用户提供的第十五章 GET CODE。未从环境变量、其他仓库或历史记录补充广告配置。

| 广告单元 | 原始 script src | 原始配置/属性 |
| --- | --- | --- |
| Desktop Banner | `https://bauval.org/22/7426e0b4535177b251052c4216cc4709` | key `7426e0b4535177b251052c4216cc4709`；format `iframe`；728×90；params `{}` |
| Mobile Banner | `https://bauval.org/22/366c8fccedfb0e055e7728b86a927983` | key `366c8fccedfb0e055e7728b86a927983`；format `iframe`；320×50；params `{}` |
| Native Banner | `https://bauval.org/21/0f53a608f3525a1de6e926eaaa15816a` | async；`data-cfasync="false"`；目标 ID `container-0f53a608f3525a1de6e926eaaa15816a` |
| Social Bar | `https://bauval.org/14/4cde00871a8a6e115ca1ab27134b18af` | `data-cfasync="false"` |

没有发现源码中硬编码的不匹配旧站 key。原来的 Native 实现由两个 `NEXT_PUBLIC_ADSTERRA_NATIVE_*` 环境变量决定，存在部署时被未知配置替换的可能；已移除该读取逻辑及对应工作流注入，改用本次公开 GET CODE。未读取或猜测旧环境变量的值。

无法访问 Adsterra Publisher：网站/Ad Unit 后台归属、Approved/Active 状态和 Statistics 均**无法核实**。四段代码可识别对应格式及配置，并不等于已确认后台归属或审批。

## B. 变更范围

| 文件 | 作用及最小差异 |
| --- | --- |
| `config/integrations.ts` | 固定本次四个公开广告地址及 Banner 配置；移除旧 Native 广告环境变量读取；GA4 与验证配置逻辑保留 |
| `config/types.ts` | 扩展广告配置类型，包含桌面/移动 Banner 和 Social 地址 |
| `components/integrations/banner-ad.tsx` | 新增响应式 Banner、同源适配 iframe、尺寸适配及空内容观察 |
| `components/integrations/native-ad-client.tsx` | 先创建官方目标再执行脚本；保留 async/cfasync；防重复；观察填充；移除 effect cleanup 中清空 host 的逻辑 |
| `components/integrations/native-ad-slot.tsx` | 匹配新的四格式广告配置类型 |
| `components/integrations/ad-document-lifecycle.tsx` | 新增全局 Social Script 和完整页面导航策略 |
| `app/layout.tsx` | 在原 Footer 后、body 结束前插入全局广告生命周期组件 |
| `components/templates/fixed-template-home.tsx` | 在完整首页 Hero 后插入 Banner；移除正文末尾旧 Native 挂载点 |
| `components/templates/fixed-template-inner.tsx` | 在原页面 Hero/header 后插入 Banner；移除正文末尾旧 Native 挂载点 |
| `components/templates/fixed-template-content.tsx` | 在首个完整内容块后插入 Native |
| `components/site/page-sections.tsx` | 增加可选广告插入点；原 section 内容、顺序和标题保持不变 |
| `app/globals.css` | 仅新增广告标签、居中、尺寸预留、缩放和空位收起样式 |
| `content/legal.ts` | Privacy 新增 Banner/Native/Social 与可能的 Cookie/技术信息说明；该页审阅日期更新为 2026-10-11，其 Schema 日期随原逻辑更新 |
| `.github/workflows/deploy.yml` | 仅移除两个旧 Native 广告环境变量，避免覆盖本次广告配置 |
| `ADSTERRA-QA.md` | 本验收记录，不属于网站页面 |

### 挂载与执行

- 首页：完整 Hero（标题、介绍、CTA、封面）→ Banner → 原有 Quick Answer 内容块 → Native → 原有后续内容。
- 子页：原 Breadcrumb/Hero/header → Banner → 原有首个完整内容块 → Native → 原有后续内容。Banner 和 Native 之间始终有真实内容，没有拆段、移动 H2 或添加 SEO 文案。
- 移动首页 Hero 和首个内容块较长，Native 可以超过 1–1.5 屏软目标；保护原内容优先。
- 首次初始化使用真实客户端 `matchMedia("(min-width: 768px)")`，仅执行一个 Banner。每个 Banner iframe 内只有所选单元的 `atOptions` 和原始 src，因此配置不会互相覆盖。
- 采用稳定策略：窗口跨越 768px 时不换广告、不发新请求、不刷新页面；首次选定的 Banner 按可用空间缩放。下次正常页面加载再按当时 viewport 选择尺寸。
- Banner 有一个最小 `srcdoc` 适配 iframe。它继承主页面 origin，无 sandbox，不改官方 URL。提供商脚本的 `document.write` 被限制在 iframe 中。实际脚本请求为空或 403，无法确认其内部初始化方式；适配层的真实填充和统计仍需线上核实。Mock 已验证 parser-time `document.write` 不会清空主页面。
- 本地浏览器确认适配 iframe origin 为 `http://127.0.0.1:4173`，官方请求 Referer 保留该站来源；生产 origin 的填充和统计尚未验证。
- 首次等待时 Banner 预留桌面 90px/移动 50px，并显示低调的 Advertisement。无内容/失败后外围高度和标签收起；iframe、脚本及官方目标仍保留，迟到的内容可以再次展开。
- Native 目标先挂载再加载官方脚本，每页只有一个 ID、一个实例。空时无标签/额外空间，有内容时显示 Advertisement。没有超时销毁、永久关闭、循环重试或自动刷新逻辑。
- Social 位于全局 root 的 body 尾部附近，使用 `next/script` 的 `afterInteractive` 和固定 ID，每个文档只加载一次。
- 第三方片段没有提供可核实的 SPA teardown/reinitialization API，因此普通站内跨页链接使用完整页面导航。地址、文字与内容未改；同页锚点、外链、新窗口、修饰键点击和下载链接保留原生行为。正常导航及历史恢复各文档没有重复广告实例。
- 没有新增代理、镜像、Popunder、Smartlink、未知广告地址或广告依赖。
- 项目未发现 CSP 或既有地区同意管理实现；未新增宽泛 CSP 放行，未绕过既有偏好机制。是否需要额外同意方案需按实际服务地区核实，本次未声称完成法律合规。

## C. 实测证据

| 静态检查 | Mock 测试 | 未 Mock 的真实广告网络测试 |
| --- | --- | --- |
| 四份官方 src/key/尺寸/params 完整；Native/Social cfasync 原样保留；13 个内容页面各一个 Banner slot、一个 Native slot | 1440/375px 首页与 Codes 页，blocked-by-client 与 200 空 JS；16 秒延迟内容；document.write 隔离；Next dev Strict Mode；767/768px 边界与缩放 | 最终静态构建的 1440/375px 首页与 Codes 页均实际发起官方原始 URL 请求；Desktop/Mobile 互斥；Native/Social 各一次 |
| Hero、首块内容与广告插入顺序正确；没有另一套广告 key | 空位高度为 0、标签隐藏、官方目标/脚本仍在；16 秒后恢复显示；单一实例；页面和 H1 保留 | 全部原始请求返回 HTTP 403，浏览器记录 `net::ERR_ABORTED`，没有重定向，最终 URL 与原始 URL 相同；响应体 0 bytes，未看到真实素材 |
| GA4、SEO、静态导出配置保留 | 只证明结构、生命周期和布局；**不证明广告网络投放、真实素材或 impression** | 没有通过改域名、代理或绕过拦截来处理 403；无法由本机 403 判断审批、地域或真实访客结果 |

真实请求计数（每个新文档）：

| 视口/页面 | Desktop | Mobile | Native | Social | 真实结果 |
| --- | ---: | ---: | ---: | ---: | --- |
| 1440px 首页 | 1 | 0 | 1 | 1 | 三个请求均 403，无素材 |
| 1440px `/codes/` | 1 | 0 | 1 | 1 | 三个请求均 403，无素材 |
| 375px 首页 | 0 | 1 | 1 | 1 | 三个请求均 403，无素材 |
| 375px `/codes/` | 0 | 1 | 1 | 1 | 三个请求均 403，无素材 |

目标生产域名也分别检查了上述四个页面/视口组合。当前旧部署没有本次广告容器或广告请求；不能把本地网络测试描述为新代码已在线成功投放。

原始 Desktop URL 的一次 curl 检查返回 200，但 JavaScript 正文为 0 bytes，无重定向。这与浏览器 403 的不同结果说明环境/请求上下文需要继续核实；两者都不能证明素材填充，也未据此修改任何官方地址。

最终本地浏览器中，四个测试页面均无页面级 JS exception、无横向溢出，空 Banner/Native 区域高度为 0。资源加载 403 仍出现在浏览器 console，已单独记录。单次采样的 CLS：桌面首页 0.04653、桌面 Codes 0.02030、移动首页 0.01423、移动 Codes 0.02007；这些是无素材情景的数据，不能代替真实填充后的性能测量。

由于 Social 未返回实际素材，其真实覆盖位置和 Play/Codes/导航是否被遮挡仍待线上填充后检查。

本地 QA 输出在 `output/playwright/`（被 Git 忽略，不进入站点构建）：

- `final-real-ad-qa.json` / `.log`：最终构建的未 Mock 请求、状态、属性、referrer、布局和性能采样。
- `real-ad-qa.json`：包含完整页面导航、首页→Codes→首页、后退/前进及生产旧部署基线。
- `mock-ad-qa.json` / `.log`：拦截、空响应、16 秒延迟、document.write 和 Strict Mode 测试。
- `boundary-ad-qa.json` / `.log`：767/768px 选择与桌面缩至移动宽度的 Mock 结构测试。
- `seo-regression.json`：修改前后的 SEO/内容比较。
- `real-1440-home.png`、`real-1440-codes.png`、`real-375-home.png`、`real-375-codes.png`：真实请求失败场景页面截图。
- `mock-delayed-desktop-codes.png`：模拟内容的布局截图，仅作 Mock QA。

**后台 Statistics：尚未验证后台是否已有 impression。没有确认曝光或收益。**

## D. 工程与 SEO

- `npm run typecheck`：通过（包括恢复 Next 自动生成声明文件到原状后的复核）。
- `npm run lint`：通过。
- `npm run build`：通过，静态导出及 postbuild 成功。
- `npm run verify:export`：通过，8 个核心页面及原有 GA4、Schema、FAQ、内部链接、robots/sitemap、legal noindex 和文本导出校验通过。
- 项目没有 `test`、`validate` 或 `audit:seo` 脚本，未将它们宣称为通过。浏览器 QA 使用 Playwright CLI；未增加 `@playwright/test` 或生产依赖。
- 修改前静态产物与最终产物对比：12 个非 Privacy 内容页面的 title、meta、canonical、H1/H2/H3、可见文字、JSON-LD、导航、Footer、锚点链接保持一致。
- Privacy 的 title、meta、H1/H2/H3、导航、Footer 和链接保持一致；仅广告服务说明及审阅/Schema 日期改变。
- `sitemap.xml`、`robots.txt`、`llms.txt`、`llms-full.txt`、`manifest.webmanifest` 与修改前逐字节相同。没有改动游戏数据、生成内容、GA4 Measurement ID `G-NW23ZFSC5L`、导航或 Footer 文案。
- Next dev 自动生成的 AGENTS/CLAUDE 文件和 next-env.d.ts 路径变更已清理/恢复，没有纳入本次改动。

### 部署后复核

1. 在 Publisher 的 Websites 中核对实际域名 `break-and-steal-an-egg.github.io` 及 Approved/Active 状态；检查表 A 四个 key 均属于该网站且可用。
2. 部署后用普通浏览器打开首页和 `/codes/`，分别设置 1440px 与 375px；DevTools → Network 勾选 Preserve log，按 `bauval.org` 过滤。每个新文档确认只有对应 Banner、Native、Social 三个原始请求。
3. 检查各请求的原始 URL、HTTP 状态、重定向链、最终 URL、Initiator、Referer 和 console。若 403，带请求证据核实来源、审批和浏览器环境；若 200 空正文/未填充，继续核实初始化、库存/no-fill、地域和设备。不要改写官方 src 或绕过 AdBlock。
4. 确认真实素材可见、Native 目标唯一、Social 不永久挡住 CTA、无横向滚动；正常导航及后退/前进不残留重复实例。不要点击广告或重复刷新制造测试流量。
5. 在 Statistics 核对网站、Ad Unit/Placement、日期、时区和其他筛选；确认有真实未拦截访客，并等待后台规定的数据处理时间。有素材却无数据时，核对归属/筛选/延迟，并把网络证据交给 Adsterra 支持。

未完成项：新代码尚未部署；已批准域名上的真实填充、适配 iframe 的统计效果、Social 实际覆盖情况及后台 impression 均待确认。请求发出不等于素材填充，素材填充也不等于后台立即记录 impression。
