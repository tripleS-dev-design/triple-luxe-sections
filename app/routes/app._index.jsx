// app/routes/app._index.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/* ===============================
 * LOADER: Auth only (Managed pricing = no Billing API)
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
 * Deep links to Theme Editor
 * =============================== */
function editorBase({ shopSub }) {
  return `https://admin.shopify.com/store/${shopSub}/themes/current/editor`;
}
function linkAddBlock({
  shopSub,
  template = "index",
  apiKey,
  handle,
  target = "newAppsSection",
}) {
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
 * Content (blocks)
 * =============================== */
const APP_BLOCKS = [
  // HEADER
  {
    group: "Header",
    items: [
      {
        handle: "tls-header",
        template: "index",
        icon: "layout",
        title: "Simple header (dark & pink)",
        desc: "Logo, horizontal menu, and cart. Clean and responsive.",
      },
    ],
  },

  // CONTENT
  {
    group: "Content",
    items: [
      {
        handle: "tls-banner-3",
        template: "index",
        icon: "images",
        title: "Banner – 3 images",
        desc: "Auto slider with 3 visuals. Keeps original ratio (no crop).",
      },
      {
        handle: "tls-circle-marquee",
        template: "index",
        icon: "marquee",
        title: "Product marquee (circle)",
        desc: "Continuous scrolling list of products with hover zoom.",
      },
      {
        handle: "tls-product-card",
        template: "product",
        icon: "card",
        title: "Product – Showcase card",
        desc: "Large main image, thumbnails, price, and a primary CTA.",
      },
      {
        handle: "tls-social-timer",
        template: "index",
        icon: "star",
        title: "Social + Countdown",
        desc: "Instagram / Facebook / TikTok / WhatsApp icons with live timer.",
      },
      {
        handle: "tls-testimonials",
        template: "index",
        icon: "reviews",
        title: "Testimonials grid",
        desc: "Responsive customer reviews presented in a clean grid.",
      },
    ],
  },

  // FOOTER
  {
    group: "Footer",
    items: [
      {
        handle: "tls-footer",
        template: "index",
        icon: "footer",
        title: "Footer (2–4 columns)",
        desc: "Uses Shopify menus and payment icons. Fully responsive.",
      },
    ],
  },
];

/* ===============================
 * Styles (inline CSS-in-JS)
 * =============================== */
const COLORS = {
  bg: "#f5f7fb",
  card: "#ffffff",
  border: "rgba(16,24,40,0.08)",
  text: "#0b1320",
  sub: "#4b5563",
  btnText: "#ffffff",
  btnGradA: "#2F6BFF",
  btnGradB: "#8A4DFF",
  pillBg: "rgba(255,255,255,0.18)",
  pillText: "#ffffff",
};
const PAGE = {
  minHeight: "100vh",
  background: COLORS.bg,
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  color: COLORS.text,
};
const WRAP = { maxWidth: 1080, margin: "0 auto", padding: "22px 16px 80px" };

const HERO = {
  position: "relative",
  background: "linear-gradient(135deg, #4fb2ff 0%, #6c47ff 100%)",
  borderRadius: 18,
  padding: "26px 22px",
  color: "#fff",
  boxShadow: "0 16px 40px rgba(29,78,216,0.20)",
  overflow: "hidden",
};
const HERO_ROW = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};
const HERO_TITLE = { margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: ".2px" };
const HERO_SUB = { margin: "6px 0 0 0", opacity: 0.95, fontWeight: 500 };

const PILL_ROW = { display: "flex", gap: 10, flexWrap: "wrap" };
const PILL = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 14px",
  borderRadius: 999,
  background: COLORS.pillBg,
  border: "1px solid rgba(255,255,255,0.22)",
  color: COLORS.pillText,
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "none",
};

const GROUP = { marginTop: 22 };
const GROUP_HEAD = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  margin: "8px 0 10px 4px",
  color: "#1f2b43",
  fontWeight: 900,
  fontSize: 18,
};
const CHIP = {
  width: 26,
  height: 26,
  borderRadius: 8,
  display: "grid",
  placeItems: "center",
  background: "#eef2ff",
  border: "1px solid #dbe3ff",
};

const CARD = {
  background: COLORS.card,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 16,
  padding: 16,
  marginBottom: 14,
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "center",
  gap: 14,
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
};
const ICON = {
  width: 46,
  height: 46,
  borderRadius: 12,
  display: "grid",
  placeItems: "center",
  background: "#eef2ff",
  border: "1px solid #dbe3ff",
};
const TITLE = { fontSize: 16, fontWeight: 900, margin: 0, color: COLORS.text };
const DESC = { margin: "4px 0 0 0", color: COLORS.sub };

const BTN = {
  border: "none",
  borderRadius: 12,
  padding: "12px 18px",
  fontWeight: 800,
  cursor: "pointer",
  color: COLORS.btnText,
  background: `linear-gradient(135deg, ${COLORS.btnGradA} 0%, ${COLORS.btnGradB} 100%)`,
  boxShadow: "0 10px 20px rgba(47,107,255,0.25)",
};

/* ===============================
 * Small inline icons
 * =============================== */
