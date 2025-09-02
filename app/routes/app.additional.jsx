// app/routes/app.additional.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const meta = () => [{ title: "Pricing — Triple-Luxe-Sections" }];

export const loader = async ({ request }) => {
  const { PLAN_HANDLES } = await import("../shopify.server");
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || "";
  const qs = new URLSearchParams({ ...(shop && { shop }), ...(host && { host }) }).toString();
  return json({ PLAN_HANDLES, qs });
};

export default function Pricing() {
  const { PLAN_HANDLES, qs } = useLoaderData();

  const BUTTON_BASE = { border: "none", borderRadius: "10px", padding: "12px 20px", fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,.18)", letterSpacing: ".2px" };
  const CONTAINER_STYLE = { maxWidth: "1080px", margin: "0 auto", padding: "18px 16px 60px", fontFamily: "system-ui, sans-serif" };
  const HEADER_HERO = { background: "linear-gradient(135deg, #0a0a0a 35%, #1a1a1a 60%, #2a2a2a 100%)", border: "1px solid rgba(200,162,77,.35)", borderRadius: "16px", padding: "22px", marginBottom: "18px", color: "#fff", boxShadow: "0 12px 40px rgba(0,0,0,.25)", textAlign: "center" };
  const TITLE = { margin: 0, fontSize: "22px", fontWeight: 900, letterSpacing: ".3px", background: "linear-gradient(90deg,#d6b35b,#f0df9b 50%,#d6b35b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
  const GRID = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };
  const GRID_MOBILE = { display: "grid", gridTemplateColumns: "1fr", gap: "16px" };
  const CARD = (highlight = false) => ({ backgroundColor: "#111111", borderRadius: "14px", padding: "22px", border: `1px solid rgba(200,162,77,${highlight ? ".55" : ".25"})`, color: "#f5f5f5", boxShadow: highlight ? "0 16px 44px rgba(0,0,0,.28)" : "0 10px 28px rgba(0,0,0,.2)" });
  const PRICE = { fontSize: "34px", fontWeight: 900, color: "#f0df9b", lineHeight: 1 };
  const FEATURE = { display: "flex", alignItems: "center", gap: "10px", margin: "8px 0", opacity: 0.95 };
  const CHECK = <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(90deg,#d6b35b,#f0df9b 70%,#d6b35b)", display: "inline-grid", placeItems: "center", color: "#111", fontSize: 14, fontWeight: 900 }}>✓</span>;

  const features = ["Sections Header / Content / Footer","Bannière 3 images","Bandeau produits (cercle)","Bloc vitrine produit","Social + Timer","Testimonials avancés","Mises à jour & support de base"];

  const Plan = ({ title, price, period, highlight, cta, planHandle }) => {
    const href = `/billing/activate?plan=${encodeURIComponent(planHandle)}${qs ? `&${qs}` : ""}`;
    return (
      <article style={CARD(highlight)}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3 style={{ margin: 0, fontWeight: 900 }}>{title}</h3>
          {highlight && (
            <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 900, padding: "6px 10px", borderRadius: 999, color: "#111", background:"linear-gradient(90deg,#d6b35b,#f0df9b 70%,#d6b35b)", border:"1px solid rgba(200,162,77,.6)" }}>
              Meilleure offre
            </span>
          )}
        </div>

        <div style={{ marginTop: 10, display: "flex", alignItems: "end", gap: 8 }}>
          <span style={PRICE}>{price}</span><span style={{ opacity: 0.8 }}>/ {period}</span>
        </div>

        <div style={{ marginTop: 14 }}>
          {features.map((f, i) => (<div key={i} style={FEATURE}>{CHECK}<span>{f}</span></div>))}
        </div>

        <div style={{ marginTop: 18 }}>
          <a href={href} target="_top" rel="noreferrer">
            <button style={{ ...BUTTON_BASE, width: "100%", background: "linear-gradient(90deg,#d6b35b,#f0df9b 70%,#d6b35b)", color: "#111" }}>
              {cta}
            </button>
          </a>
        </div>
      </article>
    );
  };

  const twoCols = typeof window !== "undefined" ? window.innerWidth > 900 : true;

  return (
    <div style={CONTAINER_STYLE}>
      <section style={HEADER_HERO}>
        <h1 style={TITLE}>Tarifs — Triple-Luxe-Sections</h1>
        <p style={{ margin: "6px 0 0 0", opacity: 0.9 }}>Choisissez votre plan — les deux incluent toutes les sections. Essai gratuit 14 jours.</p>
      </section>

      <section style={twoCols ? GRID : GRID_MOBILE}>
        <Plan title="Mensuel" price="4,99 $" period="mois" cta="Choisir le plan mensuel" planHandle={PLAN_HANDLES.monthly} />
        <Plan title="Annuel"  price="39,99 $" period="an"   cta="Choisir le plan annuel"  planHandle={PLAN_HANDLES.annual}  highlight />
      </section>
    </div>
  );
}
