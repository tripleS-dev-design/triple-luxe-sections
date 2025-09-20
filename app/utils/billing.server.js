// app/utils/billing.server.js
/**
 * Utilitaire pour vérifier/créer un abonnement App Recurring
 * using Admin GraphQL API.
 */
export async function hasActiveSubscription(admin) {
  const resp = await admin.graphql(`
    query AppActiveSubs {
      currentAppInstallation {
        activeSubscriptions {
          id
          status
          lineItems {
            plan {
              pricingDetails {
                __typename
                ... on AppRecurringPricing {
                  interval
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `);

  const data = await resp.json();
  const subs = data?.data?.currentAppInstallation?.activeSubscriptions || [];
  const active = subs.find((s) => s.status === "ACTIVE");
  return active || null;
}

/**
 * S'assure qu'il existe un abonnement actif ; sinon, renvoie une confirmationUrl
 * pour que le marchand accepte le plan (redirection nécessaire).
 */
export async function ensureSubscription({
  admin,
  returnUrl,
  test = false,
  price = "0.99",
  currency = "USD",
}) {
  const alreadyActive = await hasActiveSubscription(admin);
  if (alreadyActive) return null;

  // Si aucun abonnement actif → créer l'abonnement
  const mutation = `
    mutation CreateSub(
      $name: String!
      $returnUrl: URL!
      $test: Boolean
      $lineItems: [AppSubscriptionLineItemInput!]!
    ) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        test: $test
        lineItems: $lineItems
      ) {
        userErrors { field message }
        confirmationUrl
        appSubscription { id }
      }
    }
  `;

  const variables = {
    name: "Premium plan - Monthly $0.99",
    returnUrl,
    test,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: { amount: parseFloat(price), currencyCode: currency },
            interval: "EVERY_30_DAYS", // aucun essai
          },
        },
      },
    ],
  };

  const resp = await admin.graphql(mutation, { variables });
  const json = await resp.json();
  const errs = json?.data?.appSubscriptionCreate?.userErrors || [];
  if (errs.length) {
    throw new Error(
      `appSubscriptionCreate errors: ${errs.map((e) => e.message).join(", ")}`
    );
  }
  const confirmationUrl = json?.data?.appSubscriptionCreate?.confirmationUrl || null;
  return confirmationUrl; // si non null → redirect(confirmationUrl)
}
