<template>
  <v-card :disabled="isClosed" :class="{'vote-container__user_voted': userVoted}">
    <div class="d-flex flex-fill justify-end vote-container__flair_header">
      <div class="vote-container__flair bg-orange-darken-2" v-if="currentTop">
        Top
      </div>
      <div class="vote-container__flair bg-blue-darken-2" v-if="tiedForTop">
        Tied
      </div>
      <div class="vote-container__flair bg-red-darken-4 text-grey-lighten-2" v-if="isClosed">
        Closed
      </div>
    </div>
    <v-card-text>
      <div class="mx-auto text-center">
        <h2>{{ name }}</h2>
        <v-divider class="my-3"></v-divider>
        <div class="d-flex justify-space-between">
          <div class="vote-container-voted-bar-entry"></div>
          <h1 class="vote-container-voted-bar-entry">{{ votes }}</h1>
          <div class="vote-container-voted-bar-entry d-flex justify-end">
            <div v-for="(user,index) in votedBy" :key="index" class="vote-container-voted-bar-entry--merging">
              <v-avatar color="deep-orange" size="small">
                <span>{{ user }}</span>
              </v-avatar>
            </div>
          </div>
        </div>
        <v-divider class="my-3"></v-divider>
        <v-btn rounded variant="text"> Menu</v-btn>
        <v-divider class="my-3"></v-divider>
        <v-btn v-if="!isClosed" :class="userVoted ? 'bg-red-darken-3' : 'bg-green-darken-2'" rounded variant="elevated"
               @click="$emit('vote', locationId)">
          {{ userVoted ? "Unvote" : "Vote" }}
        </v-btn>
        <v-btn v-if="isClosed" class="bg-grey-darken-2" rounded variant="elevated">
          Closed
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>
<script lang="ts">
export default {
  data() {
    return {
      // testUsers: [
      //   "AFA",
      //   "AFA",
      //   "AFA",
      //   "AFA",
      // ]
    }
  },
  props: {
    name: String,
    votes: Number,
    userVoted: Boolean,
    votedBy: Array<String>,
    currentTop: Boolean,
    tiedForTop: Boolean,
    isClosed: Boolean,
    locationId: String,
  },
  emits: ["vote"],
  methods: {
    // getRandomColor(): string {
    //   switch (Math.floor(Math.random() * 10)) {
    //     case 0:
    //       return "red";
    //     case 1:
    //       return "green";
    //     case 2:
    //       return "pink";
    //     case 3:
    //       return "purple";
    //     case 4:
    //       return "indigo";
    //     case 5:
    //       return "deep-purple";
    //     case 6:
    //       return "light-green";
    //     case 7:
    //       return "amber";
    //     case 8:
    //       return "orange";
    //     case 9:
    //       return "blue-grey";
    //     default:
    //       return "blue";
    //   }
    // }
  }
};
</script>

<style scoped lang="scss">

.vote-container-voted-bar-entry {
  overflow: hidden !important;
  flex: 1;

  &--merging {
    min-width: 10px;
  }
}

.vote-container {
  &__user_voted {
    box-shadow: 0 0 7px 5px rgba(29, 172, 66, 0.5) !important;
  }

  &__flair_header {
    height: 1.5rem;
  }

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
