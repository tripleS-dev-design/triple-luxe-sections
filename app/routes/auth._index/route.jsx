// app/routes/auth._index/route.jsx
import { authenticate } from "../../shopify.server";
export const loader = async ({ request }) => authenticate.begin(request);
