// app/routes/app._index.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

/* ================================
   Loader: auth + billing status + shop/apiKey
=================================== */
export const loader = async ({ request }) => {
  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");
  const { billing, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const qs = url.searchParams.toString();

  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  // Vérifie l’accès (mensuel/annuel); ne redirige pas, on affiche l’UI avec CTA
  let hasAccess = false;
  try {
    await billing.require({
      plans: [PLAN_HANDLES?.monthly, PLAN_HANDLES?.annual].filter(Boolean),
    });
    hasAccess = true;
  } catch (err) {
    // Si Shopify demande un 302 (login / exit-iframe), on le laisse passer
    if (err instanceof Response) return err;
    hasAccess = false;
  }

  return json({
    shopSub,
    shop: shopDomain,
    apiKey,
    hasAccess,
    qs,
    planHandles: {
      monthly: PLAN_HANDLES?.monthly || "tls-premium-monthly",
      annual: PLAN_HANDLES?.annual || "tls-premium-annual",
    },
  });
};

/* ================================
   Helpers deep links
   - addAppBlockId = <API_KEY>/<handle>
   - addAppSectionId = <API_KEY>/<handle>
=================================== */
function editorBase({ shopSub }) {
  // admin.shopify.com = plus robuste que *.myshopify.com/admin
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}

function linkActivateApp({ shopSub, apiKey }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    activateAppId: apiKey,
  });
  return `${base}?${p.toString()}`;
}

function linkAddBlock({ shopSub, apiKey, handle, template = "index", target = "newAppsSection" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    target,
    addAppBlockId: `${apiKey}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}

function linkAddSection({ shopSub, apiKey, handle, template = "index", target = "newAppsSection" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    target,
    addAppSectionId: `${apiKey}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}

/* ================================
   UI
=================================== */
const WRAP = { maxWidth: 1080, margin: "24px auto 80px", padding: "0 16px", fontFamily: "system-ui, sans-serif" };
const HERO = {
  background: "linear-gradient(135deg,#0a0a0a 35%,#1a1a1a 60%,#2a2a2a 100%)",
  color: "#fff",
  border: "1px solid rgba(200,162,77,.35)",
  borderRadius: 16,
  padding: 22,
  boxShadow: "0 12px 40px rgba(0,0,0,.25)",
  marginBottom: 18,
};
const TITLE = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
  letterSpacing: ".3px",
  background: "linear-gradient(90deg,#d6b35b,#f0df9b 50%,#d6b35b 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};
const ROW = { display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "center" };
const CARD = { background: "#111", color: "#f5f5f5", borderRadius: 14, border: "1px solid rgba(200,162,77,.25)", padding: 18, marginBottom: 14, ...ROW };
const BT = { border: "none", borderRadius: 10, padding: "12px 20px", fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,.18)", letterSpacing: ".2px" };

export default function AppIndex() {
  const { shopSub, apiKey, hasAccess, qs, planHandles } = useLoaderData();

  const blocks = [
    { handle: "tls-header",         title: "Header (section group: header)", template: "index", targetBlock: "newAppsSection", targetSection: "sectionGroup:header" },
    { handle: "tls-footer",         title: "Footer (section group: footer)", template: "index", targetBlock: "newAppsSection", targetSection: "sectionGroup:footer" },
    { handle: "tls-testimonials",   title: "Testimonials (content)",         template: "index" },
    { handle: "tls-banner-3",       title: "Bannière 3 images",              template: "index" },
    { handle: "tls-circle-marquee", title: "Bandeau produits (cercle)",      template: "index" },
    { handle: "tls-product-card",   title: "Produit — Bloc vitrine",         template: "product", targetBlock: "mainSection" },
    { handle: "tls-social-timer",   title: "Social + Timer",                 template: "index" },
  ];

  return (
    <main style={WRAP}>
      <section style={HERO}>
        <h1 style={TITLE}>Triple-Luxe-Sections — App</h1>
        <p style={{ margin: "6px 0 0 0", opacity: 0.9 }}>
          Page principale : ouvrez le Theme Editor, ajoutez vos blocks/sections, ou accédez aux Settings.
        </p>
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link to={`/settings${qs ? `?${qs}` : ""}`} prefetch="intent">
            <button style={{ ...BT, background: "#000", color: "#fff" }}>Open Settings</button>
          </Link>
          <a href={linkActivateApp({ shopSub, apiKey })} target="_top" rel="noreferrer">
            <button style={{ ...BT, background: "#111", color: "#fff", border: "1px solid rgba(200,162,77,.35)" }}>
              Open Theme Editor (Apps)
            </button>
          </a>
          {!hasAccess && (
            <>
              <a
                href={`/billing.activate?plan=${encodeURIComponent(planHandles.monthly)}${qs ? `&${qs}` : ""}`}
                target="_top"
                rel="noreferrer"
              >
                <button style={{ ...BT, background: "linear-gradient(90deg,#d6b35b,#f0df9b 70%,#d6b35b)", color: "#111" }}>
                  Activer plan Mensuel
                </button>
              </a>
              <a
                href={`/billing.activate?plan=${encodeURIComponent(planHandles.annual)}${qs ? `&${qs}` : ""}`}
                target="_top"
                rel="noreferrer"
              >
                <button style={{ ...BT, background: "linear-gradient(90deg,#d6b35b,#f0df9b 70%,#d6b35b)", color: "#111" }}>
                  Activer plan Annuel
                </button>
              </a>
              <Link to={`/app.additional${qs ? `?${qs}` : ""}`}>
                <button style={{ ...BT, background: "#000", color: "#fff" }}>Voir Pricing</button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* CARTES D’AJOUT RAPIDE */}
      {blocks.map((b) => (
        <article key={b.handle} style={CARD}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900 }}>{b.title}</div>
            <div style={{ opacity: 0.9, marginTop: 4 }}>
              Handle: <code>{b.handle}</code> — Template: <code>{b.template}</code>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {/* Ajouter comme Block */}
            <a
              href={linkAddBlock({
                shopSub,
                apiKey,
                handle: b.handle,
                template: b.template,
                target: b.targetBlock || "newAppsSection",
              })}
              target="_top"
              rel="noreferrer"
            >
              <button style={{ ...BT, background: "linear-gradient(90deg,#d6b35b,#f0df9b 70%,#d6b35b)", color: "#111" }}>
                Add as Block
              </button>
            </a>

            {/* Ajouter comme Section */}
            <a
              href={linkAddSection({
                shopSub,
                apiKey,
                handle: b.handle,
                template: b.template,
                target: b.targetSection || "newAppsSection",
              })}
              target="_top"
              rel="noreferrer"
            >
              <button style={{ ...BT, background: "#000", color: "#fff" }}>Add as Section</button>
            </a>
          </div>
        </article>
      ))}
    </main>
  );
}
