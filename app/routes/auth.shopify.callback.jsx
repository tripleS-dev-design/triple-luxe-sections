// app/routes/auth.shopify.callback.jsx
export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  // Même traitement si Shopify renvoie sur /auth/shopify/callback
  return authenticate.admin(request);
};
export default function AuthShopifyCallback(){ return null; }
