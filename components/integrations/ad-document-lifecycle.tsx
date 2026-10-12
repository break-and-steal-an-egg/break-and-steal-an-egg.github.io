"use client";

import { useEffect } from "react";
import Script from "next/script";
import { integrations } from "@/config/integrations";

export function AdDocumentLifecycle() {
  useEffect(() => {
    if (integrations.ads.provider !== "adsterra") return;
    // Third-party snippets expose no safe SPA teardown/reinitialization API.
    // Use normal static-page navigation to give each page a clean document.
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || (url.pathname === location.pathname && url.search === location.search)) return;
      event.preventDefault();
      event.stopPropagation();
      location.assign(url.href);
    };
    document.addEventListener("click", navigate, true);
    return () => document.removeEventListener("click", navigate, true);
  }, []);

  if (integrations.ads.provider !== "adsterra") return null;
  return <Script id="adsterra-social-bar" src={integrations.ads.socialScriptUrl} data-cfasync="false" strategy="afterInteractive" />;
}
