// app/routes/_index.jsx
import { redirect } from "@remix-run/node";
export async function loader() { return redirect("/app"); }
export default function Index() { return null; }
