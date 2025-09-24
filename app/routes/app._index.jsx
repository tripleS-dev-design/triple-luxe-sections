// app/routes/app._index.jsx — Triple Theme Blocks-Sections
import React, { useEffect, useMemo, useState } from "react";
import { useRouteLoaderData } from "@remix-run/react";
import {
  Page, Card, Button, Badge, BlockStack, InlineStack, Text, Box, Banner, Icon,
} from "@shopify/polaris";
import { AppsIcon, ThemeEditIcon, ImageIcon, StarIcon, ViewIcon } from "@shopify/polaris-icons";

/* externals */
const YOUTUBE_URL = "https://youtu.be/kqtaJU14qzQ";
const WHATSAPP_URL = "https://wa.me/212681570887";
const PROMO_URL =
  "https://apps.shopify.com/announcement-bar-app-1?locale=fr&search_id=fe6f0bc9-6312-4be5-b8b1-5240df16264e&surface_detail=triple-annoucncemnt-bar&surface_inter_position=1&surface_intra_position=18&surface_type=search";

/* FAB style */
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
  zIndex: 60,
  textDecoration: "none",
  backgroundColor: "#000",
};

/* ===== shopSub: robust extractor (top path → host param → fallback) ===== */
function getShopSubSmart(fallback = "") {
  try {
    const topPath = window.top?.location?.pathname || "";
    const m1 = topPath.match(/\/store\/([^/]+)/);
    if (m1?.[1]) return m1[1];
  } catch {}
  try {
    const hostB64 = new URLSearchParams(window.location.search).get("host");
    if (hostB64) {
      const decoded = atob(hostB64);
      const m2 = decoded.match(/\/store\/([^/]+)/);
      if (m2?.[1]) return m2[1];
      const m3 = decoded.match(/([^./]+)\.myshopify\.com/);
      if (m3?.[1]) return m3[1];
    }
  } catch {}
  return fallback;
}

/* parent data (apiKey) + shopSub override */
function useParentData() {
  const pd = useRouteLoaderData("routes/app") || { shopSub: "", apiKey: "" };
  const smart = typeof window !== "undefined" ? getShopSubSmart(pd.shopSub) : pd.shopSub;
  return { shopSub: smart, apiKey: pd.apiKey };
}

/* ===== Deep link helpers (final) ===== */
function editorBase({ shopSub }) {
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}

function openEditorLink({ shopSub, template = "index" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    enable_app_theme_extension_dev_preview: "1",
  });
  return `${base}?${p.toString()}`;
}

function addBlockLink({
  shopSub,
  apiKey,
  handle,               // exact block handle (blocks/*.liquid)
  template = "index",
  target = "newAppsSection",
}) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    addAppBlockId: `${apiKey}/${handle}`,
    target,
    enable_app_theme_extension_dev_preview: "1",
  });
  return `${base}?${p.toString()}`;
}

