// app/routes/_index.jsx
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");

  // S'assure que l'admin est authentifié (laisse passer les 302 login/exit-iframe)
  try {
    await authenticate.admin(request);
  } catch (err) {
    if (err instanceof Response) return err;
    throw err;
  }

  // Conserve les query params (shop, host, etc.)
  const url = new URL(request.url);
  const qs = url.searchParams.toString();

  return redirect(`/app${qs ? `?${qs}` : ""}`);
};

export default function Index() {
  return null;
}
