import axios, {AxiosError} from "axios";
import {Router} from "vue-router";
import {errorStore} from "@/store/app";

export class LoginUtility {
    public constructor(private $router: Router) {
    }

    public async login(user: string, password: string) {
        try {
            const status = await axios.post(process.env.VITE_BACKEND + "/login", {
                name: user,
                password: password,
            });
            if (status.status !== 200) {
                return false;
            }
            localStorage.setItem("token", status.data.token);
            localStorage.setItem("user", user);
            setTimeout(() => {
                this.$router.push({name: "home"});
            }, 100);
        } catch (e: AxiosError | any) {
            console.log("Login catch")
            errorStore().raiseError({
                title: "Request Failed!",
                text: e?.response?.data
            })
        }

    }

    public logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.$router.push({name: "login"});
    }
}
