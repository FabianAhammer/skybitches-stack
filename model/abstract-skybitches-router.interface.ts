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

		//All routes after this point require validation on the token provided
		this.ensureLoggedInMiddleware();

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

	private ensureLoggedInMiddleware() {
		this.app.use((req, res, next) => {
			if (req.cookies.token == undefined) {
				res.status(401).send("No token provided!");
				return;
			}

			this.getSessionTokenFromDb(req.cookies.token, (token) => {
				if (token == null) {
					res.status(403).send("Invalid token!");
					return;
				} else {
					if (
						token.token !==
						this.createSessionTokenWithDate(token.name, token.passwordHash)
					) {
						res.status(400).send("Invalid token!");
						this.sessionCollection.deleteOne({ token: token.token });
						return;
					} else {
						next();
					}
				}
			});
		});
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
		token: string | undefined,
		callback: (token: UserToken | null) => void
	): void {
		if (token == null) {
			callback(null);
			return;
		}

		this.sessionCollection
			.findOne<UserToken>({ token: token })
			.then((dBtoken) => {
				console.log(dBtoken);
				if (dBtoken == null) {
					callback(null);
				} else {
					callback(dBtoken);
				}
			});
	}

	protected createSessionTokenWithDate(name: string, password: string): string {
		return this.calculateHashWithTodaySalt(name + password);
	}

	protected async persistSessionToken(
		name: string,
		passwordHash: string
	): Promise<string> {
		const token = this.createSessionTokenWithDate(name, passwordHash);
		const dbToken = await this.sessionCollection.findOne<UserToken>({
			token: token,
		});
		if (dbToken == null) {
			this.sessionCollection.insertOne({
				token: token,
				passwordHash: passwordHash,
				name: name,
			} as UserToken);
		}
		return token;
	}
}
