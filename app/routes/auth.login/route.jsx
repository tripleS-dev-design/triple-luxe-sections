import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { AppProvider as PolarisAppProvider, Button, Card, FormLayout, Page, Text, TextField } from "@shopify/polaris";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

function topLevelRedirect(url) {
  const html = `<!doctype html><html><head><meta charset="utf-8"></head>
  <body><script>window.top.location.href=${JSON.stringify(url)}</script></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html" } });
}

export const loader = async ({ request }) => {
  const res = await login(request);
  const location = res?.headers?.get?.("Location");
  const embedded = new URL(request.url).searchParams.get("embedded") === "1";
  if (location) {
    return embedded ? topLevelRedirect(location) : res;
  }
  return json({ errors: loginErrorMessage(res) });
};

export const action = async ({ request }) => {
  const res = await login(request);
  const location = res?.headers?.get?.("Location");
  if (location) {
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
          {/* ⬇️ reloadDocument est essentiel ici */}
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
