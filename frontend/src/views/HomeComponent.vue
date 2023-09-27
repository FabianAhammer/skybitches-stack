<template>
  <v-container v-if="dailyVote">
    <current-voting v-if="dailyVote?.isOpen"></current-voting>
    <order-screen v-if="!dailyVote?.isOpen"></order-screen>
  </v-container>
</template>
<script lang="ts">
import CurrentVoting from "@/views/CurrentVoting.vue";
import OrderScreen from "@/views/OrderScreen.vue";
import {currentVoteStore, locationStore, queueStore, useApiStore, userStore} from "@/store/app";
import {storeToRefs} from "pinia";

export default {
  methods: {currentVoteStore},
  components: {CurrentVoting, OrderScreen},
  data() {
    return {
      user: userStore().user,
      dailyVote: null as any,
    }
  },
  async mounted() {
    this.dailyVote = await useApiStore().backend.getDailyVote();
    locationStore().setLocations(await useApiStore().backend.getLocations());
    currentVoteStore().setVoting(this.dailyVote);
    queueStore().socket.registerVoteListener((voting: MessageEvent<string>) => {
      currentVoteStore().setVoting(JSON.parse(voting.data));
    });

    this.dailyVote = storeToRefs(currentVoteStore()).dailyVoting;
  }
}

</script>

<style scoped lang="scss">

</style>
