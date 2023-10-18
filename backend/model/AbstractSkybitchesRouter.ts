import express, {Request} from "express";
import {Collection, Db, WithId} from "mongodb";
import {createHash} from "node:crypto";
import {HASH_SALT} from "../env";
import {SessionData, User} from "../../frontend/src/models/user";
import {RestaurantLocation} from "./RestaurantLocation";
import {DailyOrder, DailyVoting, Order, OrderItem} from "../../frontend/src/models/voting";
import {OrderLookupException} from "../exceptions/OrderLookupException";
import {OrderCreationException} from "../exceptions/OrderCreationException";

/**
 * Router implementing the routes for the Skybitches API.
 */
export abstract class SkybitchesRouter {

    private readonly REQUIRED_VOTES_FOR_CLOSING_DAILY_VOTE: number = 2;

    protected userCollection: Collection<User>;
    protected sessionCollection: Collection<SessionData>;
    protected locationCollection: Collection<RestaurantLocation>;
    protected votingCollection: Collection<DailyVoting>;
    protected orderCollection: Collection<DailyOrder>;


    protected constructor(protected app: express.Express, protected db: Db) {
        console.log(
            "Router created, db status",
            db ? "'running'." : "'NOT CONNECTED'!"
        );
        this.userCollection = db.collection("users");
        this.sessionCollection = db.collection("session");
        this.locationCollection = db.collection("location");
        this.votingCollection = db.collection("voting");
        this.orderCollection = db.collection("dailyOrder");
    }

    public registerRoutes(): void {
        this.registerCreateUser();
        this.registerLogin();

        //All routes after this point require validation on the token provided
        this.ensureLoggedInMiddleware();

        this.registerSetVoteByUser();
        this.registerGetVotesForLocations();
        this.registerDeleteTodaysVoting()
        this.registerGetLocations();

        this.registerGetMenuForId();

        this.registerAddLocation();

        this.registerGetOrders();
        this.registerAddOrder();
        this.removeOrder();
        this.copyOrder();
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
                        this.sessionCollection.deleteOne({token: sessionData.token});
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

    public abstract registerGetVotesForLocations(): void;

    public abstract registerDeleteTodaysVoting(): void;

    //Location
    public abstract registerGetLocations(): void;

    public abstract registerAddLocation(): void;

    //Menu
    public abstract registerSetMenuEntryForUser(): void;

    public abstract registerGetMenuForId(): void;

    public abstract registerGetOrders(): void;

    public abstract registerAddOrder(): void;

    public abstract removeOrder(): void;

    public abstract copyOrder(): void;

    /**
     * Create hash for usage in login
     */
    public static calculateHash(req: string): string {
        return createHash("sha256")
            .update(req + HASH_SALT)
            .digest("hex");
    }

    /**
     * Generate 1 day valid hash for usage in login
     */
    protected calculateHashWithTodaySalt(req: string): string {
        return SkybitchesRouter.calculateHash(req + new Date().toISOString().split("T")[0]);
    }


    protected getUserDateFromRequest(req: Request): SessionData {
        return req.body["_skybitches_data"];
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
            .findOne<SessionData>({token: token})
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

    protected getTimeTrimmedDate(date: Date = new Date()): string {
        return date.toISOString().split("T")[0];
    }


    protected async createTodayVoting(): Promise<DailyVoting> {
        const locations: RestaurantLocation[] = await this.locationCollection
            .find<RestaurantLocation>({})
            .toArray();
        const today = this.getTimeTrimmedDate(new Date());

        const isDailyVotingInDb: boolean =
            (await this.votingCollection.findOne<DailyVoting>({date: today})) !=
            null;

        if (isDailyVotingInDb) {
            throw new Error("Daily voting already exists!");
        }

        const dailyVotingToday: DailyVoting = {
            isOpen: true,
            requiredVotes: this.REQUIRED_VOTES_FOR_CLOSING_DAILY_VOTE,
            date: this.getTimeTrimmedDate(),
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
            (await this.votingCollection.insertOne(dailyVotingToday)).acknowledged
        ) {
            return dailyVotingToday;
        }
        throw new Error("Could not create daily voting!");
    }

    protected async checkTodayRestaurantContainOrderId(id: string): Promise<OrderItem> {
        const today = await this.lookupTodayOrder();
        //TODO: Add actual check on menu
        return {id, name: "Schnitzl", price: 3.5};
    }

    protected async lookupTodayOrder(): Promise<WithId<DailyOrder> | Error | null> {
        const today = this.getTimeTrimmedDate(new Date());
        const todaysOrder = await this.orderCollection.findOne({date: today});
        if (todaysOrder) {
            return todaysOrder;
        }
        return this.createTodayOrder(today);

    }

    private async createTodayOrder(date: string): Promise<WithId<DailyOrder> | Error | null> {
        const voteStatus: DailyVoting | null =
            await this.votingCollection.findOne({date: date});
        if (voteStatus == null) {
            return null;
        }

        if (voteStatus.isOpen) {
            return new OrderLookupException("Failed to lookup, voting is not closed");
        }

        if (!voteStatus.winningLocation) {
            return new OrderLookupException("Failed to lookup, no winning location found!");
        }
        const winningLocation = await this.locationCollection.findOne({id: voteStatus.winningLocation});

        if (!winningLocation) {
            return new OrderLookupException(`Failed to get location ${voteStatus.winningLocation}`);
        }
        const order: DailyOrder = {
            date: date,
            orders: [],
            isOpen: true,
            location: winningLocation
        }

        if ((await this.orderCollection.insertOne(order)).acknowledged) {
            const dailyOrder = await this.orderCollection.findOne({date: date});
            if (dailyOrder) {
                return dailyOrder;
            }
            return new OrderCreationException("Failure to read daily order after creation!")
        }
        return new OrderCreationException("Failure to insert created daily order!")

    }

}
