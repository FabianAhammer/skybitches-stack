import { Router } from "vue-router";
import { DailyVoting } from "../../../models/voting";
import {
  AuthenticatedRestUtility,
  REST_METHOD,
} from "./AuthenticatedRestUtility";

export class BackendUtility extends AuthenticatedRestUtility {
  constructor(private $router: Router) {
    super();
  }

  public async getDailyVote(): Promise<DailyVoting> {
    return await this.triggerApiCall(
      REST_METHOD.GET,
      "http://localhost:3000/api/votes/today"
    );
  }
}