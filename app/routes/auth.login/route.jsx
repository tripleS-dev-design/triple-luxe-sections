import { json, redirect } from "@remix-run/node";

/** Récupère le shop depuis l’URL (shop/host) ou depuis un POST form-data */
async function getShopFromRequest(request) {
  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");

  // Essayer de décoder host= (admin.shopify.com/store/xxx)
  if (!shop) {
    const host = url.searchParams.get("host");
    if (host) {
      try {
        const decoded = Buffer.from(host, "base64").toString("utf-8");
        const parts = decoded.split("/");
        const store = parts[parts.length - 1]; // "selyadev"
        if (store) shop = `${store}.myshopify.com`;
      } catch {}
    }
  }

  // Si formulaire POST du petit écran "Log in"
  if (!shop && request.method === "POST") {
    const form = await request.formData();
    const raw = (form.get("shop") || "").toString().trim();
    if (raw) {
      shop = raw.includes(".") ? raw : `${raw}.myshopify.com`;
    }
  }

  return shop;
}

/** GET /auth/login */
export async function loader({ request }) {
  const shop = await getShopFromRequest(request);
  if (shop) {
    // On passe la main au flux OAuth géré par ta route /auth.$.jsx
    return redirect(`/auth?shop=${encodeURIComponent(shop)}`);
  }
  // Affiche le petit formulaire si on n'a pas pu déduire le shop
  return json({}, { status: 200 });
}

/** POST /auth/login – gère le formulaire (évite 405) */
export async function action({ request }) {
  const shop = await getShopFromRequest(request);
  if (!shop) return json({ error: "Missing shop" }, { status: 400 });
  return redirect(`/auth?shop=${encodeURIComponent(shop)}`);
}

export default function Login() {
  return (
    <div style={{ padding: 24 }}>
      <h3>Log in</h3>
      <form method="post">
        <input
          name="shop"
          placeholder="example.myshopify.com ou mon-boutique"
          style={{ padding: 8 }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>Log in</button>
      </form>
    </div>
  );
}
