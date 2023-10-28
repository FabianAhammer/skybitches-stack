import {DailyOrder, DailyVoting} from "../../frontend/src/models/base_types";
import {WithId} from "mongodb";

export interface ClientServerNotificationInterface {
    notifyDailyVoting(voting: WithId<DailyVoting> | null): void;

    notifyOrders(orders: WithId<DailyOrder>): void;
}