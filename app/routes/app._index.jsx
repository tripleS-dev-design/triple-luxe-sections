// app/routes/app._index.jsx — TLS · Rail 3 thèmes → liste Header/Content/Footer
import React, { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Button, Badge } from "@shopify/polaris";

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
 * Icônes inline (SVG)
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
 * Métadonnées (icône / gradient / description) par handle
 * Pour tes futurs .liquid, tu pourras compléter ce mapping.
 * =============================== */
const META = {
  "tls-header":         { icon: <GlyphWindow/>,  grad: "violet", desc: "Logo, menu et cart — clean et responsive." },
  "tls-banner-3":       { icon: <GlyphGallery/>, grad: "blue",   desc: "Slider auto (3 visuels), ratio d’origine." },
  "tls-circle-marquee": { icon: <GlyphMarquee/>, grad: "violet", desc: "Défilement continu de produits (circle)." },
  "tls-product-card":   { icon: <GlyphCard/>,    grad: "pink",   desc: "Vitrine produit : grande image + CTA." },
  "tls-social-timer":   { icon: <GlyphStar/>,    grad: "aqua",   desc: "Social icons + countdown (promo/urgences)." },
  "tls-testimonials":   { icon: <GlyphStar/>,    grad: "violet", desc: "Avis clients en grille responsive." },
  "tls-footer":         { icon: <GlyphWindow/>,  grad: "blue",   desc: "Footer 2–4 colonnes, menus + paiements." },
};

/* Helper pour fusionner meta */
const withMeta = (b) => ({ ...b, ...(META[b.handle] || {}) });

/* ===============================
 * 3 THÈMES — chaque thème = header + content[] + footer
 * (remplace juste les handles quand tu ajoutes tes .liquid)
 * =============================== */
const THEMES = [
  {
    key: "classic-bold",
    label: "Classic Bold",
    emoji: "🧱",
    desc: "Héros + produits + social proof, look contrasté.",
    header:  { handle: "tls-header", template: "index", title: "Header – Simple" },
    content: [
      { handle: "tls-banner-3",       template: "index",   title: "Banner 3 images" },
      { handle: "tls-circle-marquee", template: "index",   title: "Product marquee" },
      { handle: "tls-testimonials",   template: "index",   title: "Testimonials" },
    ],
    footer:  { handle: "tls-footer", template: "index", title: "Footer – 2–4 columns" },
  },
  {
    key: "minimal-fresh",
    label: "Minimal Fresh",
    emoji: "🧩",
    desc: "Léger, rapide et aéré avec social + timer.",
    header:  { handle: "tls-header", template: "index", title: "Header – Simple" },
    content: [
      { handle: "tls-banner-3",     template: "index",   title: "Banner 3 images" },
      { handle: "tls-social-timer", template: "index",   title: "Social + Countdown" },
    ],
    footer:  { handle: "tls-footer", template: "index", title: "Footer – 2–4 columns" },
  },
  {
    key: "elegant-dark",
    label: "Elegant Dark",
    emoji: "🌙",
    desc: "Ambiance sombre élégante, focus sur le produit.",
    header:  { handle: "tls-header",       template: "index",   title: "Header – Simple" },
    content: [
      { handle: "tls-product-card", template: "product", title: "Product – Showcase card" },
      { handle: "tls-testimonials", template: "index",   title: "Testimonials" },
    ],
    footer:  { handle: "tls-footer",       template: "index",   title: "Footer – 2–4 columns" },
  },
];

/* ===============================
 * Composant liste de blocks (ligne)
 * =============================== */
function BlockRow({ shopSub, apiKey, block }) {
  const b = withMeta(block);
  return (
    <div className="tls-block-row">
      <SquareIcon grad={b.grad}>{b.icon}</SquareIcon>

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
 * Colonne centrale : affiche Header / Content / Footer du thème choisi
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

  // Sélection du thème (stockée localement)
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
      title="Triple-Luxe-Sections"
      subtitle="Pick a theme • Add blocks in 1 click"
      secondaryActions={[
        { content: "YouTube", url: "https://youtube.com/", target: "_blank" },
        { content: "WhatsApp", url: "https://wa.me/212XXXXXXXXX", target: "_blank" },
      ]}
    >
      <div className="tls-shell">
        <div className="tls-editor">

          {/* Rail gauche : 3 types de thèmes */}
          <div className="tls-rail">
            <div className="tls-rail-card">
              <div className="tls-rail-head">Themes</div>
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

          {/* Colonne centrale : blocks du thème sélectionné (Header / Content / Footer) */}
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
                <Badge tone="success">Build for Shopify</Badge>
                <div style={{ color:"#637381" }}>UI Polaris — rendu natif dans l’Admin.</div>
              </div>

              <Card>
                <div style={{ fontWeight:800, marginBottom:8 }}>Quick links</div>
                <div style={{ display:"grid", gap:8 }}>
                  <Button url={editorBase({ shopSub })} target="_blank" external>
                    Open Theme Editor
                  </Button>
                  <Button url={linkAddBlock({ shopSub, template:"index", apiKey, handle:"tls-banner-3" })} target="_top">
                    Try · Banner 3 images
                  </Button>
                  <Button url={linkAddBlock({ shopSub, template:"product", apiKey, handle:"tls-product-card" })} target="_top">
                    Try · Product card
                  </Button>
                </div>
              </Card>

              <Card>
                <div style={{ fontWeight:800, marginBottom:8 }}>Tips</div>
                <ul style={{ margin:0, paddingLeft:18, color:"#374151" }}>
                  <li>Clique sur un thème à gauche pour voir ses blocks.</li>
                  <li>“Add to theme” ouvre l’éditeur avec le block déjà sélectionné.</li>
                  <li>Les blocks <b>product</b> s’ajoutent sur le template produit.</li>
                  <li>Utilise <code>target="_top"</code> pour rester dans l’Admin.</li>
                </ul>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </Page>
  );
}
