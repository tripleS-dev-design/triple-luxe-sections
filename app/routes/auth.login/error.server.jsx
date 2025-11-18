// app/routes/auth.login/error.server.jsx
import { LoginErrorType } from "@shopify/shopify-app-remix/server";

/**
 * Transforme le LoginError de `login(request)` en messages lisibles
 * pour ton formulaire (ici on renvoie un objet avec la clé `shop`).
 */
export function loginErrorMessage(loginError) {
  // Si pas d'erreur -> pas de messages
  if (!loginError || !loginError.shop) {
    return {};
  }

  switch (loginError.shop) {
    case LoginErrorType.InvalidShop:
      return {
        shop: "Shop domain invalide. Utilise le format example.myshopify.com",
      };

    case LoginErrorType.MissingShop:
      return {
        shop: "Le domaine du shop est obligatoire.",
      };

    default:
      return {
        shop: "Une erreur est survenue. Merci de réessayer.",
      };
  }
}
