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
        <v-card-title class="d-flex align-center justify-space-between" style="gap:3rem">
          <v-btn variant="flat" class="bg-orange-darken-1" :disabled="!wonGeneralVoting?.menu"
                 @click="menuDialogue = true">
            <v-icon icon="mdi mdi-menu"></v-icon>
            Menu
          </v-btn>
          <h2 class="text-grey-lighten-1">{{ wonGeneralVoting?.locationName }}</h2>
          <div>
            {{
              (dailyOrder?.orders?.reduce((p1, p2) => p1 + p2?.orderedItems?.reduce((e1, e2) => e1 + e2.price, 0), 0) ?? 0)?.toFixed(2)
            }}
            €
          </div>
        </v-card-title>

        <v-dialog width="auto" v-model="menuDialogue">
          <v-card>
            <v-card-title class="text-h4 text-center align-center position-sticky bg-grey-darken-4" style="top:0">
              {{ wonGeneralVoting?.menu?.restaurant }}
            </v-card-title>
            <div class="d-flex flex-fill pa-2 align-center" :class="index % 2 == 1 ? 'bg-grey-darken-4' : ''"
                 v-for="(item,index) in wonGeneralVoting?.menu?.menuItems" :key="index">
              <v-card-text class="w-75 text-h7">
                {{ item.name }}
              </v-card-text>
              <v-card-text class="w-25 text-grey-lighten-1 align-center text-end">
                {{ item.price.toFixed(2) }}€
              </v-card-text>

              <v-card-text class="w-10 text-grey-lighten-1 text-center">
                <v-btn :disabled="!currentOrderingsDisplayed?.isOpen" size="32" icon="mdi mdi-plus"
                       class="bg-orange-darken-1"
                       @click="add(item)"></v-btn>
              </v-card-text>
            </div>

          </v-card>
          <v-btn
            text="Close"
            class="bg-orange-darken-2"
            @click="menuDialogue = false"
          >
          </v-btn>
        </v-dialog>
      </v-card>
    </v-row>
    <v-row class="pa-2 d-flex justify-center">
      <v-btn @click="closeOrders()" :disabled="!currentOrderingsDisplayed?.isOpen">
        <v-icon>mdi mdi-lock</v-icon>
        close orders
      </v-btn>
    </v-row>
    <v-container class="grid">
      <v-card
        v-for="order in dailyOrder?.orders?.sort((e1,_) => e1.user === user ? -1 : 1 ).filter(e => e.orderedItems.length > 0)"
        :key="order.id" class="ma-2 w-100">
        <v-card-title>
          <div class="d-flex w-100">
            <v-avatar :color="order.user === user ? 'blue' : 'grey'" size="large">
              {{ order.user }}
            </v-avatar>
            <div class="d-flex flex-fill justify-end align-center w-100"> {{ order.user }}</div>
          </div>
        </v-card-title>
        <div v-for="(orderItem,index) of order?.orderedItems" :key="orderItem.id+index">
          <div class="flex-fill d-flex ">
            <v-card-text class="w-75 text-h7">
              {{ orderItem.name }}
            </v-card-text>
            <v-card-text class="w-25 d-flex text-grey-lighten-1 align-center justify-center text-end">
              {{ orderItem.price.toFixed(2) }}€
            </v-card-text>
            <v-card-text class="d-flex align-center justify-center w-25">
              <v-btn variant="plain" density="compact" v-if="order.user === user && currentOrderingsDisplayed?.isOpen"
                     @click="remove(orderItem)">
                <v-icon class="text-red-accent-2">mdi-delete</v-icon>
              </v-btn>
              <v-btn variant="plain" density="compact" v-if="order.user !== user && currentOrderingsDisplayed?.isOpen"
                     @click="add(orderItem)">
                <v-icon class="text-blue-grey-lighten-2">mdi-content-copy</v-icon>
              </v-btn>
            </v-card-text>
          </div>
        </div>
        <v-card-subtitle style="border-top:1px dashed grey;" class="d-flex pa-3">
          <v-form :disabled="order.user !== user || !currentOrderingsDisplayed?.isOpen" v-model="validVoucherApply"
                  class="w-100 d-flex">
            <v-text-field
              v-if="order.user === user && currentOrderingsDisplayed?.isOpen"
              class="w-100"
              v-model=" voucher "
              :placeholder="(order.voucher??0)+'€'"
              type="text"
              label="Gutschein"
              :rules="voucherRules"
              append-inner-icon="mdi mdi-currency-eur"
            ></v-text-field>
            <div v-if="order.user !== user || !currentOrderingsDisplayed?.isOpen" class="flex-fill d-flex">
              <v-card-text class="w-75 text-h7">
                Gutschein
              </v-card-text>
              <v-card-text class="w-25 d-flex text-green-lighten-1 align-center justify-center text-end">
                - {{ order.voucher.toFixed(2) }}€
              </v-card-text>

              <v-card-text class="d-flex align-center justify-center w-25">
              </v-card-text>
            </div>
            <v-btn v-if="order.user === user && currentOrderingsDisplayed?.isOpen" icon="mdi mdi-check" variant="text"
                   class="text-green-accent-1"
                   @click="applyVoucher()"
                   :disabled="!validVoucherApply">
            </v-btn>
          </v-form>
        </v-card-subtitle>
        <v-card-subtitle style="border-top:1px dashed grey; padding:  1rem 0"
                         class="d-flex pa-3">
          <v-card-text class="w-75 text-h7">
            Summe
          </v-card-text>
          <v-card-text class="w-25 d-flex font-weight-bold align-center justify-center text-end">
            {{ (order.orderedItems.reduce((e1, e2) => e1 + e2.price, 0) - (order?.voucher ?? 0)).toFixed(2) }} €
          </v-card-text>
          <v-card-text class="d-flex align-center justify-center w-25">
          </v-card-text>
        </v-card-subtitle>
      </v-card>
    </v-container>
  </v-container>

