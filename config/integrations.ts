import type { IntegrationConfig } from "./types";
import generatedIntegrationsRaw from "../content/generated/integrations.json";

type GeneratedIntegrations = {
  gaMeasurementId?: string | null;
  bingSiteVerification?: string | null;
};

const generatedIntegrations = generatedIntegrationsRaw as GeneratedIntegrations;

const gaFromEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
const gaFromGenerated = typeof generatedIntegrations.gaMeasurementId === "string"
  ? generatedIntegrations.gaMeasurementId.trim()
  : "";
const gaMeasurementId = gaFromEnv || gaFromGenerated || "";

const bingFromEnv = process.env.BING_SITE_VERIFICATION?.trim() || "";
const bingFromGenerated = typeof generatedIntegrations.bingSiteVerification === "string"
  ? generatedIntegrations.bingSiteVerification.trim()
  : "";
const bingVerification = bingFromEnv || bingFromGenerated || null;

export const integrations: IntegrationConfig = {
  analytics: /^G-[A-Z0-9]+$/i.test(gaMeasurementId)
    ? { provider: "google-analytics", measurementId: gaMeasurementId.toUpperCase() }
    : { provider: "none" },
  // Public GET CODE for this website only. Legacy environment values must not
  // silently replace these placements in a GitHub Pages build.
  ads: {
    provider: "adsterra",
    scriptUrl: "https://bauval.org/21/0f53a608f3525a1de6e926eaaa15816a",
    containerId: "container-0f53a608f3525a1de6e926eaaa15816a",
    banners: {
      desktop: {
        key: "7426e0b4535177b251052c4216cc4709",
        format: "iframe", width: 728, height: 90, params: {},
        scriptUrl: "https://bauval.org/22/7426e0b4535177b251052c4216cc4709",
      },
      mobile: {
        key: "366c8fccedfb0e055e7728b86a927983",
        format: "iframe", width: 320, height: 50, params: {},
        scriptUrl: "https://bauval.org/22/366c8fccedfb0e055e7728b86a927983",
      },
    },
    socialScriptUrl: "https://bauval.org/14/4cde00871a8a6e115ca1ab27134b18af",
  },
  verification: {
    bing: bingVerification,
  },
};
