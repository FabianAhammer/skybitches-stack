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
            <v-timeline direction="horizontal" side="start" size="small">
              <template v-for="(day, index) in days" :key="day">
                <v-timeline-item v-if="index < iterationOffset" :fillDot="true" dotColor="grey-darken-3" icon="mdi-check"
                  iconColor="green">
                  <p class="text-grey-darken-3">
                    {{ day.name }}
                  </p>
                  <template v-slot:opposite>
                    <p class="text-grey-darken-3">
                      {{ day.date }}
                    </p>
                  </template>

                </v-timeline-item>
                <v-timeline-item v-if="index === iterationOffset" :fillDot="false" dotColor="orange" class="pulse">
                  <p class="text-orange-lighten-1">
                    {{ day.name }}
                  </p>
                  <template v-slot:opposite>
                    <p>
                      {{ day.date }}
                    </p>
                  </template>
                </v-timeline-item>
                <v-timeline-item v-if="index > iterationOffset" :fillDot="false" dotColor="indigo">
                  <p class="text-indigo-lighten-1">
                    {{ day.name }}
                  </p>
                  <template v-slot:opposite>
                    <p class="text-grey-darken-3">
                      {{ day.date }}
                    </p>
                  </template>
                </v-timeline-item>
              </template>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-row>
      <v-row class="align-center">
        <v-col v-for="entry in dailyVote.votedLocations" :key="entry.locationid">
          <vote-container class="ma-3" :name="entry.locationName" :votes="entry.votedBy.length"
            :userVoted="entry.votedBy.map((e) => e.name).includes(user)" :isClosed="false"
            :currentTop="getIsCurrentTop(entry.locationName)" :locationId="entry.locationid"
            @vote="handleVote($event)"></vote-container>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>
<script lang="ts">
import VoteContainer from "@/components/VoteContainer.vue";
import { queueStore, useApiStore, userStore } from "@/store/app";
import { DailyVoting, GeneralVoting } from "@/models/voting";
import moment from "moment";

export default {
  components: {
    VoteContainer,
  },
  data() {
    return {
      user: userStore().user,
      dailyVote: {} as DailyVoting,
      internalVoteDay: -1 as number,
      iterationOffset: 2 as number,
      days: [] as Array<DateAndDayOfMonth>,
      dateStruct: [
        { dayOfWeek: 0, name: "Sunday" },
        { dayOfWeek: 1, name: "Monday" },
        { dayOfWeek: 2, name: "Tuesday" },
        { dayOfWeek: 3, name: "Wednesday" },
        { dayOfWeek: 4, name: "Thursday" },
        { dayOfWeek: 5, name: "Friday" },
        { dayOfWeek: 6, name: "Saturday" }
      ] as Array<DayOfMonth>
    };
  },
  async mounted() {

    this.handleVotes(await useApiStore().backend.getDailyVote());
    queueStore().socket.on("SUBSCRIBE", (message) => {
      this.handleVotes(message);
    });
  },
  methods: {
    handleVotes(dailyVote: DailyVoting): void {
      const momentDateToday: moment.Moment = moment(dailyVote.date, "YYYY-MM-DD");
      this.dailyVote = dailyVote;
      this.internalVoteDay = Number.parseFloat(momentDateToday.format("e"));
      this.days = this.generateDays(this.internalVoteDay, momentDateToday);
    },
    getIsCurrentTop(locationName: string): boolean {
      const locationVotes = this.dailyVote.votedLocations.find(
        (e) => e.locationName === locationName
      )?.votedBy.length;
      const maxVotes = Math.max(
        ...this.dailyVote.votedLocations.map((e: GeneralVoting) => e.votedBy.length)
      );
      return locationVotes === maxVotes && locationVotes > 0;
    },

    generateDays(dayToday: number, momentDate: moment.Moment): Array<DateAndDayOfMonth> {
      if (!dayToday)
        return [];
      const days: Array<DateAndDayOfMonth> = [];
      //Iterate 7 days - with preset offset (front)
      const startDay = 0 - this.iterationOffset;
      const endDay = 6 - this.iterationOffset;
      for (let i = startDay; i < endDay; i++) {
        const iterator = i + dayToday;
        const date = i < 0 ? moment(momentDate, "YYYY-MM-DD").subtract(Math.abs(i), 'days') : moment(momentDate, "YYYY-MM-DD").add(i, 'days');
        days.push({ ...this.iterationFunctionForDays(iterator), date: date.format("DD.MM.YYYY") })
      }
      return days;
    },
    iterationFunctionForDays(iterator: number): DayOfMonth {
      if (iterator < 0) {
        return this.getDayStruct(iterator + 7);
      }
      else if (iterator > 6) {
        return this.getDayStruct(iterator - 7);
      }
      else {
        return this.getDayStruct(iterator);
      }
    },
    getDayStruct(dayOfWeek: number): DayOfMonth {
      return this.dateStruct.find(e => e.dayOfWeek === dayOfWeek) || this.dateStruct[0];
    },
    async handleVote(locationId: string): Promise<void> {
      useApiStore().backend.vote(locationId);
    }
  },
};


export interface DayOfMonth {
  dayOfWeek: number;
  name: string;
}

export interface DateAndDayOfMonth extends DayOfMonth {
  date: string;
}
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
    background-position: 0% 50%;
  }

  100% {
    background-position: 200% 50%;
  }
}
</style>
../../models/voting
