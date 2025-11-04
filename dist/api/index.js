"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = vercelHandler;
const serverless_http_1 = __importDefault(require("serverless-http"));
const app_1 = require("../app");
const app = (0, app_1.createApp)();
const handler = (0, serverless_http_1.default)(app);
async function vercelHandler(req, res) {
    // CORS if frontend is on different domain
    res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN ?? "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS")
        return res.status(204).end();
    return handler(req, res);
}
//# sourceMappingURL=index.js.map