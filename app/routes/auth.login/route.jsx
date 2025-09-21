// app/routes/auth.login/route.jsx
import { login } from "../../shopify.server";

/**
 * Route d’auth recommandée par Shopify Remix.
 * - Pas de fetcher, pas d’auto-submit, pas d’UI.
 * - Le SDK gère la redirection (install / OAuth) depuis le loader & l’action.
 */

export async function loader({ request }) {
  return login(request);
}

export async function action({ request }) {
  return login(request);
}

export default function AuthLogin() {
  return null;
}
