import { randomUUID } from "crypto";

export class RestaurantLocation {
	constructor(name: string) {
		this.name = name;
		this.id = randomUUID();
	}

	public id: string;
	public name: string;
}
