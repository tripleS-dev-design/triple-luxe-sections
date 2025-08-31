// app/routes/settings.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/* ==============================
   Loader: shop + apiKey
================================ */
export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { session } = await authenticate.admin(request);

  return json({
    shop: session.shop,
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

/* ==============================
   Styles (noir & or)
================================ */
const BUTTON_BASE = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 20px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(0,0,0,.18)",
  letterSpacing: ".2px",
};

const CONTAINER_STYLE = {
  maxWidth: "1080px",
  margin: "0 auto",
  padding: "18px 16px 80px",
};

const CARD_STYLE = {
  backgroundColor: "#111111",
  borderRadius: "14px",
  padding: "18px",
  marginBottom: "16px",
  border: "1px solid rgba(200,162,77,.25)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "14px",
  alignItems: "center",
  color: "#f5f5f5",
};

const HEADER_HERO = {
  background: "linear-gradient(135deg, #0a0a0a 35%, #1a1a1a 60%, #2a2a2a 100%)",
  border: "1px solid rgba(200,162,77,.35)",
  borderRadius: "16px",
  padding: "22px",
  marginBottom: "18px",
  color: "#fff",
  boxShadow: "0 12px 40px rgba(0,0,0,.25)",
};

const TITLE = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 900,
  letterSpacing: ".3px",
  background: "linear-gradient(90deg, #d6b35b, #f0df9b 50%, #d6b35b 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const SUB = {
  margin: "6px 0 0 0",
  opacity: 0.9,
};

const GLOBAL_STYLES = `
@keyframes tlsShimmer {
  0%   { background-position: -420px 0; }
  100% { background-position: 420px 0; }
}
.tls-shine {
  background: linear-gradient(90deg, rgba(255,255,255,.08) 0%, rgba(255,255,255,.18) 50%, rgba(255,255,255,.08) 100%);
  background-size: 420px 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: tlsShimmer 5s linear infinite;
}
`;

/* ==============================
   Deep-link vers Theme Editor
   - addAppBlockId = <apiKey>/<extensionUuid>/<blockType>
   - blockType = souvent le nom du fichier .liquid sans extension
================================ */
const EXT_UUID = "123e4567-e89b-12d3-a456-426614174000";

function editorBase({ shop, themeId }) {
  const themePart = themeId ? `themes/${themeId}` : "themes/current";
  return `https://${shop}/admin/${themePart}/editor`;
}

function makeAddBlockUrl({
  shop,
  apiKey,
  template = "index",
  extensionUuid,
  blockType,
  themeId,
}) {
  const base = editorBase({ shop, themeId });
  const params = new URLSearchParams({
    context: "apps",
    template,
    target: "newAppsSection",
    addAppBlockId: `${apiKey}/${extensionUuid}/${blockType}`,
  });
  return `${base}?${params.toString()}`;
}

/* ==============================
   Définition des blocks
   (blockType = nom fichier sans .liquid)
================================ */
const APP_BLOCKS = [
  {
    handle: "tls-header",
    title: "Header simple (noir & rose)",
    desc: "Logo + menu horizontal (scroll mobile) + panier. Couleur d’accent personnalisable.",
    template: "index",
  },
  {
    handle: "tls-banner-3",
    title: "Bannière — 3 images",
    desc: "Slider automatique de 3 visuels, qualité conservée (pas de zoom forcé).",
    template: "index",
  },
  {
    handle: "tls-circle-marquee",
    title: "Bandeau produits (cercle)",
    desc: "Images rondes en défilement continu, hover zoom, pause au survol. Jusqu’à 20 items.",
    template: "index",
  },
  {
    handle: "tls-product-card",
    title: "Produit — Bloc vitrine",
    desc: "Grande image + miniatures, prix/promo, CTA “Voir le produit”, puces avantages, badges.",
    template: "index",
  },
  {
    handle: "tls-social-timer",
    title: "Social + Timer",
    desc: "Icônes Instagram / Facebook / TikTok / WhatsApp + timer 24h en boucle.",
    template: "index",
  },
  {
    handle: "tls-testimonials",
    title: "Testimonials avancés",
    desc: "Grille responsive d’avis, photos rondes, auteur doré.",
    template: "index",
  },
  {
    handle: "tls-footer",
    title: "Footer (2 à 4 colonnes)",
    desc: "Basé sur vos menus Shopify, option icônes de paiement.",
    template: "index",
  },
];

