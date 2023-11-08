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
    <v-container v-if="dailyVote?.votedLocations?.length > 0">
      <v-row>
        <v-card class="flex-fill text-center">
          <v-card-text>
            <time-line-container></time-line-container>
          </v-card-text>
        </v-card>
      </v-row>
      <v-row class="align-center">
        <v-col v-for="entry in dailyVote.votedLocations" :key="entry.locationid">
          <vote-container class="ma-3"
                          :name="entry.locationName"
                          :votes="entry.votedBy.length"
                          :userVoted="entry.votedBy.map((e) => e.name).includes(user)"
                          :isClosed="false"
                          :currentTop="getIsCurrentTop(entry.locationName)"
                          :is-daily-favourite="getIsDailyFavourite(entry.locationName)"
                          :tiedForTop="getIsTiedCurrentTop(entry.locationName)"
                          :locationId="entry.locationid"
                          :menu="entry?.menu || undefined"
                          :votedBy="entry.votedBy.map(e => e.name)"
                          @vote="userVote($event)">
          </vote-container>
        </v-col>
      </v-row>
    </v-container>
  </v-container>

</template>
<script lang="ts">
import VoteContainer from "@/components/VoteContainer.vue";
import TimeLineContainer from "@/components/TimeLineContainer.vue";
import {currentVoteStore, useApiStore, userStore} from "@/store/app";
import {DailyVoting, GeneralVoting} from "@/models/base_types";
import {storeToRefs} from "pinia";


export default {
  components: {
    VoteContainer,
    TimeLineContainer
  },
  data() {
    return {
      user: userStore().user,
      dailyVote: {} as DailyVoting,
    };
  },
  async mounted() {
    this.dailyVote = storeToRefs(currentVoteStore()).dailyVoting;
  },
  methods: {
    getIsCurrentTop(locationName: string): boolean {
      const locationVotes = this.dailyVote.votedLocations.find(
        (e) => e.locationName === locationName
      )?.votedBy.length;
      const maxVotes = Math.max(
        ...this.dailyVote.votedLocations.map((e: GeneralVoting) => e.votedBy.length)
      );

      if (this.dailyVote.votedLocations.map(e => e.votedBy.length).filter(votes => votes === maxVotes).length > 1) {
        return false;
      }
      return locationVotes === maxVotes && locationVotes > 0;
    },
    getIsTiedCurrentTop(locationName: string): boolean {
      const locationVotes = this.dailyVote.votedLocations.find(
        (e) => e.locationName === locationName
      )?.votedBy.length;
      const maxVotes = Math.max(
        ...this.dailyVote.votedLocations.map((e: GeneralVoting) => e.votedBy.length)
      );
      return locationVotes === maxVotes && locationVotes > 0 && this.dailyVote.votedLocations.map(e => e.votedBy.length).filter(votes => votes === maxVotes).length > 1;

    },

    getIsDailyFavourite(locationName: string): boolean {
      return (this.dailyVote.votedLocations.find(
        (e) => e.locationName === locationName
      )?.dailyFavourite ?? []).includes(new Date().getDay());
    },

    async userVote(locationId: string): Promise<void> {
      await useApiStore().backend.vote(locationId);
    }
  },
};


</script>

<style scoped lang="scss">
.loading-votings {
  height: 10rem;
  background: radial-gradient(circle,
    rgba(190, 113, 25, 0.213) 0%,
    rgb(58, 58, 58) 30%,
    rgb(58, 58, 58) 70%,
    rgba(38, 114, 147, 0.226) 100%);
  background-size: 200% 100%;
  filter: blur(3rem);
  animation: loading 7s linear infinite backwards;
}

@keyframes loading {
  0% {
    background-position: 0 50%;
  }

  100% {
    background-position: 200% 50%;
  }
}
</style>
