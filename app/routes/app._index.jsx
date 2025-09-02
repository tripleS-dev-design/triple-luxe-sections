// app/routes/app._index.jsx
import React, { useEffect } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";

import { authenticate } from "../shopify.server";
import { hasActiveSubscription, createSubscription } from "../services/billing.server";

/* ===============================
 * LOADER: Auth + Billing (sans 302 serveur)
 * =============================== */
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const origin = url.origin;

  // 1) Abonnement actif ?
  const active = await hasActiveSubscription(admin);
  if (!active) {
    // 2) Pas actif → on crée l’abonnement et on renvoie l’URL de confirmation
    const confirmationUrl = await createSubscription(admin, {
      name: "tls-premium-monthly",
      price: 9.99, // 💸 ton prix
      interval: "EVERY_30_DAYS", // ou "ANNUAL"
      returnUrl: `${origin}/app/billing/confirm`,
      test: process.env.NODE_ENV !== "production",
      currencyCode: "USD",
    });

    // On peut aussi renvoyer des infos shop pour l’UI derrière
    const shopDomain = session.shop || "";
    const shopSub = shopDomain.replace(".myshopify.com", "");
    const apiKey = process.env.SHOPIFY_API_KEY || "";

    return json({ confirmationUrl, shopSub, apiKey });
  }

  // ✅ Abonné → données pour l’UI
  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  return json({ shopSub, apiKey });
};

/* ===============================
 * Deep links (API KEY)
 * addAppBlockId / addAppSectionId = <API_KEY>/<handle>
 * =============================== */
function editorBase({ shopSub }) {
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}
function linkAddBlock({ shopSub, template = "index", apiKey, handle, target = "newAppsSection" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    target,
    addAppBlockId: `${apiKey}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}
function linkAddSection({ shopSub, template = "index", apiKey, handle, target = "newAppsSection" }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({
    context: "apps",
    template,
    target,
    addAppSectionId: `${apiKey}/${handle}`,
  });
  return `${base}?${p.toString()}`;
}
function linkActivateApp({ shopSub, apiKey }) {
  const base = editorBase({ shopSub });
  const p = new URLSearchParams({ context: "apps", activateAppId: apiKey });
  return `${base}?${p.toString()}`;
}

/* ===============================
 * UI (SETTINGS) — Page principale
 * =============================== */
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
  fontFamily: "system-ui, sans-serif",
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

// Handles = noms des fichiers .liquid
const APP_BLOCKS = [
  { handle: "tls-header",         title: "Header simple (noir & rose)", desc: "Logo + menu horizontal + panier.",       template: "index" },
  { handle: "tls-banner-3",       title: "Bannière — 3 images",         desc: "Slider auto 3 visuels, sans crop.",      template: "index" },
  { handle: "tls-circle-marquee", title: "Bandeau produits (cercle)",   desc: "Défilement continu, hover zoom.",        template: "index" },
  { handle: "tls-product-card",   title: "Produit — Bloc vitrine",      desc: "Grande image + miniatures + CTA.",       template: "product" },
  { handle: "tls-social-timer",   title: "Social + Timer",              desc: "IG / FB / TikTok / WhatsApp + timer.",   template: "index" },
  { handle: "tls-testimonials",   title: "Testimonials avancés",        desc: "Grille d’avis responsive.",              template: "index" },
  { handle: "tls-footer",         title: "Footer (2 à 4 colonnes)",     desc: "Basé sur menus Shopify + paiements.",    template: "index" },
];

export default function AppIndex() {
  const data = useLoaderData();
  const app = useAppBridge();

  // Si le loader a renvoyé une URL de confirmation, on fait une redirection REMOTE (hors iframe)
  useEffect(() => {
    if (data?.confirmationUrl && app) {
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.REMOTE, data.confirmationUrl);
    }
  }, [data?.confirmationUrl, app]);

  const { shopSub, apiKey } = data || {};

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

  // Pendant la redirection de billing, on affiche juste un "chargement"
  if (data?.confirmationUrl) {
    return (
      <div style={{ ...CONTAINER_STYLE, color: "#fff" }}>
        <section style={HEADER_HERO}>
          <h1 style={TITLE}>Redirection vers la page de paiement…</h1>
          <p style={SUB}>Merci de patienter, Shopify s’ouvre hors de l’iframe.</p>
        </section>
      </div>
    );
  }

  return (
    <div style={CONTAINER_STYLE}>
      <section style={HEADER_HERO}>
        <h1 style={TITLE}>Triple-Luxe-Sections — Settings</h1>
        <p style={SUB}>
          Ajoutez vos éléments ci-dessous. Chaque bouton ouvre l’éditeur et pré-sélectionne le block/section.
        </p>
      </section>

      {/* HEADER */}
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

      {/* CONTENT */}
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

      {/* FOOTER */}
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
  );
}
