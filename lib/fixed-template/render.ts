/** Shared modular wiki skin for navigation and structured articles. */
export function scopedTemplateCss(_skin: string, _accentColorId?: string) {
  return `
  body[data-fixed-template] { --foreground:31 34% 16%; --muted-foreground:31 24% 26%; --card:43 65% 85%; --card-foreground:31 34% 16%; --secondary:40 48% 78%; --muted:40 45% 80%; --border:31 43% 35%; --primary:258 60% 42%; --primary-foreground:0 0% 100%; --radius:0rem; }
  body[data-fixed-template] { background-color:#2f251a; background-image:linear-gradient(#3b2d1f 3px,transparent 3px),linear-gradient(90deg,#3b2d1f 3px,transparent 3px); background-size:44px 44px; }
  [data-fixed-template] h1,[data-fixed-template] h2,[data-fixed-template] h3 { letter-spacing:0; overflow-wrap:anywhere; }
  [data-fixed-template] h1 { font-size:clamp(1.8rem,4vw,3.1rem); line-height:1.3; color:#245235; }
  [data-fixed-template] h2 { font-size:clamp(1.3rem,2.4vw,1.8rem); line-height:1.4; color:#26573a; }
  [data-fixed-template] h3 { font-size:1.15rem; line-height:1.5; }
  [data-fixed-template] a:focus-visible,[data-fixed-template] button:focus-visible { outline:3px solid #8b5cf6; outline-offset:4px; }
  .wiki-top { background:#183a2d; color:#fff5c9; border-bottom:6px solid #74502f; }
  .wiki-top-inner { display:flex; align-items:center; flex-wrap:wrap; justify-content:space-between; gap:12px; padding-block:16px; }
  .wiki-brand { display:flex; align-items:center; gap:10px; max-width:100%; font-family:var(--font-heading); font-size:14px; font-weight:600; }
  .wiki-brand img { width:40px; height:40px; object-fit:cover; border:2px solid #c99a61; flex-shrink:0; }
  .wiki-primary-nav { display:flex; flex-wrap:wrap; gap:4px; }
  .wiki-primary-nav a { padding:10px; font-size:13px; border:2px solid transparent; }
  .wiki-primary-nav a:hover,.wiki-primary-nav a[aria-current=page] { background:#244d3d; border-color:#c99a61; }
  .wiki-menu-button { display:none; padding:10px; border:2px solid #c99a61; color:inherit; align-items:center; gap:8px; background:#244d3d; }
  .wiki-hero { background:linear-gradient(#79b8d8 0 58%,#5d8a3b 58% 63%,#6e4a2c 63%); padding:30px 0; }
  .wiki-board { background:#f1e1b4; border:6px solid #6e4a2c; box-shadow:0 0 0 3px #2d1d11,6px 6px 0 #0005; padding:clamp(18px,3vw,32px); min-width:0; }
  .wiki-home-hero { display:grid; grid-template-columns:minmax(0,1.3fr) minmax(0,.7fr); gap:28px; align-items:center; }
  .wiki-cover { width:100%; aspect-ratio:16/9; object-fit:cover; border:4px solid #76502e; }
  .wiki-date { font-size:14px; margin-top:18px; }
  .wiki-article-layout { display:grid; grid-template-columns:minmax(0,1fr) 220px; gap:24px; padding-block:32px; align-items:start; }
  .wiki-article { min-width:0; }
  .wiki-article .section-lead,.wiki-article section>p,.wiki-article article p { max-width:75ch; }
  .wiki-article p { line-height:1.8; }
  .wiki-article .content-card { box-shadow:none; background:#f4e5bd; border:2px solid #b49160; }
  .wiki-article section { scroll-margin-top:24px; }
  .wiki-article section + section { margin-top:42px; }
  .wiki-article section>h2 { border-bottom:2px solid #b49160; padding-bottom:12px; }
  .wiki-article .table-scroll { max-width:100%; overflow-x:auto; }
  .wiki-article table { min-width:520px; }
  .wiki-article th,.wiki-article td { vertical-align:top; line-height:1.65; }
  .wiki-toc { background:#f4e5bd; border:4px solid #714e2d; padding:18px; position:sticky; top:24px; font-size:14px; }
  .wiki-toc a { display:block; margin-top:12px; text-decoration:underline; text-underline-offset:3px; }
  .wiki-article .subsections { display:block; }
  .wiki-article .subsections article + article { margin-top:18px; }
  .wiki-article .guide-steps { grid-template-columns:1fr; list-style:none; }
  .wiki-status { border-left:6px solid #26573a; background:#e5d5a6; padding:16px; margin:18px 0; font-weight:600; }
  .wiki-footer { background:#183a2d; border-top:6px solid #714e2d; color:#fff5c9; }
  .wiki-footer .text-foreground,.wiki-footer .text-muted-foreground { color:inherit; }
  .wiki-footer a:hover { color:#d9c7ff; text-decoration:underline; }
  @media(max-width:1100px) { .wiki-primary-nav { width:100%; } }
  @media(max-width:820px) { .wiki-menu-button { display:flex; } .wiki-primary-nav { display:none; flex-direction:column; } .wiki-primary-nav.is-open { display:flex; } .wiki-brand { max-width:calc(100% - 108px); } .wiki-brand span { overflow-wrap:anywhere; } .wiki-home-hero,.wiki-article-layout { grid-template-columns:minmax(0,1fr); } .wiki-toc { position:static; } .wiki-home-hero .wiki-cover { max-height:220px; } .wiki-board { border-width:4px; padding:18px; } .wiki-article-layout { gap:18px; } }
  @media(prefers-reduced-motion:reduce) { html { scroll-behavior:auto; } a { transition:none; } }
  `;
}
