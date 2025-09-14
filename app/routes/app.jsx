// app/routes/app.jsx
import React from "react";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

// Charge la CSS Polaris pour l'iframe de l’admin
export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  // Sécurise la page : si pas authentifié/ installé -> redirige vers /auth/login
  const { session } = await authenticate.admin(request);

  const shop = session.shop; // ex: "selya-store.myshopify.com"
  const shopSub = shop.replace(".myshopify.com", ""); // ex: "selya-store"

  return json({
    shopSub,
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function AppLayout() {
  // Optionnel : si tu veux utiliser les données ici aussi
  useLoaderData();

  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Outlet />
    </PolarisAppProvider>
  );
}
