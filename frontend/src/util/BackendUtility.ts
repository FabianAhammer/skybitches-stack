import {Router} from "vue-router";
import {DailyOrder, DailyVoting, MenuItem, OrderItem, RestaurantLocation} from "@/models/base_types";
import {AuthenticatedRestUtility, REST_METHOD} from "./AuthenticatedRestUtility";

export class BackendUtility extends AuthenticatedRestUtility {
  constructor(private _: Router) {
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

  public async addOrder(menuItem: MenuItem): Promise<void> {
    return await this.triggerApiCall(
      REST_METHOD.POST,
      "/order/add",
      {menuItem}
    )
  }

  public async addVoucher(voucher: string): Promise<void> {
    return await this.triggerApiCall(
      REST_METHOD.POST,
      "/order/voucher",
      {voucher}
    )
  }

  public async removeOrder(orderItem: OrderItem): Promise<void> {
    return await this.triggerApiCall(
      REST_METHOD.POST,
      "/order/delete",
      {orderItem}
    )
  }

  public async closeOrders(): Promise<void> {
    return await this.triggerApiCall(
      REST_METHOD.POST,
      "/order/close"
    )
  }
}
