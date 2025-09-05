// app/routes/app.jsx
import { Outlet } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

// 🔒 Pas d'import variable : on pointe la CSS via CDN (version à adapter à ton package.json)
export const links = () => [
  { rel: "stylesheet", href: "https://unpkg.com/@shopify/polaris@12.13.0/build/styles.css" },
];

export default function AppLayout() {
  return (
    <AppProvider i18n={en}>
      <Outlet />
    </AppProvider>
  );
}
