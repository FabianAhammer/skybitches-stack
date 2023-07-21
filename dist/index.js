"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var bodyParser = require("body-parser");
const connector_js_1 = require("./connector.js");
const app = (0, express_1.default)();
const Axios = require("axios");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const port = 8080;
app.use(bodyParser.json());
var mongoInstance = null;
var db = null;
app.listen(port, () => {
    mongoInstance = connector_js_1.MongoInstance.start().then((instance) => {
        db = instance;
    });
    console.log(`Example app listening on port ${port}`);
});
