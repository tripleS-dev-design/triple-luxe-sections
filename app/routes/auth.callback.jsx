import { redirect } from "@remix-run/node";
import { authenticate, registerWebhooks } from "../../shopify.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const { session, headers } = await authenticate.callback(request);
  await registerWebhooks({ session });
  const host = url.searchParams.get("host") || "";
  const shop = (session?.shop || "").toLowerCase();
  return redirect(`/app?shop=${shop}&host=${host}`, { headers });
};
