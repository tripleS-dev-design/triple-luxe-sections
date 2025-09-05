// app/routes/app.jsx
import { Outlet } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";

// ✅ charge la CSS Polaris sans variable ni links()
import "@shopify/polaris/build/styles.css";
// (si ça ne marche pas chez toi, essaie :
// import "@shopify/polaris/build/esm/styles.css";
// )

export default function AppLayout() {
  return (
    <AppProvider i18n={en}>
      <Outlet />
    </AppProvider>
  );
}
