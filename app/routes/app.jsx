// app/routes/app.jsx
import { Outlet } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import "@shopify/polaris/build/esm/styles.css";

export default function AppLayout() {
  return (
    <AppProvider i18n={en}>
      <Outlet />
    </AppProvider>
  );
}
