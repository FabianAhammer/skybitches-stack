import { EXPRESS_PORT } from "./env.js";
import express from "express";
var bodyParser = require("body-parser");
import { MongoInstance } from "./connector.js";
import { RestRouter } from "./routes/rest-router.js";
import { Db } from "mongodb";
import cors from "cors";
import { MqSocketBridge } from "./sockets/mq-socket-bridge.js";
const app = express();
const cookieParser = require("cookie-parser");
const port = EXPRESS_PORT;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

var mongoInstance = null;
var db: Db;

mongoInstance = MongoInstance.start().then((instance) => {
	db = instance;
	console.log("Mongo connected!");
	const socketBridge = new MqSocketBridge();
	const router: RestRouter = new RestRouter(app, db, socketBridge);
	router.registerRoutes();
});

app.listen(port, () => {
	console.log(`API Server online on ${port}`);
});
