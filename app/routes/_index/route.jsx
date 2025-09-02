import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect// app/app/routes/_index/route.jsx
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  // 1) Cas spécial: retour billing → sortir de l'iframe et ouvrir la page Shopify au top
  const exitIframe = url.searchParams.get("exitIframe");
  if (exitIframe) {
    const target = exitIframe;
    const html = `<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8"><title>Redirecting…</title></head>
  <body>
    <script>
      (function () {
        var tgt = ${JSON.stringify(target)};
        try {
          if (window.top && window.top !== window.self) {
            window.top.location.href = tgt;
          } else {
            window.location.href = tgt;
          }
        } catch (e) {
          window.location.href = tgt;
        }
      })();
    </script>
    <p>Redirecting… If nothing happens, <a href="${target}" target="_top" rel="noopener">click here</a>.</p>
  </body>
</html>`;
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  // 2) Si on vient avec ?shop=... on envoie vers l'app embarquée
  if (url.searchParams.get("shop")) {
    return redirect(`/app${url.search}`);
  }

  // 3) Sinon on affiche ta landing avec le formulaire
  return json({ showForm: Boolean(login) });
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>A short heading about [your app]</h1>
        <p className={styles.text}>
          A tagline about [your app] that describes your value proposition.
        </p>

        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}

        <ul className={styles.list}>
          <li><strong>Product feature</strong>. Some detail…</li>
          <li><strong>Product feature</strong>. Some detail…</li>
          <li><strong>Product feature</strong>. Some detail…</li>
        </ul>
      </div>
    </div>
  );
}
(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>A short heading about [your app]</h1>
        <p className={styles.text}>
          A tagline about [your app] that describes your value proposition.
        </p>
        {showForm && (
          <Form className={styles.form} method="post" action="/auth/login">
            <label className={styles.label}>
              <span>Shop domain</span>
              <input className={styles.input} type="text" name="shop" />
              <span>e.g: my-shop-domain.myshopify.com</span>
            </label>
            <button className={styles.button} type="submit">
              Log in
            </button>
          </Form>
        )}
        <ul className={styles.list}>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
        </ul>
      </div>
    </div>
  );
}
