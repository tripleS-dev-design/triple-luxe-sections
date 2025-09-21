// app/routes/app.jsx
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

/**
 * Loader racine:
 * - Authentifie l'admin (crée/valide la session)
 * - Vérifie s'il existe un abonnement actif (Managed Pricing)
 * - Si PAS d'abonnement → redirige vers la page "pricing_plans" de l'admin Shopify
 * - Sinon → charge l'app normalement
 *
 * ⚠️ IMPORTANT: Ne force PAS un shop spécifique (plus de DEV_SHOP lock).
 *     Fonctionne pour n'importe quelle boutique installée.
 */
export const loader = async ({ request }) => {
  // Doit matcher le "handle" dans shopify.app.toml
  const appHandle = "triple-luxe-sections";

  const { authenticate } = await import("../shopify.server");

  // authenticate.admin s'occupe de la session et redirige vers /auth/login si nécessaire
  const { billing, redirect, session } = await authenticate.admin(request);

  // 1) Vérifier s'il existe un abonnement actif (n'importe quel plan géré par Managed Pricing)
  const { hasActivePayment } = await billing.check();

  // 2) Extraire le store handle depuis le domaine myshopify
  //    ex: "cool-shop" à partir de "cool-shop.myshopify.com"
  const shopDomain = session.shop;               // ex: "selyadev.myshopify.com"
  const storeHandle = shopDomain.replace(".myshopify.com", "");

  // 3) Si aucun abonnement actif → redirection vers l'écran de sélection de plan (admin)
  if (!hasActivePayment) {
    return redirect(
      `https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`,
      { target: "_top" } // requis: on sort de l'iframe embedded
    );
  }

  // 4) Sinon, on charge l'app normalement
  return json({
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ apiKey }} />
    </PolarisAppProvider>
  );
}
