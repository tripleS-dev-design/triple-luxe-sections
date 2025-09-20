// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { passthroughFrom } from "../utils/params.server";

export async function loader({ request }) {
  const { passthrough } = passthroughFrom(request);
  try {
    const { session } = await authenticate.admin(request);
    console.log("[/app] session shop:", session.shop);
    return json({ shop: session.shop });
  } catch (e) {
    console.warn("[/app] no session → redirect login", e?.message);
    const qs = passthrough.toString();
    return redirect(`/auth/login${qs ? `?${qs}` : ""}`);
  }
}

export default function AppRoute() {
  return null; // ton UI existante (ou layout embedded Polaris)
}
