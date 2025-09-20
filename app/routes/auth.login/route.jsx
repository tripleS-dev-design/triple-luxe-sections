// app/routes/auth.login/route.jsx
import { json, redirect } from "@remix-run/node";
import { normalizeShop, isValidMyshopifyDomain, passthroughFrom } from "../../utils/params.server";

export async function loader({ request }) {
  const { shop, host, passthrough } = passthroughFrom(request);
  console.log("[auth.login/loader] shop:", shop, "host:", host);
  if (shop && isValidMyshopifyDomain(shop)) {
    return redirect(`/auth?${passthrough.toString()}`);
  }
  return json({}, { status: 200 });
}

export async function action({ request }) {
  const form = await request.formData();
  let shop = normalizeShop(form.get("shop"));
  if (!shop) {
    const { shop: qShop } = passthroughFrom(request);
    shop = normalizeShop(qShop);
  }
  if (!isValidMyshopifyDomain(shop)) {
    return json(
      { error: "Shop invalide. Format: myshopify.com (ex: selya-store.myshopify.com)" },
      { status: 400 }
    );
  }
  const url = new URL(request.url);
  const host = url.searchParams.get("host");
  const p = new URLSearchParams();
  p.set("shop", shop);
  if (host) p.set("host", host);
  console.log("[auth.login/action] redirect → /auth?", p.toString());
  return redirect(`/auth?${p.toString()}`);
}

export default function Login() {
  return (
    <form method="post" style={{ padding: 24, display: "flex", gap: 8 }}>
      <input
        name="shop"
        placeholder="ex: selya-store.myshopify.com"
        style={{ width: 340, padding: 8 }}
        autoComplete="off"
      />
      <button type="submit">Log in</button>
    </form>
  );
}
