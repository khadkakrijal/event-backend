// api/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../app";


const app = createApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Express apps are request handlers, so just call it:
  (app as unknown as (req: VercelRequest, res: VercelResponse) => void)(req, res);
}
