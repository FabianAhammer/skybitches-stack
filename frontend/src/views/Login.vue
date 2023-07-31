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
          <v-btn block color="primary" type="submit" :loading="loading">
            Login
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { useApiStore } from "@/store/app";

export default {
  data: () => ({
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
  },
};
</script>
