import {Db} from "mongodb";
import cron from "node-cron";
import {SetupUtility} from "./SetupUtility";

export class Scheduler {

    private activateSpoaherdRefresh(db: Db) {
        cron.schedule("* * 7 * 1", async () => {
            console.log("cron triggered for spoaherd load");
            await SetupUtility.loadSpoaherdToDb(db);
        })
    }

    public static start(db: Db) {
        const scheduler = new Scheduler();
        scheduler.activateSpoaherdRefresh(db);
    }
}