// app/routes/billing.activate.jsx
import { json } from "@remix-run/node";
import { shopify } from "../shopify.server";

export async function loader({ request }) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") || "tls-premium-monthly";
  const host = url.searchParams.get("host") || "";

  const { billing, session } = await shopify.authenticate.admin(request);

  // 1) If already paid for this plan, skip creating a new charge
  const check = await billing.check({
    plans: [plan],
    isTest: process.env.NODE_ENV !== "production",
  });
  if (check.hasActivePayment) {
    return new Response(null, {
      status: 302,
      headers: { Location: `/app?host=${encodeURIComponent(host)}` },
    });
  }

  // 2) Create the charge and send the merchant to Shopify's approval page
  const { confirmationUrl, userErrors } = await shopify.billing.request({
    session,
    plan, // <- must match your configured plan handle
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `${url.origin}/billing/confirm?host=${encodeURIComponent(host)}`,
  });

  if (!confirmationUrl || (userErrors && userErrors.length)) {
    return new Response("Failed to create subscription", { status: 500 });
  }

  // Top-level redirect so it works inside the Admin iframe
  return new Response(null, {
    status: 302,
    headers: {
      Location: confirmationUrl,
      "X-Shopify-API-Request-Redirect": confirmationUrl,
    },
  });
}
