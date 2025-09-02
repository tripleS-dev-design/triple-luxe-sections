// app/routes/app._index.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/* ===============================
 * LOADER: Auth (no billing gate)
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
 * Theme Editor deep links
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
// Kept for parity (unused in UI, safe to keep)
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
 * CONTACT LINKS (edit if you want)
 * =============================== */
const CONTACT = {
  whatsapp: "https://wa.me/0000000000", // ← put your number
  video: "https://youtu.be/dQw4w9WgXcQ", // ← put your tutorial link
};

/* ===============================
 * DESIGN TOKENS (Shopify-like grays)
 * =============================== */
const COLORS = {
  bg: "#F6F6F7",
  surface: "#FFFFFF",
  text: "#202223",
  subtext: "#5C5F62",
  border: "#E1E3E5",
  borderSoft: "#F0F1F2",
  black: "#000000",
  white: "#FFFFFF",
};
const FONTS =
  "-apple-system, BlinkMacSystemFont, Inter, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji', 'Segoe UI Symbol', sans-serif";

/* ===============================
 * UI STYLES
 * =============================== */
const PAGE = {
  minHeight: "100vh",
  background: COLORS.bg,
  fontFamily: FONTS,
  color: COLORS.text,
};
const WRAP = { maxWidth: 1100, margin: "0 auto", padding: "20px 18px 80px" };

const TOPBAR = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: COLORS.surface,
  borderBottom: `1px solid ${COLORS.border}`,
};
const TOPBAR_INNER = {
  ...WRAP,
  display: "grid",
  gridTemplateColumns: "160px 1fr 160px",
  alignItems: "center",
  gap: 12,
  padding: "12px 18px",
};
const BRAND = { fontWeight: 800, letterSpacing: ".3px" };
const TAGLINE = { textAlign: "center", color: COLORS.subtext, fontSize: 14 };

const TOPBTN = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 36,
  padding: "0 12px",
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.text,
  textDecoration: "none",
  fontWeight: 600,
  gap: 8,
};

const SECTION_TITLE = { margin: "18px 0 10px", fontSize: 14, color: COLORS.subtext, fontWeight: 800 };

const CARD = {
  background: COLORS.surface,
  borderRadius: 14,
  border: `1px solid ${COLORS.border}`,
  padding: 16,
  marginBottom: 12,
  boxShadow: "0 1px 0 rgba(22, 29, 37, 0.04)",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  alignItems: "center",
};

const CARD_TITLE = { margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: ".2px" };
const CARD_DESC = { margin: "6px 0 0", color: COLORS.subtext, fontSize: 14, lineHeight: 1.4 };

const BTN_ADD = {
  background: COLORS.black,
  color: COLORS.white,
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 800,
  letterSpacing: ".2px",
  cursor: "pointer",
};

/* ===============================
 * BLOCKS (English)
 * =============================== */
const APP_BLOCKS = [
  {
    handle: "tls-header",
    title: "Simple header (dark & pink)",
    desc: "Logo, horizontal menu, and cart. Clean and responsive.",
    template: "index",
  },
  {
    handle: "tls-banner-3",
    title: "Banner — 3 images",
    desc: "Auto slider with 3 visuals. Keeps original ratio (no crop).",
    template: "index",
  },
  {
    handle: "tls-circle-marquee",
    title: "Product marquee (circle)",
    desc: "Continuous scrolling list of products with hover zoom.",
    template: "index",
  },
  {
    handle: "tls-product-card",
    title: "Product — Showcase card",
    desc: "Large main image, thumbnails, price, and primary CTA.",
    template: "product",
  },
  {
    handle: "tls-social-timer",
    title: "Social + Countdown",
    desc: "Instagram / Facebook / TikTok / WhatsApp icons with a live timer.",
    template: "index",
  },
  {
    handle: "tls-testimonials",
    title: "Advanced testimonials",
    desc: "Responsive grid for customer quotes and ratings.",
    template: "index",
  },
  {
    handle: "tls-footer",
    title: "Footer (2 to 4 columns)",
    desc: "Built from Shopify menus + payment icons. Fully responsive.",
    template: "index",
  },
];

/* ===============================
 * PAGE
 * =============================== */
export default function AppIndex() {
  const { shopSub, apiKey } = useLoaderData();

  const headerBlocks = APP_BLOCKS.filter((b) => b.handle === "tls-header");
  const footerBlocks = APP_BLOCKS.filter((b) => b.handle === "tls-footer");
  const contentBlocks = APP_BLOCKS.filter((b) => b.handle !== "tls-header" && b.handle !== "tls-footer");

  const AddButton = ({ b }) => (
    <a
      href={linkAddBlock({ shopSub, template: b.template, apiKey, handle: b.handle })}
      target="_top"
      rel="noreferrer"
    >
      <button style={BTN_ADD}>Add to theme</button>
    </a>
  );

  const BlockItem = ({ b }) => (
    <article style={CARD} key={b.handle}>
      <div>
        <h3 style={CARD_TITLE}>{b.title}</h3>
        <p style={CARD_DESC}>{b.desc}</p>
      </div>
      <AddButton b={b} />
    </article>
  );

  return (
    <div style={PAGE}>
      {/* Top bar */}
      <header style={TOPBAR}>
        <div style={TOPBAR_INNER}>
          <a href={CONTACT.whatsapp} style={TOPBTN} target="_blank" rel="noreferrer">
            {/* simple emoji to avoid extra deps */}
            <span>🟢</span>
            <span>WhatsApp</span>
          </a>

          <div style={TAGLINE}>
            <strong style={BRAND}>Triple-Luxe Sections</strong> — Build premium sections in seconds.
          </div>

          <a href={CONTACT.video} style={{ ...TOPBTN, justifySelf: "end" }} target="_blank" rel="noreferrer">
            <span>▶️</span>
            <span>Video guide</span>
          </a>
        </div>
      </header>

      {/* Content */}
      <main style={WRAP}>
        {/* Header */}
        <div style={SECTION_TITLE}>Header</div>
        {headerBlocks.map((b) => (
          <BlockItem key={b.handle} b={b} />
        ))}

        {/* Content */}
        <div style={SECTION_TITLE}>Content</div>
        {contentBlocks.map((b) => (
          <BlockItem key={b.handle} b={b} />
        ))}

        {/* Footer */}
        <div style={SECTION_TITLE}>Footer</div>
        {footerBlocks.map((b) => (
          <BlockItem key={b.handle} b={b} />
        ))}
      </main>
    </div>
  );
}
