import {ClientServerNotificationInterface} from "../interfaces/ClientServerNotificationInterface";
import {DailyOrder, DailyVoting} from "../../frontend/src/models/base_types";
import {WithId} from "mongodb";

export abstract class AbstractServerClientNotification implements ClientServerNotificationInterface {
    protected constructor() {
    }

    protected abstract notifyUsers(voting: {
        voting?: WithId<DailyVoting>,
        orders?: WithId<DailyOrder>
    }): void;

    public notifyDailyVoting(voting: WithId<DailyVoting> | null): void {
        if (voting !== null) {
            this.notifyUsers({voting});
        } else {
            console.warn("Failed notify for daily voting!");
        }
    }

    public notifyOrders(orders: WithId<DailyOrder>): void {
        if (orders !== null) {
            this.notifyUsers({orders});
        } else {
            console.warn("Failed notify for orders!");
        }
    }


}