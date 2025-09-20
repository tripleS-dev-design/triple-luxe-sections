// app/utils/params.server.js
export function normalizeShop(input) {
  if (!input) return "";
  let s = String(input).trim().toLowerCase();
  if (!s.includes(".")) s = `${s}.myshopify.com`;
  if (s.endsWith(".myshopify")) s = `${s}.com`;
  return s;
}

export function isValidMyshopifyDomain(shop) {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop || "");
}

export function passthroughFrom(request, { normalize = true } = {}) {
  const url = new URL(request.url);
  const p = new URLSearchParams();
  let shop = url.searchParams.get("shop");
  const host = url.searchParams.get("host");
  const embedded = url.searchParams.get("embedded");
  const locale = url.searchParams.get("locale");
  if (normalize && shop) shop = normalizeShop(shop);
  if (shop) p.set("shop", shop);
  if (host) p.set("host", host);
  if (embedded) p.set("embedded", embedded);
  if (locale) p.set("locale", locale);
  return { shop, host, passthrough: p };
}
