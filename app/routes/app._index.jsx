// app/routes/app._index.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/* =========================================
 * LOADER: Auth uniquement (Managed pricing)
 * ========================================= */
export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { session } = await authenticate.admin(request);

  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  return json({ shopSub, apiKey });
};

/* =========================================
 * Deep links (Theme editor)
 * ========================================= */
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

/* =========================================
 * Styles de base (look Shopify, clair)
 * ========================================= */
const COLORS = {
  bg: "#f5f7fb",
  card: "#ffffff",
  text: "#101113",
  sub: "#5b667a",
  line: "#e9edf5",
  btnText: "#ffffff",
  pillText: "#0f172a",
};

const WRAP = {
  background: COLORS.bg,
  minHeight: "100vh",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Inter,Helvetica,Arial,sans-serif",
  color: COLORS.text,
};

const CONTAINER = {
  maxWidth: 1100,
  margin: "28px auto 64px",
  padding: "0 18px",
};

const HERO = {
  background: "linear-gradient(135deg,#32a5ff 0%,#5b6bff 40%,#7a4fff 100%)",
  borderRadius: 16,
  padding: 22,
  color: "#fff",
  boxShadow: "0 14px 40px rgba(62, 47, 176, .25)",
  position: "relative",
};

const HERO_TOP = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const TITLE_WRAP = { display: "flex", alignItems: "center", gap: 12 };
const APP_TITLE = { margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: ".2px" };
const APP_SUB = { margin: "2px 0 0 0", opacity: 0.95, fontSize: 13, fontWeight: 500 };

const PILLS = { display: "flex", gap: 10, flexWrap: "wrap" };
const pill = (bg = "#fff") => ({
  background: bg,
  color: bg === "#fff" ? COLORS.pillText : "#fff",
  borderRadius: 999,
  padding: "8px 12px",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontWeight: 700,
  fontSize: 13,
  textDecoration: "none",
  boxShadow: "0 6px 18px rgba(0,0,0,.15)",
});

const SECTION_TITLE = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 900,
  color: "#0f172a",
  margin: "22px 0 12px",
};

const LIST = { display: "grid", gap: 12 };

const CARD = {
  background: COLORS.card,
  borderRadius: 14,
  border: `1px solid ${COLORS.line}`,
  padding: 14,
  display: "grid",
  gridTemplateColumns: "56px 1fr auto",
  alignItems: "center",
  gap: 14,
  boxShadow: "0 8px 28px rgba(16,17,19,.04)",
};

const NAME = { margin: 0, fontWeight: 800, fontSize: 16 };
const DESC = { margin: "3px 0 0 0", color: COLORS.sub, fontSize: 13 };

const BTN_ADD = {
  background:
    "linear-gradient(135deg, #3a7fff 0%, #6252ff 55%, #8b44ff 100%)",
  color: COLORS.btnText,
  border: "0",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(98,82,255,.35)",
  whiteSpace: "nowrap",
};

/* =========================================
 * Icônes (inline SVG + carrés dégradés)
 * ========================================= */
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
  return (
    <div style={{ ...SQUARE(size), background: bg }}>
      {children}
    </div>
  );
};

// Petites icônes pour "Header / Content / Footer"
const TinyBadge = ({ emoji, grad = "violet" }) => (
  <SquareIcon size={28} grad={grad}>
    <span style={{ fontSize: 14, filter: "drop-shadow(0 1px 1px rgba(0,0,0,.25))" }}>
      {emoji}
    </span>
  </SquareIcon>
);

// Glyphs principaux (SVG)
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

/* =========================================
 * Données des blocs
 * ========================================= */
const APP_BLOCKS = [
  {
    handle: "tls-header",
    template: "index",
    title: "Simple header (dark & pink)",
    desc: "Logo, horizontal menu, and cart. Clean and responsive.",
    icon: <GlyphWindow />,
    grad: "violet",
    group: "Header",
  },
  {
    handle: "tls-banner-3",
    template: "index",
    title: "Banner – 3 images",
    desc: "Auto slider with 3 visuals. Keeps original ratio (no crop).",
    icon: <GlyphGallery />,
    grad: "blue",
    group: "Content",
  },
  {
    handle: "tls-circle-marquee",
    template: "index",
    title: "Product marquee (circle)",
    desc: "Continuous scrolling list of products with hover zoom.",
    icon: <GlyphMarquee />,
    grad: "violet",
    group: "Content",
  },
  {
    handle: "tls-product-card",
    template: "product",
    title: "Product – Showcase card",
    desc: "Large main image, thumbnails, price, and a primary CTA.",
    icon: <GlyphCard />,
    grad: "pink",
    group: "Content",
  },
  {
    handle: "tls-social-timer",
    template: "index",
    title: "Social + Countdown",
    desc: "Instagram / Facebook / TikTok / WhatsApp icons with live timer.",
    icon: <GlyphStar />,
    grad: "aqua",
    group: "Content",
  },
  {
    handle: "tls-testimonials",
    template: "index",
    title: "Testimonials grid",
    desc: "Responsive customer reviews presented in a clean grid.",
    icon: <GlyphStar />,
    grad: "violet",
    group: "Content",
  },
  {
    handle: "tls-footer",
    template: "index",
    title: "Footer (2–4 columns)",
    desc: "Uses Shopify menus and payment icons. Fully responsive.",
    icon: <GlyphWindow />,
    grad: "blue",
    group: "Footer",
  },
];

export default function AppIndex() {
  const { shopSub, apiKey } = useLoaderData();

  const groups = [
    { key: "Header", emoji: "🧱" },
    { key: "Content", emoji: "🧩" },
    { key: "Footer", emoji: "📦" },
  ];

  const byGroup = (g) => APP_BLOCKS.filter((b) => b.group === g);

  const AddButton = ({ b }) => (
    <a
      href={linkAddBlock({
        shopSub,
        template: b.template,
        apiKey,
        handle: b.handle,
      })}
      target="_top"
      rel="noreferrer"
    >
      <button style={BTN_ADD}>Add to theme</button>
    </a>
  );

  return (
    <div style={WRAP}>
      <div style={CONTAINER}>
        {/* Top hero */}
        <header style={HERO}>
          <div style={HERO_TOP}>
            <div style={TITLE_WRAP}>
              <SquareIcon grad="aqua">
                <GlyphWindow />
              </SquareIcon>
              <div>
                <h1 style={APP_TITLE}>Triple-Luxe-Sections</h1>
                <p style={APP_SUB}>Build premium sections in seconds</p>
              </div>
            </div>
            <div style={PILLS}>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
                style={pill("#ffffff")}
              >
                <span>▶</span> Video guide
              </a>
              <a
                href="https://wa.me/0000000000"
                target="_blank"
                rel="noreferrer"
                style={pill("linear-gradient(135deg,#22c55e,#16a34a)")}
              >
                <span>🟢</span> WhatsApp
              </a>
            </div>
          </div>
        </header>

        {/* Sections */}
        {groups.map((g) => (
          <section key={g.key} style={{ marginTop: 18 }}>
            <div style={SECTION_TITLE}>
              <TinyBadge emoji={g.emoji} />
              <span style={{ fontSize: 18 }}>{g.key}</span>
            </div>

            <div style={LIST}>
              {byGroup(g.key).map((b) => (
                <article key={b.handle} style={CARD}>
                  <SquareIcon grad={b.grad}>{b.icon}</SquareIcon>

                  <div>
                    <h3 style={NAME}>{b.title}</h3>
                    <p style={DESC}>{b.desc}</p>
                  </div>

                  <AddButton b={b} />
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
