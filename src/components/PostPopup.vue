<template>
  <div class="popup-overlay " @click.self="close">
    <div
      class="popup-content relative w-[90vw] max-w-[1100px] h-[85vh]
             rounded-2xl bg-black/40 flex flex-col overflow-hidden"
    >
      <!-- 上半部：圖片＋文字＋留言，一起捲動 -->
      <div class="flex-1 overflow-y-auto">
        <div class="flex flex-col md:flex-row h-full">
          <!-- 左側圖片 -->
          <div
            class="w-full md:w-[55%] h-64 md:h-full flex-shrink-0
                   overflow-hidden rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
          >
            <img
              :src="
                localPost.coverURL ||
                localPost.imageUrl ||
                'https://picsum.photos/400/400?random'
              "
              alt="貼文照片"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- 右側內容 -->
          <div class="post-info w-full md:w-[45%] flex flex-col">
            <!-- 貼文標頭 -->
            <div class="post-header h-15 flex justify-between items-center px-4 mt-2">
              <div class="flex items-center flex-1">
                <img
                  :src="
                    authorAvatar ||
                    localPost.authorAvatar ||
                    'https://picsum.photos/40/40?random=1'
                  "
                  class="avatar w-10 h-10 rounded-full mr-3"
                  @error="
                    $event.target.src = 'https://picsum.photos/40/40?random=1'
                  "
                />
                <div>
                  <div class="font-semibold">
                    {{ localPost.authorName || "匿名使用者" }}
                  </div>
                  <div class="text-sm">
                    {{ scheduleTitle || "行程已刪除 ಥ_ಥ" }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 貼文內容＋留言 捲 -->
            <div class="flex-1 flex flex-col overflow-hidden">
              <div class="post-body p-4 border-b">
                <p class="break-words whitespace-pre-wrap">
                  {{ localPost.content || "沒有內容" }}
                </p>
              </div>

              <CommentSection
                :post="localPost"
                ref="commentSectionRef"
                @comment-added="handleCommentUpdate"
                class="flex-1"
              />
            </div>

            <!-- 桌機版-->
            <div class="hidden md:flex border-t px-4 py-3 items-center gap-3">
              <AddComment
                :isSubmitting="isSubmitting"
                @submit="submitComment"
                class="flex-1 mt-0"
              />
              <FavoriteButton
                :postId="localPost.postId"
                :memberId="getCurrentUserId()"
                :favoriteCount="localPost.favoriteCount"
                @favorite-toggled="handleFavoriteToggle"
                class="shrink-0 mt-3"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ 手機版：固定在整張卡片底部 -->
      <div class="border-t px-4 py-3 flex items-center gap-2 md:hidden">
        <AddComment
          :isSubmitting="isSubmitting"
          @submit="submitComment"
          class="flex-1 mt-0"
        />
        <FavoriteButton
          :postId="localPost.postId"
          :memberId="getCurrentUserId()"
          :favoriteCount="localPost.favoriteCount"
          @favorite-toggled="handleFavoriteToggle"
          class="shrink-0 mt-3"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from 'vue-router'
import axios from "axios";
import CommentSection from "../components/CommentSection.vue";
import FavoriteButton from "../components/FavoriteButton.vue";
import AddComment from "../components/AddComment.vue";

const isSubmitting = ref(false);            // 給 AddComment 用
const commentSectionRef = ref(null); 
const router = useRouter()

const props = defineProps({
  post: {
    type: Object,
    default: () => ({
      imageUrl: "",
      authorName: "",
      authorAvatar: "",
      content: "",
    }),
  },
  isVisible: {
    type: Boolean,
    default: false,
  },
  scheduleId: Number
});

const emit = defineEmits(["close", "update-post"]);

const scheduleTitle = ref("未命名行程");
const authorAvatar = ref("");

// 本地 post 狀態，會隨著操作而更新
const localPost = ref({ ...props.post });

const close = () => {
  emit("close");
};

const toTravelPage = () => {
  console.log("跳轉到行程頁面");
  router.push({ name: 'scheduledetail', params: { id: props.scheduleId } })
};

// 獲取行程 title
const fetchScheduleTitle = async () => {
  if (props.post.title) {
    try {
      // const res = await axios.get(
      //   `${import.meta.env.VITE_API_URL}/travelSchedule/${props.post.title}`,
      //   {
      //     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      //   },
      // );

      scheduleTitle.value = props.post.title || "未命名行程";
    } catch (error) {
      scheduleTitle.value = props.post.title;
    }
  } else {
    scheduleTitle.value = "行程已刪除 ಥ_ಥ";
  }
};

// 格式化時間
const formatTime = (timeString) => {
  if (!timeString) return "";
  const date = new Date(timeString);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "剛剛";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分鐘前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小時前`;

  return date.toLocaleDateString("zh-TW");
};

const refreshPost = async () => {
  try {
    // 嘗試獲取最新的貼文資訊
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/allposts/${props.post.postId}`,
    );

    // 通知父組件更新列表中顯示的計數
    emit("update-post", res.data.post || res.data);
  } catch (error) {
    console.error("更新貼文資訊失敗，嘗試手動更新計數", error);

    // 如果 API 端點不存在，我們可以手動更新計數
    // 這裡可以根據實際情況調整
    const updatedPost = {
      postId: props.post.postId,
      commentCount: props.post.commentCount,
      favoriteCount: props.post.favoriteCount,
    };
    emit("update-post", updatedPost);
  }
};

