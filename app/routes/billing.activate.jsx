// app/routes/billing.activate.tsx (ou .jsx si tu n'utilises pas TS)
import { redirect } from "@remix-run/node";

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") || "";
  const host = url.searchParams.get("host") || "";

  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");
  const { billing, session } = await authenticate.admin(request);

  // 0) Valider le handle
  const knownHandles = new Set(Object.values(PLAN_HANDLES));
  if (!knownHandles.has(plan)) {
    console.error("[billing.activate] Handle inconnu:", { plan, knownHandles: [...knownHandles] });
    return new Response("Plan inconnu", { status: 400 });
  }

  // 1) Check si déjà actif
  const isTest = process.env.NODE_ENV !== "production";
  const check = await billing.check({ plans: [plan], isTest });

  console.info("[billing.check]", {
    shop: session.shop,
    plan,
    isTest,
    hasActivePayment: check.hasActivePayment,
    oneTimePurchases: check.oneTimePurchases?.length ?? 0,
    subscriptions: check.subscriptions?.length ?? 0,
  });

  if (check.hasActivePayment) {
    // Déjà payé → renvoyer dans l’app
    return redirect(`/app?host=${encodeURIComponent(host)}`);
  }

  // 2) Créer la requête de facturation
  const returnUrl = `${url.origin}/billing/confirm?host=${encodeURIComponent(host)}`;

  const { confirmationUrl, userErrors } = await billing.request({
    session,
    plan,               // ⚠️ le même handle que pour check()
    isTest,
    returnUrl,
  });

  console.info("[billing.request] result", { confirmationUrl, userErrors });

  if (!confirmationUrl || (userErrors && userErrors.length)) {
    console.error("[billing.request] FAILED", { userErrors });
    return new Response("Failed to create subscription", { status: 500 });
  }

  // 3) Redirection top-level vers la page de paiement Shopify
  return redirect(confirmationUrl, {
    headers: { "X-Shopify-API-Request-Redirect": confirmationUrl },
  });
};