const Svg = {
  layout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="6" rx="2" fill="#6b7cff" />
      <rect x="3" y="12" width="10" height="8" rx="2" fill="#b6c3ff" />
      <rect x="15" y="12" width="6" height="8" rx="2" fill="#b6c3ff" />
    </svg>
  ),
  images: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="6" height="6" rx="1.5" fill="#6b7cff" />
      <rect x="9.5" y="5" width="6" height="6" rx="1.5" fill="#8ea0ff" />
      <rect x="16" y="5" width="5" height="6" rx="1.5" fill="#b6c3ff" />
      <rect x="3" y="13" width="18" height="6" rx="2" fill="#e1e7ff" />
    </svg>
  ),
  marquee: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="6" width="18" height="12" rx="3" stroke="#6b7cff" strokeWidth="2" />
      <circle cx="8" cy="12" r="2.2" fill="#6b7cff" />
      <circle cx="12" cy="12" r="2.2" fill="#8ea0ff" />
      <circle cx="16" cy="12" r="2.2" fill="#b6c3ff" />
    </svg>
  ),
  card: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke="#6b7cff" strokeWidth="2" />
      <rect x="6" y="7" width="7" height="7" rx="1.5" fill="#6b7cff" />
      <rect x="14.5" y="8" width="5.5" height="2.4" rx="1.2" fill="#b6c3ff" />
      <rect x="14.5" y="12" width="5.5" height="2.4" rx="1.2" fill="#e1e7ff" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6L7.1 19l.9-5.5-4-3.9 5.5-.8L12 4z" fill="#6b7cff" />
    </svg>
  ),
  reviews: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="#6b7cff" strokeWidth="2" />
      <rect x="6" y="8" width="12" height="2.2" rx="1.1" fill="#b6c3ff" />
      <rect x="6" y="12" width="9" height="2.2" rx="1.1" fill="#e1e7ff" />
    </svg>
  ),
  footer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="#6b7cff" strokeWidth="2" />
      <rect x="5" y="15" width="14" height="3" rx="1.5" fill="#6b7cff" />
    </svg>
  ),
  section: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="#fff" strokeWidth="2" />
      <rect x="7" y="7" width="10" height="6" rx="1.5" fill="#fff" />
    </svg>
  ),
  video: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2" />
      <polygon points="10,8 16,12 10,16" fill="#fff" />
    </svg>
  ),
  whatsapp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 12a8 8 0 0 1-11.9 7l-3.1 1 1-3.1A8 8 0 1 1 20 12z" fill="#25D366" />
      <path d="M8.8 9.9c.2-.5.4-.5.7-.5h.6c.2 0 .4.1.5.4.2.4.6 1.4.7 1.5.1.2.1.3 0 .5-.1.2-.2.4-.4.6-.2.2-.4.5 0 1 .3.4 1.3 2 3.1 2.8.5.2.9.2 1.2 0 .3-.2.8-.8 1-.9.2-.1.3 0 .5 0 .1 0 1.1.5 1.3.6.2.1.4.2.4.3 0 .2 0 1.1-.5 1.7-.4.6-1.2.9-2 .7-1.8-.4-3.2-1.4-4.6-2.7-1.3-1.3-2.3-2.7-2.7-4.5-.2-.9 0-1.7.6-2.1z" fill="#fff" />
    </svg>
  ),
};

/* ===============================
 * Component
 * =============================== */
export default function AppIndex() {
  const { shopSub, apiKey } = useLoaderData();

  // TODO: remplacez par vos liens réels
  const videoURL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  const whatsappURL = "https://wa.me/212600000000";

  return (
    <div style={PAGE}>
      <div style={WRAP}>
        {/* HERO */}
        <section style={HERO}>
          <div style={HERO_ROW}>
            <div>
              <h1 style={HERO_TITLE}>Triple-Luxe-Sections</h1>
              <p style={HERO_SUB}>Build premium sections in seconds</p>
            </div>
            <div style={PILL_ROW}>
              <a href={videoURL} target="_blank" rel="noreferrer" style={PILL} title="Video guide">
                {Svg.video}
                <span>Video guide</span>
              </a>
              <a href={whatsappURL} target="_blank" rel="noreferrer" style={PILL} title="WhatsApp support">
                {Svg.whatsapp}
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </section>

        {/* GROUPS */}
        {APP_BLOCKS.map(({ group, items }) => (
          <div key={group} style={GROUP}>
            <div style={GROUP_HEAD}>
              <div style={CHIP}>{Svg.section}</div>
              <div>{group}</div>
            </div>

            {items.map((b) => (
              <article key={b.handle} style={CARD}>
                <div style={ICON}>{Svg[b.icon] || Svg.card}</div>

                <div>
                  <h3 style={TITLE}>{b.title}</h3>
                  <p style={DESC}>{b.desc}</p>
                </div>

                <a
                  href={linkAddBlock({
                    shopSub,
                    template: b.template,
                    apiKey,
                    handle: b.handle,
                  })}
                  target="_top"
                  rel="noreferrer"
                  title="Add this block to your theme"
                >
                  <button style={BTN}>Add to theme</button>
                </a>
              </article>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
