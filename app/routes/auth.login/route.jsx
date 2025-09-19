// app/routes/auth.login/route.jsx
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  const url = new URL(request.url);
  let shop = url.searchParams.get("shop");

  // Si on vient de l’Admin, on récupère le store via host (base64)
  if (!shop) {
    const host = url.searchParams.get("host");
    if (host) {
      try {
        const decoded = Buffer.from(host, "base64").toString("utf-8"); // ex: admin.shopify.com/store/selyadev
        const parts = decoded.split("/");
        const store = parts[parts.length - 1]; // "selyadev"
        if (store) shop = `${store}.myshopify.com`;
      } catch {}
    }
  }

  if (shop) {
    const { login } = await import("../../shopify.server");
    // Envoie directement vers l’écran d’autorisation Shopify
    return login.redirectToShopifyOrContinue({ request, shop });
  }

  // Si on n’a pas pu déduire la boutique, on montre le formulaire simple
  return null;
}

export default function Login() {
  // Fallback minuscule (quasi jamais affiché après le code ci-dessus)
  return (
    <div style={{ padding: 24 }}>
      <h3>Log in</h3>
      <form method="post" action="/auth/login">
        <input
          name="shop"
          placeholder="example.myshopify.com"
          style={{ padding: 8 }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>Log in</button>
      </form>
    </div>
  );
}
