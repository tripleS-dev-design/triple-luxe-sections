// app/routes/settings.jsx
import React from "react";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/* =============== Loader: shop + apiKey + billing gating =============== */
export const loader = async ({ request }) => {
  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");
  const REQUIRED = [PLAN_HANDLES.monthly, PLAN_HANDLES.annual];

  const { billing, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const qs = url.searchParams.toString();

  // Si pas abonné → page pricing (ta route /app.additional)
  try {
    await billing.require({ plans: REQUIRED });
  } catch {
    return redirect(`/app.additional${qs ? `?${qs}` : ""}`);
  }

  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  return json({ shopSub, apiKey });
};

/* ============================== Styles ============================== */
const BUTTON_BASE = { border: "none", borderRadius: "10px", padding: "12px 20px", fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,.18)", letterSpacing: ".2px" };
const CONTAINER_STYLE = { maxWidth: "1080px", margin: "0 auto", padding: "18px 16px 80px" };
const CARD_STYLE = { backgroundColor: "#111111", borderRadius: "14px", padding: "18px", marginBottom: "16px", border: "1px solid rgba(200,162,77,.25)", display: "grid", gridTemplateColumns: "1fr auto", gap: "14px", alignItems: "center", color: "#f5f5f5" };
const HEADER_HERO = { background: "linear-gradient(135deg, #0a0a0a 35%, #1a1a1a 60%, #2a2a2a 100%)", border: "1px solid rgba(200,162,77,.35)", borderRadius: "16px", padding: "22px", marginBottom: "18px", color: "#fff", boxShadow: "0 12px 40px rgba(0,0,0,.25)" };
const TITLE = { margin: 0, fontSize: "22px", fontWeight: 900, letterSpacing: ".3px", background: "linear-gradient(90deg, #d6b35b, #f0df9b 50%, #d6b35b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
const SUB = { margin: "6px 0 0 0", opacity: 0.9 };
const GLOBAL_STYLES = `
@keyframes tlsShimmer { 0%{background-position:-420px 0} 100%{background-position:420px 0} }
.tls-shine{ background:linear-gradient(90deg,rgba(255,255,255,.08) 0%,rgba(255,255,255,.18) 50%,rgba(255,255,255,.08) 100%); background-size:420px 100%; -webkit-background-clip:text; -webkit-text-fill-color:transparent; animation:tlsShimmer 5s linear infinite;}
`;

/* =============== Deep-links (API KEY comme l’app 1) =============== */
function editorBase({ shopSub }) {
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}

function linkAddBlock({ shopSub, template = "index", apiKey, handle, target = "newAppsSection" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({ context: "apps", template, target, addAppBlockId: `${apiKey}/${handle}` });
  return `${base}?${p.toString()}`;
}

function linkAddSection({ shopSub, template = "index", apiKey, handle, target = "newAppsSection" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({ context: "apps", template, target, addAppSectionId: `${apiKey}/${handle}` });
  return `${base}?${p.toString()}`;
}

function linkActivateApp({ shopSub, apiKey }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({ context: "apps", activateAppId: apiKey });
  return `${base}?${p.toString()}`;
}

/* =============== Tes blocks (handles = fichiers .liquid) =============== */
const APP_BLOCKS = [
  { handle: "tls-header",          title: "Header simple (noir & rose)", desc: "Logo + menu horizontal + panier.", template: "index" },
  { handle: "tls-banner-3",        title: "Bannière — 3 images",         desc: "Slider auto 3 visuels, sans crop.", template: "index" },
  { handle: "tls-circle-marquee",  title: "Bandeau produits (cercle)",   desc: "Défilement continu, hover zoom.",   template: "index" },
  { handle: "tls-product-card",    title: "Produit — Bloc vitrine",      desc: "Grande image + miniatures + CTA.",  template: "index" },
  { handle: "tls-social-timer",    title: "Social + Timer",              desc: "IG / FB / TikTok / WhatsApp + timer.", template: "index" },
  { handle: "tls-testimonials",    title: "Testimonials avancés",        desc: "Grille d’avis responsive.",         template: "index" },
  { handle: "tls-footer",          title: "Footer (2 à 4 colonnes)",     desc: "Basé sur menus Shopify + paiements.", template: "index" },
];

/* ============================== UI ============================== */
export default function Settings() {
  const { shopSub, apiKey } = useLoaderData();

  const headerBlocks  = APP_BLOCKS.filter((b) => b.handle === "tls-header");
  const footerBlocks  = APP_BLOCKS.filter((b) => b.handle === "tls-footer");
  const contentBlocks = APP_BLOCKS.filter((b) => b.handle !== "tls-header" && b.handle !== "tls-footer");

  const ActionButtons = ({ b }) => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <a href={linkAddBlock({ shopSub, template: b.template, apiKey, handle: b.handle })} target="_top" rel="noreferrer">
        <button style={{ ...BUTTON_BASE, background: "linear-gradient(90deg,#d6b35b,#f0df9b 70%,#d6b35b)", color: "#111" }}>
          Add as Block
        </button>
      </a>
      <a href={linkAddSection({ shopSub, template: b.template, apiKey, handle: b.handle })} target="_top" rel="noreferrer">
        <button style={{ ...BUTTON_BASE, background: "#000", color: "#fff" }}>
          Add as Section
        </button>
      </a>
      <a href={linkActivateApp({ shopSub, apiKey })} target="_top" rel="noreferrer">
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
        <section style={HEADER_HERO}>
          <h1 style={TITLE} className="tls-shine">Triple-Luxe-Sections — Settings</h1>
          <p style={SUB}>Ajoutez vos éléments ci-dessous. Chaque bouton ouvre l’éditeur et pré-sélectionne le block/section.</p>
        </section>

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
    </>
  );
}
