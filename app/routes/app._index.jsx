// app/routes/app._index.jsx — TLS · 3 themes (Polaris-only icons)
import React, { useEffect, useMemo, useState } from "react";
import { useRouteLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  Button,
  Badge,
  BlockStack,
  InlineStack,
  Text,
  Box,
  Banner,
  Icon,
} from "@shopify/polaris";
import {
  AppsIcon,
  ThemeEditIcon,
  ImageIcon,
  StarIcon,
  ViewIcon,
} from "@shopify/polaris-icons";

/* ===== externals (YouTube / WhatsApp) ===== */
const YOUTUBE_URL = "https://www.youtube.com/@yourchannel"; // change si besoin
const WHATSAPP_URL = "https://wa.me/+212630079763";

/* ===== shared button base (for floating FABs) ===== */
const BUTTON_FAB = {
  position: "fixed",
  bottom: "24px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
  zIndex: 60,                // z-index raisonnable pour ne pas couvrir ton UI
  textDecoration: "none",
  backgroundColor: "#000",
};

/* ===== get parent data (shopSub, apiKey) ===== */
function useParentData() {
  return useRouteLoaderData("routes/app") || { shopSub: "", apiKey: "" };
}

/* ===== Deep links Theme Editor ===== */
function editorBase({ shopSub }) {
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}
function linkAddBlock({
  shopSub,
  template = "index",
  apiKey,
  handle,
  target = "main",
}) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    target,
    addAppBlockId: `${apiKey}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}

/* ===== Light CSS ===== */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .tls-theme-chip {
    display:inline-grid; grid-auto-flow:column; gap:8px; align-items:center;
    padding:8px 12px; border:1px solid #E5E7EB; border-radius:999px;
    background:#fff; cursor:pointer; font-weight:700;
  }
  .tls-theme-chip[data-on="1"] { outline:2px solid #2563EB; }
  .tls-block-row  { padding:10px 6px; border-top:1px solid #F1F2F4; }
  .tls-block-row:first-of-type { border-top:none; }
`;
function InjectCssOnce() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("tls-layout-css")) return;
    const t = document.createElement("style");
    t.id = "tls-layout-css";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
  }, []);
  return null;
}

/* ===== META (Polaris icons only) ===== */
const META = {
  // Theme 1 — Tech
  "header-informatique": {
    title: "Header — Tech",
    icon: ThemeEditIcon,
    desc: "Logo, search, utilities, quick links.",
  },
  "banner-kenburns": {
    title: "Ken Burns Banner",
    icon: ImageIcon,
    desc: "3 slides, fade + smooth zoom/pan.",
  },
  "carousel-cercle": {
    title: "Circle Carousel",
    icon: AppsIcon,
    desc: "Circular image scrolling.",
  },
  "packs-descriptifs": {
    title: "Descriptive Packs",
    icon: StarIcon,
    desc: "Product cards + lists & badges.",
  },
  "product-grid-glow": {
    title: "Product Grid (Glow)",
    icon: AppsIcon,
    desc: "Showcase products with glow style.",
  },
  "social-icons": {
    title: "Social Icons",
    icon: AppsIcon,
    desc: "Stylish social links, variants.",
  },
  "footer-liens": {
    title: "Footer — Links",
    icon: ViewIcon,
    desc: "2–4 link columns.",
  },

  // Theme 2 — Fashion
  "t2-header-fashion": {
    title: "Header — Fashion",
    icon: ThemeEditIcon,
    desc: "Fashion header (light, airy).",
  },
  "t2-hero-runway": {
    title: "Hero — Runway",
    icon: ImageIcon,
    desc: "Runway hero with collection CTA.",
  },
  "t2-categories-pills": {
    title: "Categories (pills)",
    icon: AppsIcon,
    desc: "Filters/tabs styled as pills.",
  },
  "t2-products-grid": {
    title: "Product Grid (Fashion)",
    icon: AppsIcon,
    desc: "Responsive grid adapted for fashion.",
  },
  "t2-social-proof": {
    title: "Social Proof",
    icon: StarIcon,
    desc: "Testimonials / customer reviews.",
  },

  // Theme 3 — Triple-S Branding (pro)
  "tls3-hero-brand-video-pro": {
    title: "Hero Video — Brand Pro",
    icon: ImageIcon,
    desc: "Large hero video or key visual.",
  },
  "tls3-marquee-wordmark-pro": {
    title: "Marquee — Wordmark",
    icon: AppsIcon,
    desc: "Scrolling brand/wordmarks.",
  },
  "tls3-press-logos-pro": {
    title: "Press Logos",
    icon: AppsIcon,
    desc: "Media / partner logos.",
  },
  "tls3-values-grid-pro": {
    title: "Values (grid)",
    icon: StarIcon,
    desc: "3–6 brand value cards.",
  },
  "tls3-timeline-pro": {
    title: "Timeline — Story",
    icon: AppsIcon,
    desc: "Key steps / milestones.",
  },
  "tls3-founders-story-pro": {
    title: "Founders’ Story",
    icon: StarIcon,
    desc: "Storytelling & photo.",
  },
};

