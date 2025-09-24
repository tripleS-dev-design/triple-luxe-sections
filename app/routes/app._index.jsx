// app/routes/app.tsx (أو .jsx) — loader فقط
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import shopify from "../shopify.server"; // تأكد من المسار الصحيح

export async function loader({ request }) {
  const url = new URL(request.url);
  const qsShop = url.searchParams.get("shop") || ""; // e.g. samifinal.myshopify.com
  const { admin, session } = await shopify.authenticate.admin(request);

  // إذا كاين shop فالـ URL وهو مختلف عن session.shop → بدّل الكونتكست لهاد الشوب
  if (qsShop && session?.shop && session.shop !== qsShop) {
    // بداية OAuth لهاد الشوب الجديد باش ما يبقاش يرجّعك للسابق
    const authUrl = await shopify.auth.begin({
      shop: qsShop,
      callbackPath: "/auth/callback",
      isOnline: false,
      request,
    });
    throw redirect(authUrl);
  }

  const shopDomain = (qsShop || session?.shop || "").toLowerCase();
  const shopSub = shopDomain.replace(".myshopify.com", "");
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  return json({ shopSub, apiKey });
}

export default function AppLayout() {
  const data = useLoaderData<typeof loader>();
  return <Outlet context={data} />;
}
