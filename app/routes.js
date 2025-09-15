// app/routes.js
import { flatRoutes } from "@remix-run/fs-routes";

/**
 * Remix va appeler cette fonction au build pour générer la table des routes.
 * On lui dit simplement d'utiliser le dossier "app/routes".
 */
export default function routes(defineRoutes) {
  // équivaut à la config par défaut, mais explicite
  return flatRoutes("routes", defineRoutes);
}