</template>

<script lang="ts">
import {currentVoteStore, locationStore, orderStore, useApiStore, userStore} from "@/store/app";
import TimeLineContainer from "@/components/TimeLineContainer.vue";
import {mapState} from "pinia";
import {DailyOrder, GeneralVoting, MenuItem, OrderItem, RestaurantLocation} from "@/models/base_types";

export default {
  components: {TimeLineContainer},
  data() {
    return {
      validVoucherApply: false,
      disable: false,
      voucher: null as unknown as string,
      currentLocation: {} as RestaurantLocation | null,
      wonGeneralVoting: {} as GeneralVoting | null,
      expansionMap: new Map(),
      menuDialogue: false,
      currentOrderingsDisplayed: null as unknown as DailyOrder,
      voucherRules: [
        (value: string) => {
          if (value === "") {
            return true;
          }
          if (Number.isNaN(Number.parseFloat(value))) {
            return "Must be number"
          }
          return true;
        }
      ]
    }
  },
  computed: {
    ...mapState(userStore, ['user']),
    ...mapState(locationStore, ['locations']),
    ...mapState(currentVoteStore, ['dailyVoting']),
    ...mapState(orderStore, ['dailyOrder']),
  },
  mounted() {
    currentVoteStore().$subscribe(() => {
      this.loadData();
    })
    this.loadData();


    this.loadDailyOrder();
    orderStore().$subscribe(() => {
      this.loadDailyOrder();
    });
  },
  methods: {
    loadData() {
      if (this.dailyVoting && this.locations.length) {
        this.currentLocation = this.locations?.find(e => e?.id === this.dailyVoting?.winningLocation) || null;
        this.wonGeneralVoting = this.dailyVoting.votedLocations.find(e => e?.locationid === this.dailyVoting?.winningLocation) || null;
        this.currentOrderingsDisplayed = this.dailyOrder;
      }
    },
    loadDailyOrder() {
      this.currentOrderingsDisplayed = this.dailyOrder;
    },
    closeOrders() {
      useApiStore().backend.closeOrders();
    },
    remove(orderItem: OrderItem) {
      useApiStore().backend.removeOrder(orderItem);
    },
    add(item: MenuItem) {
      useApiStore().backend.addOrder(item);
    },
    applyVoucher() {
      useApiStore().backend.addVoucher(this.voucher);
    }
  }
}
</script>

<style scoped lang="scss">

.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
</style>
