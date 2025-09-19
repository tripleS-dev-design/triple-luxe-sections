// app/routes/auth.login.jsx
import { redirect } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";

/**
 * Si Shopify ouvre l’app avec ?host=<base64...>,
 * on décode le store handle et on redirige vers /auth/login?shop=<handle>.myshopify.com
 * → plus besoin de taper le domaine à la main.
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // si le shop est déjà fourni, on affiche la page (ou le flux d’install continue)
  const shop = url.searchParams.get("shop");
  if (shop) return null;

  // auto-détection depuis host
  const host = url.searchParams.get("host");
  if (host) {
    try {
      const decoded = Buffer.from(host, "base64").toString("utf8"); // "admin.shopify.com/store/<handle>"
      const handle = decoded.split("/").pop();
      if (handle && !handle.includes("admin.shopify.com")) {
        return redirect(`/auth/login?shop=${handle}.myshopify.com`);
      }
    } catch {
      // on ignore, on laissera le formulaire s'afficher
    }
  }

  // pas de shop ni de host → on laisse afficher le petit formulaire ci-dessous
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
