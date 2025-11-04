"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
// src/supabase.ts
const supabase_js_1 = require("@supabase/supabase-js");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
    throw new Error("Missing Supabase env vars. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
}
exports.supabase = (0, supabase_js_1.createClient)(url, serviceKey, { auth: { persistSession: false } });
//# sourceMappingURL=supabase.js.map