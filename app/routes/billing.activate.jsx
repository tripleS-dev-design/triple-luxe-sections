// app/routes/billing.activate.jsx
import { shopify } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  if (!plan) {
    return new Response("Missing plan", { status: 400 });
  }

  // Assure la session Admin
  const { session } = await shopify.authenticate.admin(request);

  // URL de retour après acceptation du plan (on garde shop/host & co)
  const returnUrl = `${url.origin}/billing/confirm?${url.searchParams.toString()}`;

  // Si déjà payé, on retourne dans l’app
  const check = await shopify.billing.check({
    session,
    plans: [plan],
    isTest: process.env.NODE_ENV !== "production",
    returnObject: true,
  });
  if (check?.hasActivePayment) {
    return new Response(
      `<script>window.top.location.href=${JSON.stringify(`/app?${url.searchParams.toString()}`)};</script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Demande l’URL de confirmation
  const req = await shopify.billing.request({
    session,
    plan,
    isTest: process.env.NODE_ENV !== "production",
    returnUrl,
  });

  // IMPORTANT: forcer la redirection top-level (évite la boucle dans l’iframe)
  return new Response(
    `<html><body><script>window.top.location.href=${JSON.stringify(req.confirmationUrl)};</script></body></html>`,
    { headers: { "Content-Type": "text/html" } }
  );
};
