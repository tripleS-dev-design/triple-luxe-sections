// app/routes/billing.activate.jsx
import { shopify } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan");
  if (!plan) return new Response("Missing plan", { status: 400 });

  const { session } = await shopify.authenticate.admin(request);

  const req = await shopify.billing.request({
    session,
    plan,
    isTest: process.env.NODE_ENV !== "production",
    returnUrl: `${url.origin}/billing/confirm?${url.searchParams.toString()}`,
  });

  return new Response(
    `<script>window.top.location.href=${JSON.stringify(req.confirmationUrl)};</script>`,
    { headers: { "Content-Type": "text/html" } }
  );
};
