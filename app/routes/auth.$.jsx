// app/routes/auth.$.jsx
import { redirect } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../shopify.server";

/**
 * Gère les 2 phases:
 *  - GET /auth?shop=...           -> begin OAuth
 *  - GET /auth/callback?code=...  -> finish OAuth
 */
export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const pathname = url.pathname.toLowerCase();

  // --- Callback phase ---
  if (pathname.endsWith("/auth/callback")) {
    const { session, headers } = await authenticate.callback(request);
    // (optionnel) بعد نجاح الأوث، سجل/حدّث الويبهوكس
    await registerWebhooks({ session });

    const host = url.searchParams.get("host") || "";
    const shop = (session?.shop || "").toLowerCase();
    return redirect(`/app?shop=${shop}&host=${host}`, { headers });
  }

  // --- Begin phase (/auth?shop=...) ---
  return authenticate.begin(request);
};
