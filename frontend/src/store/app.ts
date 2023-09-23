// Utilities
import {BackendUtility} from "@/util/BackendUtility";
import {LoginUtility} from "@/util/LoginUtility";
import {defineStore} from "pinia";
import {useRouter} from "vue-router";
import {SocketHandler} from "@/websocket/SocketHandler";
import {DailyVoting} from "@/models/voting";

export const useApiStore = defineStore("backend", {
    state: () => ({
        backend: new BackendUtility(useRouter()),
        auth: new LoginUtility(useRouter()),
    }),
});

export const userStore = defineStore("user", {
    state: () => ({
        user: localStorage.getItem("user") as string,
    }),
});

export const queueStore = defineStore("queue", {
    state: () => ({
        socket: new SocketHandler(process.env.VITE_SOCKET_URL || "ws://localhost:3000")
    })
});


export const currentVoteStore = defineStore("currentVote", {
    state: () => ({
        dailyVoting: null as DailyVoting | null
    }),
    actions: {
        setVoting(voting: DailyVoting) {
            console.log("store mutated");
            this.dailyVoting = voting;
        }
    }
})

