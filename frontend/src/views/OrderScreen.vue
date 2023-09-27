<template>
  <v-container class="flex-fill" v-if="dailyVoting && locations.length">
    <v-row>
      <v-card class="flex-fill text-center">
        <v-card-text>
          <time-line-container></time-line-container>
        </v-card-text>
      </v-card>
    </v-row>
    <v-row style="min-height: 1.5rem">
    </v-row>
    <v-row>
      <v-card class="flex-fill text-center">
        <v-card-title>
          <h2 class="text-amber-darken-1">{{ currentLocation?.name }}</h2>
        </v-card-title>
      </v-card>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {currentVoteStore, locationStore} from "@/store/app";
import TimeLineContainer from "@/components/TimeLineContainer.vue";
import {mapState} from "pinia";
import {RestaurantLocation} from "@/models/voting";

export default {
  components: {TimeLineContainer},
  data() {
    return {
      currentLocation: {} as RestaurantLocation | null
    }
  },
  computed: {
    ...mapState(currentVoteStore, ['dailyVoting']),
    ...mapState(locationStore, ['locations'])
  },
  mounted() {
    if (this.dailyVoting && this.locations.length) {
      this.currentLocation = this.locations?.find(e => e?.id === this.dailyVoting?.winningLocation) || null;
    }
  }
}
</script>

<style scoped lang="scss">

</style>
