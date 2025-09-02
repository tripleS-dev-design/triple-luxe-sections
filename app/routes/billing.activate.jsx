// app/routes/billing.activate.(ts|tsx|jsx)
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan")!;
  const host = url.searchParams.get("host")!;

  const { authenticate, PLAN_HANDLES } = await import("../shopify.server");
  const { admin, session } = await authenticate.admin(request);

  // Crée la souscription (ex: appSubscriptionCreate via SDK/billing helper)
  const returnUrl = `${process.env.APP_URL}/billing/confirm?host=${encodeURIComponent(host)}`;
  const mutation = `
    mutation appSubscriptionCreate($name: String!, $returnUrl: URL!, $amount: Decimal!, $currencyCode: CurrencyCode!) {
      appSubscriptionCreate(
        name: $name,
        returnUrl: $returnUrl,
        lineItems: [{ plan: { appRecurringPricingDetails: { price: { amount: $amount, currencyCode: $currencyCode }}}}]
      ) {
        confirmationUrl
        userErrors { field message }
      }
    }
  `;
  const vars = {
    name: plan,
    returnUrl,
    amount: plan === PLAN_HANDLES.annual ? 39.99 : 4.99,
    currencyCode: "USD",
  };

  const resp = await admin.graphql(mutation, { variables: vars });
  const data = await resp.json();
  const confirmationUrl = data?.data?.appSubscriptionCreate?.confirmationUrl;

  if (!confirmationUrl) {
    throw new Response("Billing error", { status: 500 });
  }

  // Redirection top-level (clé !)
  return redirect(confirmationUrl, {
    headers: { "X-Shopify-API-Request-Redirect": confirmationUrl },
  });
};

