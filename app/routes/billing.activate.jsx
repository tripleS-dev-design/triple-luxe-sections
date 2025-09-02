// app/routes/billing.activate.(ts|tsx|jsx)
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const { authenticate } = await import("~/shopify.server");
  const { billing } = await authenticate.admin(request);

  // Demande du plan (adapte selon ta config)
  const { confirmationUrl } = await billing.request({
    plan: "tls-premium-monthly",
  });

  // Redirige hors iframe vers la page de paiement Shopify
  return redirect(confirmationUrl, {
    headers: { "X-Shopify-API-Request-Redirect": confirmationUrl },
  });
};
