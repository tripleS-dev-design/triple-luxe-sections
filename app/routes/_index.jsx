// app/routes/_index.jsx
import { redirect } from "@remix-run/node";
import { unauthenticated } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  // Si Shopify appelle ton app avec ?shop=...
  if (shop) {
    return redirect(`/app?shop=${shop}`);
  }

  // Sinon, on laisse Shopify gérer l'installation / login
  const installUrl = await unauthenticated.admin.install({ request });

  if (installUrl) {
    // Redirection vers la page d'installation / autorisation Shopify
    return redirect(installUrl);
  }

  // Fallback : formulaire login manuel
  return redirect("/auth/login");
};

export default function Index() {
  return null;
}
