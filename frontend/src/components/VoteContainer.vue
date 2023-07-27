<template>
  <v-card :disabled="isClosed">
    <div class="d-flex flex-fill justify-end">
      <div class="vote-container__flair bg-orange-darken-2" v-if="currentTop">
        Top
      </div>
      <div
        class="vote-container__flair bg-red-darken-4 text-grey-lighten-2"
        v-if="isClosed"
      >
        Closed
      </div>
    </div>
    <v-card-text>
      <div class="mx-auto text-center">
        <h2>{{ name }}</h2>
        <v-divider class="my-3"></v-divider>
        <h1>{{ votes }}</h1>
        <v-divider class="my-3"></v-divider>
        <v-btn rounded variant="text"> Menu </v-btn>
        <v-divider class="my-3"></v-divider>
        <v-btn
          v-if="!isClosed"
          :class="userVoted ? 'bg-red-darken-3' : 'bg-green-darken-2'"
          rounded
          variant="elevated"
        >
          {{ userVoted ? "Unvote" : "Vote" }}
        </v-btn>
        <v-btn
          v-if="isClosed"
          class="bg-grey-darken-2"
          rounded
          variant="elevated"
        >
          Closed
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
export default {
  props: {
    name: String,
    votes: Number,
    userVoted: Boolean,
    votedBy: Array<String>,
    currentTop: Boolean,
    isClosed: Boolean,
  },
};
</script>

<style scoped lang="scss">
.vote-container {
  &__flair {
    --width: 7rem;
    width: var(--width);
    padding-left: 0.5rem;
    text-align: center;
    align-self: flex-end;
    align-items: flex-end;
    transform: rotateZ(35deg) translate(calc(var(--width) / 6));
    &--top-voted {
      background: rgb(186, 161, 0);
    }
    &--best-of-day {
      background: rgb(103, 7, 144);
    }
    &--closed {
      background: rgba(255, 0, 0, 0.73);
    }
  }
}
</style>
