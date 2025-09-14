// app/routes/auth.login/route.jsx
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  AppProvider as PolarisAppProvider,
  Button,
  Card,
  Form,
  FormLayout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import styles from "@shopify/polaris/build/esm/styles.css?url";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: styles }];

// --- helper: renvoie une page qui sort de l'iframe et redirige en top ---
function topLevelRedirect(url) {
  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"></head>
  <body>
    <script>
      window.top.location.href = ${JSON.stringify(url)};
    </script>
  </body>
</html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const embedded = url.searchParams.get("embedded") === "1";

  // Si on a déjà un shop (ex: /auth/login?shop=xxx&embedded=1), on déclenche l’auth
  if (shop) {
    const resp = await login(request); // renvoie normalement un redirect 302 vers admin.shopify.com
    const location = resp.headers.get("Location");
    if (location && embedded) {
      // IMPORTANT: casser l’iframe → rediriger en top-level
      return topLevelRedirect(location);
    }
    return resp; // sinon on laisse suivre la redirection normale
  }

  // Sinon, on affiche le formulaire de login « hors Shopify »
  const errors = loginErrorMessage(await login(request));
  return json({ errors });
};

export const action = async ({ request }) => {
  // Quand on poste le domaine, le SDK renvoie un redirect → on le transforme en top-level
  const resp = await login(request);
  const location = resp.headers.get("Location");
  if (location) return topLevelRedirect(location);
  return resp;
};

export default function LoginPage() {
  const { errors } = useLoaderData() || {};
  // Petit formulaire “fallback” si tu ouvres /auth/login directement
  return (
    <PolarisAppProvider i18n={en}>
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
