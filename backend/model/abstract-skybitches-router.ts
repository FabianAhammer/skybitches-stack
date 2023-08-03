import express from "express";
import { Collection, Db } from "mongodb";
import { createHash } from "node:crypto";
import { HASH_SALT } from "../env";
import { SessionData, User } from "../../models/user";
import { RestaurantLocation } from "./db_location";
import { DailyVoting } from "../../models/voting";
/**
 * Router implementing the routes for the Skybitches API.
 */
export abstract class SkybitchesRouter {


	protected userCollection: Collection<User>;
	protected sessionCollection: Collection<SessionData>;
	protected locationCollection: Collection<RestaurantLocation>;
	protected votingCollection: Collection<DailyVoting>;


	constructor(protected app: express.Express, protected db: Db) {
		console.log(
			"Router created, db status",
			db ? "'running'." : "'NOT CONNECTED'!"
		);
		this.userCollection = db.collection("users");
		this.sessionCollection = db.collection("session");
		this.locationCollection = db.collection("location");
		this.votingCollection = db.collection("voting");
	}

	public registerRoutes(): void {
		this.registerCreateUser();
		this.registerLogin();

		//All routes after this point require validation on the token provided
		this.ensureLoggedInMiddleware();

		this.registerSetVoteByUser();
		this.registerGetVoteByUser();

		this.registerGetVotesForLocations();

		this.registerGetLocations();

		this.registerSetMenuEntryForUser();
		this.registerGetMenuForId();
		this.registerGetMenuStateToday();
		this.registerGetMenusTakenForUser();

		this.registerAddLocation();
	}

	private ensureLoggedInMiddleware() {
		this.app.use((req, res, next) => {
			if (req.headers.token == undefined) {
				res.status(401).send("No token provided!");
				return;
			}

			this.getSessionTokenFromDb(req.headers.token, (sessionData) => {
				if (sessionData == null) {
					res.status(403).send("Invalid token!");
					return;
				} else {
					if (
						sessionData.token !==
						this.createSessionTokenWithDate(
							sessionData.name,
							sessionData.passwordHash
						)
					) {
						res.status(400).send("Invalid token!");
						this.sessionCollection.deleteOne({ token: sessionData.token });
						return;
					} else {
						//Appends login information to the request
						req.body["_skybitches_data"] = sessionData;
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
	public abstract registerGetVotesForLocations(): void;

	//Location
	public abstract registerGetLocations(): void;
	public abstract registerAddLocation(): void;

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
		token: string | unknown,
		callback: (token: SessionData | null) => void
	): void {
		if (token == null) {
			callback(null);
			return;
		}

		this.sessionCollection
			.findOne<SessionData>({ token: token })
			.then((dBtoken) => {
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
		passwordHash: string,
		id: string
	): Promise<string> {
		const token = this.createSessionTokenWithDate(name, passwordHash);
		const dbToken = await this.sessionCollection.findOne<SessionData>({
			token: token,
		});
		if (dbToken == null) {
			this.sessionCollection.insertOne({
				token: token,
				passwordHash: passwordHash,
				name: name,
				id: id,
			} as SessionData);
		}
		return token;
	}

	protected getTImeTrimmedDate(date: Date = new Date()): string {
		return date.toISOString().split("T")[0];
	}

	protected async createTodayVoting(): Promise<DailyVoting> {
		const locations: RestaurantLocation[] = await this.locationCollection
			.find<RestaurantLocation>({})
			.toArray();
		const today = this.getTImeTrimmedDate(new Date());

		const isDailyVotingInDb: boolean =
			(await this.votingCollection.findOne<DailyVoting>({ date: today })) !=
			null;

		if (isDailyVotingInDb) {
			throw new Error("Daily voting already exists!");
		}

		const dailyVotingToday: DailyVoting = {
			isOpen: true,
			requiredVotes: 1,
			date: this.getTImeTrimmedDate(),
			votedLocations: locations.map((location) => {
				return {
					locationid: location.id,
					locationName: location.name,
					votedBy: [],
				};
			}),
			winningLocation: null,
		};

		if (
			(await this.votingCollection.insertOne(dailyVotingToday)).acknowledged ==
			true
		) {
			return dailyVotingToday;
		}
		throw new Error("Could not create daily voting!");
	}
}
