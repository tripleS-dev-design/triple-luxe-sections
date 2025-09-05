// app/routes/app._index.jsx — TLS Builder + 3 Themes (Header / Content / Footer)
import React, { useEffect, useMemo, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Button, Badge } from "@shopify/polaris";

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
 * CSS layout 3 colonnes
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
  .tls-block-row  { display:grid; grid-template-columns:56px 1fr auto; gap:14px; alignItems:center; padding:10px 6px; border-top:1px solid #F1F2F4; }
  .tls-block-row:first-of-type { border-top:none; }

  .tls-preview-col { position:sticky; top:68px; max-height:calc(100vh - 84px); overflow:auto; }
  .tls-preview-card{ background:#fff; border:1px solid #E5E7EB; border-radius:12px; padding:12px; display:grid; gap:12px; }

  .tls-theme-chip { display:inline-grid; place-items:center; padding:8px 12px; border-radius:999px; border:1px solid #E5E7EB; background:#fff; cursor:pointer; font-weight:700; }
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
 * Icônes inline
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
 * Bibliothèque de blocks (pour la vue “Library” classique)
 * =============================== */
const APP_BLOCKS = [
  { handle: "tls-header",         template: "index",   title: "Simple header (dark & pink)",  desc: "Logo, menu horizontal, cart — clean et responsive.", icon: <GlyphWindow/>,  grad: "violet", group: "Header",  section: "Headers" },
  { handle: "tls-banner-3",       template: "index",   title: "Banner – 3 images",            desc: "Slider auto avec 3 visuels, ratio d’origine (sans crop).", icon: <GlyphGallery/>, grad: "blue",   group: "Content", section: "Banners" },
  { handle: "tls-circle-marquee", template: "index",   title: "Product marquee (circle)",     desc: "Défilement continu de produits avec zoom au survol.", icon: <GlyphMarquee/>, grad: "violet", group: "Content", section: "Collections" },
  { handle: "tls-product-card",   template: "product", title: "Product – Showcase card",      desc: "Grande image, vignettes, prix et CTA principal.", icon: <GlyphCard/>,    grad: "pink",   group: "Content", section: "Product page" },
  { handle: "tls-social-timer",   template: "index",   title: "Social + Countdown",           desc: "Icônes Instagram/Facebook/TikTok/WhatsApp + timer.", icon: <GlyphStar/>,   grad: "aqua",   group: "Content", section: "Social & timers" },
  { handle: "tls-testimonials",   template: "index",   title: "Testimonials grid",            desc: "Avis clients en grille responsive (propre).",         icon: <GlyphStar/>,   grad: "violet", group: "Content", section: "Social proof" },
  { handle: "tls-footer",         template: "index",   title: "Footer (2–4 columns)",         desc: "Menus Shopify + icônes paiement, full responsive.",   icon: <GlyphWindow/>,  grad: "blue",   group: "Footer",  section: "Footers" },
];

/* ===============================
 * 3 THÈMES — chaque thème = header + content[] + footer
 * Tu pourras changer les handles par tes propres .liquid plus tard.
 * =============================== */
const THEMES = [
  {
    key: "classic-bold",
    label: "Classic Bold",
    emoji: "🧱",
    desc: "Héros + produits + preuves sociales, look contrasté.",
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

/* Utils */
function groupBySection(blocks) {
  const map = new Map();
  for (const b of blocks) {
    const k = b.section || "General";
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(b);
  }
  return Array.from(map.entries()); // [ [sectionName, [blocks...]], ... ]
}

/* ===============================
 * Page
 * =============================== */
export default function TLSBuilderIndex() {
  useInjectCss();
  const { shopSub, apiKey } = useLoaderData();

  /* ========== 1) Rail gauche: catégories “Library” ========== */
  const CATEGORIES = [
    { key: "Header",  label: "Header",  emoji: "🧱" },
    { key: "Content", label: "Content", emoji: "🧩" },
    { key: "Footer",  label: "Footer",  emoji: "📦" },
  ];
  const [selCat, setSelCat] = useState("Content");
  const blocksInCat = useMemo(() => APP_BLOCKS.filter(b => b.group === selCat), [selCat]);
  const grouped = useMemo(() => groupBySection(blocksInCat), [blocksInCat]);

  /* ========== 2) Theme picker (3 thèmes) ========== */
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem("tls_selected_theme") || "classic-bold");
  useEffect(() => { try { localStorage.setItem("tls_selected_theme", themeKey); } catch {} }, [themeKey]);
  const theme = useMemo(() => THEMES.find(t => t.key === themeKey) || THEMES[0], [themeKey]);

  const AddButton = ({ b }) => (
    <Button
      url={linkAddBlock({ shopSub, template: b.template, apiKey, handle: b.handle })}
      target="_top"
      variant="primary"
    >
      Add to theme
    </Button>
  );

  return (
    <Page
      title="Triple-Luxe-Sections"
      subtitle="Build premium sections in seconds"
      secondaryActions={[
        { content: "YouTube", url: "https://youtube.com/", target: "_blank" },
        { content: "WhatsApp", url: "https://wa.me/212XXXXXXXXX", target: "_blank" },
      ]}
    >
      <div className="tls-shell">
        <div className="tls-editor">

          {/* Rail gauche : 3 éléments “Library” */}
          <div className="tls-rail">
            <div className="tls-rail-card">
              <div className="tls-rail-head">Library</div>
              <div className="tls-rail-list">
                {CATEGORIES.map((c) => (
                  <div
                    key={c.key}
                    className="tls-rail-item"
                    data-sel={selCat===c.key?1:0}
                    onClick={()=>setSelCat(c.key)}
                  >
                    <div style={{ fontSize:18 }}>{c.emoji}</div>
                    <div style={{ fontWeight:700 }}>{c.label}</div>
                    <div><Badge>{APP_BLOCKS.filter(b=>b.group===c.key).length}</Badge></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne centre : Theme picker + Library */}
          <div className="tls-center-col">

            {/* ---- (A) THEME PICKER & APPLY ---- */}
            <div className="tls-panel">
              <div className="tls-section-h">Theme presets (3)</div>

              {/* Choix des 3 thèmes */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:12 }}>
                {THEMES.map(t => (
                  <button
                    key={t.key}
                    type="button"
                    className="tls-theme-chip"
                    data-on={themeKey===t.key?1:0}
                    onClick={()=>setThemeKey(t.key)}
                    title={t.desc}
                  >
                    <span style={{ marginRight:6 }}>{t.emoji}</span>{t.label}
                  </button>
                ))}
              </div>

              {/* Étapes d’application du thème choisi */}
              <Card>
                <div style={{ display:"grid", gap:12 }}>
                  <div style={{ fontWeight:800 }}>{theme.label}</div>
                  <div style={{ color:"#637381" }}>{theme.desc}</div>

                  {/* Step 1 — Header */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center", gap:12 }}>
                    <div>
                      <div style={{ fontWeight:700 }}>1) Header</div>
                      <div style={{ fontSize:13, color:"#637381" }}>{theme.header.title}</div>
                    </div>
                    <AddButton b={theme.header} />
                  </div>

                  {/* Step 2 — Content (N blocks) */}
                  <div>
                    <div style={{ fontWeight:700, marginBottom:6 }}>2) Content</div>
                    <div style={{ display:"grid", gap:10 }}>
                      {theme.content.map((blk, i) => (
                        <div key={blk.handle} style={{ display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center", gap:12 }}>
                          <div>
                            <div style={{ fontSize:13, color:"#6B7280" }}>Block {i+1}</div>
                            <div style={{ fontWeight:600 }}>{blk.title}</div>
                            {blk.template==="product" && (
                              <div style={{ fontSize:12, color:"#0F172A", opacity:.75 }}>Template : <b>product</b></div>
                            )}
                          </div>
                          <AddButton b={blk} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3 — Footer */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr auto", alignItems:"center", gap:12 }}>
                    <div>
                      <div style={{ fontWeight:700 }}>3) Footer</div>
                      <div style={{ fontSize:13, color:"#637381" }}>{theme.footer.title}</div>
                    </div>
                    <AddButton b={theme.footer} />
                  </div>

                  <div style={{ fontSize:12, color:"#6B7280" }}>
                    Astuce : pour des raisons de sécurité du Theme Editor, l’ajout se fait **bloc par bloc** (un lien par block).
                  </div>
                </div>
              </Card>
            </div>

            {/* ---- (B) LIBRARY par catégories (optionnel, déjà existant) ---- */}
            {grouped.map(([sectionName, blocks]) => (
              <div key={sectionName} className="tls-panel">
                <div className="tls-section-h">{sectionName}</div>
                <div>
                  {blocks.map((b) => (
                    <div key={b.handle} className="tls-block-row">
                      <SquareIcon grad={b.grad}>{b.icon}</SquareIcon>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize:16, fontWeight:700, lineHeight:1.2 }}>{b.title}</div>
                        <div style={{ marginTop:4, color:"#637381", fontSize:13 }}>{b.desc}</div>
                        {b.template === "product" && (
                          <div style={{ marginTop:6, fontSize:12, color:"#0F172A", opacity:0.7 }}>
                            Template : <b>product</b> — tip : teste ce block depuis une page produit.
                          </div>
                        )}
                      </div>
                      <div style={{ display:"grid", gap:8, justifyItems:"end" }}>
                        <AddButton b={b} />
                        <Button url={editorBase({ shopSub })} target="_blank" external>
                          Open editor
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

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
                  <li>“Add to theme” ouvre l’éditeur avec le block déjà sélectionné.</li>
                  <li>Les blocks <b>product</b> s’ajoutent sur le template produit.</li>
                  <li>Garde la navigation dans l’admin avec <code>target="_top"</code>.</li>
                </ul>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </Page>
  );
}
