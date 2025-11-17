// app/routes/app._index.jsx — Selya · Pages: Home / Product / Cart
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
  Icon,
  Banner,
} from "@shopify/polaris";
import {
  AppsIcon,
  ThemeEditIcon,
  ImageIcon,
  StarIcon,
  ViewIcon,
} from "@shopify/polaris-icons";

/* ===== externals (YouTube only) ===== */
const YOUTUBE_URL = "https://www.youtube.com/@yourchannel"; // change if needed

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
  zIndex: 60,
  textDecoration: "none",
  backgroundColor: "#000",
};

/* ===== get parent data (shopSub, apiKey) ===== */
function useParentData() {
  // Ensure your parent route id matches your app (commonly "routes/app")
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
    template, // "index", "product", "cart", ...
    target, // keep "main" unless you use header/footer targets
    addAppBlockId: `${apiKey}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}

/* ===== Light CSS ===== */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .tls-page-chip {
    display:inline-grid; grid-auto-flow:column; gap:8px; align-items:center;
    padding:8px 12px; border:1px solid #E5E7EB; border-radius:999px;
    background:#fff; cursor:pointer; font-weight:700;
  }
  .tls-page-chip[data-on="1"] { outline:2px solid #2563EB; }
  .tls-block-row  { padding:10px 6px; border-top:1px solid #F1F2F4; }
  .tls-block-row:first-of-type { border-top:none; }

  /* Video 16:9 responsive container */
  .tls-video-wrap { position: relative; width: 100%; border-radius: 12px; overflow: hidden; background: #0b1f3a; }
  .tls-video-16x9 { position: relative; width: 100%; padding-top: 56.25%; }
  .tls-video-16x9 iframe, .tls-video-16x9 .tls-video-placeholder {
    position: absolute; inset: 0; width: 100%; height: 100%; border: 0;
  }
  .tls-video-placeholder {
    display:flex; align-items:center; justify-content:center; color:#fff;
    font-weight:600; letter-spacing:.3px;
    background: radial-gradient(ellipse at 50% 50%, rgba(255,204,0,.25), rgba(11,31,58,.95));
  }
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

/* ===== Tawk.to loader (mount/unmount safe) ===== */
function TawkTo({ propertyId, widgetId }) {
  useEffect(() => {
    // avoid duplicate injection on HMR
    const selector = `script[src*="embed.tawk.to/${propertyId}/${widgetId}"]`;
    if (document.querySelector(selector)) return;

    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s0.parentNode.insertBefore(s1, s0);

    return () => {
      const node = document.querySelector(selector);
      if (node) node.remove();
      try { delete window.Tawk_API; } catch {}
    };
  }, [propertyId, widgetId]);
  return null;
}

/* ===== VIDEO URLS (put your YouTube links later) =====
   – Leave empty string "" to show the placeholder preview box.
   – Example: "https://www.youtube.com/embed/VIDEO_ID"
*/
const VIDEO_URLS = {
  home: "",     // add your URL later
  product: "",  // add your URL later
  cart: "",     // add your URL later
};

/* ===== PAGE TEXTS (definition + how-to) ===== */
const PAGE_TEXTS = {
  home: {
    title: "Welcome to Selya — Homepage Builder",
    intro:
      "Selya lets you build a complete theme experience using app-powered sections. Use the quick actions below to add sections directly into your theme editor.",
    howto: [
      "Click “Add to theme” on any section to deep-link into Shopify’s Theme Editor.",
      "In the Theme Editor, adjust the section’s settings (text, images, colors, layout).",
      "Reorder sections as you like, then save your changes.",
    ],
  },
  product: {
    title: "Product Page — Information & Conversion",
    intro:
      "Enhance your product detail page with rich information blocks, recommendations, imagery and sticky CTAs. Add the sections below and customize them.",
    howto: [
      "Choose a block and click “Add to theme” to open the Product template.",
      "Configure gallery, variants, pricing, and upsell options as needed.",
      "Preview on a real product and save.",
    ],
  },
  cart: {
    title: "Cart Page — Upsell & Trust",
    intro:
      "Improve the cart experience with clean line items, clear totals, trust badges and smart recommendations. Add the sections below in one click.",
    howto: [
      "Click “Add to theme” on the blocks you need for the Cart template.",
      "Tune visibility, messaging and upsell logic in settings.",
      "Test flows to checkout and save.",
    ],
  },
};

/* ===== META (labels & Polaris icons) ===== */
const META = {
  // HOME (index)
  header: {
    title: "Header",
    icon: ThemeEditIcon,
    desc: "Brand logo, navigation, utilities.",
  },
  "image-banner": {
    title: "Image Banner",
    icon: ImageIcon,
    desc: "Hero banner with image and CTA.",
  },
  "image-scroller": {
    title: "Image Scroller",
    icon: ImageIcon,
    desc: "Continuous horizontal image strip.",
  },
  "video-carousel-trio": {
    title: "Video Carousel (Trio)",
    icon: ImageIcon,
    desc: "Three inline video carousels.",
  },
  "marquee-text": {
    title: "Marquee Text",
    icon: AppsIcon,
    desc: "Scrolling promotional text.",
  },
  "social-icons": {
    title: "Social Icons",
    icon: AppsIcon,
    desc: "Instagram, Facebook, WhatsApp, YouTube, TikTok.",
  },
  "product-description": {
    title: "Product Description",
    icon: StarIcon,
    desc: "Rich product or brand description block.",
  },
  "product-grid": {
    title: "Product Grid",
    icon: AppsIcon,
    desc: "Responsive product cards with price and ATC.",
  },
  footer: {
    title: "Footer",
    icon: ViewIcon,
    desc: "About / Links / Contact + social.",
  },

  // PRODUCT (product)
  "product-header": {
    title: "Header",
    icon: ThemeEditIcon,
    desc: "Brand header for product page.",
  },
  "product-info-section": {
    title: "Product Info",
    icon: ThemeEditIcon,
    desc: "Gallery, title, price, variants, ATC.",
  },
  "product-recommended": {
    title: "Recommended Products",
    icon: StarIcon,
    desc: "You may also like…",
  },
  "image-details-section": {
    title: "Image Details",
    icon: ImageIcon,
    desc: "Detailed imagery or feature highlights.",
  },
  "product-footer": {
    title: "Footer",
    icon: ViewIcon,
    desc: "Footer for product page.",
  },

  // CART (cart)
  "cart-header": {
    title: "Header",
    icon: ThemeEditIcon,
    desc: "Brand header for cart page.",
  },
  "cart-info": {
    title: "Cart Info",
    icon: AppsIcon,
    desc: "Line items, quantities, remove actions.",
  },
  "cart-recommended": {
    title: "Recommended Products",
    icon: StarIcon,
    desc: "Cross-sell based on cart.",
  },
  "cart-footer": {
    title: "Footer",
    icon: ViewIcon,
    desc: "Footer for cart page.",
  },
};

/* ===== PAGES (sections by template) ===== */
const PAGES = [
  // HOME
  {
    key: "home",
    emoji: "🏠",
    label: "Home",
    template: "index",
    desc: "Build your homepage with ready-to-use sections.",
    blocks: [
      { handle: "header" },
      { handle: "image-banner" },
      { handle: "image-scroller" },
      { handle: "video-carousel-trio" },
      { handle: "marquee-text" },
      { handle: "social-icons" },
      { handle: "product-description" },
      { handle: "product-grid" },
      { handle: "footer" },
    ],
  },

  // PRODUCT
  {
    key: "product",
    emoji: "📦",
    label: "Product",
    template: "product",
    desc: "Optimize PDP with info, recommendations, and rich imagery.",
    blocks: [
      { handle: "product-header" },
      { handle: "product-info-section" },
      { handle: "product-recommended" },
      { handle: "image-details-section" },
      { handle: "product-footer" },
    ],
  },

  // CART
  {
    key: "cart",
    emoji: "🛒",
    label: "Cart",
    template: "cart",
    desc: "Enhance the cart experience and drive checkout.",
    blocks: [
      { handle: "cart-header" },
      { handle: "cart-info" },
      { handle: "cart-recommended" },
      { handle: "cart-footer" },
    ],
  },
];

/* ===== UI bits ===== */
function DefinitionBanner({ pageKey }) {
  const c = PAGE_TEXTS[pageKey];
  if (!c) return null;
  return (
    <Banner title={c.title} tone="info">
      <p style={{ marginTop: 6 }}>{c.intro}</p>
      <div style={{ marginTop: 10 }}>
        <strong>How to add sections</strong>
        <ol style={{ marginTop: 6, paddingLeft: 18 }}>
          {c.howto.map((line, i) => (
            <li key={i} style={{ margin: "4px 0" }}>{line}</li>
          ))}
        </ol>
      </div>
    </Banner>
  );
}

function VideoPanel({ url }) {
  return (
    <Card>
      <Box padding="300">
        <Text as="h3" variant="headingSm">Video walkthrough</Text>
        <Box paddingBlockStart="200">
          <div className="tls-video-wrap">
            <div className="tls-video-16x9">
              {url ? (
                <iframe
                  src={url}
                  title="Selya walkthrough"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="tls-video-placeholder">
                  Add your YouTube embed URL in VIDEO_URLS to show the video
                </div>
              )}
            </div>
          </div>
        </Box>
      </Box>
    </Card>
  );
}

/* ===== Block Row (single actionable line) ===== */
function BlockRow({ shopSub, apiKey, block, template }) {
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
                template,
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

/* ===== Template view (list blocks + definition + video) ===== */
function TemplateBlocksView({ page, shopSub, apiKey }) {
  return (
    <BlockStack gap="400">
      {/* Definition / How-to */}
      <DefinitionBanner pageKey={page.key} />

      {/* Sections list */}
      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={ThemeEditIcon} />
            <Text as="h2" variant="headingSm">
              {page.label} — sections ({page.blocks.length})
            </Text>
          </InlineStack>
        </Box>

        <BlockStack gap="0">
          {page.blocks.map((blk) => (
            <BlockRow
              key={`${page.key}:${blk.handle}`}
              shopSub={shopSub}
              apiKey={apiKey}
              block={blk}
              template={page.template}
            />
          ))}
        </BlockStack>
      </Card>

      {/* Video walkthrough (16:9, large) */}
      <VideoPanel
        url={
          page.key === "home"
            ? VIDEO_URLS.home
            : page.key === "product"
            ? VIDEO_URLS.product
            : VIDEO_URLS.cart
        }
      />
    </BlockStack>
  );
}

/* ===== Main page ===== */
export default function SelyaBuilderIndex() {
  const { shopSub, apiKey } = useParentData();
  const [pageKey, setPageKey] = useState(PAGES[0].key);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tls_selected_page");
      if (saved && PAGES.some((p) => p.key === saved)) setPageKey(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("tls_selected_page", pageKey);
    } catch {}
  }, [pageKey]);

  const page = useMemo(
    () => PAGES.find((p) => p.key === pageKey) || PAGES[0],
    [pageKey]
  );

  return (
    <Page
      title="Selya — Theme Sections"
      subtitle="Pick a page • Add sections in one click"
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
        {/* Page selector (Home / Product / Cart) */}
        <Card>
          <Box padding="300">
            <InlineStack gap="200" wrap>
              {PAGES.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className="tls-page-chip"
                  data-on={pageKey === p.key ? 1 : 0}
                  onClick={() => setPageKey(p.key)}
                  title={p.desc}
                >
                  <span style={{ fontSize: 16, marginRight: 6 }}>{p.emoji}</span>
                  <span style={{ fontWeight: 700 }}>{p.label}</span>
                  <span style={{ marginLeft: 8 }}>
                    <Badge>{p.blocks.length}</Badge>
                  </span>
                </button>
              ))}
            </InlineStack>

            <Box paddingBlockStart="200">
              <Text as="p" tone="subdued">
                {page.desc}
              </Text>
            </Box>
          </Box>
        </Card>

        {/* Page content (definition + sections + video) */}
        <TemplateBlocksView page={page} shopSub={shopSub} apiKey={apiKey} />

        {/* Quick links (optional) */}
        <Card>
          <Box padding="300">
            <Text as="h3" variant="headingSm">
              Quick links
            </Text>
            <BlockStack gap="200">
              <Button url={editorBase({ shopSub })} target="_blank" external icon={ViewIcon}>
                Open Theme Editor
              </Button>
            </BlockStack>
          </Box>
        </Card>
      </BlockStack>


      {/* Tawk.to chat widget */}
      <TawkTo propertyId="68d9b9b47e832f194e5d7159" widgetId="1j697qqqh" />
    </Page>
  );
}
