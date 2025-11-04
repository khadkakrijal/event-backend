// api/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverlessHttp from "serverless-http";
import { createApp } from "../app";


const app = createApp();
const handler = serverlessHttp(app);

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  // CORS if frontend is on different domain
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN ?? "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(204).end();

  return handler(req as any, res as any);
}
