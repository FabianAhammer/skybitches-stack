"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = void 0;
function setupRoutes(app) {
    app.post("/login", (req, res) => {
    });
    app.post("/createuser", (req, res) => {
        res.send(req.body);
    });
}
exports.setupRoutes = setupRoutes;
