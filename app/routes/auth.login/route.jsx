// app/routes/auth.login/route.jsx
import { json, redirect } from "@remix-run/node";
import { Form, useNavigation, useSearchParams } from "@remix-run/react";
import { login } from "../../shopify.server"; // ← use login, not authenticate.login

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  if (shop) {
    // jump straight into OAuth
    return redirect(`/auth?shop=${shop}`);
  }
  return json({});
}

export async function action({ request }) {
  // Kick off OAuth; Remix returns 204 with headers that redirect inside admin
  const { headers } = await login(request); // ← FIX
  return json({ ok: true }, { headers });
}

export default function AuthLogin() {
  const [params] = useSearchParams();
  const nav = useNavigation();
  const busy = nav.state !== "idle";

  if (params.get("shop")) return null; // loader will redirect

  return (
    <div style={{ padding: 24, maxWidth: 520 }}>
      <h1>Log in</h1>
      <p>Enter your shop domain to continue:</p>
      <Form method="post">
        <input
          type="text"
          name="shop"
          placeholder="example.myshopify.com"
          required
          style={{ width: "100%", padding: 8 }}
        />
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={busy}>
            {busy ? "Redirecting…" : "Log in"}
          </button>
        </div>
      </Form>
    </div>
  );
}
