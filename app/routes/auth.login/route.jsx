// app/routes/auth.login/route.jsx
import { json } from "@remix-run/node";
import { useEffect, useMemo, useState } from "react";
import { Form, useActionData, useLoaderData, useLocation } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button, Card, FormLayout, Page, Text, TextField,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// --- util: décode host= (base64 "admin.shopify.com/store/<handle>")
function shopFromHostParam(hostB64) {
  try {
    if (!hostB64) return null;
    const decoded = Buffer.from(hostB64, "base64").toString("utf-8");
    const m = decoded.match(/store\/([^/?]+)/);
    return m ? `${m[1]}.myshopify.com` : null;
  } catch { return null; }
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  let shop =
    url.searchParams.get("shop") ||
    shopFromHostParam(url.searchParams.get("host")) ||
    request.headers.get("x-shopify-shop-domain") ||
    null;

  if (!shop && process.env.SHOPIFY_DEV_SHOP) {
    shop = process.env.SHOPIFY_DEV_SHOP;
  }

  // 🔑 TOP-LEVEL REDIRECT côté serveur (avant d’afficher quoi que ce soit)
  if (shop) {
    const target = new URL("/auth", url.origin);
    target.searchParams.set("shop", shop);
    const html = `<!doctype html><meta charset="utf-8">
<script>
  (function () {
    var href = ${JSON.stringify(target.toString())};
    if (window.top === window.self) {
      window.location.href = href;
    } else {
      window.top.location.href = href;
    }
  })();
</script>`;
    return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
  }

  // sinon on affiche le formulaire
  const errors = loginErrorMessage(await login(request));
  return json({ errors, polarisTranslations, defaultShop: "" });
};

// ⚠️ Quand on POST le formulaire, Shopify renvoie un 302 -> /auth.
// Mais si on reste dans l’iframe, ce sera bloqué.
// On laisse quand même l’action pour compatibilité.
export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return json({ errors });
};

export default function AuthLogin() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const location = useLocation();
  const { errors } = actionData || loaderData;

  // Essaie d’auto-déduire le shop côté client puis casse l’iframe immédiatement
  const autoShop = useMemo(() => {
    try {
      const params = new URLSearchParams(location.search);
      return (
        params.get("shop") ||
        shopFromHostParam(params.get("host")) ||
        ""
      );
    } catch { return ""; }
  }, [location.search]);

  useEffect(() => {
    if (autoShop) {
      const href = `/auth?shop=${encodeURIComponent(autoShop)}`;
      if (window.top === window.self) {
        window.location.href = href;
      } else {
        window.top.location.href = href;
      }
    }
  }, [autoShop]);

  const [shop, setShop] = useState(loaderData.defaultShop || "");

  // Fallback visible seulement si on n’a pas pu déduire le shop
  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <Page>
        <Card>
          <Form
            method="post"
            // Interception du submit pour casser l’iframe aussi en manuel
            onSubmit={(e) => {
              e.preventDefault();
              const s = shop?.trim();
              if (s) {
                const href = `/auth?shop=${encodeURIComponent(s)}`;
                if (window.top === window.self) {
                  window.location.href = href;
                } else {
                  window.top.location.href = href;
                }
              }
            }}
          >
            <FormLayout>
              <Text variant="headingMd" as="h2">Log in</Text>
              <TextField
                type="text"
                name="shop"
                label="Shop domain"
                helpText="example.myshopify.com"
                value={shop}
                onChange={setShop}
                autoComplete="on"
                error={errors?.shop}
              />
              <Button submit>Log in</Button>
            </FormLayout>
          </Form>
        </Card>
      </Page>
    </PolarisAppProvider>
  );
}
