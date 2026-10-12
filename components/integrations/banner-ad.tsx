"use client";

import { useEffect, useRef } from "react";
import { integrations } from "@/config/integrations";

export function BannerAd() {
  const slotRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slot = slotRef.current;
    const host = hostRef.current;
    if (!slot || !host || integrations.ads.provider !== "adsterra") return;

    // Choose once per document; never refresh an ad on a resize. Isolation keeps
    // any provider document.write inside the adapter instead of the React page.
    let frame = host.querySelector<HTMLIFrameElement>("iframe");
    if (!frame) {
      const device = window.matchMedia("(min-width: 768px)").matches ? "desktop" : "mobile";
      const { scriptUrl, ...options } = integrations.ads.banners[device];
      slot.dataset.device = device;
      frame = document.createElement("iframe");
      frame.title = "Advertisement";
      frame.width = String(options.width);
      frame.height = String(options.height);
      // No sandbox: srcdoc inherits the site's origin and document referrer.
      frame.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;width:${options.width}px;overflow:hidden}</style></head><body><script>atOptions = ${JSON.stringify(options)};<\/script><script src="${scriptUrl}"><\/script></body></html>`;
      host.appendChild(frame);
    }
    const adFrame = frame;
    let mutations: MutationObserver | undefined;
    let sizes: ResizeObserver | undefined;
    const fit = () => {
      const width = Number(adFrame.width);
      const scale = Math.min(1, slot.clientWidth / width);
      host.style.width = `${width * scale}px`;
      host.style.height = `${Number(adFrame.height) * scale}px`;
      adFrame.style.transform = `scale(${scale})`;
    };
    const inspect = () => {
      const body = adFrame.contentDocument?.body;
      if (!body) return;
      const filled = Array.from(body.children).some((child) =>
        !["SCRIPT", "STYLE"].includes(child.tagName) && child.getBoundingClientRect().height > 0,
      );
      slot.dataset.state = filled ? "filled" : "empty";
    };
    const watch = () => {
      mutations?.disconnect();
      sizes?.disconnect();
      const body = adFrame.contentDocument?.body;
      if (!body) return;
      mutations = new MutationObserver(inspect);
      sizes = new ResizeObserver(inspect);
      mutations.observe(body, { childList: true, subtree: true, attributes: true });
      sizes.observe(body);
      inspect();
    };
    const viewport = new ResizeObserver(fit);
    viewport.observe(slot);
    adFrame.addEventListener("load", watch);
    if (adFrame.contentDocument?.URL === "about:srcdoc" && adFrame.contentDocument.readyState === "complete") watch();
    fit();

    return () => {
      viewport.disconnect();
      mutations?.disconnect();
      sizes?.disconnect();
      adFrame.removeEventListener("load", watch);
      // Preserve the adapter through Strict Mode replay; no timeout or retries.
    };
  }, []);

  if (integrations.ads.provider !== "adsterra") return null;
  return <div ref={slotRef} className="ad-slot ad-banner" data-banner-ad-slot data-state="pending" aria-label="Advertisement">
    <div className="ad-label">Advertisement</div>
    <div ref={hostRef} className="ad-banner-host" />
  </div>;
}
