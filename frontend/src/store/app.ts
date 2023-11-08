// Utilities
import {BackendUtility} from "@/util/BackendUtility";
import {LoginUtility} from "@/util/LoginUtility";
import {defineStore} from "pinia";
import {useRouter} from "vue-router";
import {SocketHandler} from "@/websocket/SocketHandler";
import {DailyOrder, DailyVoting, RestaurantLocation, UiError} from "@/models/base_types";

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
        // Subscribe is only triggered if a $patch is executed!
        setVoting(voting: DailyVoting) {
            this.$patch({dailyVoting: voting});
        },
    },
})


export const locationStore = defineStore("location", {
    state: () => ({
        locations: [] as RestaurantLocation[]
    }),
    actions: {
        // Subscribe is only triggered if a $patch is executed!
        setLocations(locations: RestaurantLocation[]) {
            this.$patch({locations: locations});
        },
    },
})

export const orderStore = defineStore("currentOrder", {
    state: () => ({
        dailyOrder: {} as DailyOrder
    }),
    actions: {
        setOrders(order: DailyOrder) {
            this.$patch({dailyOrder: order});
        },
    }
})

export const errorStore = defineStore("errorStore", {
    state: () => ({
        error: {} as UiError
    }),
    actions: {
        raiseError(error: UiError) {
            this.$patch({error});
        }
    }
})
