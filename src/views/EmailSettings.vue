<template>
  <div class="p-2 max-w-xl">
    <div v-if="loading">載入中...</div>
    <div v-else>
      <div
        v-for="(_value, key) in preferences"
        :key="key"
        class="flex items-center py-3"
      >
        <input type="checkbox" v-model="preferences[key]" />
        <span>{{ labels[key] }}</span>
      </div>
      <button
        @click="savePreferences"
        class="text-gray text-sm cursor-pointer bg-black/30 rounded-full px-5 py-0.5 relative top-4"
      >
        儲存設定
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const preferences = ref({
  onLogin: true,
  onLoginfail: true,
  onComment: true,
  onBookmark: true,
});

const labels = {
  onLogin: "登入成功",
  onLoginfail: "帳號登入異常",
  onComment: "貼文被留言",
  onBookmark: "貼文被收藏",
};

const loading = ref(false);

const fetchPreferences = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("尚未登入，無法載入偏好設定。");
      return; 
    }

    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/email-preferences/get`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    preferences.value = data;
  } catch (err) {
    alert("載入偏好設定失敗。");
  } finally {
    loading.value = false;
  }
};

const savePreferences = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("尚未登入，無法儲存設定。");
      return;
    }

    await axios.put(
      `${import.meta.env.VITE_API_URL}/email-preferences/update`,
      { preferences: preferences.value },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    alert("偏好設定已更新！");
  } catch (err) {
    alert("儲存失敗，請稍後再試。");
  }
};

onMounted(() => {
  fetchPreferences();
});
</script>
