"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoInstance = void 0;
const mongodb_1 = require("mongodb");
const env_1 = require("./env");
class MongoInstance {
    constructor() { }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.client = new mongodb_1.MongoClient(env_1.DB_URL, {
                    auth: {
                        password: env_1.MONGO_INITDB_ROOT_PASSWORD,
                        username: env_1.MONGO_INITDB_ROOT_USERNAME,
                    },
                });
                yield this.client.connect();
                this.db = this.client.db(env_1.DB_NAME);
            }
            catch (err) {
                console.log("ERROR", err);
            }
            return this.db;
        });
    }
    static start() {
        return new MongoInstance().start();
    }
}
exports.MongoInstance = MongoInstance;
