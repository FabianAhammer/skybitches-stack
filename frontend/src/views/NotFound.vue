<template>
  <v-app id="inspire">
    <app-bar></app-bar>

    <v-main class="bg-grey-lighten-3">
      <v-container class="fill-height flex-column">
        <h1>Nothing here :)</h1>
        <v-spacer></v-spacer>
        <v-btn prepend-icon="mdi-arrow-left" variant="tonal" to="/"
          >Fuck go Back
        </v-btn>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import AppBar from "@/layouts/default/AppBar.vue";
</script>
