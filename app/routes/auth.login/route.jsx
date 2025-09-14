// app/routes/auth.login/route.jsx
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// Décode le param host= (ex: "admin.shopify.com/store/xxxxx")
function shopFromHostParam(hostB64) {
  try {
    if (!hostB64) return null;
    const decoded = Buffer.from(hostB64, "base64").toString("utf8");
    const m = decoded.match(/store\/([^/?]+)/);
    return m ? `${m[1]}.myshopify.com` : null;
  } catch {
    return null;
  }
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // 1) ?shop=...
  let shop = url.searchParams.get("shop");

  // 2) ?host=... (embedded)
  if (!shop) shop = shopFromHostParam(url.searchParams.get("host"));

  // 3) header ajouté par Shopify dans certains cas
  if (!shop) shop = request.headers.get("x-shopify-shop-domain");

  // 4) fallback ENV (dev)
  const fallbackShop = process.env.SHOPIFY_DEV_SHOP || "";
  if (!shop && fallbackShop) {
    // 👉 Si tu préfères toujours forcer ton dev shop, dé-commente:
    // shop = fallbackShop;
  }

  // Si on a un shop → démarre l’OAuth directement
  if (shop) {
    const oauth = new URL("/auth", url.origin);
    oauth.searchParams.set("shop", shop);
    return redirect(oauth.toString());
  }

  // Sinon on affiche le formulaire de login
  const errors = loginErrorMessage(await login(request));
  return json({
    errors,
    polarisTranslations,
    defaultShop: fallbackShop, // pour préremplir le champ
  });
};

export const action = async ({ request }) => {
  // POST normal du formulaire → shopify.login lance l’OAuth
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
              <Text variant="headingMd" as="h2">
                Log in
              </Text>
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
