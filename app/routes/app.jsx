// app/app/routes/app.jsx
import React from "react";
import { Outlet } from "@remix-run/react";
import "@shopify/polaris/build/esm/styles.css";

export default function App() {
  // Pas de nav ici → plus de "HomePricing"
  return <Outlet />;
}
