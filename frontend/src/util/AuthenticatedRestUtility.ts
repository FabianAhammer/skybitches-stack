import { useApiStore } from "@/store/app";
import axios, { AxiosError } from "axios";

export class AuthenticatedRestUtility {
  constructor() {}

  protected getToken(): string | null {
    return localStorage.getItem("token");
  }

  protected async triggerApiCall(
    method: REST_METHOD,
    url: string,
    data?: any
  ): Promise<any> {
    try {
      const response = await axios({
        method: method,
        url: url,
        data: data,
        headers: {
          token: this.getToken(),
        },
      });

      return response.data;
    } catch (e: AxiosError | any) {
      if (e.request.status === 401) {
        const store = useApiStore();
        store.auth.logout();
        return null;
      }
    }
  }
}

export enum REST_METHOD {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}
