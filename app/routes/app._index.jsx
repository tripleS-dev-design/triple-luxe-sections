// app/routes/app._index.jsx — TLS · 3 thèmes (Polaris only icons)
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
  OrdersIcon,
  ImageIcon,
  WandIcon,
  StarIcon,
} from "@shopify/polaris-icons";

/* ===============================
 * LOADER: shopSub + apiKey
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
 * Deep links vers Theme Editor
 * =============================== */
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

/* ===============================
 * Métadonnées visuelles (Polaris icons)
 * =============================== */
const META = {
  // Thème 1 (informatique)
  "tls-header":         { title: "Header – Simple",       icon: ThemeEditIcon,  desc: "Logo / menu / panier." },
  "tls-banner-3":       { title: "Bannière 3 images",     icon: ImageIcon,      desc: "Slider auto, ratio d’origine." },
  "tls-circle-marquee": { title: "Marquee produits (cercle)", icon: ProductsIcon, desc: "Défilement continu d’images." },
  "tls-testimonials":   { title: "Témoignages (grille)",  icon: StarIcon,       desc: "Social proof, responsive." },
  "tls-footer":         { title: "Footer 2–4 colonnes",   icon: ThemeEditIcon,  desc: "Menus + infos utiles." },

  // Thème 2 (vêtements & accessoires)
  "tls-hero-lookbook":   { title: "Hero Lookbook",         icon: ImageIcon,     desc: "Hero animé + CTA collection." },
  "tls-collection-tabs": { title: "Collections onglets",   icon: ProductsIcon,  desc: "Catégories en onglets." },
  "tls-sticky-promo":    { title: "Bandeau sticky promo",  icon: WandIcon,      desc: "Bandeau sticky (remise/code)." },

  // Thème 3 (design adapté / branding Triple-S)
  "tls-brand-hero":    { title: "Brand Hero",       icon: ThemeEditIcon,  desc: "Visuel branding + message clé." },
  "tls-brand-cards":   { title: "Brand Cards",      icon: AppsIcon,       desc: "3 cartes valeurs/engagements." },
  "tls-brand-reels":   { title: "Brand Reels",      icon: ImageIcon,      desc: "Grid légère de visuels/motion." },
};

/* ===============================
 * 3 THÈMES — handles des blocs .liquid
 * (adapte les handles selon tes fichiers block)
 * =============================== */
const THEMES = [
  {
    key: "theme-informatique",
    label: "Informatique",
    emoji: "💻",
    desc: "Héros + produits + preuves sociales (clair & efficace).",
    header:  { handle: "tls-header", template: "index" },
    content: [
      { handle: "tls-banner-3",       template: "index" },
      { handle: "tls-circle-marquee", template: "index" },
      { handle: "tls-testimonials",   template: "index" },
    ],
    footer:  { handle: "tls-footer", template: "index" },
  },
  {
    key: "theme-vetements",
    label: "Vêtements & Accessoires",
    emoji: "🧥",
    desc: "Lookbook, catégories en onglets et promo sticky.",
    header:  { handle: "tls-header", template: "index" },
    content: [
      { handle: "tls-hero-lookbook",   template: "index" },
      { handle: "tls-collection-tabs", template: "index" },
      { handle: "tls-sticky-promo",    template: "index" },
    ],
    footer:  { handle: "tls-footer", template: "index" },
  },
  {
    key: "theme-brand",
    label: "Design — Triple-S",
    emoji: "✨",
    desc: "Branding poussé, sections identitaires et motion léger.",
    header:  { handle: "tls-header", template: "index" },
    content: [
      { handle: "tls-brand-hero",  template: "index" },
      { handle: "tls-brand-cards", template: "index" },
      { handle: "tls-brand-reels", template: "index" },
    ],
    footer:  { handle: "tls-footer", template: "index" },
  },
];

/* ===============================
 * UI — une ligne “block” avec actions
 * =============================== */
function BlockRow({ shopSub, apiKey, block }) {
  const meta = META[block.handle] || {};
  const IconComp = meta.icon ? meta.icon : AppsIcon;

  return (
    <Box paddingBlock="200" paddingInline="100" borderBlockStartWidth="025">
      <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
        <InlineStack gap="300" blockAlign="center">
          <Icon source={IconComp} />
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
          >
            Add to theme
          </Button>
          <Button url={editorBase({ shopSub })} target="_blank" external>
            Open editor
          </Button>
        </InlineStack>
      </InlineStack>
    </Box>
  );
}

/* ===============================
 * Liste Header / Content / Footer
 * =============================== */
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
            <Icon source={ThemeEditIcon} />
            <Text as="h2" variant="headingSm">Footer</Text>
          </InlineStack>
        </Box>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.footer} />
      </Card>
    </BlockStack>
  );
}

/* ===============================
 * Page principale
 * =============================== */
export default function TLSBuilderIndex() {
  const { shopSub, apiKey } = useLoaderData();

  // Sélection du thème (persisté côté navigateur uniquement)
  const [themeKey, setThemeKey] = useState(THEMES[0].key);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("tls_selected_theme");
      if (saved && THEMES.some((t) => t.key === saved)) setThemeKey(saved);
    } catch {}
  }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
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
      subtitle="Choisissez un thème • Ajoutez les blocks en 1 clic"
      primaryAction={null}
      secondaryActions={[
        { content: "Theme editor", url: editorBase({ shopSub }), target: "_blank" },
      ]}
    >
      <BlockStack gap="400">

        {/* Bandeau info Polaris */}
        <Banner
          tone="success"
          title="Build for Shopify (Polaris)"
        >
          <p>Icônes & UI 100% Polaris. Les liens ouvrent l’éditeur de thème avec le block pré-sélectionné.</p>
        </Banner>

        {/* Choix du thème */}
        <Card>
          <Box padding="300">
            <InlineStack gap="200" wrap>
              {THEMES.map((t) => (
                <Button
                  key={t.key}
                  pressed={t.key === themeKey}
                  onClick={() => setThemeKey(t.key)}
                  accessibilityLabel={`Choisir ${t.label}`}
                >
                  {t.emoji} {t.label} <Badge tone="new">{countBlocks(t)}</Badge>
                </Button>
              ))}
            </InlineStack>
            <Box paddingBlockStart="200">
              <Text as="p" tone="subdued">{theme.desc}</Text>
            </Box>
          </Box>
        </Card>

        {/* Liste des blocks du thème sélectionné */}
        <ThemeBlocksView theme={theme} shopSub={shopSub} apiKey={apiKey} />

        {/* Liens rapides */}
        <Card>
          <Box padding="300">
            <Text as="h3" variant="headingSm">Liens rapides</Text>
            <BlockStack gap="200">
              <Button url={editorBase({ shopSub })} target="_blank" external>
                Ouvrir Theme Editor
              </Button>
              <InlineStack gap="200" wrap>
                <Button url={linkAddBlock({ shopSub, template: "index", apiKey, handle: "tls-banner-3" })} target="_top">
                  Try · Banner 3 images
                </Button>
                <Button url={linkAddBlock({ shopSub, template: "index", apiKey, handle: "tls-footer" })} target="_top">
                  Try · Footer
                </Button>
              </InlineStack>
            </BlockStack>
          </Box>
        </Card>

      </BlockStack>
    </Page>
  );
}
