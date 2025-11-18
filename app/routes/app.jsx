// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

/**
 * Loader principal de l'app :
 * - Récupère le shop réel depuis la session Shopify
 * - S'assure que l'URL contient bien ?shop=<ce shop>
 * - Expose shopSub + apiKey aux routes enfants
 */
export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  // Auth admin → récupère la session du shop en cours (celui du client)
  const { session } = await authenticate.admin(request).catch(() => ({
    session: null,
  }));

  const url = new URL(request.url);
  const shopFromQuery = (url.searchParams.get("shop") || "").toLowerCase();
  const shopFromSession = (session?.shop || "").toLowerCase();

  // Si on n'a ni session ni query, on renvoie vers la page de login
  if (!shopFromSession && !shopFromQuery) {
    throw redirect("/auth/login");
  }

  // Shop canonique = priorité à la session, sinon query
  const shopDomain = (shopFromSession || shopFromQuery).toLowerCase();
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  // Si la query ?shop ne correspond pas au shop réel → on la corrige
  if (shopFromQuery !== shopDomain) {
    url.searchParams.set("shop", shopDomain);
    throw redirect(url.toString());
  }

  return json({ shopSub, apiKey });
};

export default function AppLayout() {
  const { shopSub, apiKey } = useLoaderData();

  return (
    <PolarisAppProvider i18n={fr}>
      {/* On passe shopSub/apiKey via Outlet context si tu veux les lire autrement */}
      <Outlet context={{ shopSub, apiKey }} />
    </PolarisAppProvider>
  );
}
