// app/routes/auth.login/route.jsx
import { json, redirect } from "@remix-run/node";
import { Form, useNavigation, useSearchParams } from "@remix-run/react";
import { authenticate } from "../../shopify.server"; // ← remonte de 2 niveaux

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // Si Shopify fournit ?shop=..., on déclenche l'install OAuth directement
  if (shop) {
    return redirect(`/auth?shop=${shop}`);
  }
  return json({});
}

export async function action({ request }) {
  // Priorité au ?shop dans l'URL si présent (évite les confusions multi-stores)
  const url = new URL(request.url);
  const qsShop = url.searchParams.get("shop");
  if (qsShop) {
    return redirect(`/auth?shop=${qsShop}`);
  }

  // Sinon, on laisse le SDK gérer via le "shop" posté par le formulaire
  const { headers } = await authenticate.login(request);
  return json({ ok: true }, { headers });
}

export default function AuthLogin() {
  const [params] = useSearchParams();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  // Si ?shop existe déjà, le loader redirige → on n'affiche rien
  if (params.get("shop")) return null;

  // Fallback simple
  return (
    <div style={{ padding: 24 }}>
      <Form method="post">
        <label>
          Shop domain
          <input
            type="text"
            name="shop"
            placeholder="example.myshopify.com"
            required
          />
        </label>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={busy}>
            {busy ? "Redirecting…" : "Log in"}
          </button>
        </div>
      </Form>
    </div>
  );
}
