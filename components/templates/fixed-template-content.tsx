import type { HomePageDefinition, SeoPageDefinition } from "@/config/types";
import { PageSections } from "@/components/site/page-sections";
import { NativeAdSlot } from "@/components/integrations/native-ad-slot";
import { Faq } from "@/components/site/faq";
import { assetPath } from "@/lib/urls";

export function UpdatedDate({ date }: { date: string }) {
  const label = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
  return <p className="wiki-date">Last updated: <time dateTime={date}>{label}</time></p>;
}

export function FixedContent({ page }: { page: HomePageDefinition | SeoPageDefinition }) {
  return <>
    <PageSections sections={page.sections} afterFirstSection={<NativeAdSlot />} />
    {page.screenshots?.length ? <section id="screenshots"><h2>Gameplay Screenshots</h2><div className="mt-7 grid gap-5 md:grid-cols-2">
      {page.screenshots.map((shot) => <figure key={shot.src}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={assetPath(shot.src)} alt={shot.alt} className="aspect-video w-full object-cover" loading="lazy" />
        {shot.caption ? <figcaption>{shot.caption}</figcaption> : null}
      </figure>)}
    </div></section> : null}
    {page.faq?.length ? <Faq items={page.faq} /> : null}
  </>;
}

export function ContentNavigation({ page }: { page: HomePageDefinition | SeoPageDefinition }) {
  return <nav className="wiki-toc" aria-label="On this page"><strong>On this page</strong>
    {page.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.heading}</a>)}
    {page.faq?.length ? <a href="#faq">Frequently Asked Questions</a> : null}
  </nav>;
}
