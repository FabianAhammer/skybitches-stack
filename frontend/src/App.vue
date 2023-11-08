<template>
  <router-view/>
  <v-snackbar class="snackbar" :timeout="timeout+timeout/100" v-model="errorVisible">
    <v-alert close-label="Close Alert" color="error" icon="$error" :title="uiError?.text">
    </v-alert>
    <v-progress-linear :model-value="progress"></v-progress-linear>
  </v-snackbar>
</template>

<script lang="ts">

import {errorStore} from "@/store/app";
import {UiError} from "@/models/base_types";

export default {
  data() {
    return {
      errorVisible: false as boolean,
      uiError: {} as UiError,
      timeout: 3000,
      timer: 0,
      progress: 0,
      currentInterval: null as any,
    };
  },
  mounted() {
    errorStore().$subscribe((_, state) => {
      this.errorSub(state.error);
    })
  },
  methods: {
    errorSub(error: UiError) {
      if (this.currentInterval !== null) {
        clearInterval(this.currentInterval);
        this.currentInterval = null;
      }
      this.uiError = error;
      this.errorVisible = true;
      this.timer = 0;
      this.progress = 0;
      const spacer = this.timeout / 100;
      this.currentInterval = setInterval(() => {
        if (this.timer === this.timeout + spacer) {
          clearInterval(this.currentInterval);
          this.currentInterval = null;
        } else {
          this.timer += spacer
        }
        this.progress = this.timer / this.timeout * 100;
      }, spacer);

    },
  }
}
</script>

<style>
.v-snackbar__content {
  padding: 0 !important;
}
</style>
