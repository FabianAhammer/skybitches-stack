<template>
  <v-container class="flex-fill" v-if="dailyVoting">
    <v-row>
      <v-card class="flex-fill text-center">
        <v-card-text>
          <time-line-container></time-line-container>
        </v-card-text>
      </v-card>
    </v-row>
    <v-spacer></v-spacer>
    <v-row>
      <v-card class="flex-fill text-center">
        <v-card-title>Today: {{ dailyVoting.winningLocation }}</v-card-title>
      </v-card>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {currentVoteStore} from "@/store/app";
import TimeLineContainer from "@/components/TimeLineContainer.vue";
import {mapState} from "pinia";

export default {
  components: {TimeLineContainer},
  computed: {
    ...mapState(currentVoteStore, ['dailyVoting'])
  }
}
</script>

<style scoped lang="scss">

</style>