/* ===== THEMES (block handles) ===== */
const THEMES = [
  {
    key: "tech",
    label: "Tech",
    emoji: "💻",
    desc: "Hero + product highlights + packs and social.",
    header: { handle: "header-informatique", template: "index" },
    content: [
      { handle: "banner-kenburns", template: "index" },
      { handle: "carousel-cercle", template: "index" },
      { handle: "product-grid-glow", template: "index" },
      { handle: "packs-descriptifs", template: "index" },
      { handle: "social-icons", template: "index" },
    ],
    footer: { handle: "footer-liens", template: "index" },
  },
  {
    key: "fashion",
    label: "Fashion",
    emoji: "🧥",
    desc: "Lookbook, categories pills, product grid, and social proof.",
    header: { handle: "t2-header-fashion", template: "index" },
    content: [
      { handle: "t2-hero-runway", template: "index" },
      { handle: "t2-categories-pills", template: "index" },
      { handle: "t2-products-grid", template: "index" },
      { handle: "t2-social-proof", template: "index" },
    ],
    footer: { handle: "footer-liens", template: "index" },
  },
  {
    key: "triple-s",
    label: "Triple-S Branding",
    emoji: "✨",
    desc: "Brand hero video, press logos, values, timeline & story.",
    header: { handle: "header-informatique", template: "index" }, // generic header
    content: [
      { handle: "tls3-hero-brand-video-pro", template: "index" },
      { handle: "tls3-marquee-wordmark-pro", template: "index" },
      { handle: "tls3-press-logos-pro", template: "index" },
      { handle: "tls3-values-grid-pro", template: "index" },
      { handle: "tls3-timeline-pro", template: "index" },
      { handle: "tls3-founders-story-pro", template: "index" },
    ],
    footer: { handle: "footer-liens", template: "index" },
  },
];

/* ===== Block Row ===== */
function BlockRow({ shopSub, apiKey, block }) {
  const meta = META[block.handle] || {};
  const IconSrc = meta.icon || AppsIcon;

  return (
    <div className="tls-block-row">
      <Box paddingBlock="200" paddingInline="100">
        <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
          <InlineStack gap="300" blockAlign="center">
            <Icon source={IconSrc} />
            <Box>
              <Text as="h3" variant="headingSm">
                {meta.title || block.handle}
              </Text>
              {meta.desc ? (
                <Text as="p" tone="subdued">
                  {meta.desc}
                </Text>
              ) : null}
            </Box>
          </InlineStack>

          <InlineStack gap="200">
            <Button
              url={linkAddBlock({
                shopSub,
                template: block.template,
                apiKey,
                handle: block.handle,
              })}
              target="_top"
              variant="primary"
              icon={ThemeEditIcon}
            >
              Add to theme
            </Button>
            <Button url={editorBase({ shopSub })} target="_blank" external icon={ViewIcon}>
              Open editor
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>
    </div>
  );
}

/* ===== Theme blocks view ===== */
function ThemeBlocksView({ theme, shopSub, apiKey }) {
  return (
    <BlockStack gap="400">
      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={ThemeEditIcon} />
            <Text as="h2" variant="headingSm">
              Header
            </Text>
          </InlineStack>
        </Box>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.header} />
      </Card>

      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={AppsIcon} />
            <Text as="h2" variant="headingSm">
              Content
            </Text>
          </InlineStack>
        </Box>
        <BlockStack gap="0">
          {theme.content.map((blk) => (
            <BlockRow key={blk.handle} shopSub={shopSub} apiKey={apiKey} block={blk} />
          ))}
        </BlockStack>
      </Card>

      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={ViewIcon} />
            <Text as="h2" variant="headingSm">
              Footer
            </Text>
          </InlineStack>
        </Box>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.footer} />
      </Card>
    </BlockStack>
  );
}

