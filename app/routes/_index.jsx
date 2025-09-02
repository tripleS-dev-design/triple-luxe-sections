// app/routes/_index.jsx
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  return json({
    exitIframe: url.searchParams.get("exitIframe"),
    search: url.search, // garde tous les QS
  });
};

export default function Index() {
  const { exitIframe, search } = useLoaderData();
  const navigate = useNavigate();

  useEffect(() => {
    if (exitIframe) {
      // Ouvre la page de paiement Shopify au top window
      try {
        const target = String(exitIframe);
        if (window.top && window.top !== window.self) {
          window.top.location.href = target;
        } else {
          window.location.href = target;
        }
      } catch {
        window.location.href = exitIframe;
      }
      return;
    }

    // Pas de exitIframe -> on va vers /app en conservant le QS
    navigate(`/app${search || ""}`, { replace: true });
  }, [exitIframe, search, navigate]);

  return null;
}
