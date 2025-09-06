// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { session } = await authenticate.admin(request); // fait l’OAuth si besoin

  const shopDomain = session.shop || "";
  const shopSub = shopDomain.replace(".myshopify.com", "");
  return json({ shopSub, apiKey: process.env.SHOPIFY_API_KEY || "" }, { headers: { "Cache-Control": "no-store" } });
};

// Important: pas d’UI ici, on laisse les enfants rendre.
export default function AppRoute() {
  return <Outlet />;
}

// Toujours revérifier (utile quand embedded/params changent)
export function shouldRevalidate() {
  return true;
}
