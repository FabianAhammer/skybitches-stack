import express from "express";
import { Db, WithId } from "mongodb";
import { SkybitchesRouter } from "../model/abstract-skybitches-router.interface";
import { User } from "../model/user";
import { RestaurantLocation } from "../model/location";
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
			if (req?.body?.name == null || req?.body?.password == null) {
				res.status(400).send("Failure to create user!");
				return;
			}

			var user: User = {
				name: req.body.name,
				password: this.calculateHash(req.body.password),
			};

			this.userCollection
				.findOne({ name: user.name })
				.then((dbCollecterUser) => {
					if (dbCollecterUser == null) {
						this.userCollection.insertOne(user).then(() => {
							res.status(200).send("User created");
							return;
						});
					} else {
						res.status(400).send("User already exists");
						return;
					}
				});
		});
	}

	public registerLogin(): void {
		this.app.post("/login", (req: any, res: any) => {
			if (req?.body?.name == null || req?.body?.password == null) {
				res.status(400).send("Login failed!");
				return;
			}

			var user: User = {
				name: req.body.name,
				password: this.calculateHash(req.body.password),
			};

			this.userCollection
				.findOne({ name: user.name, password: user.password })
				.then(async (dbCollecterUser) => {
					if (dbCollecterUser == null) {
						res.status(400).send("Login failed!");
						return;
					} else {
						var token: string = await this.persistSessionToken(
							user.name,
							user.password
						);
						res.cookie("token", token);
						res.status(200).send("Login successful!");
						return;
					}
				});
		});
	}

	public registerSetVoteByUser(): void {
		this.app.get("/voted", (req, res) => {});
	}

	public registerGetVoteByUser(): void {}
	public registerGetVotedMenusByUser(): void {}
	public registerGetVotesForLocation(): void {}
	public registerGetTodayWinningVoteStatus(): void {}

	public registerGetLocations(): void {
		this.app.get("/locations", async (req, res) => {
			const locations: RestaurantLocation[] = (
				await this.locationCollection.find().toArray()
			).map((location: WithId<RestaurantLocation>) => {
				return { name: location.name, id: location.id };
			});

			res.status(200).send(locations);
		});
	}

	public registerSetMenuEntryForUser(): void {}
	public registerGetMenuForId(): void {}
	public registerGetMenuStateToday(): void {}
	public registerGetMenusTakenForUser(): void {}

	public registerAddLocation(): void {
		this.app.post("/addlocation", (req, res) => {
			if (!req?.body?.location_name) {
				res.status(400).send("No location name provided!");
				return;
			}
			const name = req.body.location_name;
			const location = new RestaurantLocation(name);
			this.locationCollection.insertOne(location);
			res.status(200).send(req.body);
		});
	}
}
