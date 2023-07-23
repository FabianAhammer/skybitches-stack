import express from "express";
import { Db } from "mongodb";
import { SkybitchesRouter } from "../model/router";
import { User } from "../model/user";
export class RestRouter extends SkybitchesRouter {
	/**
	 *
	 */
	constructor(app: express.Express, db: Db) {
		console.log("Rest Router created");
		super(app, db);
	}
	public registerCreateUser(): void {
		this.app.post("/createuser", (req: any, res: any) => {
			var user: User;
			if (!req?.body?.name || req?.body?.password) {
				res.status(400).send("Failure to create login");
				return;
			}
			user = {
				name: req.body.name,
				password: this.calculateHash(req.body.password),
			};

			this.userCollection.findOne({ name: user.name }).then(() => {
				res.status(400).send("User already exists");
				return;
			});

			this.userCollection.insertOne(user).then(() => {
				res.status(200).send("User created");
				return;
			});
		});
	}

	public registerLogin(): void {
		this.app.post("/login", (req: any, res: any) => {});
	}

	public registerSetVoteByUser(): void {}

	public registerGetVoteByUser(): void {}
	public registerGetVotedMenusByUser(): void {}
	public registerGetVotesForLocation(): void {}
	public registerGetTodayWinningVoteStatus(): void {}

	public registerGetLocations(): void {}

	public registerSetMenuEntryForUser(): void {}
	public registerGetMenuForId(): void {}
	public registerGetMenuStateToday(): void {}
	public registerGetMenusTakenForUser(): void {}
}
