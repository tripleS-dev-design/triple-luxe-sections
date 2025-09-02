// app/routes/app.billing.confirm.jsx
import { redirect } from "@remix-run/node";
import React from "react";
import { authenticate } from "../shopify.server";
import { hasActiveSubscription } from "../services/billing.server";

export const loader = async ({ request }) => {
  // On force juste un retour vers /app ; le guard du loader vérifiera l’état
  const { admin } = await authenticate.admin(request);
  try {
    await hasActiveSubscription(admin);
  } catch (_) {}
  return redirect("/app");
};

export default function Confirm() {
  return null;
}
