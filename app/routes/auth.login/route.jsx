// app/routes/auth.login.jsx
import { json, redirect } from "@remix-run/node";
import { Form, useNavigation, useSearchParams } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  // Essaie de récupérer le shop depuis l'URL (admin passe host/shop)
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // Si on a déjà le shop → on lance l’install OAuth automatiquement
  if (shop) {
    // redirige vers /auth?shop=...
    return redirect(`/auth?shop=${shop}`);
  }

  // Sinon, on laisse afficher un mini-form pour saisir le shop manquant
  return json({});
}

export async function action({ request }) {
  // Le SDK gère la redirection vers admin.shopify.com/.../oauth/install
  const { session, shop, headers } = await authenticate.login(request);
  // login() renvoie un 204 avec en-têtes de redirection côté admin; on n’affiche rien ici.
  return json({ ok: true }, { headers });
}

export default function AuthLogin() {
  const [params] = useSearchParams();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  // Si admin nous a déjà donné shop en query, on ne montre rien (le loader va redirect)
  const hasShop = !!params.get("shop");
  if (hasShop) return null;

  // Fallback: petit formulaire pour saisir le domaine si on est hors contexte admin
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
