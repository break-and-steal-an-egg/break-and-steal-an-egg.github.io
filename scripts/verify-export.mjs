import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const home = JSON.parse(readFileSync('content/generated/home.json', 'utf8'));
const core = JSON.parse(readFileSync('content/generated/pages.json', 'utf8'));
const site = JSON.parse(readFileSync('content/generated/site.json', 'utf8'));
const root = `${site.hosting.siteUrl}/`;
const pages = [home, ...core];
const titles = new Set();
const descriptions = new Set();
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');
const textOnly = (html) => decode(html.replace(/<(script|style|svg|nav)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' '));
const requiredSlugs = ['', 'codes', 'new-biome', 'zones', 'eggs', 'pickaxes', 'trails', 'beginner-guide'];
const reviewDate = '2026-10-08';
const legalSlugs = ['about', 'privacy', 'terms', 'copyright', 'contact'];
assert.deepEqual(pages.map((p) => p.slug), requiredSlugs);
assert.equal(site.readyForLaunch, true);
assert.equal(site.seo.titleTemplate, '%s');
assert.equal(site.game.developer, 'ILGames x Eggs');
assert.ok(!existsSync('tsconfig.tsbuildinfo'), 'Root TypeScript cache must be absent');
const zoneTable = core.find((page) => page.slug === 'zones').sections[0].table;
assert.equal(zoneTable.rows.length, 9);
assert.deepEqual(core.find((page) => page.slug === 'eggs').sections[0].table, {
  ...zoneTable,
  caption: 'Current eggs by zone and rarity — guide updated October 8, 2026',
});
assert.equal(core.find((page) => page.slug === 'pickaxes').sections[0].table.rows.length, 18);
assert.equal(core.find((page) => page.slug === 'trails').sections[0].table.rows.length, 11);

