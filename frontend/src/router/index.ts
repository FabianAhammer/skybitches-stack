// Composables
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/default/Layout.vue"),
    children: [
      {
        path: "",
        name: "current",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import("@/views/Current.vue"),
      },
    ],
  },
  {
    path: "/page-not-found",
    name: "errorpage",
    component: () => import("@/views/NotFound.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/page-not-found",
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;