<template>
  <div class="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow">
    <div v-if="loading" class="text-center text-gray-500">載入中...</div>

    <div v-else-if="error" class="text-center text-red-500">
      {{ error }}
    </div>

    <div v-else>
      <h2 class="text-xl font-bold mb-2 text-center">{{ trip.title }}</h2>
      <p class="text-gray-600 text-center mb-4">
        主揪：{{ trip.ownerName }}｜你將擁有
        <span class="font-semibold">
          {{ trip.permission === "editor" ? "編輯權限" : "檢視權限" }}
        </span>
      </p>

      <div v-if="joined" class="text-green-600 text-center font-medium">
        你已是共編成員！
      </div>

      <div v-else class="flex justify-center">
        <button
          @click="acceptShare"
          class="bg-blue-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-600"
        >
          加入共編
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const token = route.query.token;

const loading = ref(true);
const error = ref("");
const trip = ref({});
const joined = ref(false);

// 取得邀請資訊
const fetchInviteInfo = async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/trip-shares/${token}/inviteInfo`,
    );
    trip.value = res.data.trip;
    joined.value = res.data.alreadyJoined;
  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 404) {
      error.value = "此連結已過期或無效";
    } else {
      error.value = "無法載入行程資訊";
    }
  } finally {
    loading.value = false;
  }
};

// 點擊加入共編
const acceptShare = async () => {
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/trip-shares/${token}/accept`,
    );
    joined.value = true;
  } catch (err) {
    if (err.response?.status === 409) {
      joined.value = true;
    } else {
      alert("加入失敗，請稍後再試");
    }
  }
};

onMounted(() => {
  fetchInviteInfo();
});
</script>
