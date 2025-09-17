// app/routes.ts
import type { RouteConfig } from "@remix-run/dev";
import { defineRoutes } from "@remix-run/dev";

export default defineRoutes((route): RouteConfig => {
  route("/", "routes/_index.jsx");         // page d’accueil
  route("/app", "routes/app.jsx");         // ton layout parent (Outlet)
  route("/app/index", "routes/app._index.jsx"); // ta page TLS (si nécessaire)
  route("/auth/login", "routes/auth.login.ts"); // si tu l'as
  route("/auth/callback", "routes/auth.callback.ts"); // si tu l'as
  route("/api/*", "routes/api.$.ts");      // si tu as des endpoints dynamiques
});
