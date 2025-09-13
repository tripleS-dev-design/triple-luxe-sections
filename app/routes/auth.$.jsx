// app/routes/auth.$.jsx
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/callback")) {
    // fin de l’OAuth → crée la session puis redirect vers /app
    return authenticate.callback(request);
  }
  // début de l’OAuth (environnement embedded)
  return authenticate.begin(request);
};

export const action = loader;
export default function Auth() { return null; }
