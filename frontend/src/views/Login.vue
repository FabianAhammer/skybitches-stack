<template>
  <v-container class="d-flex flex-column align-center justify-space-between h-screen w-100" style="gap:0.5rem">
    <div clasS="align-self-center">

    </div>
    <v-card class="card-size">
      <v-img
          width="500"
          :aspect-ratio="4.3/1"
          :cover="true"
          src="@/assets/logo.png"
      ></v-img>
      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-text-field v-model="user" label="User" type="user" :loading="loading" :rules="userRules"
                        required></v-text-field>
          <v-text-field v-model="password" label="Password" type="password" :loading="loading" :rules="passwordRules"
                        required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn block class="bg-orange-accent-3" type="submit" :loading="loading">
            <span>I am 18+ continue</span>
            <v-icon>mdi mdi-arrow-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
    <div></div>
  </v-container>
</template>

<script lang="ts">
import {useApiStore} from "@/store/app";

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

<style scoped>
  .card-size{
    width: 25%;
  }

   @media only screen and (max-width: 600px)  {
     .card-size{
       width: 75%;
     }
   }
</style>
