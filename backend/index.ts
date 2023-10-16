import {EXPRESS_PORT} from "./env.js";
import express from "express";

var bodyParser = require("body-parser");
const {createServer} = require('http')
import {MongoInstance} from "./impl/MongoDatabaseConnectorImpl";
import {RestRouterImpl} from "./impl/RestRouterImpl";
import {Db} from "mongodb";
import cors from "cors";
import {WebSocketNotificationImpl} from "./impl/WebSocketNotificationImpl";
import {SetupUtility} from "./utility/SetupUtility";

const ws = require("ws");
const cookieParser = require("cookie-parser");
const expressWs = require('express-ws');
const app = expressWs(express()).app;

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
let db: Db;

const server = createServer(app)

const wsServer = new ws.Server({noServer: true});
MongoInstance.start().then(async (instance) => {
    db = instance;
    await SetupUtility.setupDb(db);
    console.log("Mongo connected!");
    const router: RestRouterImpl = new RestRouterImpl(app, db, new WebSocketNotificationImpl(
        wsServer
    ));
    router.registerRoutes();
});


server.listen(EXPRESS_PORT, () => {
    console.log(`API Server online on ${EXPRESS_PORT}`);
});

server.on('upgrade', (request: any, socket: any, head: any) => {
    wsServer.handleUpgrade(request, socket, head, (socket: any) => {
        wsServer.emit('connection', socket, request);
    });
});
