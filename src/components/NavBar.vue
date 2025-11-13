<template>
  <header class="navbar-style flex items-center rounded-full px-6 py-4">
    <div class="flex-none font-bold w-7 h-7">
      <router-link to="/" class="cursor-pointer block">
        <img :src="logo" alt="Logo" />
      </router-link>
    </div>

    <nav class="flex-1 flex justify-center space-x-3 md:space-x-10 ">
      <button class="flex items-center space-x-1">
        <RouterLink to="/schedule" class="">
          <font-awesome-icon :icon="['fas', 'compass']" />
          <span class="pl-2 no-underline">探索</span>
        </RouterLink>
      </button>

      <button class="flex items-center space-x-1">
        <RouterLink to="/community">
          <font-awesome-icon :icon="['fas', 'globe']" />
          <span class="pl-2 no-underline">社群</span>
        </RouterLink>
      </button>

      <slot name="mapSearch"></slot>
    </nav>

    <div class="flex-none">
      <template v-if="!isLoggedIn">
        <RouterLink to="/signup" class="underline"
          ><font-awesome-icon :icon="['fas', 'user']"
        /></RouterLink>
      </template>

      <template v-else>
        <RouterLink to="/profile" class="flex items-center">
          <img
            :src="userAvatar || 'https://picsum.photos/32/32?random=1'"
            :alt="會員頭貼"
            class="w-8 h-8 rounded-full object-cover shadow-sm hover:scale-110 transition-transform"
            @error="$event.target.src = 'https://picsum.photos/32/32?random=1'"
          />
        </RouterLink>
      </template>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import axios from "axios";
import logo from "../assets/icons/Logo/logo.svg";

const isLoggedIn = ref(false);
const userAvatar = ref("");

const checkLoginStatus = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem("token");
        isLoggedIn.value = false;
        userAvatar.value = "";
        return;
      }

      isLoggedIn.value = true;
      const userId = payload.id || payload.userId || payload.memberId;

      if (userId) {
        fetchUserAvatar(userId);
      }
    } catch (error) {
      localStorage.removeItem("token");
      isLoggedIn.value = false;
      userAvatar.value = "";
    }
  } else {
    isLoggedIn.value = false;
    userAvatar.value = "";
  }
};

const fetchUserAvatar = async (userId) => {
  if (!userId) {
    return;
  }
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/profile`,
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    userAvatar.value =
      response.data.avatar || "https://picsum.photos/32/32?random=1";
  } catch (error) {
    userAvatar.value = "https://picsum.photos/32/32?random=1";
  }
};

const handleStorageChange = (e) => {
  if (e.key === "token") {
    checkLoginStatus();
  }
};

onMounted(() => {
  checkLoginStatus();
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener("login-status-changed", checkLoginStatus);
});

onUnmounted(() => {
  window.removeEventListener("storage", handleStorageChange);
  window.removeEventListener("login-status-changed", checkLoginStatus);
});
</script>
