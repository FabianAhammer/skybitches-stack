import {Collection, Db} from "mongodb";
import {SkybitchesRouter} from "../model/AbstractSkybitchesRouter";
import {User} from "../../frontend/src/models/user";
import {Menu, MenuItem} from "../../frontend/src/models/base_types";
import {DEFAULT_SKYBITCHES_PASSWORD, DEFAULT_SKYBITCHES_USER} from "../env";
import path from "path";
import shell from 'shelljs';
import {RestaurantLocation} from "../model/RestaurantLocation";
import {RestaurantLocationList} from "../model/LocationConstants";

export class SetupUtility {
    private static MENU_COLLECTION: string = "menus";
    private static LOCATION_COLLECTION: string = "location";
    private static USER_COLLECTION: string = "users";

    public static async setupDb(db: Db): Promise<void> {
        await this.setupMasterUser(db);
        await this.checkRestaurants(db);
        await this.checkAndLoadSpoaherdIfNeeded(db);
    }


    public static async setupMasterUser(db: Db): Promise<void> {
        const user: User = {
            name: DEFAULT_SKYBITCHES_USER,
            password: SkybitchesRouter.calculateHash(DEFAULT_SKYBITCHES_PASSWORD),
        };

        const userCollection = db.collection(this.USER_COLLECTION);
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


    public static async checkAndLoadSpoaherdIfNeeded(db: Db): Promise<void> {
        const menuCollection: Collection<Menu> = db.collection(this.MENU_COLLECTION);
        await menuCollection.findOne({restaurant: "spoaherd"}).then(entry => {
            if (entry == null) {
                this.loadSpoaherdToDb(db);
            }
        })
    }

    public static async loadSpoaherdToDb(db: Db): Promise<void> {
        const stdout1 = shell.exec(path.resolve(__dirname, 'spoaherd.sh')).stdout;
        const menuItems: MenuItem[] = JSON.parse(stdout1);
        const spoaherdEntry: Menu = {
            restaurant: RestaurantLocationList.spoaherd.name,
            updatedAt: new Date().toISOString(),
            menuItems
        }
        const menuCollection: Collection<Menu> = db.collection(this.MENU_COLLECTION);
        await menuCollection.insertOne(spoaherdEntry);
    }

    public static async checkRestaurants(db: Db): Promise<void> {
        const locationCollection: Collection<RestaurantLocation> = db.collection(this.LOCATION_COLLECTION);
        for (const restaurantLocationListKey in RestaurantLocationList) {

            const restaurantLocationElement: {
                name: string,
                hasMenu: boolean
                //@ts-ignore
            } = RestaurantLocationList[restaurantLocationListKey];
            await locationCollection.findOne({name: restaurantLocationElement.name})
                .then(async entry => {
                    if (entry == null) {
                        const insert: RestaurantLocation = new RestaurantLocation(restaurantLocationElement.name, restaurantLocationElement.hasMenu)
                        await locationCollection.insertOne(insert);
                    }
                })

        }
    }


}