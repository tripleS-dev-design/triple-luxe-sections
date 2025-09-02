// app/routes/_index.jsx
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  await authenticate.admin(request);

  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return redirect(`/app${qs ? `?${qs}` : ""}`);
};

export default function Index() {
  return null;
}
