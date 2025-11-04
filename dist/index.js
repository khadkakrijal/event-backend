"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts (local dev only)
const app_1 = require("./app");
const app = (0, app_1.createApp)();
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`🚀 Backend running at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map