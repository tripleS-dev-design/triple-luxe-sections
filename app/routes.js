// app/routes.js
import { flatRoutes } from "@remix-run/fs-routes";

export default function routes(defineRoutes) {
  return flatRoutes("routes", defineRoutes);
}
