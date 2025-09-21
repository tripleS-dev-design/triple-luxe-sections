// app/routes/auth.login/route.jsx
import { json, redirect } from "@remix-run/node";
import { Form, useFetcher, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { login } from "../../shopify.server";

/**
 * Objectif:
 * - Si ?shop est présent → on passe par /auth?shop=... (OAuth immédiat côté admin)
 * - Sinon on AUTO-POST vers cette même route pour déclencher login(request) (204 + headers)
 *   => évite la page "Log in (shop domain)" et les 200 vides.
 */

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (shop) {
    return redirect(`/auth?shop=${shop}`);
  }
  // pas de shop fourni par l'admin → on va auto-poster côté client
  return json({});
}

export async function action({ request }) {
  // Démarre l'OAuth (Shopify renvoie 204 + headers Location)
  return login(request);
}

export default function AuthLogin() {
  const [params] = useSearchParams();
  const shop = params.get("shop");
  const fetcher = useFetcher();

  // Si ?shop existe, le loader a déjà redirigé → rien à rendre
  if (shop) return null;

  // Auto-POST dès le montage pour déclencher login(request)
  useEffect(() => {
    if (fetcher.state === "idle") {
      const formData = new FormData();
      // Shopify lit aussi host depuis les cookies/params, pas indispensable ici
      fetcher.submit(formData, { method: "post" });
    }
  }, [fetcher]);

  // Pas d'UI : on laisse l'auto-POST travailler
  return (
    <Form method="post" style={{ display: "none" }}>
      {/* fallback si JS désactivé */}
      <button type="submit">Continue</button>
    </Form>
  );
}
