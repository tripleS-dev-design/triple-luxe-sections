import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  // Auth obligatoire + on récupère le shop pour le lien éditeur
  const { session } = await authenticate.admin(request);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop, // ex: selyadev.myshopify.com
  };
};

export default function App() {
  const { apiKey, shop } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        {/* Accueil de l’app */}
        <Link to="/app" rel="home">
          Home
        </Link>

        {/* Page PRICING (remplace l’ancienne “Additional page”) */}
        <Link to="/app/additional">Pricing</Link>

        {/* Raccourci éditeur de thème (ouvre hors iframe, onglet Apps) */}
       

        {/* (Optionnel) Page de réglages si tu utilises app.settings.jsx */}
        {/* <Link to="/app/settings">Settings</Link> */}
      </NavMenu>

      <Outlet />
    </AppProvider>
  );
}

// Shopify a besoin que Remix attrape certaines réponses pour inclure leurs headers
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
