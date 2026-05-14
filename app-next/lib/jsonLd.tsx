import type { ReactElement } from "react";

export const ORGANIZATION_LD = {
  "@type": "ProfessionalService" as const,
  "@id": "https://senscode.com/#organization",
  name: "SensCode",
  legalName: "Sensormedia LLC",
  url: "https://senscode.com/",
  logo: "https://senscode.com/assets/Signature.png",
};

export function breadcrumbLd(items: Array<{ name: string; url: string }>) {
  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function JsonLd({ graph }: { graph: unknown[] }): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
