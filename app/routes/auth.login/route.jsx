// app/routes/auth.login/route.jsx
import { json } from "@remix-run/node";
import { login } from "../../shopify.server";

/**
 * GET /auth/login?shop=xxxx.myshopify.com&host=...
 * Posera le cookie top-level et redirigera automatiquement vers /auth?...
 */
export async function loader({ request }) {
  return await login(request);
}

/**
 * POST /auth/login
 * Le formulaire soumet un champ "shop" (avec ou sans .myshopify.com)
 * On délègue au loader (ci-dessus) via une redirection 302 implicite faite par login(request)
 */
export async function action({ request }) {
  return await login(request);
}

export default function Login() {
  return (
    <div style={{ padding: 24 }}>
      <h3>Log in</h3>
      <form method="post">
        <input
          name="shop"
          placeholder="example.myshopify.com ou mon-boutique"
          style={{ padding: 8, width: 320 }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>Log in</button>
      </form>
    </div>
  );
}
