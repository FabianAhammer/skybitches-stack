import {randomUUID} from "crypto";

export class RestaurantLocation {
    constructor(name: string, hasMenu: boolean) {
        this.name = name;
        this.hasMenu = hasMenu;
        this.id = randomUUID();
    }

    public id: string;
    public name: string;
    public hasMenu: boolean;
}
