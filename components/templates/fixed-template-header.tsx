"use client";

import { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import type { InternalLink } from "@/config/types";
import { assetPath, routePath } from "@/lib/urls";

export function FixedTemplateHeader({ links }: { links: InternalLink[] }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const pathname = usePathname()?.replace(/\/+$/, "") || "/";
  return (
    <header className="wiki-top" onKeyDown={(event) => {
      if (event.key === "Escape" && open) { setOpen(false); button.current?.focus(); }
    }}>
      <div className="site-container wiki-top-inner">
        <Link className="wiki-brand" href="/" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={assetPath(siteConfig.assets.logo)} alt="" width={40} height={40} />
          <span>{siteConfig.shortName}</span>
        </Link>
        <button ref={button} type="button" className="wiki-menu-button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />} Menu
        </button>
        <nav id="primary-navigation" aria-label="Primary navigation" className={`wiki-primary-nav${open ? " is-open" : ""}`}>
          {links.map((link) => <Link key={link.slug} href={routePath(link.slug)} aria-current={pathname === `/${link.slug}` ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
        </nav>
      </div>
    </header>
  );
}
