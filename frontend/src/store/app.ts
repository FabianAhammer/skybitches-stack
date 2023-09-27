// Utilities
import {BackendUtility} from "@/util/BackendUtility";
import {LoginUtility} from "@/util/LoginUtility";
import {defineStore, storeToRefs} from "pinia";
import {useRouter} from "vue-router";
import {SocketHandler} from "@/websocket/SocketHandler";
import {DailyVoting} from "@/models/voting";
import {watch} from "vue";

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
        dailyVoting: {} as DailyVoting | null
    }),
    actions: {
        /**
         * Subscribe is only triggered if a $patch is executed!
         *
         * @param voting daily voting
         */
        setVoting(voting: DailyVoting) {
            console.log("Setting value", voting)
            this.$patch({dailyVoting: voting});
        },
    },
    getters: {
        currentVote: (state) => state.dailyVoting
    }
})

