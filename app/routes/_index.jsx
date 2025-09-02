// app/routes/_index.jsx
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const to = new URL("/app", url.origin);
  url.searchParams.forEach((v, k) => to.searchParams.set(k, v));
  return redirect(to.toString());
};

export default function Index() {
  return null;
}
