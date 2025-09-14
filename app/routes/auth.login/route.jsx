// app/routes/auth.login/route.jsx
import { json } from "@remix-run/node";
import { useState } from "react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button, Card, FormLayout, Page, Text, TextField,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// Décode host= (base64: "admin.shopify.com/store/<handle>")
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

  // Fallback dev (optionnel)
  if (!shop && process.env.SHOPIFY_DEV_SHOP) {
    shop = process.env.SHOPIFY_DEV_SHOP;
  }

  // 👉 Top-level redirect pour casser l’iframe AVANT OAuth
  if (shop) {
    const target = new URL("/auth", url.origin);
    target.searchParams.set("shop", shop);
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<script>
  var href = ${JSON.stringify(target.toString())};
  if (window.top === window.self) {
    window.location.href = href;
  } else {
    window.top.location.href = href; // sort de l’iframe
  }
</script>
<body>Redirecting…</body></html>`;
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // Pas de shop → on montre le formulaire
  const errors = loginErrorMessage(await login(request));
  return json({ errors, polarisTranslations, defaultShop: "" });
};

export const action = async ({ request }) => {
  // Soumission manuelle du formulaire → shopify.login gère l’OAuth
  const errors = loginErrorMessage(await login(request));
  return json({ errors });
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const { errors } = actionData || loaderData;
  const [shop, setShop] = useState(loaderData.defaultShop || "");

  return (
    <PolarisAppProvider i18n={loaderData.polarisTranslations}>
      <Page>
        <Card>
          <Form method="post">
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
