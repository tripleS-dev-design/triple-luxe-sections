import crypto from "crypto";

export function verifyShopifyWebhook({ request, secret }) {
  const hmacHeader =
    request.headers.get("x-shopify-hmac-sha256") ||
    request.headers.get("X-Shopify-Hmac-Sha256");
  if (!hmacHeader) return { ok: false, reason: "missing hmac header" };

  return request.text().then((rawBody) => {
    const digest = crypto
      .createHmac("sha256", secret)
      .update(rawBody, "utf8")
      .digest("base64");

    // timing-safe compare
    const ok =
      digest.length === hmacHeader.length &&
      crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));

    return { ok, rawBody };
  });
}
