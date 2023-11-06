<template>
  <v-timeline direction="horizontal" side="start" size="small" v-if="dailyVoting">
    <template v-for="(day, index) in days" :key="day">
      <v-timeline-item v-if="index < iterationOffset" :fillDot="true" dotColor="grey-darken-3"
                       icon="mdi-check"
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
</template>

<script lang="ts">
import moment from "moment/moment";
import {currentVoteStore} from "@/store/app";
import {DailyVoting} from "@/models/base_types";

export default {
  data() {
    return {
      dailyVoting: null as unknown as DailyVoting,
      days: [] as Array<DateAndDayOfMonth>,
      iterationOffset: 2 as number,
      dateStruct: [
        {dayOfWeek: 0, name: "Sunday"},
        {dayOfWeek: 1, name: "Monday"},
        {dayOfWeek: 2, name: "Tuesday"},
        {dayOfWeek: 3, name: "Wednesday"},
        {dayOfWeek: 4, name: "Thursday"},
        {dayOfWeek: 5, name: "Friday"},
        {dayOfWeek: 6, name: "Saturday"}
      ] as Array<DayOfMonth>
    }
  },
  computed: {
    // ...mapState(currentVoteStore, ['dailyVoting'])
  },
  mounted() {
    this.changeOfVote(currentVoteStore().dailyVoting);
    currentVoteStore().$subscribe((_, state) => {
      this.changeOfVote(state?.dailyVoting);
    })
  },
  methods: {
    changeOfVote(state: DailyVoting | null): void {
      if (!state) {
        return;
      }
      const momentDateToday: moment.Moment = moment(state?.date, "YYYY-MM-DD");
      const internalVoteDay = Number.parseFloat(momentDateToday.format("e")) ?? -1;
      this.days = this.generateDays(internalVoteDay, momentDateToday);
      this.dailyVoting = state;
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
        days.push({...this.iterationFunctionForDays(iterator), date: date.format("DD.MM.YYYY")})
      }
      return days;
    },
    iterationFunctionForDays(iterator
                                 :
                                 number
    ):
        DayOfMonth {
      if (iterator < 0) {
        return this.getDayStruct(iterator + 7);
      } else if (iterator > 6) {
        return this.getDayStruct(iterator - 7);
      } else {
        return this.getDayStruct(iterator);
      }
    }
    ,
    getDayStruct(dayOfWeek
                     :
                     number
    ):
        DayOfMonth {
      return this.dateStruct.find(e => e.dayOfWeek === dayOfWeek) || this.dateStruct[0];
    }
    ,
  }
}

export interface DayOfMonth {
  dayOfWeek: number;
  name: string;
}

export interface DateAndDayOfMonth extends DayOfMonth {
  date: string;
}
</script>
<style scoped lang="scss">

</style>
