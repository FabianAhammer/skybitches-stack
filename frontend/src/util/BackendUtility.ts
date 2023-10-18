import {Router} from "vue-router";
import {DailyOrder, DailyVoting, RestaurantLocation} from "@/models/voting";
import {AuthenticatedRestUtility, REST_METHOD,} from "./AuthenticatedRestUtility";

export class BackendUtility extends AuthenticatedRestUtility {
    constructor(private $router: Router) {
        super();
    }

    public async getDailyVote(): Promise<DailyVoting> {
        return await this.triggerApiCall(
            REST_METHOD.GET,
            "/votes/today"
        );
    }

    public async vote(locationid: string): Promise<void> {
        return await this.triggerApiCall(
            REST_METHOD.POST,
            "/vote",
            {locationid}
        );
    }


    public async getLocations(): Promise<RestaurantLocation[]> {
        return await this.triggerApiCall(
            REST_METHOD.GET,
            "/locations"
        );
    }


    public async getOrders(): Promise<DailyOrder> {
        return await this.triggerApiCall(
            REST_METHOD.GET,
            "/orders"
        )
    }

    public async addOrder(orderId: string): Promise<void> {
        return await this.triggerApiCall(
            REST_METHOD.POST,
            "/order/add",
            {orderId}
        )
    }

    public async removeOrder(orderId: string): Promise<void> {
        return await this.triggerApiCall(
            REST_METHOD.POST,
            "/order/delete",
            {orderId}
        )
    }
}
