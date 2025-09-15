// app/routes/auth.login/route.jsx
import React from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button, Card, FormLayout, Page, Text, TextField,
} from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

// Document HTML qui sort de l'iframe
function topLevelRedirect(url) {
  const html = `<!doctype html><meta charset="utf-8">
  <script>window.top.location.href=${JSON.stringify(url)}</script>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

export const loader = async ({ request }) => {
  const res = await login(request);
  const loc = res?.headers?.get?.("Location");
  if (loc) return topLevelRedirect(loc);             // 🔴 TOUJOURS top-level
  return json({ errors: loginErrorMessage(res) });
};

export const action = async ({ request }) => {
  const res = await login(request);
  const loc = res?.headers?.get?.("Location");
  if (loc) return topLevelRedirect(loc);             // 🔴 TOUJOURS top-level
  return json({ errors: loginErrorMessage(res) });
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const { errors } = actionData || loaderData || {};
  const [shop, setShop] = React.useState("");

  return (
    <PolarisAppProvider i18n={polarisTranslations}>
      <Page>
        <Card>
          {/* IMPORTANT: reloadDocument pour exécuter le script top-level */}
          <Form method="post" reloadDocument>
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
