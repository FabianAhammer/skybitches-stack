import { Db, MongoClient } from "mongodb";
import {
	DB_URL,
	DB_NAME,
	MONGO_INITDB_ROOT_PASSWORD,
	MONGO_INITDB_ROOT_USERNAME,
} from "./env";

export class MongoInstance {
	constructor() {}
	private client: MongoClient;
	private db: Db;

	async start() {
		console.log("Starting to connect to mongo");
		try {
			this.client = new MongoClient(DB_URL, {
				auth: {
					password: MONGO_INITDB_ROOT_PASSWORD,
					username: MONGO_INITDB_ROOT_USERNAME,
				},
			});
			await this.client.connect();
			this.db = this.client.db(DB_NAME);
			console.log("DB connected to: " + DB_NAME);
		} catch (err) {
			console.log("ERROR", err);
		}
		return this.db;
	}

	static start() {
		console.log("Mongo fired up");
		return new MongoInstance().start();
	}
}
