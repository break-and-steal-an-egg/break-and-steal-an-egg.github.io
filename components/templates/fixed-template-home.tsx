import Link from "next/link";
import { BannerAd } from "@/components/integrations/banner-ad";
import { JsonLd } from "@/components/site/json-ld";
import { siteConfig } from "@/config/site";
import type { HomePageDefinition } from "@/config/types";
import { homeSchemas } from "@/lib/schema";
import { assetPath, routePath } from "@/lib/urls";
import { ContentNavigation, FixedContent, UpdatedDate } from "./fixed-template-content";

export function FixedTemplateHome({ home }: { home: HomePageDefinition }) {
  return <>
    <JsonLd data={homeSchemas(home)} />
    <main>
      <section className="wiki-hero"><div className="site-container"><div className="wiki-board wiki-home-hero">
        <div><p className="eyebrow">{home.hero.eyebrow}</p><h1>{home.hero.heading}</h1><p className="section-lead">{home.hero.lead}</p>
          {home.hero.supportingText ? <p>{home.hero.supportingText}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {home.hero.primaryLink ? <Link className="button-primary" href={routePath(home.hero.primaryLink.slug)}>{home.hero.primaryLink.label}</Link> : null}
            {home.hero.secondaryLink ? <a className="button-secondary" href={home.hero.secondaryLink.url} rel="noopener noreferrer">{home.hero.secondaryLink.label}</a> : null}
          </div><UpdatedDate date={home.lastReviewed} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="wiki-cover" src={assetPath(siteConfig.assets.cover)} width={767} height={432} alt="Break and Steal an Egg Roblox cover art" fetchPriority="high" />
      </div></div></section>
      <div className="site-container"><BannerAd /></div>
      <div className="site-container wiki-article-layout">
        <div className="wiki-board wiki-article"><FixedContent page={home} /></div>
        <ContentNavigation page={home} />
      </div>
    </main>
  </>;
}
