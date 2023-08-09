// Utilities
import { BackendUtility } from "@/util/BackendUtility";
import { LoginUtility } from "@/util/LoginUtility";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { io } from 'socket.io-client'

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
    socket: io(process.env.VUE_APP_SOCKET_URL || '', { transports: ['websocket'] }),
  })
});

