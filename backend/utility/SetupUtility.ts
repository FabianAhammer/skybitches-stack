import {Db} from "mongodb";
import {SkybitchesRouter} from "../model/AbstractSkybitchesRouter";
import {User} from "../../frontend/src/models/user";
import {DEFAULT_SKYBITCHES_PASSWORD, DEFAULT_SKYBITCHES_USER} from "../env";

export class SetupUtility {
    public static async setupDb(db: Db): Promise<void> {

        const user: User = {
            name: DEFAULT_SKYBITCHES_USER,
            password: SkybitchesRouter.calculateHash(DEFAULT_SKYBITCHES_PASSWORD),
        };

        const userCollection = db.collection("users");
        await userCollection
            .findOne({name: user.name})
            .then((dbUser) => {
                if (dbUser == null) {
                    userCollection.insertOne(user).then(() => {
                        console.log("Added initial Database User!")
                    });
                }
            });
    }
}