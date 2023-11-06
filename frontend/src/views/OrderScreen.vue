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
          <h2 class="text-amber-darken-1">{{ dailyOrder?.location?.name }}</h2>
        </v-card-title>
        <v-card-subtitle class="pa-5">
          <v-btn class="bg-grey-lighten-1">
            <v-icon>mdi-magnify</v-icon>
            Menu
          </v-btn>
        </v-card-subtitle>
      </v-card>
    </v-row>

    <v-row v-for="order in dailyOrder?.orders?.sort((e1,_) => e1.user === user ? -1 : 1 )" :key="order.id">
      <v-card class="flex-fill">
        <v-card-title>
          <v-avatar :color="order.user === user ? 'blue' : 'grey'" size="large">
            {{ order.user }}
          </v-avatar>
        </v-card-title>
        <v-card-subtitle v-for="(orderItem,index) of order?.orderedItems" :key="orderItem.id+index">
          <v-card :color="user === order.user ? 'blue-darken-4':'blue-grey-darken-3' "
                  class="d-flex pa-1 align-center">
            <div class="pl-2 flex-1-1 text-white text-h6">{{ orderItem.name }}</div>

            <div class="flex-1-1 text-center text-h6">{{ orderItem.price }} €</div>
            <div class="flex-1-1">
              <v-card-actions class="justify-end">
                <v-btn v-if="order.user === user" @click="add(orderItem.id)">
                  <v-icon class="text-green-accent-2">mdi-plus</v-icon>
                </v-btn>
                <v-btn v-if="order.user === user" @click="remove(orderItem.id)">
                  <v-icon class="text-red-accent-2">mdi-delete</v-icon>
                </v-btn>
                <v-btn v-if="order.user !== user" @click="add(orderItem.id)">
                  <v-icon class="text-blue-grey-lighten-2">mdi-content-copy</v-icon>
                </v-btn>
              </v-card-actions>
            </div>

          </v-card>
          <v-divider></v-divider>
        </v-card-subtitle>
        <v-card-actions>

        </v-card-actions>
      </v-card>
      <v-divider></v-divider>
    </v-row>
    <v-btn @click="testorder()">
      TEST
    </v-btn>
  </v-container>
</template>

<script lang="ts">
import {currentVoteStore, locationStore, orderStore, useApiStore, userStore} from "@/store/app";
import TimeLineContainer from "@/components/TimeLineContainer.vue";
import {mapState} from "pinia";
import {RestaurantLocation} from "@/models/base_types";

export default {
  components: {TimeLineContainer},
  data() {
    return {
      currentLocation: {} as RestaurantLocation | null,
      expansionMap: new Map()
    }
  },
  computed: {
    ...mapState(userStore, ['user']),
    ...mapState(locationStore, ['locations']),
    ...mapState(currentVoteStore, ['dailyVoting']),
    ...mapState(orderStore, ['dailyOrder']),
  },
  mounted() {
    if (this.dailyVoting && this.locations.length) {
      this.currentLocation = this.locations?.find(e => e?.id === this.dailyVoting?.winningLocation) || null;
    }
  },
  methods: {
    testorder() {
      useApiStore().backend.addOrder("testid");
    },
    remove(id: string) {
      useApiStore().backend.removeOrder(id);
    },
    add(id: string) {
      useApiStore().backend.addOrder(id);
    }
  }
}
</script>

<style scoped lang="scss">

</style>
