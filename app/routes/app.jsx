// app/routes/app.jsx
import { Outlet } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

// ✅ charge la CSS sans links(), donc pas de variable polarisStyles
import "@shopify/polaris/build/styles.css";
// (si jamais ça casse chez toi, essaie l’autre chemin:)
// import "@shopify/polaris/build/esm/styles.css";

export default function AppLayout() {
  return (
    <AppProvider i18n={en}>
      <Outlet />
    </AppProvider>
  );
}
