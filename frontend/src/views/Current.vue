<template>
  <v-container class="flex-fill">
    <v-row class="align-center" v-if="votables.length === 0">
      <v-col v-for="entry in [1, 2, 3, 4]" :key="entry">
        <v-card loading="true">
          <v-card-text>
            <div class="loading-votings"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="align-center" v-if="votables.length > 0">
      <v-col v-for="entry in votables" :key="entry.name">
        <vote-container
          class="ma-3"
          :name="entry.name"
          :votes="entry.votes"
          :userVoted="entry.userVoted"
          :isClosed="entry.isClosed"
          :currentTop="
            entry.votes ===
            votables.reduce((a, b) => (a.votes > b.votes ? a : b)).votes
          "
        ></vote-container>
      </v-col>
    </v-row>
  </v-container>
</template>
<script lang="ts">
import VoteContainer from "@/components/VoteContainer.vue";
import { DailyVoting } from "../../../models/voting";
import Axios from "axios";

export default {
  components: {
    VoteContainer,
  },
  data() {
    return {
      dailyVote: {} as DailyVoting,
      votables: [],
    };
  },
  mounted() {
    Axios.get("http://localhost:3000/api/votes/today").then((response) => {
      this.dailyVote = response.data;
    });
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
