import express from "express";
var bodyParser = require("body-parser");
import { MongoInstance } from "./connector.js";
import { RestRouter } from "./routes/rest-router.class.js";
import { Db } from "mongodb";
const app = express();
const Axios = require("axios");
const port = 8080;

app.use(bodyParser.json());
var mongoInstance = null;
var db: Db;

mongoInstance = MongoInstance.start().then((instance) => {
	db = instance;
	console.log("Mongo connected!");
	const router: RestRouter = new RestRouter(app, db);
	router.registerRoutes();
});

app.listen(port, () => {
	console.log(`API Server online on ${port}`);
});
