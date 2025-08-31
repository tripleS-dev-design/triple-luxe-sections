// app/routes/settings.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/* ==============================
   Loader: shop + extensionId
================================ */
export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { session } = await authenticate.admin(request);

  // session.shop = "selyadev.myshopify.com" → on extrait le sous-domaine "selyadev"
  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");

  return json({
    shopSub, // "selyadev"
    extensionId: process.env.THEME_EXTENSION_ID || "bfb33fe92c4274f1ba39275effdb6c25",
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

const SUB = { margin: "6px 0 0 0", opacity: 0.9 };

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
   Deep-links (même logique que ton app 1)
   - addAppBlockId = <extensionId>/<handle>
   - addAppSectionId = <extensionId>/<handle>
================================ */
function editorBase({ shopSub, themeId }) {
  const themePart = themeId ? `themes/${themeId}` : "themes/current";
  return `https://${shopSub}.myshopify.com/admin/${themePart}/editor`;
}

function linkAddBlock({ shopSub, template = "index", extensionId, handle, themeId }) {
  const base = editorBase({ shopSub, themeId });
  const p = new URLSearchParams({
    context: "apps",
    template,
    addAppBlockId: `${extensionId}/${handle}`,
    // target volontairement omis—Shopify place le block dans la section Apps si nécessaire
  });
  return `${base}?${p.toString()}`;
}

function linkAddSection({ shopSub, template = "index", extensionId, handle, themeId }) {
  const base = editorBase({ shopSub, themeId });
  const p = new URLSearchParams({
    context: "apps",
    template,
    target: "newAppsSection",
    addAppSectionId: `${extensionId}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}

function linkActivateApp({ shopSub, extensionId, themeId }) {
  const base = editorBase({ shopSub, themeId });
  const p = new URLSearchParams({
    context: "apps",
    activateAppId: extensionId,
  });
  return `${base}?${p.toString()}`;
}

/* ==============================
   Tes blocks (handles = fichiers .liquid)
================================ */
const APP_BLOCKS = [
  { handle: "tls-header",          title: "Header simple (noir & rose)", desc: "Logo + menu horizontal + panier.", template: "index" },
  { handle: "tls-banner-3",        title: "Bannière — 3 images",         desc: "Slider auto 3 visuels, sans crop.", template: "index" },
  { handle: "tls-circle-marquee",  title: "Bandeau produits (cercle)",   desc: "Défilement continu, hover zoom.",   template: "index" },
  { handle: "tls-product-card",    title: "Produit — Bloc vitrine",      desc: "Grande image + miniatures + CTA.",  template: "index" },
  { handle: "tls-social-timer",    title: "Social + Timer",              desc: "IG / FB / TikTok / WhatsApp + timer.", template: "index" },
  { handle: "tls-testimonials",    title: "Testimonials avancés",        desc: "Grille d’avis responsive.",         template: "index" },
  { handle: "tls-footer",          title: "Footer (2 à 4 colonnes)",     desc: "Basé sur menus Shopify + paiements.", template: "index" },
];

/* ==============================
   UI
================================ */
export default function Settings() {
  const { shopSub, extensionId } = useLoaderData();

  const headerBlocks = APP_BLOCKS.filter((b) => b.handle === "tls-header");
  const footerBlocks = APP_BLOCKS.filter((b) => b.handle === "tls-footer");
  const contentBlocks = APP_BLOCKS.filter((b) => b.handle !== "tls-header" && b.handle !== "tls-footer");

  const missingExt = !extensionId || extensionId.length < 16; // ton app 1 utilise 32 chars hex

  const ActionButtons = ({ b }) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <a href={linkAddBlock({ shopSub, template: b.template, extensionId, handle: b.handle })} target="_top" rel="noreferrer">
        <button style={{ ...BUTTON_BASE, background: "linear-gradient(90deg,#d6b35b,#f0df9b 70%,#d6b35b)", color: "#111" }}>
          Add as Block
        </button>
      </a>
      <a href={linkAddSection({ shopSub, template: b.template, extensionId, handle: b.handle })} target="_top" rel="noreferrer">
        <button style={{ ...BUTTON_BASE, background: "#000", color: "#fff" }}>
          Add as Section
        </button>
      </a>
      <a href={linkActivateApp({ shopSub, extensionId })} target="_top" rel="noreferrer">
        <button style={{ ...BUTTON_BASE, background: "#111", color: "#fff", border: "1px solid rgba(200,162,77,.35)" }}>
          Open Editor (Apps)
        </button>
      </a>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <div style={CONTAINER_STYLE}>
        {/* HERO */}
        <section style={HEADER_HERO}>
          <h1 style={TITLE} className="tls-shine">Triple-Luxe-Sections — Settings</h1>
          <p style={SUB}>
            Ajoutez vos éléments ci-dessous. Chaque bouton ouvre l’éditeur et tente d’insérer automatiquement le block/section.
          </p>
          {missingExt && (
            <div style={{
              marginTop: 12, background: "#2a1f10", color: "#f0df9b",
              border: "1px solid rgba(200,162,77,.35)", borderRadius: 10, padding: "10px 14px", fontWeight: 700
            }}>
              THEME_EXTENSION_ID manquant/incorrect. Mets l’ID que tu utilises dans ton app 1 (ex: <code>be79dab79ff6bb4be47d4e66577b6c50</code>).
            </div>
          )}
        </section>

        {/* HEADER group */}
        <section style={{ marginBottom: 10 }}>
          <div style={{ color: "#111", fontWeight: 900, letterSpacing: ".3px", margin: "0 0 10px 2px" }}>Header</div>
          {headerBlocks.map((b) => (
            <article key={b.handle} style={CARD_STYLE}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{b.title}</div>
                <div style={{ opacity: 0.9, marginTop: 4 }}>{b.desc}</div>
              </div>
              <ActionButtons b={b} />
            </article>
          ))}
        </section>

        {/* CONTENT group */}
        <section style={{ margin: "16px 0 10px" }}>
          <div style={{ color: "#111", fontWeight: 900, letterSpacing: ".3px", margin: "0 0 10px 2px" }}>Content</div>
          {contentBlocks.map((b) => (
            <article key={b.handle} style={CARD_STYLE}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{b.title}</div>
                <div style={{ opacity: 0.9, marginTop: 4 }}>{b.desc}</div>
              </div>
              <ActionButtons b={b} />
            </article>
          ))}
        </section>

        {/* FOOTER group */}
        <section style={{ marginTop: 16 }}>
          <div style={{ color: "#111", fontWeight: 900, letterSpacing: ".3px", margin: "0 0 10px 2px" }}>Footer</div>
          {footerBlocks.map((b) => (
            <article key={b.handle} style={CARD_STYLE}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900 }}>{b.title}</div>
                <div style={{ opacity: 0.9, marginTop: 4 }}>{b.desc}</div>
              </div>
              <ActionButtons b={b} />
            </article>
          ))}
        </section>
      </div>

      {/* YouTube */}
      <a
        href="https://youtu.be/dm0eBVNGGjw"
        target="_blank"
        rel="noopener noreferrer"
        style={{ position: "fixed", bottom: "24px", right: "24px", textDecoration: "none", zIndex: 999 }}
        aria-label="YouTube tutorial"
      >
        <button style={{ ...BUTTON_BASE, backgroundColor: "#000", color: "#fff", padding: "12px 20px", borderRadius: "30px", cursor: "pointer" }}>
          YouTube
        </button>
      </a>

      {/* WhatsApp */}
      <a
        href="https://wa.me/+212630079763"
        target="_blank"
        rel="noopener noreferrer"
        style={{ position: "fixed", bottom: "24px", left: "24px", backgroundColor: "#000", borderRadius: "50%", padding: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", zIndex: 999 }}
        aria-label="WhatsApp"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="#fff" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339.4 55.6 283.3 32 224 32S108.6 55.6 67.1 97.1C25.6 138.6 2 194.7 2 254c0 45.3 13.5 89.3 39 126.7L0 480l102.6-38.7C140 481.5 181.7 494 224 494c59.3 0 115.4-23.6 156.9-65.1C422.4 370.6 446 314.5 446 254s-23.6-115.4-65.1-156.9zM224 438c-37.4 0-73.5-11.1-104.4-32l-7.4-4.9-61.8 23.3 23.2-60.6-4.9-7.6C50.1 322.9 38 289.1 38 254c0-102.6 83.4-186 186-186s186 83.4 186 186-83.4 186-186 186zm101.5-138.6c-5.5-2.7-32.7-16.1-37.8-17.9-5.1-1.9-8.8-2.7-12.5 2.7s-14.3 17.9-17.5 21.6c-3.2 3.7-6.4 4.1-11.9 1.4s-23.2-8.5-44.2-27.1c-16.3-14.5-27.3-32.4-30.5-37.9-3.2-5.5-.3-8.5 2.4-11.2 2.5-2.5 5.5-6.4 8.3-9.6 2.8-3.2 3.7-5.5 5.5-9.2s.9-6.9-.5-9.6c-1.4-2.7-12.5-30.1-17.2-41.3-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2s-9.6 1.4-14.6 6.9-19.2 18.7-19.2 45.7 19.7 53 22.4 56.7c2.7 3.7 38.6 59.1 93.7 82.8 13.1 5.7 23.3 9.1 31.3 11.7 13.1 4.2 25.1 3.6 34.6 2.2 10.5-1.6 32.7-13.4 37.3-26.3 4.6-12.7 4.6-23.5 3.2-25.7-1.4-2.2-5-3.6-10.5-6.2z"/>
        </svg>
      </a>
    </>
  );
}
