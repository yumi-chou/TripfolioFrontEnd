<template>
  <div class="homepage-bg min-h-screen relative">
    <div class="md:w-1/2 py-5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-black/45 shadow-2xl ">
      <h2 class="text-lg font-bold mb-8 text-center text-white">註冊</h2>
      <div v-if="showError" class="space-y-2 w-[300px] mx-auto">
        <div
          v-for="(msg, index) in errorMessages"
          :key="index"
          class="flex items-start bg-red-100 text-red-800 border border-red-200 px-4 py-3 rounded-md text-sm mb-3"
        >
          <font-awesome-icon
            icon="exclamation-triangle"
            class="mr-2 mt-0.5 text-red-600"
          />
          <span>{{ msg }}</span>
        </div>
      </div>

      <div
        v-if="showSuccess"
        class="w-[300px] mx-auto bg-blue-100 text-black border border-blue-200 px-4 py-3 rounded-md mb-4"
      >
        {{ successMessage }}
      </div>

      <form
        class="space-y-6 flex flex-col justify-center items-center px-2"
        @submit.prevent="signUp"
      >
        <input
          v-model="name"
          placeholder="該怎麼稱呼您"
          class="mb-5 block w-[300px] text-white rounded-md border border-gray-300 shadow-sm p-2"
        />
        <input
          v-model="email"
          type="email"
          placeholder="請輸入電子郵件"
          class="mb-5 block w-[300px] text-white rounded-md border border-gray-300 shadow-sm p-2"
        />
        <input
          v-model="password"
          type="password"
          placeholder="請輸入密碼"
          class="mb-5 block w-[300px] text-white  rounded-md border border-gray-300 shadow-sm p-2"
        />

        <div class="flex justify-center gap-6 mt-4">

          <!-- Google 註冊/登入按鈕 -->
          <!-- <button
            type="button"
            @click="handleGoogleLogin"
            class="p-[10px] border border-[#fff]  rounded-full  text-[14px] flex items-center justify-center gap-2 hover:bg-white/30 w-full"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" class="w-5 h-5 "/>
            <span class="text-white px-0.5">使用 Google 註冊</span>
          </button> -->

          <button
            type="submit"
            class="w-[100px] bg-black/50 text-white py-2 rounded-full transition mx-auto cursor-pointer  hover:bg-white/30"
          >
            註冊
          </button>

        </div>


        <RouterLink to="/login">
          <button
            class="text-[#4d4d4d] py-2 transition hover:text-[#ffffff]"
          >
            已有帳號？登入
          </button>
        </RouterLink>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from "vue-router";
import axios from "axios";

const name = ref("");
const email = ref("");
const password = ref("");

const router = useRouter();
const TOKEN_NAME = 'token';

const showError = ref(false);
const errorMessages = ref([]);

const showSuccess = ref(false);
const successMessage = ref("");

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/signup`;

const clearText = () => {
  email.value = "";
  password.value = "";
  name.value = "";
};

const signUp = async () => {
  showError.value = false;
  errorMessages.value = [];
  showSuccess.value = false;
  successMessage.value = "";

  try {
    const response = await axios.post(API_BASE_URL, {
      email: email.value,
      password: password.value,
      name: name.value,
    });

    clearText();
    showSuccess.value = true;
    successMessage.value = response.data.message;

    setTimeout(() => {
      showSuccess.value = false;
      router.push("/login");
    }, 2000);
  } catch (err) {
    showError.value = true;
    if (Array.isArray(err.response?.data?.errors)) {
      errorMessages.value = err.response.data.errors;
    } else {
      errorMessages.value = ["註冊失敗，請稍後重試"];
    }
  }
};

const handleGoogleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
};

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const googleToken = urlParams.get('token');

  if (googleToken) {
    localStorage.setItem(TOKEN_NAME, googleToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${googleToken}`;
    router.replace('/');
  }
});

</script>
