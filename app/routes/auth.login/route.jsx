// app/routes/auth.login/route.jsx
import { login } from "../../shopify.server";

/**
 * Ne mets rien d’autre : Shopify fournit la redirection OAuth.
 * Le 405/500 que tu avais venait d’un handler custom inutile.
 */
export async function loader({ request }) {
  return login(request);
}
export async function action({ request }) {
  return login(request);
}

export default function Login() {
  return (
    <form method="post" style={{ padding: 24 }}>
      <input
        name="shop"
        placeholder="example.myshopify.com"
        style={{ width: 320, padding: 8 }}
      />
      <button type="submit" style={{ marginLeft: 8 }}>Log in</button>
    </form>
  );
}
