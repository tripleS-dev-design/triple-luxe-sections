// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";

function passthroughFrom(request) {
  const url = new URL(request.url);
  const p = new URLSearchParams();
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  const embedded = url.searchParams.get("embedded");
  const locale = url.searchParams.get("locale");
  if (shop) p.set("shop", shop);
  if (host) p.set("host", host);
  if (embedded) p.set("embedded", embedded);
  if (locale) p.set("locale", locale);
  return { shop, passthrough: p };
}

export async function loader({ request }) {
  const { passthrough } = passthroughFrom(request);
  try {
    const { admin, session } = await authenticate.admin(request);
    return json({ shop: session.shop, scope: session.scope });
  } catch {
    const qs = passthrough.toString();
    return redirect(`/auth/login${qs ? `?${qs}` : ""}`);
  }
}

export default function AppRoute() { return null; }
