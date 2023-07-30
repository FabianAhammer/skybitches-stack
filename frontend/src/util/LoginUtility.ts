import axios from "axios";

export class LoginUtility {
  private constructor() {}

  public static async login(user: string, password: string) {
    const status = await axios.post("http://localhost:3000/api/login", {
      name: user,
      password: password,
    });
    if (status.status !== 200) {
      return false;
    }

    localStorage.setItem("token", status.data.token);
    localStorage.setItem("user", user);
    return true;
  }

  public static logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}
