// app/routes/auth.$.jsx
import { login } from "../shopify.server";

// Laisse le SDK gérer /auth/login, /auth/callback, /auth/shopify/callback
export const loader = async ({ request }) => {
  return login(request);
};

export default function AuthRoute() {
  return null;
}
