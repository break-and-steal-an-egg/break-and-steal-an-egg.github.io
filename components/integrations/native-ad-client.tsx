"use client";

import { useEffect, useRef } from "react";

export function NativeAdClient({ scriptUrl, containerId }: { scriptUrl: string; containerId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let container = host.querySelector<HTMLDivElement>(`[id="${containerId}"]`);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      host.appendChild(container);
    }
    const update = () => {
      // Empty/no-fill hosts have no label or margins. Keep the official target
      // alive: delayed provider content can still make the slot visible.
      if (slotRef.current) slotRef.current.dataset.filled = String(container.getBoundingClientRect().height > 0);
    };
    const mutations = new MutationObserver(update);
    const sizes = new ResizeObserver(update);
    mutations.observe(container, { childList: true, subtree: true, attributes: true });
    sizes.observe(container);

    if (!host.querySelector("script[data-game-wiki-native-ad]")) {
      const script = document.createElement("script");
      script.async = true;
      script.src = scriptUrl;
      script.dataset.cfasync = "false";
      script.dataset.gameWikiNativeAd = containerId;
      script.addEventListener("error", update);
      script.addEventListener("load", update);
      // Mount the original container before executing the official script.
      host.appendChild(script);
    }
    update();

    return () => {
      mutations.disconnect();
      sizes.disconnect();
      // Do not destroy loading scripts/targets during Strict Mode replay.
    };
  }, [containerId, scriptUrl]);

  return <div ref={slotRef} className="ad-slot ad-native" data-native-ad-slot data-filled="false" aria-label="Advertisement">
    <div className="ad-label">Advertisement</div>
    <div ref={hostRef} className="ad-native-host" />
  </div>;
}
