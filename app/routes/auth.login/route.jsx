import { json, redirect } from "@remix-run/node";

/** Récupère shop + host depuis l’URL ou le formulaire */
async function getParams(request) {
  const url = new URL(request.url);
  let shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || ""; // on le garde tel quel

  // Si on n'a pas shop, tenter depuis le host décodé (admin.shopify.com/store/<store>)
  if (!shop && host) {
    try {
      const decoded = Buffer.from(host, "base64").toString("utf-8");
      const parts = decoded.split("/");
      const store = parts[parts.length - 1];
      if (store) shop = `${store}.myshopify.com`;
    } catch {}
  }

  // Si formulaire POST
  if (!shop && request.method === "POST") {
    const fd = await request.formData();
    const raw = (fd.get("shop") || "").toString().trim();
    if (raw) shop = raw.includes(".") ? raw : `${raw}.myshopify.com`;
  }

  // Conserver aussi les autres query params (ex: locale, id_token…)
  const passthrough = new URLSearchParams(url.search);
  // on va remplacer/ajouter proprement shop et host
  if (shop) passthrough.set("shop", shop);
  if (host) passthrough.set("host", host);

  return { shop, host, passthrough };
}

/** GET /auth/login */
export async function loader({ request }) {
  const { shop, passthrough } = await getParams(request);
  if (shop) {
    return redirect(`/auth?${passthrough.toString()}`);
  }
  return json({}, { status: 200 });
}

/** POST /auth/login (formulaire) */
export async function action({ request }) {
  const { shop, passthrough } = await getParams(request);
  if (!shop) return json({ error: "Missing shop" }, { status: 400 });
  return redirect(`/auth?${passthrough.toString()}`);
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
