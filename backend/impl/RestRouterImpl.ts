import express, {Request, Response} from "express";
import {Db, WithId} from "mongodb";
import {SessionData, User} from "../../frontend/src/models/user";
import {DailyOrder, DailyVoting, GeneralVoting, MenuItem, Order, OrderItem} from "../../frontend/src/models/base_types";
import {SkybitchesRouter} from "../model/AbstractSkybitchesRouter";
import {RestaurantLocation} from "../model/RestaurantLocation";
import {ClientServerNotificationInterface} from "../interfaces/ClientServerNotificationInterface";
import {DailyVotingMalcreatedException} from "../exceptions/DailyVotingMalcreatedException";
import {OrderAddException} from "../exceptions/OrderAddException";
import {randomUUID} from "crypto";

export class RestRouterImpl extends SkybitchesRouter {

    constructor(app: express.Express, db: Db, private clientServerNotification: ClientServerNotificationInterface) {
        console.log("Rest Router created");
        super(app, db);
    }

    //#region RestMapper
    public registerCreateUser(): void {
        this.app.post("/createuser", (req: any, res: any) => {
            if (req?.body?.name == null || req?.body?.password == null) {
                res.status(400).send("Failure to create user!");
                return;
            }

            const user: User = {
                name: req.body.name,
                password: SkybitchesRouter.calculateHash(req.body.password),
            };

            this.userCollection
                .findOne({name: user.name})
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
                password: SkybitchesRouter.calculateHash(req.body.password),
            };
            this.userCollection
                .findOne({name: user.name, password: user.password})
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
                    res.status(200).send({token});
                    return;
                });
        });
    }

    public registerDeleteTodaysVoting(): void {
        this.app.post("/votes/delete", async (req, res) => {
            const today = this.getTimeTrimmedDate(new Date());
            const voteStatus: DailyVoting | null =
                await this.votingCollection.findOne({date: today});
            if (voteStatus) {
                await this.votingCollection.deleteOne({date: today});
            }
            res.sendStatus(200);

        })
    }


    public registerSetVoteByUser(): void {
        this.app.post("/vote", async (req, res) => {
            console.log("voteing in");
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

            const today = this.getTimeTrimmedDate(new Date());
            const voteStatus: DailyVoting | null =
                await this.votingCollection.findOne({date: today});
            if (voteStatus == null) {
                res.status(400).send("No voting for today found!");
                return;
            }

            if (!voteStatus.isOpen) {
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
                        e.votedBy.push({name: sessionData.name, id: sessionData.id});
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
            /**
             * If 200 and no response body is passed, it will go to a 204 (no content) and browser will not continue -> resulting in a stall?
             */
            res.status(200).send("Passed voting");
            this.clientServerNotification.notifyDailyVoting(await this.votingCollection.findOne({date: today}));
        });
    }

    /**
     * Handles the manipulation of the voting collection, returns success
     *
     * @param voting        array of voting
     * @param voteStatus    today´s voting
     * @param today         ISO String of date
     */
    private async handleVoteManipulation(
        voting: Array<GeneralVoting>,
        voteStatus: DailyVoting,
        today: string
    ): Promise<boolean> {
        if (
            voting.filter((e) => e.votedBy.length === voteStatus.requiredVotes)
                .length === 1
        ) {
            return (
                await this.votingCollection.updateOne(
                    {date: today},
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
                    {date: today},
                    {$set: {votedLocations: voting}}
                )
            ).acknowledged;
        }
    }

    public registerGetVotesForLocations(): void {
        this.app.get("/votes/today", async (req, res) => {
            const today = this.getTimeTrimmedDate(new Date());
            const voteStatus: DailyVoting | null =
                await this.votingCollection.findOne({date: today});
            try {

                if (voteStatus != null) {
                    if (voteStatus.votedLocations.length === 0) {
                        throw new DailyVotingMalcreatedException("Empty locations");
                    }
                    res.status(200).send(voteStatus);
                    return;
                }
            } catch (exception) {
                console.error(this.registerGetVotesForLocations.name);
                await this.votingCollection.deleteOne({date: today});
                res.status(500).send("Error on today`s vote, please try again");
                return;
            }

            try {
                console.log(this.registerGetVotesForLocations.name, "Creating new voting for today")
                const newVoteStatus = await this.createTodayVoting();
                res.status(200).send(newVoteStatus);
            } catch (e) {
                console.error(e);
                res.status(500).send("Error retrieving voting status for today!");
            }
        });
    }

    public registerGetLocations(): void {
        this.app.get("/locations", async (req, res) => {
            const locations: RestaurantLocation[] = (
                await this.locationCollection.find().toArray()
            );
            res.status(200).send(locations);
        });
    }

    public registerAddLocation(): void {
        this.app.post("/addlocation", async (req, res) => {
            if (!req?.body?.location_name) {
                res.status(400).send("No location name provided!");
                return;
            }

            if (!req?.body?.has_menu) {
                res.status(400).send("No information on menu!");
                return;
            }
            const name = req.body.location_name;
            const hasMenu = req.body.has_menu
            const location = new RestaurantLocation(name, hasMenu, []);
            await this.locationCollection.insertOne(location);
            res.status(200).send(req.body);
        });
    }

    public registerAddOrder(): void {
        this.app.post("/order/add", async (req, res) => {
            const orderedItem = await this.checkRequestForOrder(req, res);
            if (!orderedItem) {
                res.status(400).send("Failed to find ordered item");
                return;
            }
            const isOpen = await this.isTodaysOrderOpen();
            if (isOpen !== true) {
                res.status(500).send("Order is not open ");
                return;
            }

            const dailyOrder: DailyOrder | Error | null = await this.lookupTodayOrder();
            if (!dailyOrder) {
                res.status(500).send("Failed to delete, cannot find today orders");
                return;
            }

            if (dailyOrder instanceof Error) {
                res.status(500).send("Failed to lookup orders - " + JSON.stringify(dailyOrder));
                return;
            }
            const orderOfUser: Order | undefined = dailyOrder.orders.find(e => e.user === this.getUserDateFromRequest(req).name);
            if (orderOfUser != null) {
                orderOfUser.orderedItems.push(orderedItem);
            } else {
                dailyOrder.orders.push({
                    user: this.getUserDateFromRequest(req).name,
                    id: randomUUID(),
                    orderedItems: [orderedItem],
                    voucher: 0
                });
            }
            this.persistAndUpdateDailyOrder(res, dailyOrder);
        })
    }

    public registerAddVoucher(): void {
        this.app.post("/order/voucher", async (req, res) => {
            const voucher: number = Number.parseFloat(req.body?.voucher || "0");
            if (Number.isNaN(voucher)) {
                res.status(500).send("Failed to parse voucher, not valid!");
                return;
            }
            const isOpen = await this.isTodaysOrderOpen();
            if (isOpen !== true) {
                res.status(500).send("Order is not open!");
                return;
            }


            const dailyOrder: DailyOrder | Error | null = await this.lookupTodayOrder();
            if (!dailyOrder) {
                res.status(500).send("Failed to delete, cannot find today orders");
                return;
            }

            if (dailyOrder instanceof Error) {
                res.status(500).send("Failed to lookup orders - " + JSON.stringify(dailyOrder));
                return;
            }
            const orderOfUser: Order | undefined = dailyOrder.orders.find(e => e.user === this.getUserDateFromRequest(req).name);

            if (orderOfUser == null) {
                res.status(500).send("Failed to set voucher, no order found for user!");
                return;
            }
            orderOfUser.voucher = voucher;
            this.persistAndUpdateDailyOrder(res, dailyOrder);
        })
    }

    public registerGetOrders(): void {
        this.app.get("/orders", async (req, res) => {
            const todayOrders = await this.lookupTodayOrder();

            if (todayOrders == null) {
                res.status(404).send("No orders found");
                return;
            }
            res.status(200).send(todayOrders);
        });
    }

    public registerRemoveOrder(): void {
        this.app.post("/order/delete", async (req, res) => {
            const orderItem = req.body?.orderItem;
            if (!orderItem) {
                res.status(500).send("Failed to delete, no order item");
                return null;
            }
            const isOpen = await this.isTodaysOrderOpen();
            if (isOpen !== true) {
                res.status(500).send("Order is not open ");
                return;
            }
            const dailyOrder: WithId<DailyOrder> | Error | null = await this.lookupTodayOrder();
            if (!dailyOrder) {
                res.status(500).send("Failed to delete, cannot find today orders");
                return;
            }
            if (dailyOrder instanceof Error) {
                res.status(500).send("Failed to lookup orders - " + JSON.stringify(dailyOrder));
                return;
            }
            const orderOfUser: Order | undefined = dailyOrder.orders.find(e => e.user === this.getUserDateFromRequest(req).name)
            if (orderOfUser == null) {
                res.status(500).send("Failed to find order to remove");
                return;
            }
            const firstOrderOfItemIdx = orderOfUser.orderedItems.findIndex(e => e.id === orderItem.id)
            orderOfUser.orderedItems = orderOfUser.orderedItems.filter((_, i) => i !== firstOrderOfItemIdx);
            await this.persistAndUpdateDailyOrder(res, dailyOrder);
        })
    }

    public registerCloseOrders(): void {
        this.app.post("/order/close", async (req, res) => {
            const sessionData: SessionData = req.body._skybitches_data;
            const closure = await this.closeTodaysOrder(sessionData.name)
            if (closure instanceof Error) {
                res.status(500).send(closure.message);
                return;
            }
            if (!closure) {
                res.status(500).send("Failed to close voting, already closed.")
                return;
            }
            await this.notifyUsersWithNewOrder(res);
        })
    }

    //#end region
    private async checkRequestForOrder(req: Request, res: Response): Promise<OrderItem | null> {
        if (!req.body?.menuItem) {
            console.log("No menu item");
            return null;
        }

        const menuItem: MenuItem = req.body.menuItem;
        const orderedItem: OrderItem | false = await this.checkTodayRestaurantContainMenuitem(menuItem);

        if (!orderedItem) {
            res.status(500).send("Item not in menu!");
            return null;
        }
        return orderedItem;
    }


    private async persistAndUpdateDailyOrder(res: Response, dailyOrder: DailyOrder) {
        if (!(await this.orderCollection.updateOne({date: dailyOrder.date}, {
            $set: {
                orders: dailyOrder.orders
            }
        })).acknowledged) {
            res.status(500).send("Failed to insert on db");
            throw new OrderAddException("Failure to add to order, db insert failed!");
        }
        await this.notifyUsersWithNewOrder(res);
    }

    private async notifyUsersWithNewOrder(res: Response) {
        const newOrders = await this.lookupTodayOrder();
        if (!newOrders) {
            res.status(500).send("Failed to load new values of orders of db");
            throw new OrderAddException("Failure to read new values of orders from db!");
        }
        if (newOrders instanceof Error) {
            res.status(500).send("Failed to lookup orders");
            return;
        }
        this.clientServerNotification.notifyOrders(newOrders);
        res.sendStatus(200);
    }
}
