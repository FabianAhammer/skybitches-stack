import {DailyVoting} from "../../frontend/src/models/voting";
import {WithId} from "mongodb";

export interface ClientServerNotificationInterface {
    notifyDailyVoting(voting: WithId<DailyVoting> | null): void;
}