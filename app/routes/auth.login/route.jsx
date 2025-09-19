import { json } from "@remix-run/node";
import { login } from "../../shopify.server";

/** Essaie d’obtenir le shop depuis l’URL (shop/host) ou depuis un POST form-data */
async function getShopFromRequest(request) {
  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");

  if (!shop) {
    const host = url.searchParams.get("host");
    if (host) {
      try {
        const decoded = Buffer.from(host, "base64").toString("utf-8"); // ex: admin.shopify.com/store/selyadev
        const parts = decoded.split("/");
        const store = parts[parts.length - 1];          // "selyadev"
        if (store) shop = `${store}.myshopify.com`;
      } catch {}
    }
  }

  // si c’est un POST depuis le petit formulaire
  if (!shop && request.method === "POST") {
    const form = await request.formData();
    const v = (form.get("shop") || "").toString().trim();
    if (v && !v.includes(".")) {
      shop = `${v}.myshopify.com`;
    } else if (v) {
      shop = v;
    }
  }

  return shop;
}

/** GET /auth/login */
export async function loader({ request }) {
  const shop = await getShopFromRequest(request);
  if (shop) {
    // Redirection top-level gérée par le SDK
    return login.redirectToShopifyOrContinue({ request, shop });
  }
  // Affiche simplement la page avec le petit formulaire
  return json({}, { status: 200 });
}

/** POST /auth/login (évite 405) */
export async function action({ request }) {
  const shop = await getShopFromRequest(request);
  if (!shop) return json({ error: "Missing shop" }, { status: 400 });
  return login.redirectToShopifyOrContinue({ request, shop });
}

export default function Login() {
  // Fallback minimal (s’affiche rarement car on détecte shop via host)
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
