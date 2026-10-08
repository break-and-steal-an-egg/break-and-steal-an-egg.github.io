import type { HomePageDefinition, PageSection, SeoPageDefinition } from "@/config/types";

function sectionText(section: PageSection) {
  const parts = [section.heading, section.intro, section.callout, ...(section.paragraphs ?? []), ...(section.bullets ?? [])];
  function addTable(table: NonNullable<PageSection["table"]>) {
    parts.push(table.caption, table.columns.join(" | "), ...table.rows.map((row) => row.join(" | ")));
  }
  if (section.table) addTable(section.table);
  for (const subsection of section.subsections ?? []) {
    parts.push(subsection.heading, ...subsection.paragraphs, ...(subsection.bullets ?? []));
    if (subsection.table) addTable(subsection.table);
  }
  for (const step of section.steps ?? []) parts.push(step.heading, step.description);
  for (const link of section.links ?? []) parts.push(link.label, link.description);
  return parts.filter(Boolean).join("\n");
}

export function pagePlainText(page: HomePageDefinition | SeoPageDefinition) {
  const heroLead = page.hero.lead;
  const sections = page.sections.map(sectionText);
  const faq = (page.faq ?? []).flatMap((item) => [item.question, item.answer]);
  return [page.title, page.description, page.hero.heading, heroLead, ...sections, ...faq].join("\n");
}

export function wordCount(text: string) {
  return text.toLowerCase().match(/[a-z0-9]+(?:['-][a-z0-9]+)*/g)?.length ?? 0;
}

export function termCount(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (text.match(new RegExp(`\\b${escaped}\\b`, "gi")) ?? []).length;
}
