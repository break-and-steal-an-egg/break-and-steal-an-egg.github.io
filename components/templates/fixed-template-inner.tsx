import Link from "next/link";
import { BannerAd } from "@/components/integrations/banner-ad";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { RelatedPages } from "@/components/site/related-pages";
import type { SeoPageDefinition } from "@/config/types";
import { siteConfig } from "@/config/site";
import { getRelatedPages } from "@/content/registry";
import { pageSchemas } from "@/lib/schema";
import { ContentNavigation, FixedContent, UpdatedDate } from "./fixed-template-content";

export function FixedTemplateInner({ page }: { page: SeoPageDefinition }) {
  return <>
    <JsonLd data={pageSchemas(page)} />
    <main className="site-container wiki-article-layout">
      <article className="wiki-board wiki-article">
        <Breadcrumbs slug={page.slug} current={page.hero.heading} />
        <header className="mb-10">
          {page.hero.eyebrow ? <p className="eyebrow">{page.hero.eyebrow}</p> : null}
          <h1>{page.hero.heading}</h1><p className="section-lead">{page.hero.lead}</p><UpdatedDate date={page.lastReviewed} />
        </header>
        <BannerAd />
        <FixedContent page={page} />
        <RelatedPages pages={getRelatedPages(page)} />
        <p className="mt-8"><Link className="underline" href="/">Return to the Break and Steal an Egg wiki</Link>{siteConfig.game.officialUrl ? <> · <a className="underline" href={siteConfig.game.officialUrl} rel="noopener noreferrer">Official Roblox game</a></> : null}</p>
      </article>
      <ContentNavigation page={page} />
    </main>
  </>;
}
