// app/routes/app._index.jsx — Polaris edition
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Button, Badge, Stack } from "@shopify/polaris";

/* ===============================
 * LOADER: Auth (Managed pricing)
 * =============================== */
export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { session } = await authenticate.admin(request);

  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  return json({ shopSub, apiKey });
};

/* ===============================
 * Deep links (Theme editor)
 * =============================== */
function editorBase({ shopSub }) {
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}
function linkAddBlock({ shopSub, template = "index", apiKey, handle, target = "newAppsSection" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    target,
    addAppBlockId: `${apiKey}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}

/* ===============================
 * Icônes inline (on garde tes SVG pour fiabilité)
 * =============================== */
const SQUARE = (size = 44) => ({
  width: size,
  height: size,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,.45), 0 10px 28px rgba(70,78,255,.15)",
});

const SquareIcon = ({ size = 44, grad = "violet", children }) => {
  const bg =
    grad === "violet"
      ? "linear-gradient(135deg,#7c3aed 0%,#3b82f6 100%)"
      : grad === "blue"
      ? "linear-gradient(135deg,#3b82f6 0%,#22c1c3 100%)"
      : grad === "pink"
      ? "linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%)"
      : "linear-gradient(135deg,#6366f1 0%,#22d3ee 100%)";
  return <div style={{ ...SQUARE(size), background: bg }}>{children}</div>;
};

const TinyBadge = ({ emoji }) => (
  <div style={{ display: "inline-grid", placeItems: "center", width: 28, height: 28 }}>
    <span style={{ fontSize: 16 }}>{emoji}</span>
  </div>
);

const GlyphWindow = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" fill="#ffffff" opacity="0.95" />
    <rect x="5" y="9" width="14" height="8" rx="2" fill="#3b82f6" opacity="0.95" />
    <circle cx="7" cy="7" r="1" fill="#8b5cf6" />
    <circle cx="10" cy="7" r="1" fill="#8b5cf6" />
    <circle cx="13" cy="7" r="1" fill="#8b5cf6" />
  </svg>
);
const GlyphGallery = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3" fill="#fff" opacity="0.95" />
    <rect x="6" y="9" width="4" height="8" rx="2" fill="#60a5fa" />
    <rect x="10" y="9" width="4" height="8" rx="2" fill="#818cf8" />
    <rect x="14" y="9" width="4" height="8" rx="2" fill="#a78bfa" />
  </svg>
);
const GlyphMarquee = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="6" width="18" height="12" rx="3" fill="#fff" opacity="0.95" />
    <circle cx="8" cy="12" r="2.5" fill="#60a5fa" />
    <circle cx="12" cy="12" r="2.5" fill="#818cf8" />
    <circle cx="16" cy="12" r="2.5" fill="#a78bfa" />
  </svg>
);
const GlyphCard = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="5" width="16" height="14" rx="3" fill="#fff" opacity="0.95" />
    <rect x="6" y="7" width="12" height="7" rx="2" fill="#93c5fd" />
    <rect x="6" y="15.5" width="7.5" height="2" rx="1" fill="#6366f1" />
  </svg>
);
const GlyphStar = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.8 6.9 19l1-5.6-4.1-4 5.7-.8L12 3.5z" fill="#fff" />
  </svg>
);

/* ===============================
 * Données des blocs
 * =============================== */
const APP_BLOCKS = [
  {
    handle: "tls-header",
    template: "index",
    title: "Simple header (dark & pink)",
    desc: "Logo, horizontal menu, and cart. Clean and responsive.",
    icon: <GlyphWindow />,
    grad: "violet",
    group: "Header",
  },
  {
    handle: "tls-banner-3",
    template: "index",
    title: "Banner – 3 images",
    desc: "Auto slider with 3 visuals. Keeps original ratio (no crop).",
    icon: <GlyphGallery />,
    grad: "blue",
    group: "Content",
  },
  {
    handle: "tls-circle-marquee",
    template: "index",
    title: "Product marquee (circle)",
    desc: "Continuous scrolling list of products with hover zoom.",
    icon: <GlyphMarquee />,
    grad: "violet",
    group: "Content",
  },
  {
    handle: "tls-product-card",
    template: "product",
    title: "Product – Showcase card",
    desc: "Large main image, thumbnails, price, and a primary CTA.",
    icon: <GlyphCard />,
    grad: "pink",
    group: "Content",
  },
  {
    handle: "tls-social-timer",
    template: "index",
    title: "Social + Countdown",
    desc: "Instagram / Facebook / TikTok / WhatsApp icons with live timer.",
    icon: <GlyphStar />,
    grad: "aqua",
    group: "Content",
  },
  {
    handle: "tls-testimonials",
    template: "index",
    title: "Testimonials grid",
    desc: "Responsive customer reviews presented in a clean grid.",
    icon: <GlyphStar />,
    grad: "violet",
    group: "Content",
  },
  {
    handle: "tls-footer",
    template: "index",
    title: "Footer (2–4 columns)",
    desc: "Uses Shopify menus and payment icons. Fully responsive.",
    icon: <GlyphWindow />,
    grad: "blue",
    group: "Footer",
  },
];

export default function AppIndex() {
  const { shopSub, apiKey } = useLoaderData();

  const groups = [
    { key: "Header", emoji: "🧱" },
    { key: "Content", emoji: "🧩" },
    { key: "Footer", emoji: "📦" },
  ];

  const byGroup = (g) => APP_BLOCKS.filter((b) => b.group === g);

  const AddButton = ({ b }) => (
    <Button variant="primary"
      url={linkAddBlock({ shopSub, template: b.template, apiKey, handle: b.handle })}
      external
      target="_top"
    >
      Add to theme
    </Button>
  );

  return (
    <Page
      title="Triple-Luxe-Sections"
      subtitle="Build premium sections in seconds"
      secondaryActions={[
        { content: "YouTube", url: "https://youtube.com", external: true, target: "_blank" },
        { content: "WhatsApp", url: "https://wa.me/", external: true, target: "_blank" },
      ]}>

      <Layout>
        {groups.map((g) => (
          <Layout.Section key={g.key}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <TinyBadge emoji={g.emoji} />
              <h2 style={{ margin: 0, fontSize: 18 }}>{g.key}</h2>
            </div>

            <Card>
              <Stack vertical spacing="tight">
                {byGroup(g.key).map((b, i) => (
                  <div
                    key={b.handle}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "56px 1fr auto",
                      alignItems: "center",
                      gap: 14,
                      padding: "10px 6px",
                      borderTop: i === 0 ? "none" : "1px solid var(--p-color-bg-surface-tertiary, #f1f2f4)",
                    }}
                  >
                    <SquareIcon grad={b.grad}>{b.icon}</SquareIcon>

                    <div>
                      <h3 style={{ margin: 0, fontSize: 16 }}>{b.title}</h3>
                      <p style={{ margin: "4px 0 0 0", color: "#637381", fontSize: 13 }}>{b.desc}</p>
                    </div>

                    <AddButton b={b} />
                  </div>
                ))}
              </Stack>
            </Card>
          </Layout.Section>
        ))}

        {/* Bandeau d'info "Build for Shopify" (facultatif) */}
        <Layout.Section>
          <Card>
            <Stack spacing="loose" alignment="center">
              <Badge status="success">Build for Shopify</Badge>
              <div style={{ color: "#637381" }}>
                UI basée sur Polaris pour un look & feel natif de l'Admin Shopify.
              </div>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
