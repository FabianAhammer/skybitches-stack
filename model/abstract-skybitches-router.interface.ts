import express from "express";
import { Collection, Db } from "mongodb";
import { createHash } from "node:crypto";
import { HASH_SALT } from "../env";
import { UserToken } from "./user";
/**
 * Router implementing the routes for the Skybitches API.
 */
export abstract class SkybitchesRouter {
	protected userCollection: Collection;
	protected sessionCollection: Collection;

	constructor(protected app: express.Express, protected db: Db) {
		console.log(
			"Router created, db status",
			db ? "'running'." : "'NOT CONNECTED'!"
		);
		this.userCollection = db.collection("users");
		this.sessionCollection = db.collection("session");
	}

	public registerRoutes(): void {
		this.registerCreateUser();
		this.registerLogin();

		this.registerSetVoteByUser();
		this.registerGetVoteByUser();
		this.registerGetVotedMenusByUser();
		this.registerGetVotesForLocation();
		this.registerGetTodayWinningVoteStatus();

		this.registerGetLocations();

		this.registerSetMenuEntryForUser();
		this.registerGetMenuForId();
		this.registerGetMenuStateToday();
		this.registerGetMenusTakenForUser();
	}

	//User stuff
	public abstract registerCreateUser(): void;
	public abstract registerLogin(): void;

	// voting
	public abstract registerSetVoteByUser(): void;
	public abstract registerGetVoteByUser(): void;
	public abstract registerGetVotedMenusByUser(): void;
	public abstract registerGetVotesForLocation(): void;
	public abstract registerGetTodayWinningVoteStatus(): void;

	//Location
	public abstract registerGetLocations(): void;

	//Menu
	public abstract registerSetMenuEntryForUser(): void;
	public abstract registerGetMenuForId(): void;
	public abstract registerGetMenuStateToday(): void;
	public abstract registerGetMenusTakenForUser(): void;

	/**
	 * Create hash for usage in login
	 */
	protected calculateHash(req: string): string {
		return createHash("sha256")
			.update(req + HASH_SALT)
			.digest("hex");
	}

	/**
	 * Generate 1 day valid hash for usage in login
	 */
	protected calculateHashWithTodaySalt(req: string): string {
		return this.calculateHash(req + new Date().toISOString().split("T")[0]);
	}

	protected getSessionTokenFromDb(
		token: string,
		callback: (token: UserToken | null) => void
	): void {
		this.sessionCollection
			.findOne<UserToken>({ token: token })
			.then((dBtoken) => {
				if (dBtoken == null) {
					callback(null);
				} else {
					callback(dBtoken);
				}
			});
	}

	protected createSessionToken(
		token: string,
		passwordHash: string,
		name: string
	) {
		this.getSessionTokenFromDb(token, (token) => {
			if (token == null) {
				this.sessionCollection.insertOne({
					token: token,
					passwordHash: passwordHash,
					name: name,
				});
			}
		});
	}
}
