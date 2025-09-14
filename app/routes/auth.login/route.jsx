// app/routes/auth.login/route.jsx
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
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

// --- sort de l'iframe et redirige en top-level (obligatoire pour accounts.shopify.com)
function topLevelRedirect(url) {
  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
  <body><script>window.top.location.href=${JSON.stringify(url)}</script></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

export const loader = async ({ request }) => {
  const res = await login(request); // peut renvoyer une redirection vers admin.shopify.com
  const location = res?.headers?.get?.("Location");
  const embedded = new URL(request.url).searchParams.get("embedded") === "1";

  if (location) {
    return embedded ? topLevelRedirect(location) : res;
  }

  // Sinon, pas de redirection => on affiche le formulaire avec les erreurs éventuelles
  return json({ errors: loginErrorMessage(res), polarisTranslations });
};

export const action = async ({ request }) => {
  const res = await login(request);
  const location = res?.headers?.get?.("Location");

  if (location) {
    // Sur POST, on force toujours la redirection en top-level
    return topLevelRedirect(location);
  }

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