/* ==============================
   UI
================================ */
export default function Settings() {
  const { shop, apiKey } = useLoaderData();

  // Groupes d’affichage
  const headerBlocks = APP_BLOCKS.filter((b) => b.handle === "tls-header");
  const footerBlocks = APP_BLOCKS.filter((b) => b.handle === "tls-footer");
  const contentBlocks = APP_BLOCKS.filter(
    (b) => b.handle !== "tls-header" && b.handle !== "tls-footer"
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <div style={CONTAINER_STYLE}>
        {/* HERO */}
        <section style={HEADER_HERO}>
          <h1 style={TITLE} className="tls-shine">Triple-Luxe-Sections — Settings</h1>
          <p style={SUB}>
            Page principale (noir & doré). Ajoutez vos sections ci-dessous —
            chaque bouton ouvre l’éditeur de thème et insère automatiquement le block.
          </p>
          <div style={{ marginTop: 12 }}>
            {/* Fallback: focus sur l’onglet Apps de l’éditeur */}
            <a
              href={`https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}`}
              target="_top"
              rel="noreferrer"
            >
              <button
                style={{
                  ...BUTTON_BASE,
                  background:
                    "linear-gradient(90deg, #d6b35b, #f0df9b 70%, #d6b35b)",
                  color: "#111",
                }}
              >
                Open Theme Editor (Apps)
              </button>
            </a>
          </div>
        </section>

        {/* HEADER group */}
        <section style={{ marginBottom: 10 }}>
          <div
            style={{
              color: "#111",
              fontWeight: 900,
              letterSpacing: ".3px",
              margin: "0 0 10px 2px",
            }}
          >
            Header
          </div>
          {headerBlocks.map((b) => (
            <article key={b.handle} style={CARD_STYLE}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{b.title}</div>
                <div style={{ opacity: 0.9, marginTop: 4 }}>{b.desc}</div>
              </div>
              <div>
                <a
                  href={makeAddBlockUrl({
                    shop,
                    apiKey,
                    template: b.template,
                    extensionUuid: EXT_UUID,
                    blockType: b.handle, // ← par défaut: nom de fichier
                  })}
                  target="_top"
                  rel="noreferrer"
                >
                  <button
                    style={{
                      ...BUTTON_BASE,
                      background:
                        "linear-gradient(90deg, #d6b35b, #f0df9b 70%, #d6b35b)",
                      color: "#111",
                    }}
                  >
                    Add block in Theme
                  </button>
                </a>
              </div>
            </article>
          ))}
        </section>

        {/* CONTENT group */}
        <section style={{ margin: "16px 0 10px" }}>
          <div
            style={{
              color: "#111",
              fontWeight: 900,
              letterSpacing: ".3px",
              margin: "0 0 10px 2px",
            }}
          >
            Content
          </div>
          {contentBlocks.map((b) => (
            <article key={b.handle} style={CARD_STYLE}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{b.title}</div>
                <div style={{ opacity: 0.9, marginTop: 4 }}>{b.desc}</div>
              </div>
              <div>
                <a
                  href={makeAddBlockUrl({
                    shop,
                    apiKey,
                    template: b.template,
                    extensionUuid: EXT_UUID,
                    blockType: b.handle,
                  })}
                  target="_top"
                  rel="noreferrer"
                >
                  <button
                    style={{
                      ...BUTTON_BASE,
                      background:
                        "linear-gradient(90deg, #d6b35b, #f0df9b 70%, #d6b35b)",
                      color: "#111",
                    }}
                  >
                    Add block in Theme
                  </button>
                </a>
              </div>
            </article>
          ))}
        </section>

        {/* FOOTER group */}
        <section style={{ marginTop: 16 }}>
          <div
            style={{
              color: "#111",
              fontWeight: 900,
              letterSpacing: ".3px",
              margin: "0 0 10px 2px",
            }}
          >
            Footer
          </div>
          {footerBlocks.map((b) => (
            <article key={b.handle} style={CARD_STYLE}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{b.title}</div>
                <div style={{ opacity: 0.9, marginTop: 4 }}>{b.desc}</div>
              </div>
              <div>
                <a
                  href={makeAddBlockUrl({
                    shop,
                    apiKey,
                    template: b.template,
                    extensionUuid: EXT_UUID,
                    blockType: b.handle,
                  })}
                  target="_top"
                  rel="noreferrer"
                >
                  <button
                    style={{
                      ...BUTTON_BASE,
                      background:
                        "linear-gradient(90deg, #d6b35b, #f0df9b 70%, #d6b35b)",
                      color: "#111",
                    }}
                  >
                    Add block in Theme
                  </button>
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>

      {/* Bouton YouTube (en bas à droite) */}
      <a
        href="https://youtu.be/dm0eBVNGGjw"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          textDecoration: "none",
          zIndex: 999,
        }}
        aria-label="YouTube tutorial"
      >
        <button
          style={{
            ...BUTTON_BASE,
            backgroundColor: "#000",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "30px",
            cursor: "pointer",
          }}
        >
          YouTube
        </button>
      </a>

      {/* WhatsApp (en bas à gauche) */}
      <a
        href="https://wa.me/+212630079763"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "fixed",
          bottom: "24px",
          left: "24px",
          backgroundColor: "#000",
          borderRadius: "50%",
          padding: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 999,
        }}
        aria-label="WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#fff" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339.4 55.6 283.3 32 224 32S108.6 55.6 67.1 97.1C25.6 138.6 2 194.7 2 254c0 45.3 13.5 89.3 39 126.7L0 480l102.6-38.7C140 481.5 181.7 494 224 494c59.3 0 115.4-23.6 156.9-65.1C422.4 370.6 446 314.5 446 254s-23.6-115.4-65.1-156.9zM224 438c-37.4 0-73.5-11.1-104.4-32l-7.4-4.9-61.8 23.3 23.2-60.6-4.9-7.6C50.1 322.9 38 289.1 38 254c0-102.6 83.4-186 186-186s186 83.4 186 186-83.4 186-186 186zm101.5-138.6c-5.5-2.7-32.7-16.1-37.8-17.9-5.1-1.9-8.8-2.7-12.5 2.7s-14.3 17.9-17.5 21.6c-3.2 3.7-6.4 4.1-11.9 1.4s-23.2-8.5-44.2-27.1c-16.3-14.5-27.3-32.4-30.5-37.9-3.2-5.5-.3-8.5 2.4-11.2 2.5-2.5 5.5-6.4 8.3-9.6 2.8-3.2 3.7-5.5 5.5-9.2s.9-6.9-.5-9.6c-1.4-2.7-12.5-30.1-17.2-41.3-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.6 1.4-14.6 6.9-19.2 18.7-19.2 45.7 19.7 53 22.4 56.7c2.7 3.7 38.6 59.1 93.7 82.8 13.1 5.7 23.3 9.1 31.3 11.7 13.1 4.2 25.1 3.6 34.6 2.2 10.5-1.6 32.7-13.4 37.3-26.3 4.6-12.7 4.6-23.5 3.2-25.7-1.4-2.2-5-3.6-10.5-6.2z"/>
        </svg>
      </a>
    </>
  );
}