for (const page of pages) {
  assert.equal(page.lastReviewed, reviewDate, `${page.slug} review date`);
  assert.ok(!JSON.stringify(page).includes('October 7') && !JSON.stringify(page).includes('2026-10-07'), 'Old core review date');
  const path = page.slug ? join('out', page.slug, 'index.html') : 'out/index.html';
  assert.ok(existsSync(path), `Missing ${path}`);
  const html = readFileSync(path, 'utf8');
  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '');
  const description = decode(html.match(/<meta name="description" content="([^"]*)"\s*\/?\s*>/)?.[1] ?? '');
  assert.equal(title, page.title, `${page.slug} title`);
  assert.equal(description, page.description, `${page.slug} description`);
  assert.ok(title.length <= 60 && !titles.has(title), 'Title length or uniqueness');
  assert.ok(description.length <= 160 && !descriptions.has(description), 'Description length or uniqueness');
  titles.add(title); descriptions.add(description);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${page.slug} H1 count`);
  assert.ok(html.includes(`<link rel="canonical" href="${root}${page.slug ? `${page.slug}/` : ''}"`), `${page.slug} canonical`);
  assert.ok(/<meta name="robots" content="index, follow"/.test(html), `${page.slug} indexability`);
  assert.ok(html.includes(`<meta property="og:title" content="${escape(page.title)}"`));
  assert.ok(html.includes(`<meta name="twitter:description" content="${escape(page.description)}"`));
  assert.equal((html.match(/<footer\b/g) ?? []).length, 1, 'Global footer count');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
  assert.ok(main.includes('<time dateTime="2026-10-08">October 8, 2026</time>'), 'Visible update date');
  const nav = html.match(/<nav id="primary-navigation"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
  const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1] ?? '';
  for (const slug of requiredSlugs.slice(1)) {
    assert.ok(nav.includes(`href="/${slug}/"`), `Missing header link ${slug}`);
    assert.ok(footer.includes(`href="/${slug}/"`), `Missing footer link ${slug}`);
  }
  for (const slug of legalSlugs) assert.ok(footer.includes(`href="/${slug}/"`), `Missing legal link ${slug}`);
  if (page.slug) {
    assert.ok(main.includes('href="/"'), 'Missing home body link');
    const contextLinks = page.sections.flatMap((section) => section.links ?? []).filter((link) => link.slug);
    assert.ok(contextLinks.length >= 1, 'Missing contextual guide links');
    for (const link of contextLinks) assert.ok(main.includes(`href="/${link.slug}/"`), 'Missing contextual link');
  }
  const words = textOnly(main).match(/[a-z0-9]+(?:['-][a-z0-9]+)*/gi)?.length ?? 0;
  assert.ok(words >= (page.slug ? 800 : 1200), `${page.slug} visible word count ${words}`);
  for (const section of page.sections) {
    assert.ok(main.includes(`<h2>${escape(section.heading)}</h2>`), `Missing H2 ${section.heading}`);
    for (const sub of section.subsections ?? []) assert.ok(main.includes(`<h3>${escape(sub.heading)}</h3>`), `Missing H3 ${sub.heading}`);
    for (const table of [section.table, ...(section.subsections ?? []).map((s) => s.table)].filter(Boolean)) {
      assert.ok(main.includes(escape(table.caption)), 'Table caption');
      for (const row of table.rows) for (const cell of row) assert.ok(main.includes(escape(cell)), `Missing table cell ${cell}`);
    }
  }
  const renderedTables = [...main.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/g)].map((match) => {
    const tbody = match[1].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)?.[1] ?? '';
    return [...tbody.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map((row) => [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/g)].map((cell) => textOnly(cell[1]).trim()));
  });
  const expectedTables = page.sections.flatMap((section) => [section.table, ...(section.subsections ?? []).map((sub) => sub.table)]).filter(Boolean);
  assert.deepEqual(renderedTables, expectedTables.map((table) => table.rows), 'Exported table rows');
  for (const match of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = decode(match[1]);
    const target = href.endsWith('/') ? join('out', href, 'index.html') : join('out', href);
    assert.ok(existsSync(target), `Broken internal link ${href}`);
  }
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => JSON.parse(m[1]));
  const types = schemas.map((s) => s['@type']);
  for (const type of page.slug ? ['WebPage', 'BreadcrumbList', 'FAQPage'] : ['WebSite', 'VideoGame', 'FAQPage']) assert.ok(types.includes(type), `Missing schema ${type}`);
  const faq = schemas.find((s) => s['@type'] === 'FAQPage');
  assert.deepEqual(faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]), page.faq.map((f) => [f.question, f.answer]));
  for (const f of page.faq) assert.ok(main.includes(escape(f.question)) && main.includes(escape(f.answer)), 'Visible FAQ mismatch');
  if (page.slug) {
    const crumb = schemas.find((s) => s['@type'] === 'BreadcrumbList');
    assert.equal(crumb.itemListElement.at(-1).item, `${root}${page.slug}/`);
    assert.ok(main.includes('aria-label="Breadcrumb"'));
  } else {
    assert.equal(schemas.find((s) => s['@type'] === 'VideoGame').author.name, 'ILGames x Eggs');
    for (const slug of requiredSlugs.slice(1)) assert.ok(main.includes(`href="/${slug}/"`), `Missing home body link ${slug}`);
  }
  if (page.slug === 'new-biome') {
    const event = schemas.find((s) => s['@type'] === 'Event');
    assert.equal(event.startDate, '2026-10-11T12:00:07Z');
    assert.equal(event.endDate, '2026-10-12T12:00:07Z');
    assert.equal(event.location.url, site.game.officialUrl);
  }
  if (page.slug === 'beginner-guide') {
    const steps = page.sections.flatMap((s) => s.steps ?? []);
    assert.deepEqual(schemas.find((s) => s['@type'] === 'HowTo').step.map((s) => [s.name, s.text]), steps.map((s) => [s.heading, s.description]));
  }
  if (page.slug === 'codes') {
    assert.ok(!types.includes('HowTo'));
    assert.ok(main.includes('There are currently no confirmed working redeem codes for Break and Steal an Egg as of October 8, 2026.'));
  }
  console.log(`${page.slug || '/'}: PASS · ${words} visible words · title ${title.length} · description ${description.length}`);
}
const robots = readFileSync('out/robots.txt', 'utf8');
assert.ok(robots.includes('Allow: /') && !robots.includes('Disallow: /'));
assert.ok(robots.includes(`${root}sitemap.xml`));
const sitemap = readFileSync('out/sitemap.xml', 'utf8');
assert.equal((sitemap.match(/<loc>/g) ?? []).length, 8);
for (const slug of requiredSlugs) assert.ok(sitemap.includes(`<loc>${root}${slug ? `${slug}/` : ''}</loc>`));
assert.equal((sitemap.match(/<lastmod>2026-10-08(?:T00:00:00.000Z)?<\/lastmod>/g) ?? []).length, 8);
for (const name of ['llms.txt', 'llms-full.txt']) {
  const text = readFileSync(`out/${name}`, 'utf8');
  for (const slug of requiredSlugs.slice(1)) assert.ok(text.includes(`${root}${slug}/`));
  for (const slug of legalSlugs) assert.ok(!text.includes(`${root}${slug}/`), 'Legal page in text export');
  assert.ok(!text.includes('October 7, 2026') && !text.includes('2026-10-07'), 'Old date in text export');
}
assert.ok(readFileSync('out/llms-full.txt', 'utf8').includes('Celestial | $20Qa | 25B'));
assert.ok(readFileSync('out/index.html', 'utf8').includes('G-NW23ZFSC5L'));
assert.equal(JSON.parse(readFileSync('out/manifest.webmanifest', 'utf8')).icons[0].type, 'image/webp');
for (const slug of legalSlugs) assert.ok(readFileSync(`out/${slug}/index.html`, 'utf8').includes('content="noindex, follow"'));
assert.ok(readFileSync('out/404.html', 'utf8').includes('noindex'));
console.log('Robots, sitemap, structured data, internal links, GA4, legal pages and text exports: PASS');
