// app/services/billing.server.js

// admin = { graphql: (query, { variables }) => Promise<Response> }

export async function hasActiveSubscription(admin) {
  const QUERY = `
    query {
      appInstallation {
        activeSubscriptions { status }
      }
    }
  `;
  const res = await admin.graphql(QUERY);
  const json = await res.json();
  const list = json?.data?.appInstallation?.activeSubscriptions ?? [];
  return list.some((s) => s?.status === "ACTIVE");
}

export async function createSubscription(admin, opts) {
  const {
    name,
    price,
    returnUrl,
    interval = "EVERY_30_DAYS", // "EVERY_30_DAYS" ou "ANNUAL"
    currencyCode = "USD",
    test = process.env.NODE_ENV !== "production",
  } = opts || {};

  const MUT = `
    mutation appSubscriptionCreate(
      $name: String!
      $lineItems: [AppSubscriptionLineItemInput!]!
      $returnUrl: URL!
      $test: Boolean
    ) {
      appSubscriptionCreate(
        name: $name
        lineItems: $lineItems
        returnUrl: $returnUrl
        test: $test
      ) {
        confirmationUrl
        userErrors { field message }
      }
    }
  `;

  const variables = {
    name,
    returnUrl,
    test: Boolean(test),
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: {
              amount: price,
              currencyCode,
            },
            interval, // "EVERY_30_DAYS" | "ANNUAL"
          },
        },
      },
    ],
  };

  const res = await admin.graphql(MUT, { variables });
  const json = await res.json();

  const errs = json?.data?.appSubscriptionCreate?.userErrors || [];
  if (errs.length) {
    throw new Error(errs.map((e) => e.message).join(", "));
  }

  const url = json?.data?.appSubscriptionCreate?.confirmationUrl;
  if (!url) throw new Error("Aucune confirmationUrl retournée par Shopify.");
  return url;
}
