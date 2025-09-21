// app/routes/auth.login/route.jsx
import { redirect } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { login } from "../../shopify.server";

/**
 * - Si ?shop est présent → on passe par /auth?shop=... (OAuth côté admin)
 * - Sinon : on déclenche un VRAI POST (navigation classique) pour `login(request)`
 *   ⚠️ Surtout pas de fetcher: il renvoie 200 et ne navigue pas → boucle.
 */

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (shop) return redirect(`/auth?shop=${shop}`);
  return null; // pas d'UI, le composant auto-soumettra le <Form>
}

export async function action({ request }) {
  // Le SDK renvoie un 204 + headers Location pour l'admin OAuth.
  return login(request);
}

export default function AuthLogin() {
  const [params] = useSearchParams();
  const shop = params.get("shop");
  const formRef = useRef(null);

  // Si ?shop est présent, le loader a déjà redirigé → ne rien rendre
  if (shop) return null;

  // Auto-soumission en navigation classique (pas de fetcher)
  useEffect(() => {
    formRef.current?.submit();
  }, []);

  // Pas d'UI: juste un form pour déclencher l'action en POST
  return (
    <Form method="post" ref={formRef} replace>
      {/* Champ factice pour éviter certains bloqueurs d'autosoumission */}
      <input type="hidden" name="auto" value="1" />
      <noscript><button type="submit">Continue</button></noscript>
    </Form>
  );
}