/* light CSS */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .tls-theme-chip {
    display:inline-grid; grid-auto-flow:column; gap:8px; align-items:center;
    padding:8px 12px; border:1px solid #E5E7EB; border-radius:999px; background:#fff; cursor:pointer; font-weight:700;
  }
  .tls-theme-chip[data-on="1"] { outline:2px solid #2563EB; }
  .tls-block-row  { padding:10px 6px; border-top:1px solid #F1F2F4; }
  .tls-block-row:first-of-type { border-top:none; }
  .tls-right-promo { position: fixed; top: 110px; right: 24px; width: 300px; max-width: calc(100vw - 32px); z-index: 55; pointer-events: auto; }
  @media (max-width: 1400px){ .tls-right-promo{ display:none; } }
`;
function InlineCss() { return <style id="tls-layout-css">{LAYOUT_CSS}</style>; }

/* META */
const META = {
  "header-informatique": { title: "Header — Tech", icon: ThemeEditIcon, desc: "Logo, search, utilities, quick links." },
  "banner-kenburns": { title: "Ken Burns Banner", icon: ImageIcon, desc: "3 slides, fade + smooth zoom/pan." },
  "carousel-cercle": { title: "Circle Carousel", icon: AppsIcon, desc: "Circular image scrolling." },
  "packs-descriptifs": { title: "Descriptive Packs", icon: StarIcon, desc: "Product cards + lists & badges." },
  "product-grid-glow": { title: "Product Grid (Glow)", icon: AppsIcon, desc: "Showcase products with glow style." },
  "social-icons": { title: "Social Icons", icon: AppsIcon, desc: "Stylish social links, variants." },
  "footer-liens": { title: "Footer — Links", icon: ViewIcon, desc: "2–4 link columns." },
  "t2-header-fashion": { title: "Header — Fashion", icon: ThemeEditIcon, desc: "Fashion header (light, airy)." },
  "t2-hero-runway": { title: "Hero — Runway", icon: ImageIcon, desc: "Runway hero with collection CTA." },
  "t2-categories-pills": { title: "Categories (pills)", icon: AppsIcon, desc: "Filters/tabs styled as pills." },
  "t2-products-grid": { title: "Product Grid (Fashion)", icon: AppsIcon, desc: "Responsive grid adapted for fashion." },
  "t2-social-proof": { title: "Social Proof", icon: StarIcon, desc: "Testimonials / preview demo content." },
  "tls3-hero-brand-video-pro": { title: "Hero Video — Brand Pro", icon: ImageIcon, desc: "Large hero video or key visual." },
  "tls3-founders-story-pro": { title: "Founders’ Story", icon: StarIcon, desc: "Storytelling & photo." },
};

/* THEMES */
const THEMES = [
  { key: "tech", label: "Tech", emoji: "💻", desc: "Hero + product highlights + packs and social.",
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
  { key: "fashion", label: "Fashion", emoji: "🧥", desc: "Lookbook, categories pills, product grid, social proof.",
    header: { handle: "t2-header-fashion", template: "index" },
    content: [
      { handle: "t2-hero-runway", template: "index" },
      { handle: "t2-categories-pills", template: "index" },
      { handle: "t2-products-grid", template: "index" },
      { handle: "t2-social-proof", template: "index" },
    ],
    footer: { handle: "footer-liens", template: "index" },
  },
  { key: "triple-s", label: "Triple-S Branding", emoji: "✨", desc: "All blocks in one place (branding + tech + fashion).",
    header: { handle: "header-informatique", template: "index" },
    content: [
      { handle: "tls3-hero-brand-video-pro", template: "index" },
      { handle: "tls3-founders-story-pro", template: "index" },
      { handle: "banner-kenburns", template: "index" },
      { handle: "carousel-cercle", template: "index" },
      { handle: "product-grid-glow", template: "index" },
      { handle: "packs-descriptifs", template: "index" },
      { handle: "social-icons", template: "index" },
      { handle: "t2-hero-runway", template: "index" },
      { handle: "t2-categories-pills", template: "index" },
      { handle: "t2-products-grid", template: "index" },
      { handle: "t2-social-proof", template: "index" },
    ],
    footer: { handle: "footer-liens", template: "index" },
  },
];

/* UI rows */
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
              <Text as="h3" variant="headingSm">{meta.title || block.handle}</Text>
              {meta.desc ? <Text as="p" tone="subdued">{meta.desc}</Text> : null}
            </Box>
          </InlineStack>
          <InlineStack gap="200">
            <Button
              url={addBlockLink({ shopSub, apiKey, template: block.template, handle: block.handle })}
              target="_top"
              variant="primary"
              icon={ThemeEditIcon}
            >
              Add to theme
            </Button>
            <Button
              url={openEditorLink({ shopSub, template: block.template })}
              target="_top"
              external
              icon={ViewIcon}
            >
              Open editor
            </Button>
          </InlineStack>
        </InlineStack>
      </Box>
    </div>
  );
}

function ThemeBlocksView({ theme, shopSub, apiKey }) {
  return (
    <BlockStack gap="400">
      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center"><Icon source={ThemeEditIcon} /><Text as="h2" variant="headingSm">Header</Text></InlineStack>
        </Box>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.header} />
      </Card>
      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center"><Icon source={AppsIcon} /><Text as="h2" variant="headingSm">Content</Text></InlineStack>
        </Box>
        <BlockStack gap="0">
          {theme.content.map((blk) => (<BlockRow key={blk.handle} shopSub={shopSub} apiKey={apiKey} block={blk} />))}
        </BlockStack>
      </Card>
      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center"><Icon source={ViewIcon} /><Text as="h2" variant="headingSm">Footer</Text></InlineStack>
        </Box>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.footer} />
      </Card>
    </BlockStack>
  );
}

/* main */
export default function TLSBuilderIndex() {
  const { shopSub, apiKey } = useParentData();
  const [themeKey, setThemeKey] = useState(THEMES[0].key);

  useEffect(() => { try { const s = localStorage.getItem("tls_selected_theme"); if (s && THEMES.some(t => t.key === s)) setThemeKey(s); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("tls_selected_theme", themeKey); } catch {} }, [themeKey]);

  const theme = useMemo(() => THEMES.find(t => t.key === themeKey) || THEMES[0], [themeKey]);
  const countBlocks = React.useCallback((t) => 1 + (t.content?.length || 0) + 1, []);

  return (
    <Page
      title="Triple Theme Blocks-Sections"
      subtitle="Choose a theme • Add blocks in 1 click"
      secondaryActions={[{ content: "Theme editor", url: openEditorLink({ shopSub, template: "index" }), target: "_top", external: true }]}
    >
      <InlineCss />
      <Card>
        <Box padding="300">
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Setup (3 steps)</Text>
            <BlockStack gap="150">
              <Box>
                <Text as="p"><strong>1)</strong> Open the Shopify Theme Editor (apps context).</Text>
                <Button url={openEditorLink({ shopSub, template: "index" })} target="_top" external icon={ViewIcon}>Open Theme Editor</Button>
              </Box>
              <Box>
                <Text as="p"><strong>2)</strong> Add blocks via buttons below or quick links:</Text>
                <InlineStack gap="200" wrap>
                  <Button url={addBlockLink({ shopSub, apiKey, template: "index", handle: "banner-kenburns" })} target="_top" icon={ThemeEditIcon}>Add · Ken Burns Banner</Button>
                  <Button url={addBlockLink({ shopSub, apiKey, template: "index", handle: "footer-liens" })} target="_top" icon={ThemeEditIcon}>Add · Footer Links</Button>
                </InlineStack>
              </Box>
              <Box>
                <Text as="p"><strong>3)</strong> Customize content/colors/layout in the Theme Editor.</Text>
              </Box>
            </BlockStack>
          </BlockStack>
        </Box>
      </Card>

      <Box paddingBlockEnd="200">
        <Banner tone="info" title="How Triple Theme Blocks-Sections works">
          <BlockStack gap="100">
            <Text as="p">• Add blocks directly from the <strong>Shopify Theme Editor</strong> (no code).</Text>
            <Text as="p">• Pick a theme below, then click <em>Add to theme</em> on any block.</Text>
            <Text as="p">• Fully customizable from the Theme Editor.</Text>
          </BlockStack>
        </Banner>
      </Box>

      <BlockStack gap="400">
        <Card>
          <Box padding="300">
            <InlineStack gap="200" wrap>
              {THEMES.map((t) => (
                <button key={t.key} type="button" className="tls-theme-chip"
                  data-on={themeKey === t.key ? 1 : 0}
                  onClick={() => setThemeKey(t.key)} title={t.desc} role="switch" aria-checked={themeKey === t.key}>
                  <span style={{ fontSize: 16, marginRight: 6 }}>{t.emoji}</span>
                  <span style={{ fontWeight: 700 }}>{t.label}</span>
                  <span style={{ marginLeft: 8 }}><Badge>{countBlocks(t)}</Badge></span>
                </button>
              ))}
            </InlineStack>
            <Box paddingBlockStart="200"><Text as="p" tone="subdued">{theme.desc}</Text></Box>
          </Box>
        </Card>

        <ThemeBlocksView theme={theme} shopSub={shopSub} apiKey={apiKey} />

        <Card>
          <Box padding="300">
            <Text as="h3" variant="headingSm">Quick links</Text>
            <BlockStack gap="200">
              <Button url={openEditorLink({ shopSub, template: "index" })} target="_top" external icon={ViewIcon}>Open Theme Editor</Button>
              <InlineStack gap="200" wrap>
                <Button url={addBlockLink({ shopSub, apiKey, template: "index", handle: "banner-kenburns" })} target="_top" icon={ThemeEditIcon}>Try · Ken Burns Banner</Button>
                <Button url={addBlockLink({ shopSub, apiKey, template: "index", handle: "footer-liens" })} target="_top" icon={ThemeEditIcon}>Try · Footer Links</Button>
              </InlineStack>
            </BlockStack>
          </Box>
        </Card>
      </BlockStack>

      <div className="tls-right-promo" aria-hidden={false}>
        <Card>
          <Box padding="300">
            <BlockStack gap="150">
              <Text as="h3" variant="headingSm">Boost announcements</Text>
              <Text as="p" tone="subdued">Try our <strong>Triple Announcement Bar</strong> app to promote sales, shipping, and news.</Text>
              <Button url={PROMO_URL} target="_blank" external>View app on Shopify</Button>
            </BlockStack>
          </Box>
        </Card>
      </div>

      <div style={{ pointerEvents: "none" }}>
        <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ ...BUTTON_FAB, right: "24px", backgroundColor: "#FF0000", pointerEvents: "auto" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 576 512" fill="#fff" aria-hidden="true"><path d="M549.7 124.1c-6.3-23.7-24.9-42.3-48.6-48.6C458.8 64 288 64 288 64S117.2 64 74.9 75.5..."/></svg>
        </a>
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ ...BUTTON_FAB, left: "24px", backgroundColor: "#25D366", pointerEvents: "auto" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 448 512" fill="#fff" aria-hidden="true"><path d="M380.9 97.1C339.4 55.6 283.3 32 224 32S108.6 55.6..."/></svg>
        </a>
      </div>
    </Page>
  );
}
