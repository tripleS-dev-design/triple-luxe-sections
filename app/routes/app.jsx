import { Outlet } from "@remix-run/react";
import { AppProvider } from "@shopify/polaris";

export default function AppLayout() {
  return (
    <AppProvider i18n={{}}>
      <Outlet />
    </AppProvider>
  );
}
