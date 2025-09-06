import { redirect } from "@remix-run/node";

// Redirige vers /app proprement
export const loader = async () => redirect("/app");

export default function Index() {
  return null;
}
