// app/routes/auth.$.jsx
export const loader = async ({ request }) => {
  const { authenticate, login } = await import("../shopify.server");
  const url = new URL(request.url);

  // Si on arrive sur /auth/login → Shopify fournit une page qui sort de l’iframe
  if (url.pathname.endsWith("/auth/login")) {
    return login(request);
  }

  // Pour tous les autres /auth/* (callback compris) → librairie gère toute seule
  return authenticate.admin(request);
};

export const action = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  return authenticate.admin(request);
};

export default function AuthWildcard() { return null; }
