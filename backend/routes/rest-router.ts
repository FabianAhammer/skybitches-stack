import express from "express";
import { Db, WithId } from "mongodb";
import { SessionData, User } from "../../models/user";
import { DailyVoting, GeneralVoting } from "../../models/voting";
import { SkybitchesRouter } from "../model/abstract-skybitches-router";
import { RestaurantLocation } from "../model/db_location";
import { AbstractSocketBridge } from "../model/abstract-socket-bridge";
export class RestRouter extends SkybitchesRouter {
	constructor(app: express.Express, db: Db, private socketBridge: AbstractSocketBridge) {
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
					}

					var token: string = await this.persistSessionToken(
						user.name,
						user.password,
						dbCollecterUser._id.toString("base64")
					);
					res.status(200).send({ token });
					return;
				});
		});
	}

	public registerSetVoteByUser(): void {
		this.app.post("/vote", async (req, res) => {
			const locationId = req.body.locationid
			if (!locationId) {
				res.status(400).send("No location to vote for provided!");
				return;
			}

			const locations: RestaurantLocation[] = await this.locationCollection
				.find()
				.toArray();

			const votedLocation = locations.find((e) => e.id === locationId);
			if (votedLocation == null) {
				res.status(400).send("Location not found!");
				return;
			}

			const today = this.getTImeTrimmedDate(new Date());
			const voteStatus: DailyVoting | null =
				await this.votingCollection.findOne({ date: today });
			if (voteStatus == null) {
				res.status(400).send("No voting for today found!");
				return;
			}

			if (voteStatus.isOpen === false) {
				res.status(400).send("Voting is closed!");
				return;
			}

			const sessionData: SessionData = req.body._skybitches_data;

			const modifiedVoting: Array<GeneralVoting> =
				voteStatus.votedLocations.map((e) => {
					if (
						e.locationid === req.body.locationid &&
						e.votedBy.find((e) => e.id === sessionData.id) == null
					) {
						e.votedBy.push({ name: sessionData.name, id: sessionData.id });
					} else {
						e.votedBy = e.votedBy.filter((e) => e.id !== sessionData.id);
					}
					return e;
				});

			const successful: boolean = await this.handleVoteManipulation(
				modifiedVoting,
				voteStatus,
				today
			);
			if (!successful) {
				res.status(500).send("Error while voting!");
				return;
			}
			res.status(200);
			this.socketBridge.notifyVotes(await this.votingCollection.findOne({ date: today }));
		});
	}

	/**
	 * Handles the manipulation of the voting collection, returns success
	 */
	private async handleVoteManipulation(
		voting: Array<GeneralVoting>,
		voteStatus: DailyVoting,
		today: string
	): Promise<boolean> {
		false;
		if (
			voting.filter((e) => e.votedBy.length === voteStatus.requiredVotes)
				.length === 1
		) {
			return (
				await this.votingCollection.updateOne(
					{ date: today },
					{
						$set: {
							votedLocations: voting,
							isOpen: false,
							winningLocation: voting.filter(
								(e) => e.votedBy.length === voteStatus.requiredVotes
							)[0].locationid,
						},
					}
				)
			).acknowledged;
		} else {
			return (
				await this.votingCollection.updateOne(
					{ date: today },
					{ $set: { votedLocations: voting } }
				)
			).acknowledged;
		}
	}

	public registerGetVotesForLocations(): void {
		this.app.get("/votes/today", async (req, res) => {
			const today = this.getTImeTrimmedDate(new Date());
			const voteStatus: DailyVoting | null =
				await this.votingCollection.findOne({ date: today });
			if (voteStatus != null) {
				res.status(200).send(voteStatus);
				return;
			}
			try {
				const newVoteStatus = await this.createTodayVoting();
				res.status(200).send(newVoteStatus);
			} catch (e) {
				console.error(e);
				res.status(500).send("Error retrieving voting status for today!");
			}
		});
	}

	public registerGetVoteByUser(): void { }
	public registerGetVotedMenusByUser(): void { }

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

	public registerSetMenuEntryForUser(): void { }
	public registerGetMenuForId(): void { }
	public registerGetMenuStateToday(): void { }
	public registerGetMenusTakenForUser(): void { }
}
