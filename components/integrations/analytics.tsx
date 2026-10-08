import Script from "next/script";
import { integrations } from "@/config/integrations";

export function Analytics() {
  if (integrations.analytics.provider !== "google-analytics") return null;
  const measurementId = integrations.analytics.measurementId;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
