import {ClientServerNotificationInterface} from "../interfaces/ClientServerNotificationInterface";
import {DailyVoting} from "../../frontend/src/models/voting";
import {WithId} from "mongodb";

export abstract class AbstractServerClientNotification implements ClientServerNotificationInterface {
    protected constructor() {
    }

    protected abstract notifyUsers(voting: DailyVoting): void;

    public notifyDailyVoting(voting: WithId<DailyVoting> | null): void {
        if (voting !== null) {
            this.notifyUsers(voting);
        }
        else{
            console.warn("Fauled t")

        }
    }
}