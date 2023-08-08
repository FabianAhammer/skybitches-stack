import axios from "axios";
import { Router } from "vue-router";

export class LoginUtility {
  public constructor(private $router: Router) { }

  public async login(user: string, password: string) {
    const status = await axios.post("http://localhost:3000/api/login", {
      name: user,
      password: password,
    });
    if (status.status !== 200) {
      return false;
    }



    localStorage.setItem("token", status.data.token);
    localStorage.setItem("user", user);
    setTimeout(() => {
      this.$router.push({ name: "home" });
    }, 100);
  }

  public logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.$router.push({ name: "login" });
  }
}
