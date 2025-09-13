// app/routes/auth.$.jsx
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }) => {
  if (params["*"] === "callback") {
    return authenticate.callback(request);
  }
  return authenticate.begin(request);
};
