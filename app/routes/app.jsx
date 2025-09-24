// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

/** --- helpers --- */
function shopFromUrl(url) {
  const u = new URL(url);
  // 1) ?shop=something.myshopify.com
  const qsShop = u.searchParams.get("shop");
  if (qsShop) return qsShop.toLowerCase();

  // 2) ?host=base64(admin.shopify.com/store/<sub>/...) -> on extrait le sous-domaine
  const host = u.searchParams.get("host");
  if (host) {
    try {
      const decoded = Buffer.from(host, "base64").toString("utf8");
      // ex: "admin.shopify.com/store/samifinal"
      const m = decoded.match(/\/store\/([^/?#]+)/);
      if (m && m[1]) return `${m[1].toLowerCase()}.myshopify.com`;
    } catch {}
  }

  return "";
}

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const url = new URL(request.url);
  const shopDomain = shopFromUrl(request.url); // "" si introuvable

  // 1) Auth (crée/valide la session si elle existe)
  let session = null;
  try {
    ({ session } = await authenticate.admin(request));
  } catch {
    session = null;
  }

  // 2) Si pas de session → on doit lancer OAuth avec un shop explicite
  if (!session) {
    if (!shopDomain) {
      // Demander poliment le shop à Shopify en ajoutant le paramètre ?shop= si absent
      // (l’Admin affichera le même écran mais cette fois avec la valeur que tu mets)
      // Ici on ne connaît pas le shop → on montre la page login Shopify.
      // Si tu connais le shop (ex depuis un lien), mets-le dans l’URL app: /app?shop=<shop>
      return json({ shopSub: "", apiKey: process.env.SHOPIFY_API_KEY || "" });
    }
    // on lance l’install/connexion pour ce shop
    throw redirect(`/auth?shop=${encodeURIComponent(shopDomain)}`);
  }

  // 3) Session OK → on expose les infos du shop courant
  const currentShop = (session.shop || "").toLowerCase(); // ex: samifinal.myshopify.com
  const shopSub = currentShop.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  return json({ shopSub, apiKey });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ shopSub, apiKey }} />
    </PolarisAppProvider>
  );
}
