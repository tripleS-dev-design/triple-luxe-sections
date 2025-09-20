// app/routes/auth.login/route.jsx
import { json, redirect } from "@remix-run/node";

function passthroughFrom(request) {
  const url = new URL(request.url);
  const p = new URLSearchParams();
  const shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  const embedded = url.searchParams.get("embedded");
  const locale = url.searchParams.get("locale");
  if (shop) p.set("shop", shop);
  if (host) p.set("host", host);
  if (embedded) p.set("embedded", embedded);
  if (locale) p.set("locale", locale);
  return { shop, passthrough: p };
}

export async function loader({ request }) {
  const { shop, passthrough } = passthroughFrom(request);
  if (shop) return redirect(`/auth?${passthrough.toString()}`);
  return json({}, { status: 200 });
}

export async function action({ request }) {
  const form = await request.formData();
  let shop = form.get("shop");
  if (!shop) {
    const { shop: qShop } = passthroughFrom(request);
    shop = qShop;
  }
  if (!shop) return json({ error: "Missing shop" }, { status: 400 });

  const url = new URL(request.url);
  const host = url.searchParams.get("host");
  const p = new URLSearchParams();
  p.set("shop", shop);
  if (host) p.set("host", host);

  return redirect(`/auth?${p.toString()}`);
}

export default function Login() {
  return (
    <form method="post" style={{ padding: 24 }}>
      <input name="shop" placeholder="example.myshopify.com" style={{ width: 320, padding: 8 }} />
      <button type="submit" style={{ marginLeft: 8 }}>Log in</button>
    </form>
  );
}
