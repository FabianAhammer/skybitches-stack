import {randomUUID} from "crypto";

export class RestaurantLocation {
    constructor(name: string, hasMenu: boolean, dailyTop: Array<number>) {
        this.name = name;
        this.hasMenu = hasMenu;
        this.dailyTop = dailyTop;
        this.id = randomUUID();
    }

    public id: string;
    public name: string;
    public hasMenu: boolean;
    public dailyTop: Array<number>
}
