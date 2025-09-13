// app/routes/auth.callback.jsx
export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  // Gère le callback OAuth et renvoie vers /app
  return authenticate.admin(request);
};
export default function AuthCallback(){ return null; }
