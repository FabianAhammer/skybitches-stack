<template>
  <v-container class="d-flex align-center justify-center h-screen w-100">
    <v-card class="w-25">
      <v-card-title>Skybitches Login</v-card-title>
      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-text-field v-model="user" label="User" type="user" :loading="loading" :rules="userRules"
            required></v-text-field>
          <v-text-field v-model="password" label="Password" type="password" :loading="loading" :rules="passwordRules"
            required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn block color="primary" @click="dialog = true">
            Login
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
    <v-dialog v-model="dialog" width="auto">
      <v-card class="mx-auto" width="344">
        <v-img
          src="https://media0.giphy.com/media/NTur7XlVDUdqM/giphy.gif?cid=ecf05e475gdkwclmsy45mlx85o315mf0fpe48lyrge9rxqir&ep=v1_gifs_search&rid=giphy.gif"
          height="200px" cover></v-img>

        <v-card-title>
          Sike no login found!
        </v-card-title>

        <v-card-subtitle>
          Maybe we need more developers?
        </v-card-subtitle>

        <v-card-actions>
          <v-btn color="orange-lighten-2" variant="text" @click="dialog = false">
            Accept Defeat
          </v-btn>

          <v-spacer></v-spacer>

          <v-btn :icon="show ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="show = !show"></v-btn>
        </v-card-actions>

        <v-expand-transition>
          <div v-show="show">
            <v-divider></v-divider>

            <v-card-text>
              Have you really though there is more content here? Lol try going to
              https://github.com/FabianAhammer/skybitches-stack
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { useApiStore } from "@/store/app";

export default {
  data: () => ({
    dialog: false,
    show: false,
    user: "",
    password: "",
    loading: false,
    userRules: [
      (value: string) => {
        if (!value) {
          return "You must enter a username.";
        }
        return true;
      },
    ],
    passwordRules: [
      (value: string) => {
        if (!value) {
          return "You must enter a password.";
        }
        return true;
      },
    ],
  }),
  methods: {
    async submit() {
      useApiStore().auth.login(this.user, this.password);
    },
    triggerSike() {

    }
  },
};
</script>
