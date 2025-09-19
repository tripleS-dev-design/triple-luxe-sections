// app/routes/auth.login/route.jsx
import { redirect } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // si ?shop=... est déjà présent, on laisse la page s'afficher (ou l'install continue)
  const shop = url.searchParams.get("shop");
  if (shop) return null;

  // auto-détection depuis ?host=... fourni par l’Admin Shopify
  const host = url.searchParams.get("host");
  if (host) {
    try {
      const decoded = Buffer.from(host, "base64").toString("utf8"); // ex: admin.shopify.com/store/<handle>
      const handle = decoded.split("/").pop();
      if (handle && !handle.includes("admin.shopify.com")) {
        return redirect(`/auth/login?shop=${handle}.myshopify.com`);
      }
    } catch {
      // on ignore et on affiche le formulaire
    }
  }

  return null;
};

export default function Login() {
  const [params] = useSearchParams();
  const preset = params.get("shop") ?? "";

  return (
    <div style={{ maxWidth: 520, margin: "48px auto", fontFamily: "system-ui" }}>
      <h2 style={{ marginBottom: 16 }}>Log in</h2>
      <Form method="GET" action="/auth/login">
        <label htmlFor="shop" style={{ display: "block", marginBottom: 8 }}>
          Shop domain
        </label>
        <input
          id="shop"
          name="shop"
          placeholder="example.myshopify.com"
          defaultValue={preset}
          style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button type="submit" style={{ marginTop: 12, padding: "10px 16px", borderRadius: 8 }}>
          Log in
        </button>
      </Form>
    </div>
  );
}
