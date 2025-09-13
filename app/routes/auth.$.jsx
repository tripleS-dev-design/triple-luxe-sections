// app/routes/auth.$.jsx
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.pathname.endsWith("/callback")) {
    // fin d’OAuth
    return authenticate.callback(request);
  }

  // début d’OAuth (top-level redirect)
  return authenticate.begin(request);
};

export const action = loader; // Shopify peut POST → même traitement
export default function Auth() { return null; }
