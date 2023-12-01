<template>
  <v-container class="d-flex flex-column align-center justify-space-between h-screen w-100"
               style="gap:0.5rem">
    <div class="position-absolute h-screen w-100" style="top:0" v-on:mousemove="moveDiscovery($event)">
      <div class="position-absolute h-screen w-100 login-page ">
        <div class="login-page__image background_image_carousel_before"></div>
        <div ref="nofilter" class="login-page__no-filter background_image_carousel"></div>
        <div ref="onethirdfilter" class="login-page__one_third-filter background_image_carousel"></div>
        <div ref="twothirdfilter" class="login-page__two_third-filter background_image_carousel"></div>
        <div ref="threethirdfilter" class="login-page__three_third-filter background_image_carousel"></div>
      </div>
    </div>
    <div clasS="align-self-center">

    </div>
    <v-card class="card-size">
      <div class="d-flex">
        <v-img
          class="justify-center align-center"
          width="500"
          :aspect-ratio="4.3/1"
          :cover="true"
          src="@/assets/logo.png"
        ></v-img>
      </div>
      <v-form @submit.prevent="submit">
        <v-card-text>
          <v-text-field v-model="user" label="User" type="user" :loading="loading" :rules="userRules"
                        required></v-text-field>
          <v-text-field v-model="password" label="Password" type="password" :loading="loading" :rules="passwordRules"
                        required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn block class="bg-orange-accent-3" type="submit" :loading="loading">
            <span>I am 18+ continue</span>
            <v-icon>mdi mdi-arrow-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
    <div></div>
  </v-container>
</template>

<script lang="ts">
import {useApiStore} from "@/store/app";
import {ref} from "vue";

const illustrations = import.meta.glob(
  '@/assets/bg/*.png'
)
const keys = Object.keys(illustrations);
const pngNames: string[] = [];
keys.forEach(key => {
  const name = illustrations[key].name;
  if (name) {
    pngNames.push(name);
  }
});

export default {
  setup() {
    const nofilter = ref<Element>("nofilter");
    const onethirdfilter = ref<Element>('onethirdfilter');
    const twothirdfilter = ref<Element>('twothirdfilter');
    const threethirdfilter = ref<Element>('threethirdfilter');

    return {
      nofilter,
      onethirdfilter,
      twothirdfilter,
      threethirdfilter,
    }
  },
  mounted() {
    let lastNumber = +localStorage.getItem("lastScreen");
    let nextNumber = 0;
    console.log(lastNumber);
    if (lastNumber !== null) {
      nextNumber = lastNumber + 1
      if (nextNumber > pngNames.length) {
        nextNumber = 1;
      }
    }
    localStorage.setItem("lastScreen", `${nextNumber}`);
    this.setImage(nextNumber);

  },
  data: () => ({
    user: "",
    password: "",
    loading: false,
    userRules: [
      (value: string) => {
        if (!value) {
          return "You must enter a username.";
        }
        return true;
      },
    ],
    passwordRules: [
      (value: string) => {
        if (!value) {
          return "You must enter a password.";
        }
        return true;
      },
    ],
  }),
  methods: {
    async submit(): Promise<boolean> {
      return await useApiStore().auth.login(this.user, this.password);
    },
    moveDiscovery(event: MouseEvent): void {
      this.calculateAndSetStyles(event, this.nofilter);
      this.calculateAndSetStyles(event, this.onethirdfilter);
      this.calculateAndSetStyles(event, this.twothirdfilter);
      this.calculateAndSetStyles(event, this.threethirdfilter);
    },
    calculateAndSetStyles(event: MouseEvent, element: HTMLElement): void {
      const rect = (event.target as Element).getBoundingClientRect();
      const x = event.clientX - rect.left - element.offsetWidth / 2;
      const y = event.clientY - rect.top - element.offsetWidth / 2;
      element.style.transform = `translate(${x}px,${y}px)`;
      element.style.backgroundPosition = `${-x}px ${-y}px`;
    },
    setImage(imageIndex: number) {
      const elementsByClassName = [...document.getElementsByClassName("background_image_carousel")];
      const beforeElements = [...document.getElementsByClassName("background_image_carousel_before")];
      elementsByClassName.forEach(element => {
        element.classList.add(`login-page__image__${imageIndex}`);
      });
      beforeElements.forEach(element => {
        element.classList.add(`login-page__image__${imageIndex}`);
      })
    }
  },
};
</script>

<style scoped lang="scss">
.login-page {
  overflow: hidden;

  &__image {
    z-index: -1;
    content: '';
    filter: blur(15px);
    position: absolute;
    height: 100%;
    width: 100%;
    background-size: 100vw;
    @for $i from 1 through 4 {
      &__#{$i} {
        background-image: url("@/assets/bg/#{$i}.png");
      }

      @media only screen and (max-width: 600px) {
        &__#{$i} {
          background-image: url("@/assets/mobile-bg/#{$i}.png");
        }
      }
    }
  }

  &__no-filter {
    z-index: 6;
    content: '';
    position: absolute;
    width: 240px;
    height: 240px;
    border-radius: 50%;
    pointer-events: none;
    background-size: 100vw;
    transition: opacity 1.3s ease;
    opacity: 0;
  }

  &__one_third-filter {
    z-index: 5;
    content: '';
    position: absolute;
    width: 300px;
    height: 300px;
    filter: blur(10px);
    border-radius: 50%;
    pointer-events: none;
    background-size: 100vw;
    transition: opacity 1.2s ease;
    opacity: 0;
  }

  &__two_third-filter {
    z-index: 5;
    content: '';
    position: absolute;
    width: 290px;
    height: 290px;
    filter: blur(7px);
    border-radius: 50%;
    pointer-events: none;
    background-size: 100vw;
    transition: opacity 1.1s ease;
    opacity: 0;
  }

  &__three_third-filter {
    z-index: 5;
    content: '';
    position: absolute;
    width: 280px;
    height: 280px;
    filter: blur(2px);
    border-radius: 50%;
    pointer-events: none;
    background-size: 100vw;
    transition: opacity 1s ease;
    opacity: 0;
  }

  &:hover {
    .login-page__no-filter {
      opacity: 1;
    }

    .login-page__half-filter {
      opacity: 1;
    }

    .login-page__one_third-filter {
      opacity: 1;
    }

    .login-page__two_third-filter {
      opacity: 1;
    }

    .login-page__three_third-filter {
      opacity: 1;
    }
  }
}

.card-size {
  width: 25%;
  z-index: 7;
}

@media only screen and (max-width: 600px) {
  .card-size {
    width: 75%;
  }
}
</style>