const getCurrentUserId = () => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id || payload.userId || payload.memberId || null;
    } catch (error) {
      return null;
    }
  }
  return null;
};

const handleFavoriteToggle = (favoriteData) => {
  // 更新本地計數
  if (favoriteData && favoriteData.postId === localPost.value.postId) {
    // 更新本地狀態
    localPost.value = {
      ...localPost.value,
      favoriteCount: favoriteData.favoriteCount,
    };

    // 通知父組件更新
    emit("update-post", localPost.value);

    console.log(`收藏計數更新: ${favoriteData.favoriteCount}`);
  }
};

const submitComment = async (commentText) => {
  if (!commentText.trim()) return;
  isSubmitting.value = true;

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/post/${localPost.value.postId}/comments`,
      {
        content: commentText,
        memberId: getCurrentUserId(),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    if (commentSectionRef.value?.loadComments) {
      commentSectionRef.value.loadComments();
    }

    const newCommentCount = (localPost.value.commentCount || 0) + 1;

    handleCommentUpdate({
      postId: localPost.value.postId,
      commentCount: newCommentCount,
    });

    console.log("留言發表成功", response.data);
  } catch (error) {
    console.error("留言發表失敗", error);
    alert("留言發表失敗，請稍後再試");
  } finally {
    isSubmitting.value = false;
  }
};


const handleCommentUpdate = (commentData) => {
  // 更新本地計數
  if (commentData && commentData.postId === localPost.value.postId) {
    // 更新本地狀態
    localPost.value = {
      ...localPost.value,
      commentCount: commentData.commentCount,
    };

    // 通知父組件更新
    emit("update-post", localPost.value);

    console.log(`留言計數更新: ${commentData.commentCount}`);
  }
};

// 監聽 post 變化，重新獲取行程 title
watch(
  () => props.post,
  (newPost) => {
    // 更新本地 post 狀態
    localPost.value = { ...newPost };
    fetchScheduleTitle();
    // 獲取發文者頭貼
    if (newPost.memberId || newPost.authorId || newPost.userId) {
      fetchAuthorAvatar(newPost.memberId || newPost.authorId || newPost.userId);
    }
  },
  { immediate: true },
);

onMounted(() => {
  fetchScheduleTitle();
  // 獲取發文者頭貼
  if (props.post.memberId || props.post.authorId || props.post.userId) {
    fetchAuthorAvatar(
      props.post.memberId || props.post.authorId || props.post.userId,
    );
  }
});
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}
.md-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}
.popup-content {
  background-color: rgba(50, 50, 50, 0.6); 
  color: #fff;

  backdrop-filter: blur(8px); 
  -webkit-backdrop-filter: blur(8px);

  border: 1px solid rgba(255, 255, 255, 0.2); 
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.1);

  /* display: flex; */
  width: 90%;
  height: 70%;
}
/* .post-header {
  width: 100%;
  height: 10px;
  background-color: red;
} */
/* .post-image {
  flex: 1;
  background: #0ff376;
  display: flex;
  align-items: center;
  justify-content: center;
} */
/* .post-image img {
  max-width: 90%;
  max-height: 90%;
} */
/* .post-info {
  background-color: bisque;
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column; 
} */
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.avatar-small {
  width: 24px;
  height: 24px;
  border-radius: 50%;
}
.comment {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}
.comment-user {
  font-weight: bold;
  margin-right: 6px;
}
/* .comments-section {
  margin-top: 20px;
  flex: 1;
} */
</style>
