// app/routes/app._index.jsx — TLS · 3 thèmes → Header / Content / Footer
import React, { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Button, Badge, Icon } from "@shopify/polaris";
import {
  OnlineStoreMajor,
  ImageMajor,
  ProductsMajor,
  MarketingMajor,
  CustomersMajor,
  SettingsMajor,
  CollectionsMajor,
  OrdersMajor,
} from "@shopify/polaris-icons";

/* ===============================
 * LOADER: shopSub + apiKey (auth Remix + Admin)
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
 * CSS layout (3 colonnes)
 * =============================== */
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
  .tls-section-h  { font-weight:800; letter-spacing:.2px; background:#F2F6FF; color:#0C4A6E; border:1px solid #CFE0FF; border-radius:10px; padding:10px 12px; margin-bottom:12px; }
  .tls-block-row  { display:grid; grid-template-columns:56px 1fr auto; gap:14px; align-items:center; padding:10px 6px; border-top:1px solid #F1F2F4; }
  .tls-block-row:first-of-type { border-top:none; }

  .tls-preview-col { position:sticky; top:68px; max-height:calc(100vh - 84px); overflow:auto; }
  .tls-preview-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; display:grid; gap:12px; }

  .tls-theme-chip { display:grid; grid-template-columns:auto 1fr; align-items:center; gap:8px; padding:8px 12px; border-radius:999px; border:1px solid #E5E7EB; background:#fff; cursor:pointer; font-weight:700; }
  .tls-theme-chip[data-on="1"] { outline:2px solid #2563EB; }

  .tls-square { width:44px; height:44px; border-radius:12px; display:grid; place-items:center; color:#fff; }
  .tls-square[data-grad="violet"] { background:linear-gradient(135deg,#7c3aed 0%,#3b82f6 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 10px 28px rgba(70,78,255,.15); }
  .tls-square[data-grad="blue"]   { background:linear-gradient(135deg,#3b82f6 0%,#22c1c3 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 10px 28px rgba(70,78,255,.15); }
  .tls-square[data-grad="pink"]   { background:linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%); box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 10px 28px rgba(70,78,255,.15); }

  @media (max-width: 1200px) { .tls-editor { grid-template-columns: 240px 2fr 1fr; } }
  @media (max-width: 980px)  { .tls-editor { grid-template-columns: 1fr; } .tls-rail, .tls-preview-col { position:static; max-height:none; } }
`;
function useInjectCss(){
  useEffect(()=>{
    const t=document.createElement("style");
    t.id="tls-layout-css";
    t.appendChild(document.createTextNode(LAYOUT_CSS));
    document.head.appendChild(t);
    return ()=>t.remove();
  },[]);
}

/* ===============================
 * META par handle (icône Polaris + description)
 * =============================== */
const META = {
  // Thème 1 — Informatique
  "tls1-header-informatique-pro":               { icon: OnlineStoreMajor,  grad: "violet", desc: "Header clair avec recherche et accès compte/panier." },
  "tls1-banner-informatique-kenburns-pro":      { icon: ImageMajor,        grad: "blue",   desc: "Bannière Ken Burns (fondu + zoom) en 3 slides." },
  "tls1-packs-descriptifs-pro":                 { icon: ProductsMajor,     grad: "pink",   desc: "Cartes produits descriptives avec CTA." },
  "tls1-social-icons-pro":                      { icon: MarketingMajor,    grad: "violet", desc: "Réseaux sociaux (icônes Polaris) — labels optionnels." },
  "tls1-footer-bgimage-pro":                    { icon: SettingsMajor,     grad: "blue",   desc: "Footer image de fond + menus configurables." },

  // Thème 2 — Vêtements & Accessoires
  "tls2-header-fashion-pro":                    { icon: OnlineStoreMajor,  grad: "violet", desc: "Header mode, minimal et responsive." },
  "tls2-hero-fashion-pro":                      { icon: ImageMajor,        grad: "blue",   desc: "Hero plein écran ou ratio fixe, texte & bouton." },
  "tls2-grid-fashion-pro":                      { icon: CollectionsMajor,  grad: "pink",   desc: "Grille éditoriale (collections / visuels lookbook)." },
  "tls2-social-timer-pro":                      { icon: MarketingMajor,    grad: "violet", desc: "Barre sociale + compteur (offres limitées)." },
  "tls2-footer-fashion-pro":                    { icon: SettingsMajor,     grad: "blue",   desc: "Footer compact, colonnes adaptatives." },

  // Thème 3 — Triple S Brand
  "tls3-header-brand-pro":                      { icon: OnlineStoreMajor,  grad: "violet", desc: "Header branding premium." },
  "tls3-hero-brand-video-pro":                  { icon: ImageMajor,        grad: "blue",   desc: "Hero vidéo/poster avec overlay et CTA." },
  "tls3-press-logos-pro":                       { icon: CollectionsMajor,  grad: "pink",   desc: "Barre logos presse/partenaires (auto défilement)." },
  "tls3-founders-story-pro":                    { icon: CustomersMajor,    grad: "violet", desc: "Bloc “story” fondateurs (texte + portrait)." },
  "tls3-values-grid-pro":                       { icon: SettingsMajor,     grad: "blue",   desc: "Valeurs de marque en tuiles." },
  "tls3-timeline-pro":                          { icon: OrdersMajor,       grad: "pink",   desc: "Timeline milestones (dates clés de la marque)." },
  "tls3-footer-brand-pro":                      { icon: SettingsMajor,     grad: "blue",   desc: "Footer éditorial / liens essentiels." },
};

const withMeta = (b) => {
  const m = META[b.handle] || {};
  return { ...b, icon: m.icon || OnlineStoreMajor, grad: m.grad || "violet", desc: b.desc || m.desc };
};

/* ===============================
 * 3 THÈMES — header + content[] + footer (handles alignés)
 * =============================== */
const THEMES = [
  {
    key: "theme-informatique",
    label: "Informatique",
    emoji: "💻",
    desc: "Héros animé + packs descriptifs + réseaux — design propre et rapide.",
    header:  { handle: "tls1-header-informatique-pro", template: "index", title: "Header — Informatique" },
    content: [
      { handle: "tls1-banner-informatique-kenburns-pro", template: "index",   title: "Banner — Ken Burns" },
      { handle: "tls1-packs-descriptifs-pro",             template: "index",   title: "Packs descriptifs" },
      { handle: "tls1-social-icons-pro",                  template: "index",   title: "Réseaux sociaux" },
    ],
    footer:  { handle: "tls1-footer-bgimage-pro", template: "index", title: "Footer — BG Image" },
  },
  {
    key: "theme-vetements-accessoires",
    label: "Vêtements & Accessoires",
    emoji: "👗",
    desc: "Lookbook aéré, grille éditoriale et social bar pour l’engagement.",
    header:  { handle: "tls2-header-fashion-pro", template: "index", title: "Header — Fashion" },
    content: [
      { handle: "tls2-hero-fashion-pro",     template: "index",   title: "Hero — Fashion" },
      { handle: "tls2-grid-fashion-pro",     template: "index",   title: "Grille éditoriale" },
      { handle: "tls2-social-timer-pro",     template: "index",   title: "Social + Timer" },
    ],
    footer:  { handle: "tls2-footer-fashion-pro", template: "index", title: "Footer — Fashion" },
  },
  {
    key: "theme-triple-s-brand",
    label: "Triple S Brand",
    emoji: "✨",
    desc: "Branding premium : vidéo, logos presse, story, valeurs et timeline.",
    header:  { handle: "tls3-header-brand-pro", template: "index", title: "Header — Brand" },
    content: [
      { handle: "tls3-hero-brand-video-pro", template: "index",   title: "Hero — Vidéo" },
      { handle: "tls3-press-logos-pro",      template: "index",   title: "Logos presse" },
      { handle: "tls3-founders-story-pro",   template: "index",   title: "Founders story" },
      { handle: "tls3-values-grid-pro",      template: "index",   title: "Valeurs de marque" },
      { handle: "tls3-timeline-pro",         template: "index",   title: "Timeline" }
    ],
    footer:  { handle: "tls3-footer-brand-pro", template: "index", title: "Footer — Brand" },
  },
];

/* ===============================
 * UI helpers
 * =============================== */
function SquarePolarisIcon({ source, grad = "violet" }) {
  return (
    <div className="tls-square" data-grad={grad} aria-hidden="true">
      <Icon source={source} />
    </div>
  );
}

/* ===============================
 * Ligne block (Header / Content / Footer)
 * =============================== */
function BlockRow({ shopSub, apiKey, block }) {
  const b = withMeta(block);
  return (
    <div className="tls-block-row">
      <SquarePolarisIcon source={b.icon} grad={b.grad} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize:16, fontWeight:700, lineHeight:1.2 }}>{b.title || b.handle}</div>
        {b.desc && <div style={{ marginTop:4, color:"#637381", fontSize:13 }}>{b.desc}</div>}
        {b.template === "product" && (
          <div style={{ marginTop:6, fontSize:12, color:"#0F172A", opacity:0.7 }}>
            Template : <b>product</b> — ajoute-le depuis une page produit.
          </div>
        )}
      </div>
      <div style={{ display:"grid", gap:8, justifyItems:"end" }}>
        <Button
          url={linkAddBlock({ shopSub, template: b.template, apiKey, handle: b.handle })}
          target="_top"
          variant="primary"
        >
          Add to theme
        </Button>
        <Button url={editorBase({ shopSub })} target="_blank" external>
          Open editor
        </Button>
      </div>
    </div>
  );
}

/* ===============================
 * Colonne centrale : Header / Content / Footer du thème choisi
 * =============================== */
function ThemeBlocksView({ theme, shopSub, apiKey }) {
  return (
    <>
      <div className="tls-panel">
        <div className="tls-section-h">Header</div>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.header} />
      </div>

      <div className="tls-panel">
        <div className="tls-section-h">Content</div>
        <div>
          {theme.content.map((blk) => (
            <BlockRow key={blk.handle} shopSub={shopSub} apiKey={apiKey} block={blk} />
          ))}
        </div>
      </div>

      <div className="tls-panel">
        <div className="tls-section-h">Footer</div>
        <BlockRow shopSub={shopSub} apiKey={apiKey} block={theme.footer} />
      </div>
    </>
  );
}

/* ===============================
 * Page principale
 * =============================== */
export default function TLSBuilderIndex() {
  useInjectCss();
  const { shopSub, apiKey } = useLoaderData();

  // Sélection du thème (persisté localStorage)
  const [themeKey, setThemeKey] = useState(THEMES[0].key);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tls_selected_theme");
      if (saved && THEMES.some(t => t.key === saved)) setThemeKey(saved);
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("tls_selected_theme", themeKey); } catch {} }, [themeKey]);

  const theme = useMemo(() => THEMES.find(t => t.key === themeKey) || THEMES[0], [themeKey]);
  const countBlocks = (t) => 1 + (t.content?.length || 0) + 1;

  return (
    <Page
      title="Triple-Luxe Sections"
      subtitle="Choisis un thème • Ajoute les blocks en 1 clic"
      secondaryActions={[
        { content: "Open Theme Editor", url: editorBase({ shopSub }), target: "_blank" },
      ]}
    >
      <div className="tls-shell">
        <div className="tls-editor">
          {/* Rail gauche : 3 thèmes */}
          <div className="tls-rail">
            <div className="tls-rail-card">
              <div className="tls-rail-head">Thèmes</div>
              <div className="tls-rail-list">
                {THEMES.map((t) => (
                  <div
                    key={t.key}
                    className="tls-rail-item"
                    data-sel={themeKey===t.key?1:0}
                    onClick={()=>setThemeKey(t.key)}
                    title={t.desc}
                  >
                    <div style={{ fontSize:18 }}>{t.emoji}</div>
                    <div style={{ fontWeight:700 }}>{t.label}</div>
                    <div><Badge>{countBlocks(t)}</Badge></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne centrale : blocks du thème sélectionné */}
          <div className="tls-center-col">
            <div className="tls-panel">
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                {THEMES.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    className="tls-theme-chip"
                    data-on={themeKey===t.key?1:0}
                    onClick={()=>setThemeKey(t.key)}
                  >
                    <span>{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop:8, color:"#637381" }}>{theme.desc}</div>
            </div>

            <ThemeBlocksView theme={theme} shopSub={shopSub} apiKey={apiKey} />
          </div>

          {/* Colonne droite : infos rapides */}
          <div className="tls-preview-col">
            <div className="tls-preview-card">
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <Badge tone="success">Built for Shopify</Badge>
                <div style={{ color:"#637381" }}>UI Polaris — rendu natif dans l’Admin.</div>
              </div>

              <Card>
                <div style={{ fontWeight:800, marginBottom:8 }}>Raccourcis</div>
                <div style={{ display:"grid", gap:8 }}>
                  <Button url={editorBase({ shopSub })} target="_blank" external>
                    Ouvrir l’éditeur
                  </Button>
                  <Button url={linkAddBlock({ shopSub, template:"index", apiKey, handle:"tls1-banner-informatique-kenburns-pro" })} target="_top">
                    Tester · Banner Ken Burns
                  </Button>
                  <Button url={linkAddBlock({ shopSub, template:"index", apiKey, handle:"tls3-hero-brand-video-pro" })} target="_top">
                    Tester · Hero vidéo (Brand)
                  </Button>
                </div>
              </Card>

              <Card>
                <div style={{ fontWeight:800, marginBottom:8 }}>Conseils</div>
                <ul style={{ margin:0, paddingLeft:18, color:"#374151" }}>
                  <li>Clique un thème pour voir ses blocks.</li>
                  <li>“Add to theme” ouvre l’éditeur avec le block déjà sélectionné.</li>
                </ul>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </Page>
  );
}
