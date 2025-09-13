// app/routes/auth.$.jsx
export const loader = async ({ request }) => {
  const { login, authenticate } = await import("../shopify.server");
  const url = new URL(request.url);

  // Si on arrive sur /auth/login, FORCER un top-level redirect même si on est dans l'iframe
  if (url.pathname.endsWith("/auth/login")) {
    const shop = url.searchParams.get("shop") || "";
    if (shop) {
      const store = shop.replace(".myshopify.com", "");
      const installUrl = `https://admin.shopify.com/store/${store}/oauth/install?client_id=${process.env.SHOPIFY_API_KEY}`;
      return new Response(
        `<!doctype html><html><body><script>window.top.location.href=${JSON.stringify(
          installUrl
        )};</script></body></html>`,
        { headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }
    // Pas de ?shop -> fallback helper
    return login(request);
  }

  // Tous les /auth/* restants (callbacks inclus) : laisser la lib gérer
  return authenticate.admin(request);
};

export const action = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  return authenticate.admin(request);
};

export default function Auth() { return null; }
