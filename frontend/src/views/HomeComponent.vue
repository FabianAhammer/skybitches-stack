<template>
  <v-container v-if="dailyVote">
    <current-voting v-if="dailyVote?.isOpen"></current-voting>
    <order-screen v-if="!dailyVote?.isOpen"></order-screen>
  </v-container>
</template>
<script lang="ts">
import CurrentVoting from "@/views/CurrentVoting.vue";
import OrderScreen from "@/views/OrderScreen.vue";
import {currentVoteStore, locationStore, orderStore, queueStore, useApiStore, userStore} from "@/store/app";
import {storeToRefs} from "pinia";
import {DailyOrder, DailyVoting, Order, VotingUser} from "@/models/voting";

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
    orderStore().setOrders(await useApiStore().backend.getOrders());
    currentVoteStore().setVoting(this.dailyVote);
    queueStore().socket.registerWebSocketMessageListener((message: MessageEvent<string>) => {
      const parseObject: {
        voting?: DailyVoting,
        orders?: DailyOrder
      } = JSON.parse(message.data);
      if (parseObject?.voting != undefined) {
        currentVoteStore().setVoting(parseObject.voting);
      } else if (parseObject?.orders != undefined) {
        orderStore().setOrders(parseObject.orders);
      }
    });

    this.dailyVote = storeToRefs(currentVoteStore()).dailyVoting;
  }
}

</script>

<style scoped lang="scss">

</style>
