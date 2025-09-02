// app/routes/billing.confirm.jsx  →  /billing/confirm
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop") || "";
  const host = url.searchParams.get("host") || "";
  const appOrigin = process.env.SHOPIFY_APP_URL || url.origin;

  const backToApp = new URL("/app", appOrigin);
  if (shop) backToApp.searchParams.set("shop", shop);
  if (host) backToApp.searchParams.set("host", host);

  const exit = new URL("/auth/exit-iframe", appOrigin);
  if (shop) exit.searchParams.set("shop", shop);
  if (host) exit.searchParams.set("host", host);
  exit.searchParams.set("exitIframe", backToApp.toString());

  return redirect(exit.toString());
}
