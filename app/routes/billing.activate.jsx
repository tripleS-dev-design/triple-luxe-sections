// app/routes/billing.activate.tsx
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { shopify } from "~/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");                // e.g. "monthly" | "annual"
  const host = url.searchParams.get("host") || "";
  if (!plan) return json({ error: "Missing plan" }, { status: 400 });

  // Online admin session (embedded app)
  const { admin, session } = await shopify.authenticate.admin(request);

  // Build your pricing details per plan handle
  const planDetails: Record<string, { amount: number; currencyCode: string; interval: "EVERY_30_DAYS" | "ANNUAL" }> = {
    monthly: { amount: 4.99, currencyCode: "USD", interval: "EVERY_30_DAYS" },
    annual:  { amount: 39.99, currencyCode: "USD", interval: "ANNUAL" },
  };
  const sel = planDetails[plan];
  if (!sel) return json({ error: "Unknown plan" }, { status: 400 });

  // IMPORTANT: include host in returnUrl so you can re-embed after approval
  const returnUrl = `${url.origin}/billing/confirm?host=${encodeURIComponent(host)}`;

  // You can use the helper…
  // const { confirmationUrl, userErrors } = await shopify.billing.request({
  //   session,
  //   plan, // must match your configured handle
  //   isTest: process.env.NODE_ENV !== "production",
  //   returnUrl,
  // });

  // …or raw GraphQL (shown here for clarity):
  const query = `
    mutation appSubscriptionCreate(
      $name: String!, $returnUrl: URL!, $test: Boolean, $price: MoneyInput!, $interval: AppPricingInterval!
    ) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        test: $test
        lineItems: [{
          plan: {
            appRecurringPricingDetails: {
              price: $price, interval: $interval
            }
          }
        }]
      ) {
        confirmationUrl
        userErrors { field message }
      }
    }
  `;

  const resp = await admin.graphql(query, {
    variables: {
      name: plan,
      returnUrl,
      test: process.env.NODE_ENV !== "production",
      price: { amount: sel.amount, currencyCode: sel.currencyCode },
      interval: sel.interval,
    },
  });
  const data = await resp.json();
  const confirmationUrl: string | undefined = data?.data?.appSubscriptionCreate?.confirmationUrl;
  const errs = data?.data?.appSubscriptionCreate?.userErrors ?? [];

  if (!confirmationUrl || errs.length) {
    return json({ error: "Failed to create subscription", errs }, { status: 500 });
  }

  // ✅ Option A (recommended): top-level redirect header (works inside Admin iframe)
  return new Response(null, {
    status: 302,
    headers: {
      Location: confirmationUrl,
      "X-Shopify-API-Request-Redirect": confirmationUrl,
    },
  });

  // ✅ Option B: 200 + script to break iframe (uncomment to use this instead)
  // const html = `<!doctype html><meta charset="utf-8">
  // <script>window.top.location.href=${JSON.stringify(confirmationUrl)};</script>`;
  // return new Response(html, { headers: { "Content-Type": "text/html" } });
}
