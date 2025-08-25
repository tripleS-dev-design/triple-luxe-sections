// app/routes/app.additional.jsx
import React from "react";

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
  padding: "18px 16px 60px",
};

const HEADER_HERO = {
  background: "linear-gradient(135deg, #0a0a0a 35%, #1a1a1a 60%, #2a2a2a 100%)",
  border: "1px solid rgba(200,162,77,.35)",
  borderRadius: "16px",
  padding: "22px",
  marginBottom: "18px",
  color: "#fff",
  boxShadow: "0 12px 40px rgba(0,0,0,.25)",
  textAlign: "center",
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

const GRID = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px",
};
const GRID_MOBILE = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
};

const CARD = (highlight = false) => ({
  backgroundColor: "#111111",
  borderRadius: "14px",
  padding: "22px",
  border: `1px solid rgba(200,162,77,${highlight ? ".55" : ".25"})`,
  color: "#f5f5f5",
  boxShadow: highlight ? "0 16px 44px rgba(0,0,0,.28)" : "0 10px 28px rgba(0,0,0,.2)",
});

const PRICE = {
  fontSize: "34px",
  fontWeight: 900,
  color: "#f0df9b",
  lineHeight: 1,
};

const FEATURE = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  margin: "8px 0",
  opacity: 0.95,
};

const CHECK = (
  <span
    style={{
      width: 22,
      height: 22,
      borderRadius: "50%",
      background: "linear-gradient(90deg, #d6b35b, #f0df9b 70%, #d6b35b)",
      display: "inline-grid",
      placeItems: "center",
      color: "#111",
      fontSize: 14,
      fontWeight: 900,
    }}
  >
    ✓
  </span>
);

export const meta = () => [{ title: "Pricing — Triple-Luxe-Sections" }];

export default function Pricing() {
  const features = [
    "Sections Header / Content / Footer",
    "Bannière 3 images",
    "Bandeau produits (cercle)",
    "Bloc vitrine produit",
    "Social + Timer",
    "Testimonials avancés",
    "Mises à jour & support de base",
  ];

  const Plan = ({ title, price, period, highlight, cta }) => (
    <article style={CARD(highlight)}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <h3 style={{ margin: 0, fontWeight: 900 }}>{title}</h3>
        {highlight && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 12,
              fontWeight: 900,
              padding: "6px 10px",
              borderRadius: 999,
              color: "#111",
              background:
                "linear-gradient(90deg, #d6b35b, #f0df9b 70%, #d6b35b)",
              border: "1px solid rgba(200,162,77,.6)",
            }}
          >
            Meilleure offre
          </span>
        )}
      </div>

      <div style={{ marginTop: 10, display: "flex", alignItems: "end", gap: 8 }}>
        <span style={PRICE}>{price}</span>
        <span style={{ opacity: 0.8 }}>/ {period}</span>
      </div>

      <div style={{ marginTop: 14 }}>
        {features.map((f, i) => (
          <div key={i} style={FEATURE}>
            {CHECK}
            <span>{f}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <button
          // À connecter à la Billing API plus tard
          style={{
            ...BUTTON_BASE,
            width: "100%",
            background:
              "linear-gradient(90deg, #d6b35b, #f0df9b 70%, #d6b35b)",
            color: "#111",
          }}
        >
          {cta}
        </button>
      </div>
    </article>
  );

  // simple media query CSS-in-JS: bascule en 1 colonne sous 900px
  const twoCols = typeof window !== "undefined" ? window.innerWidth > 900 : true;

  return (
    <div style={CONTAINER_STYLE}>
      <section style={HEADER_HERO}>
        <h1 style={TITLE}>Tarifs — Triple-Luxe-Sections</h1>
        <p style={SUB}>
          Un design pro (noir & doré) pour votre boutique. Choisissez votre plan — les deux incluent toutes les sections.
        </p>
      </section>

      <section style={twoCols ? GRID : GRID_MOBILE}>
        <Plan
          title="Mensuel"
          price="4,99 €"
          period="mois"
          cta="Choisir le plan mensuel"
        />
        <Plan
          title="Annuel"
          price="39,99 €"
          period="an"
          highlight
          cta="Choisir le plan annuel"
        />
      </section>

      <section style={{ marginTop: 16, textAlign: "center", color: "#c8c8c8" }}>
        <small>
          Astuce : le plan annuel est idéal si vous conservez vos sections actives toute l’année.
        </small>
      </section>
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

      {/* ✅ WhatsApp en bas à GAUCHE (inchangé) */}
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
    </div>
  );
}
