import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { themes } from "@/config/themes";
import { assetPath } from "@/lib/urls";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const theme = themes[siteConfig.theme.preset];
  return {
    name: siteConfig.siteName,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: assetPath("/"),
    display: "standalone",
    background_color: `hsl(${siteConfig.theme.overrides?.background ?? theme?.tokens.background ?? "31 29% 14%"})`,
    theme_color: `hsl(${siteConfig.theme.overrides?.primary ?? theme?.tokens.primary ?? "258 90% 66%"})`,
    icons: [{ src: assetPath(siteConfig.assets.logo), sizes: "120x120", type: "image/webp" }],
  };
}
