// app/routes/app.jsx
import { Outlet } from "@remix-run/react";


export default function AppLayout() {
  // Le AppProvider est déjà appliqué globalement dans root.jsx
  return <Outlet />;
}
