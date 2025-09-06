// app/routes/app._index.jsx — TLS · 3 thèmes (Polaris-only icons, handles MAJ)
import React, { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
  ProductsIcon,
  ImageIcon,
  StarIcon,
  ViewIcon,
} from "@shopify/polaris-icons";

/* LOADER */
export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { session } = await authenticate.admin(request);

  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  return json({ shopSub, apiKey });
};

/* Deep links Theme Editor */
function editorBase({ shopSub }) {
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}
function linkAddBlock({ shopSub, template = "index", apiKey, handle, target = "main" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    target,
    addAppBlockId: `${apiKey}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}

/* CSS léger */
const LAYOUT_CSS = `
  html, body { margin:0; background:#F6F7F9; }
  .Polaris-Page, .Polaris-Page__Content { max-width:none!important; padding-left:0!important; padding-right:0!important; }
  .tls-shell { padding:16px; }
  .tls-editor { display:grid; grid-template-columns: 260px 2.3fr 1fr; gap:16px; align-items:start; }
  .tls-rail      { position:sticky; top:68px; max-height:calc(100vh - 84px); overflow:auto; }
  .tls-rail-card { background:#fff; border:1px solid #E5E7EB; border-radius:12px; }
  .tls-rail-head { padding:10px 12px; border-bottom:1px solid #E5E7EB; font-weight:800; }
  .tls-rail-list { padding:8px; display:grid; gap:8px; }
  .tls-rail-item { display:grid; grid-template-columns:28px 1fr auto; align-items:center; gap:10px; background:#fff; border:1px solid #E5E7EB; border-radius:10px; padding:10px; cursor:pointer; }
  .tls-rail-item[data-sel="1"] { outline:2px solid #2563EB; }
  .tls-center-col { display:grid; gap:16px; }
  .tls-panel      { background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; }
  .tls-block-row  { padding:10px 6px; border-top:1px solid #F1F2F4; }
  .tls-block-row:first-of-type { border-top:none; }
  .tls-preview-col { position:sticky; top:68px; max-height:calc(100vh - 84px); overflow:auto; }
  .tls-preview-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; display:grid; gap:12px; }
  .tls-theme-chip { display:grid; grid-template-columns:auto 1fr; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; border:1px solid #E5E7EB; background:#fff; cursor:pointer; font-weight:700; }
  .tls-theme-chip[data-on="1"] { outline:2px solid #2563EB; }
  @media (max-width: 1200px) { .tls-editor { grid-template-columns: 240px 2fr 1fr; } }
  @media (max-width: 980px)  { .tls-editor { grid-template-columns: 1fr; } .tls-rail, .tls-preview-col { position:static; max-height:none; } }
`;
function useInjectCss() {
  useEffect(() => {
    const t = document.createElement("style");
    t.id = "tls-layout-css";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
    return () => t.remove();
  }, []);
}

/* META (icônes Polaris uniquement) */
const META = {
  // Thème 1 — Informatique
  "header-informatique": { title: "Header — Informatique", icon: ThemeEditIcon,  desc: "Logo, recherche, utils, liens rapides." },
  "banner-kenburns":     { title: "Bannière Ken Burns",    icon: ImageIcon,      desc: "3 slides, fade + zoom/pan doux." },
  "carousel-cercle":     { title: "Carrousel cercle",      icon: ProductsIcon,   desc: "Défilement circulaire d’images." },
  "packs-descriptifs":   { title: "Packs descriptifs",     icon: StarIcon,       desc: "Cartes produits + listes & badges." },
  "product-grid-glow":   { title: "Grille produits (Glow)",icon: ProductsIcon,   desc: "Vitrine produits carte blanche + glow." },
  "social-icons":        { title: "Icônes sociaux",        icon: AppsIcon,       desc: "Liens réseaux stylés, variants." },
  "footer-liens":        { title: "Footer — Liens",        icon: ViewIcon,       desc: "2–4 colonnes de liens (sans paiements)." },

  // Thème 2 — Vêtements & accessoires
  "t2-header-fashion":   { title: "Header — Fashion",      icon: ThemeEditIcon,  desc: "Header mode (clair, aéré)." },
  "t2-hero-runway":      { title: "Hero — Runway",         icon: ImageIcon,      desc: "Hero défilé avec CTA collection." },
  "t2-categories-pills": { title: "Catégories (pills)",     icon: AppsIcon,       desc: "Filtres/onglets type pilules." },
  "t2-products-grid":    { title: "Grille produits (T2)",  icon: ProductsIcon,   desc: "Grille responsive adaptée à la mode." },
  "t2-social-proof":     { title: "Preuves sociales",      icon: StarIcon,       desc: "Témoignages / notes clients." },

  // Thème 3 — Branding Triple-S (pro)
  "tls3-hero-brand-video-pro": { title: "Hero vidéo — Brand Pro", icon: ImageIcon,      desc: "Grand hero vidéo ou visuel clé." },
  "tls3-marquee-wordmark-pro": { title: "Marquee — Wordmark",     icon: AppsIcon,       desc: "Défilement marque/wordmarks." },
  "tls3-press-logos-pro":      { title: "Logos presse",            icon: AppsIcon,       desc: "Logos médias / partenaires." },
  "tls3-values-grid-pro":      { title: "Valeurs (grille)",        icon: StarIcon,       desc: "3–6 cartes valeurs de marque." },
  "tls3-timeline-pro":         { title: "Timeline — Histoire",     icon: AppsIcon,       desc: "Étapes clés / jalons." },
  "tls3-founders-story-pro":   { title: "Histoire des fondateurs", icon: StarIcon,       desc: "Storytelling & photo." },
};

/* Thèmes -> handles EXACTS (ton dossier /blocks) */
const THEMES = [
  {
    key: "informatique",
    label: "Informatique",
    emoji: "💻",
    desc: "Héros + mise en avant produits + packs et social.",
    header:  { handle: "header-informatique", template: "index" },
    content: [
      { handle: "banner-kenburns",     template: "index" },
      { handle: "carousel-cercle",     template: "index" },
      { handle: "product-grid-glow",   template: "index" },
      { handle: "packs-descriptifs",   template: "index" },
      { handle: "social-icons",        template: "index" },
    ],
    footer:  { handle: "footer-liens", template: "index" },
  },
  {
    key: "vetements",
    label: "Vêtements & accessoires",
    emoji: "🧥",
    desc: "Lookbook, catégories en pills, grille produits et social proof.",
    header:  { handle: "t2-header-fashion", template: "index" },
    content: [
      { handle: "t2-hero-runway",      template: "index" },
      { handle: "t2-categories-pills", template: "index" },
      { handle: "t2-products-grid",    template: "index" },
      { handle: "t2-social-proof",     template: "index" },
    ],
    footer:  { handle: "footer-liens", template: "index" },
  },
  {
    key: "triple-s",
    label: "Branding Triple-S",
    emoji: "✨",
    desc: "Brand hero vidéo, logos presse, valeurs, timeline & story.",
    header:  { handle: "header-informatique", template: "index" },
    content: [
      { handle: "tls3-hero-brand-video-pro", template: "index" },
      { handle: "tls3-marquee-wordmark-pro", template: "index" },
      { handle: "tls3-press-logos-pro",      template: "index" },
      { handle: "tls3-values-grid-pro",      template: "index" },
      { handle: "tls3-timeline-pro",         template: "index" },
      { handle: "tls3-founders-story-pro",   template: "index" },
    ],
    footer:  { handle: "footer-liens", template: "index" },
  },
];

/* UI Block Row */
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
              {meta.desc && (
                <Text as="p" tone="subdued">
                  {meta.desc}{block.template === "product" ? " • (à ajouter sur template produit)" : ""}
                </Text>
              )}
            </Box>
          </InlineStack>

          <InlineStack gap="200">
            <Button
              url={linkAddBlock({ shopSub, template: block.template, apiKey, handle: block.handle })}
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

/* Liste Header / Content / Footer */
function ThemeBlocksView({ theme, shopSub, apiKey }) {
  return (
    <BlockStack gap="400">
      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={ThemeEditIcon} />
            <Text as="h2" variant="headingSm">Header</Text>
          </InlineStack>
        </Box>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.header} />
      </Card>

      <Card>
        <Box padding="300" borderRadius="300" background="bg-surface-secondary">
          <InlineStack gap="200" blockAlign="center">
            <Icon source={ProductsIcon} />
            <Text as="h2" variant="headingSm">Content</Text>
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
            <Text as="h2" variant="headingSm">Footer</Text>
          </InlineStack>
        </Box>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.footer} />
      </Card>
    </BlockStack>
  );
}

/* Page principale */
export default function TLSBuilderIndex() {
  useInjectCss();
  const { shopSub, apiKey } = useLoaderData();

  const [themeKey, setThemeKey] = useState(THEMES[0].key);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tls_selected_theme");
      if (saved && THEMES.some(t => t.key === saved)) setThemeKey(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("tls_selected_theme", themeKey); } catch {}
  }, [themeKey]);

  const theme = useMemo(() => THEMES.find(t => t.key === themeKey) || THEMES[0], [themeKey]);
  const countBlocks = (t) => 1 + (t.content?.length || 0) + 1;

  return (
    <Page
      title="Triple-Luxe-Sections"
      subtitle="Choisissez un thème • Ajoutez les blocks en 1 clic"
      secondaryActions={[{ content: "Theme editor", url: editorBase({ shopSub }), target: "_blank", external: true }]}
    >
      <BlockStack gap="400">
        <Banner tone="success" title="Built for Shopify (Polaris)">
          <p>Icônes & UI 100% Polaris. Les liens ouvrent l’éditeur avec le block pré-sélectionné.</p>
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
                  <span style={{ fontSize:16, marginRight:6 }}>{t.emoji}</span>
                  <span style={{ fontWeight:700 }}>{t.label}</span>
                  <span style={{ marginLeft:8 }}><Badge>{countBlocks(t)}</Badge></span>
                </button>
              ))}
            </InlineStack>
            <Box paddingBlockStart="200">
              <Text as="p" tone="subdued">{theme.desc}</Text>
            </Box>
          </Box>
        </Card>

        <ThemeBlocksView theme={theme} shopSub={shopSub} apiKey={apiKey} />

        <Card>
          <Box padding="300">
            <Text as="h3" variant="headingSm">Liens rapides</Text>
            <BlockStack gap="200">
              <Button url={editorBase({ shopSub })} target="_blank" external icon={ViewIcon}>
                Ouvrir Theme Editor
              </Button>
              <InlineStack gap="200" wrap>
                <Button url={linkAddBlock({ shopSub, template: "index", apiKey, handle: "banner-kenburns" })} target="_top" icon={ThemeEditIcon}>
                  Try · Banner Ken Burns
                </Button>
                <Button url={linkAddBlock({ shopSub, template: "index", apiKey, handle: "footer-liens" })} target="_top" icon={ThemeEditIcon}>
                  Try · Footer liens
                </Button>
              </InlineStack>
            </BlockStack>
          </Box>
        </Card>
      </BlockStack>
    </Page>
  );
}
