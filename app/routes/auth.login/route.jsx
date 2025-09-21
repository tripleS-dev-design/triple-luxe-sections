// app/routes/auth.login/route.jsx
import { login } from "../../shopify.server";

// GET: déclenche automatiquement l'OAuth (Shopify ajoute shop/host)
export async function loader({ request }) {
  return login(request);
}

// POST: pareil (pas de formulaire manuel)
export async function action({ request }) {
  return login(request);
}

export default function AuthLogin() {
  // Rien à rendre: Shopify redirige tout seul
  return null;
}
