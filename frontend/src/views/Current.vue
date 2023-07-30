<template>
  <v-container class="flex-fill">
    <v-row class="align-center" v-if="dailyVote?.votedLocations?.length === 0">
      <v-col v-for="entry in [1, 2, 3, 4]" :key="entry">
        <v-card loading="true">
          <v-card-text>
            <div class="loading-votings"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="align-center" v-if="dailyVote?.votedLocations?.length > 0">
      <v-col v-for="entry in dailyVote.votedLocations" :key="entry.locationid">
        <vote-container
          class="ma-3"
          :name="entry.locationName"
          :votes="entry.votedBy.length"
          :userVoted="entry.votedBy.map((e) => e.name).includes(user)"
          :isClosed="false"
          :currentTop="getIsCurrentTop(entry.locationName)"
        ></vote-container>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import VoteContainer from "@/components/VoteContainer.vue";
import { useApiStore, userStore } from "@/store/app";
import { DailyVoting } from "../../../models/voting";

export default {
  components: {
    VoteContainer,
  },
  data() {
    return {
      user: userStore().user,
      dailyVote: {} as DailyVoting,
      votables: [],
    };
  },
  async mounted() {
    this.dailyVote = await useApiStore().backend.getDailyVote();
  },
  methods: {
    getIsCurrentTop(locationName: string) {
      const locationVotes = this.dailyVote.votedLocations.find(
        (e) => e.locationName === locationName
      )?.votedBy.length;

      const maxVotes = Math.max(
        ...this.dailyVote.votedLocations.map((e) => e.votedBy.length)
      );

      return locationVotes === maxVotes && locationVotes > 0;
    },
  },
};
</script>

<style scoped lang="scss">
.loading-votings {
  height: 10rem;
  background: radial-gradient(
    circle,
    rgba(190, 113, 25, 0.213) 0%,
    rgb(58, 58, 58) 30%,
    rgb(58, 58, 58) 70%,
    rgba(38, 114, 147, 0.226) 100%
  );
  background-size: 200% 100%;
  filter: blur(3rem);
  animation: loading 7s linear infinite backwards;
}

@keyframes loading {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 200% 50%;
  }
}
</style>
