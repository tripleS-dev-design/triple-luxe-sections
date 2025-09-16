// app/routes.ts
import { flatRoutes } from "@remix-run/fs-routes";

export default function routes(defineRoutes: any) {
  return flatRoutes("routes", defineRoutes);
}
