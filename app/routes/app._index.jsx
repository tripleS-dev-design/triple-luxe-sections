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
    </Page>
  );
}
