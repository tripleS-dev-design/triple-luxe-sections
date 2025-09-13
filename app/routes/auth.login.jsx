// DÉCLENCHEUR DE LOGIN OAUTH – AUCUNE UI
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => authenticate.login(request);
export const action = loader;

export default function AuthLogin() {
  return null; // rien à rendre
}
