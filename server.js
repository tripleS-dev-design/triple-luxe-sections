// server.js
import express from "express";
import { createRequestHandler } from "@remix-run/express";
import * as build from "./build/server/index.js";

const app = express();
app.set("trust proxy", true);
app.use(express.static("public"));

app.all(
  "*",
  createRequestHandler({
    build,
    mode: process.env.NODE_ENV,
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`[server] listening on http://0.0.0.0:${PORT}`);
});
