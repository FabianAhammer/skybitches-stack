<template>
  <current-voting v-if="dailyVote?.isOpen"></current-voting>
</template>
<script lang="ts">
import CurrentVoting from "@/views/CurrentVoting.vue";
import {currentVoteStore, queueStore, useApiStore, userStore} from "@/store/app";
import {DailyVoting} from "@/models/voting";
import {storeToRefs} from "pinia";
import {Ref} from "vue";

export default {
  methods: {currentVoteStore},
  components: {CurrentVoting},
  data() {
    return {
      user: userStore().user,
      dailyVote: null as Ref<DailyVoting> | null,
    }
  },
  async mounted() {
    currentVoteStore().setVoting(await useApiStore().backend.getDailyVote());
    queueStore().socket.registerVoteListener((voting: MessageEvent<string>) => {
      currentVoteStore().setVoting(JSON.parse(voting.data));
    });

    this.dailyVote = storeToRefs(currentVoteStore()).dailyVoting;
  }
}
</script>

<style scoped lang="scss">

</style>
