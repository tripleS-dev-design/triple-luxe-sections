// app/utils/billing.server.js
export async function hasActiveSubscription(admin) {
  const r = await admin.graphql(`
    query {
      currentAppInstallation {
        activeSubscriptions {
          id status
          lineItems {
            plan {
              pricingDetails {
                __typename
                ... on AppRecurringPricing {
                  interval
                  price { amount currencyCode }
                }
              }
            }
          }
        }
      }
    }
  `);
  const j = await r.json();
  const subs = j?.data?.currentAppInstallation?.activeSubscriptions || [];
  return subs.find(s => s.status === "ACTIVE") || null;
}

/**
 * Crée l'abonnement si absent et renvoie la confirmationUrl.
 * Retourne null si le shop est déjà abonné.
 */
export async function ensureSubscription({ admin, returnUrl, test=false, price="0.99", currency="USD" }) {
  const active = await hasActiveSubscription(admin);
  if (active) return null;

  const r = await admin.graphql(`
    mutation CreateSub($name:String!,$returnUrl:URL!,$test:Boolean,$lineItems:[AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(name:$name, returnUrl:$returnUrl, test:$test, lineItems:$lineItems) {
        userErrors { field message }
        confirmationUrl
      }
    }`,
    {
      variables: {
        name: "Premium plan - Monthly $0.99",
        returnUrl,
        test,
        lineItems: [{
          plan: {
            appRecurringPricingDetails: {
              interval: "EVERY_30_DAYS",
              price: { amount: +price, currencyCode: currency }
            }
          }
        }],
      },
    }
  );

  const j = await r.json();
  const errs = j?.data?.appSubscriptionCreate?.userErrors || [];
  if (errs.length) throw new Error(errs.map(e => e.message).join(", "));
  return j?.data?.appSubscriptionCreate?.confirmationUrl || null;
}
