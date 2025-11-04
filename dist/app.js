"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const events_1 = __importDefault(require("./routes/events"));
const galleries_1 = __importDefault(require("./routes/galleries"));
const albums_1 = __importDefault(require("./routes/albums"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const connect_1 = __importDefault(require("./routes/connect"));
const reports_1 = __importDefault(require("./routes/reports"));
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || "*" }));
    app.use(express_1.default.json({ limit: "10mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
    app.get("/", (_req, res) => {
        res.send("Hello World from Event Backend!");
    });
    app.use("/events", events_1.default);
    app.use("/galleries", galleries_1.default);
    app.use("/albums", albums_1.default);
    app.use("/tickets", tickets_1.default);
    app.use("/connect", connect_1.default);
    app.use("/reports", reports_1.default);
    return app;
}
//# sourceMappingURL=app.js.map