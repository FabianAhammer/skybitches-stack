// Utilities
import { BackendUtility } from "@/util/BackendUtility";
import { LoginUtility } from "@/util/LoginUtility";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";

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
