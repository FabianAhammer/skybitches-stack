<template>
  <v-app id="inspire">
    <app-bar></app-bar>
    <v-main class="bg-grey-darken-5">
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>

</template>

<script lang="ts">
import AppBar from "@/layouts/default/AppBar.vue";


export default {
  components: {
    AppBar
  }
}

</script>
