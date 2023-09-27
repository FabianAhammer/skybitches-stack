<template>
  <v-container v-if="dailyVote">
    <current-voting></current-voting>
    <order-screen></order-screen>
  </v-container>
</template>
<script lang="ts">
import CurrentVoting from "@/views/CurrentVoting.vue";
import OrderScreen from "@/views/OrderScreen.vue";
import {currentVoteStore, queueStore, useApiStore, userStore} from "@/store/app";
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
