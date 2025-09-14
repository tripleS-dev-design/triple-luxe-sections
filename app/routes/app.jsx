// app/routes/app.jsx
import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import fr from "@shopify/polaris/locales/fr.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];

// Handle de l’app tel que dans Partner
const APP_HANDLE = "triple-luxe-sections";

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  try {
    // ⚠️ IMPORTANT : ne pas catcher les redirections du SDK
    const { session, billing } = await authenticate.admin(request);

    // Bypass pour ton dev store
    const devBypass =
      process.env.NODE_ENV !== "production" ||
      process.env.SHOPIFY_DEV_SHOP === session.shop;

    if (!devBypass) {
      let hasActivePayment = true;

      // Managed Pricing: 'billing' peut exister mais sans plans; check() est OK si présent
      if (billing?.check) {
        const res = await billing.check();
        hasActivePayment = !!res?.hasActivePayment;
      } else {
        // Si pas de helper billing, on considère qu’il faut passer par la page Pricing
        hasActivePayment = false;
      }

      if (!hasActivePayment) {
        const store = session.shop.replace(".myshopify.com", "");
        return redirect(
          `https://admin.shopify.com/store/${store}/charges/${APP_HANDLE}/pricing_plans`
        );
      }
    }

    return json({
      apiKey: process.env.SHOPIFY_API_KEY || "",
      shop: session.shop,
    });
  } catch (err) {
    // Laisse passer les Response (redirects OAuth, etc.)
    if (err instanceof Response) throw err;

    console.error("APP_LOADER_ERR", err);
    // En cas d’erreur inattendue, renvoyer vers le login proprement
    return redirect("/auth/login");
  }
};

export default function AppLayout() {
  const { apiKey } = useLoaderData();
  return (
    <PolarisAppProvider i18n={fr}>
      <Outlet context={{ apiKey }} />
    </PolarisAppProvider>
  );
}
