// app/routes/auth.login.jsx
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  // Page invisible : auto-submit vers Shopify pour sortir de l’iframe
  return authenticate.login(request);
};

export const action = loader; // Shopify peut POST sur cette route
export default function Login() { return null; }
