<template>
  <v-app-bar scroll-behavior="collapse" density="compact">
    <div class="d-flex flex-fill align-center pa-5">
      <v-btn
        v-for="link in links"
        :key="link.name"
        variant="text"
        :to="link.href"
      >
        {{ link.name }}
      </v-btn>
      <v-spacer></v-spacer>
      <v-responsive max-width="260"></v-responsive>
      <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar color="blue" size="large">
              <span class="text-h5">{{ user.initials }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="brown">
                <span class="text-h5">{{ user.initials }}</span>
              </v-avatar>
              <h3>{{ user.fullName }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>
  </v-app-bar>
</template>
<script lang="ts">
export default {
  data: () => ({
    user: {
      initials: "AFA",
      fullName: "Fabian Ahammer",
      email: "fabian.ahammer@example.com",
    },
    links: [
      { name: "Today", href: "/" },
      { name: "History", href: "/history" },
    ],
  }),
};
</script>
