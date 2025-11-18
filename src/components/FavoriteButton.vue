<template>
  <button
    @click="toggleFavorite"
    :disabled="isLoading"
    class="favorite-btn bg-red-700"
    :class="{ favorited: isFavorited }"
  >
    {{ isFavorited ? "❤️" : "🤍" }}
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const props = defineProps({
  postId: {
    type: Number,
    required: true,
  },
  memberId: {
    type: Number,
    required: true,
  },
  favoriteCount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["favorite-toggled"]);

const isFavorited = ref(false);
const isLoading = ref(false);

const checkFavoriteStatus = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token || !props.memberId) return; 

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/favorites/check/${props.postId}/${props.memberId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    isFavorited.value = response.data.isFavorited;
    console.log("後端查看通過");
  } catch (error) {
    console.error("檢查收藏狀態失敗", error);
  }
};

const toggleFavorite = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("請先登入");
    router.push("/login");
    return; 
  }

  isLoading.value = true;
  try {
    if (isFavorited.value) {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/favorites/${props.postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { memberId: props.memberId },
        },
      );
      isFavorited.value = false;
      console.log("已取消收藏");

      emit("favorite-toggled", {
        postId: props.postId,
        favoriteCount: Math.max(0, props.favoriteCount - 1),
      });
    } else {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/favorites`,
        {
          postId: props.postId,
          memberId: props.memberId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      isFavorited.value = true;
      console.log("已加入收藏");

      emit("favorite-toggled", {
        postId: props.postId,
        favoriteCount: props.favoriteCount + 1,
      });
    }
  } catch (error) {
    console.error("切換收藏狀態失敗", error);
    if (error.response?.status === 401) {
      alert("請先登入");
      router.push("/login");
    } else {
      alert("操作失敗，請稍後再試");
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkFavoriteStatus();
});

watch(
  () => props.memberId,
  (newVal, oldVal) => {
    if (newVal !== oldVal && newVal) {
      checkFavoriteStatus();
    }
  },
);
</script>

<style scoped>
.favorite-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}

.favorite-btn:hover {
  transform: scale(1.1);
}

.favorite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