/* ===== Main page ===== */
export default function TLSBuilderIndex() {
  const { shopSub, apiKey } = useParentData();
  const [themeKey, setThemeKey] = useState(THEMES[0].key);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tls_selected_theme");
      if (saved && THEMES.some((t) => t.key === saved)) setThemeKey(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("tls_selected_theme", themeKey);
    } catch {}
  }, [themeKey]);

  const theme = useMemo(
    () => THEMES.find((t) => t.key === themeKey) || THEMES[0],
    [themeKey]
  );
  const countBlocks = (t) => 1 + (t.content?.length || 0) + 1;

  return (
    <Page
      title="Triple-Luxe-Sections"
      subtitle="Choose a theme • Add blocks in 1 click"
      secondaryActions={[
        {
          content: "Theme editor",
          url: editorBase({ shopSub }),
          target: "_blank",
          external: true,
        },
      ]}
    >
      <InjectCssOnce />

      <BlockStack gap="400">
        <Banner tone="success" title="Built for Shopify (Polaris)">
          <p>Icons & UI 100% Polaris. Links open the editor with the pre-selected block.</p>
        </Banner>

        <Card>
          <Box padding="300">
            <InlineStack gap="200" wrap>
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className="tls-theme-chip"
                  data-on={themeKey === t.key ? 1 : 0}
                  onClick={() => setThemeKey(t.key)}
                  title={t.desc}
                >
                  <span style={{ fontSize: 16, marginRight: 6 }}>{t.emoji}</span>
                  <span style={{ fontWeight: 700 }}>{t.label}</span>
                  <span style={{ marginLeft: 8 }}>
                    <Badge>{countBlocks(t)}</Badge>
                  </span>
                </button>
              ))}
            </InlineStack>
            <Box paddingBlockStart="200">
              <Text as="p" tone="subdued">
                {theme.desc}
              </Text>
            </Box>
          </Box>
        </Card>

        <ThemeBlocksView theme={theme} shopSub={shopSub} apiKey={apiKey} />

        <Card>
          <Box padding="300">
            <Text as="h3" variant="headingSm">
              Quick links
            </Text>
            <BlockStack gap="200">
              <Button url={editorBase({ shopSub })} target="_blank" external icon={ViewIcon}>
                Open Theme Editor
              </Button>
              <InlineStack gap="200" wrap>
                <Button
                  url={linkAddBlock({
                    shopSub,
                    template: "index",
                    apiKey,
                    handle: "banner-kenburns",
                  })}
                  target="_top"
                  icon={ThemeEditIcon}
                >
                  Try · Ken Burns Banner
                </Button>
                <Button
                  url={linkAddBlock({
                    shopSub,
                    template: "index",
                    apiKey,
                    handle: "footer-liens",
                  })}
                  target="_top"
                  icon={ThemeEditIcon}
                >
                  Try · Footer Links
                </Button>
              </InlineStack>
            </BlockStack>
          </Box>
        </Card>
      </BlockStack>

      {/* ===== Floating buttons wrapper: no overlay on the page ===== */}
      <div
        style={{
          pointerEvents: "none",   // << empêche toute interception des clics de la page
        }}
      >
        {/* YouTube (bottom-right) */}
        <a
          href={YOUTUBE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube tutorial"
          style={{
            ...BUTTON_FAB,
            right: "24px",
            backgroundColor: "#FF0000",
            pointerEvents: "auto", // << clickable
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 576 512" fill="#fff" aria-hidden="true">
            <path d="M549.7 124.1c-6.3-23.7-24.9-42.3-48.6-48.6C458.8 64 288 64 288 64S117.2 64 74.9 75.5c-23.7 6.3-42.3 24.9-48.6 48.6C15.9 166.3 16 256 16 256s0 89.7 10.3 131.9c6.3 23.7 24.9 42.3 48.6 48.6C117.2 448 288 448 288 448s170.8 0 213.1-11.5c23.7-6.3 42.3-24.9 48.6-48.6C560.1 345.7 560 256 560 256s.1-89.7-10.3-131.9zM232 336V176l142 80-142 80z"/>
          </svg>
        </a>

        {/* WhatsApp (bottom-left) */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp support"
          style={{
            ...BUTTON_FAB,
            left: "24px",
            backgroundColor: "#25D366",
            pointerEvents: "auto", // << clickable
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 448 512" fill="#fff" aria-hidden="true">
            <path d="M380.9 97.1C339.4 55.6 283.3 32 224 32S108.6 55.6 67.1 97.1C25.6 138.6 2 194.7 2 254c0 45.3 13.5 89.3 39 126.7L0 480l102.6-38.7C140 481.5 181.7 494 224 494c59.3 0 115.4-23.6 156.9-65.1C422.4 370.6 446 314.5 446 254s-23.6-115.4-65.1-156.9zM224 438c-37.4 0-73.5-11.1-104.4-32l-7.4-4.9-61.8 23.3 23.2-60.6-4.9-7.6C50.1 322.9 38 289.1 38 254c0-102.6 83.4-186 186-186s186 83.4 186 186-83.4 186-186 186zm101.5-138.6c-5.5-2.7-32.7-16.1-37.8-17.9-5.1-1.9-8.8-2.7-12.5 2.7s-14.3 17.9-17.5 21.6c-3.2 3.7-6.4 4.1-11.9 1.4s-23.2-8.5-44.2-27.1c-16.3-14.5-27.3-32.4-30.5-37.9-3.2-5.5-.3-8.5 2.4-11.2 2.5-2.5 5.5-6.4 8.3-9.6 2.8-3.2 3.7-5.5 5.5-9.2s.9-6.9-.5-9.6c-1.4-2.7-12.5-30.1-17.2-41.3-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.6 1.4-14.6 6.9-19.2 18.7-19.2 45.7 19.7 53 22.4 56.7c2.7 3.7 38.6 59.1 93.7 82.8 13.1 5.7 23.3 9.1 31.3 11.7 13.1 4.2 25.1 3.6 34.6 2.2 10.5-1.6 32.7-13.4 37.3-26.3 4.6-12.7 4.6-23.5 3.2-25.7-1.4-2.2-5-3.6-10.5-6.2z"/>
          </svg>
        </a>
      </div>
    </Page>
  );
}
