import express from "express";
var bodyParser = require("body-parser");
import { MongoInstance } from "./connector.js";
const app = express();
const Axios = require("axios");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const port = 8080;

app.use(bodyParser.json());
var mongoInstance = null;
var db = null;

app.listen(port, () => {
	mongoInstance = MongoInstance.start().then((instance) => {
		db = instance;
	});
	console.log(`Example app listening on port ${port}`);
});
