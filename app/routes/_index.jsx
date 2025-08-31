// app/routes/_index.jsx
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";

export const loader = async ({ request }) => {
  const { authenticate } = await import("../shopify.server");
  const { session } = await authenticate.admin(request);
  return json({
    shop: session.shop,
    apiKey: process.env.SHOPIFY_API_KEY || "",
  });
};

export default function Index() {
  const { shop, apiKey } = useLoaderData();

  return (
    <main style={{ maxWidth: 960, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Triple-Luxe-Sections</h1>
      <p style={{ opacity: 0.85, marginBottom: 20 }}>
        Bienvenue 👋 Sélectionnez une action ci-dessous.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/settings">
          <button style={{ padding: "12px 20px", borderRadius: 8, fontWeight: 700 }}>
            Open Settings
          </button>
        </Link>
        <a
          href={`https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${apiKey}`}
          target="_top"
          rel="noreferrer"
        >
          <button style={{ padding: "12px 20px", borderRadius: 8, fontWeight: 700 }}>
            Open Theme Editor (Apps)
          </button>
        </a>
      </div>
    </main>
  );
}
