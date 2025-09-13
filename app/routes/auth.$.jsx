// CALLBACK + BEGIN – AUCUNE UI
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const pathname = new URL(request.url).pathname;
  // /auth/callback et /auth/shopify/callback → callback
  if (pathname.endsWith("/callback")) {
    return authenticate.callback(request);
  }
  // /auth ou /auth/shopify → begin
  return authenticate.begin(request);
};
export const action = loader;

export default function AuthCatchAll() {
  return null; // rien à rendre
}
