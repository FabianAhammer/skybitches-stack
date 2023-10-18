import {DailyOrder, DailyVoting} from "../../frontend/src/models/voting";
import {WithId} from "mongodb";

export interface ClientServerNotificationInterface {
    notifyDailyVoting(voting: WithId<DailyVoting> | null): void;

    notifyOrders(orders: WithId<DailyOrder>): void;
}