// app/routes/auth.login/route.jsx
import { json, redirect } from "@remix-run/node";
import { login } from "../../shopify.server"; // <- ajuste à ../shopify.server si besoin

/** GET /auth/login */
export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  // On a bien shop → on laisse le SDK faire le top-level login + redirection vers /auth
  if (shop) {
    return await login(request);
  }
  // Pas de "shop" => afficher le petit formulaire
  return json({}, { status: 200 });
}

/** POST /auth/login (soumission du formulaire) */
export async function action({ request }) {
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";

  const fd = await request.formData();
  let shop = (fd.get("shop") || "").toString().trim();
  if (!shop) return json({ error: "Missing shop" }, { status: 400 });
  if (!shop.includes(".")) shop = `${shop}.myshopify.com`;

  const qs = new URLSearchParams();
  qs.set("shop", shop);
  if (host) qs.set("host", host); // <- on préserve le host pour l’embed

  // Reviens sur le LOADER de /auth/login, qui appellera login(request)
  return redirect(`/auth/login?${qs.toString()}`);
}

export default function Login() {
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
