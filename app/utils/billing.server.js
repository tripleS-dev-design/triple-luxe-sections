// Simple guard pour un abonnement mensuel à 0.99$
// Utilise l'Admin GraphQL du SDK Remix: "admin.graphql"

export async function hasActiveSubscription(admin) {
  const q = `#graphql
    query AppInstallation {
      appInstallation {
        activeSubscriptions { id status name }
      }
    }
  `;
  const res = await admin.graphql(q);
  const json = await res.json();
  const subs = json?.data?.appInstallation?.activeSubscriptions || [];
  return subs.some(s => s.status === "ACTIVE");
}

export async function ensureSubscription({ admin, returnUrl, test = false, price = "0.99", currency = "USD" }) {
  // déjà abonné ?
  if (await hasActiveSubscription(admin)) return null;

  const m = `#graphql
    mutation CreateSub($name: String!, $returnUrl: URL!, $test: Boolean, $price: Decimal!, $currency: CurrencyCode!) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        test: $test
        lineItems: [
          { plan: { appRecurringPricingDetails: {
              price: { amount: $price, currencyCode: $currency },
              interval: EVERY_30_DAYS
          } } }
        ]
      ) {
        userErrors { field message }
        confirmationUrl
      }
    }
  `;
  const variables = {
    name: "Triple-Luxe-Sections — Basic",
    returnUrl,
    test,
    price,
    currency,
  };

  const res = await admin.graphql(m, { variables });
  const json = await res.json();
  const err = json?.data?.appSubscriptionCreate?.userErrors?.[0];
  if (err) throw new Error(`Billing error: ${err.message}`);

  return json?.data?.appSubscriptionCreate?.confirmationUrl || null;
}
