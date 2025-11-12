<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import { useRoute, useRouter } from "vue-router";
import PostPopup from "../components/PostPopup.vue";

const posts = ref([]);
const page = ref(1);
const limit = 15;
const isLoading = ref(false);
const hasMore = ref(true);
const scrollTrigger = ref(null);
const route = useRoute();
const router = useRouter();
const token = localStorage.getItem("token");
const showModal = ref(false);
const selectedPost = ref(null);
let observer = null;
const defaultImage = `https://picsum.photos/`;

// 分頁載入貼文，append 並保留互動欄位
const fetchPosts = async () => {
  if (isLoading.value || !hasMore.value) return;
  isLoading.value = true;
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/allposts?page=${page.value}&limit=${limit}`,
    );
    const fetched = res.data.posts || [];
    if (fetched.length < limit) {
      hasMore.value = false;
    }

    // append 並保留互動欄位
    posts.value.push(
      ...fetched.map((post) => ({
        ...post,
        isEditing: false,
        previewImage: null,
        imageFile: null,
      })),
    );
    page.value++;
    console.log(posts.value);
  } catch (err) {
    alert("載入貼文失敗");
  } finally {
    isLoading.value = false;
  }
};

const updatePost = (updatedPost) => {
  const index = posts.value.findIndex((p) => p.postId === updatedPost.postId);
  if (index !== -1) {
    // 只更新有值的欄位，避免覆蓋原有的計數
    const updateData = { ...posts.value[index] };

    // 只更新有值的計數欄位
    if (updatedPost.commentCount !== undefined) {
      updateData.commentCount = updatedPost.commentCount;
    }
    if (updatedPost.favoriteCount !== undefined) {
      updateData.favoriteCount = updatedPost.favoriteCount;
    }

    // 更新其他欄位（如果有）
    Object.keys(updatedPost).forEach((key) => {
      if (
        key !== "commentCount" &&
        key !== "favoriteCount" &&
        updatedPost[key] !== undefined
      ) {
        updateData[key] = updatedPost[key];
      }
    });

    posts.value[index] = updateData;

    console.log(`更新貼文 ${updatedPost.postId} 的計數:`, {
      commentCount: updateData.commentCount,
      favoriteCount: updateData.favoriteCount,
    });
  }
};

const closeModal = () => {
  showModal.value = false;
  selectedPost.value = null;
};

const openPostDetail = (post) => {
  selectedPost.value = post;
  showModal.value = true;
};

const goToCreatePost = () => {
  router.push("/community/post");
};

const initObserver = () => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && !isLoading.value && hasMore.value) {
        fetchPosts();
      }
    },
    {
      root: null,
      threshold: 0.3,
    },
  );
  if (scrollTrigger.value) {
    observer.observe(scrollTrigger.value);
  }
};

//動態追蹤用
watch(
  () => route.query.postId,
  (newPostId) => {
    if (!newPostId) {
      closeModal();
      return;
    }
    const tryOpen = () => {
      const foundPost = posts.value.find((p) => p.postId == newPostId);
      if (foundPost) {
        selectedPost.value = foundPost;
        showModal.value = true;
      }
    };
    if (posts.value.length) {
      tryOpen();
    } else {
      fetchPosts().then(() => {
        tryOpen();
      });
    }
  },
  { immediate: true },
);

onMounted(() => {
  fetchPosts();
  initObserver();
});

onBeforeUnmount(() => {
  if (observer && scrollTrigger.value) {
    observer.unobserve(scrollTrigger.value);
  }
});
console.log("communityList mounted");
</script>

<template>
  <div class="homepage-bg min-h-screen w-full">
    <div class="px-4 py-6 max-w-5xl mx-auto">
      <!-- <h1 class="text-2xl font-bold mb-4">社群主頁</h1> -->
      <!-- 貼文列表 -->
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-4 lg:grid-cols-4 mt-20">
        <div
          v-for="post in posts"
          :key="post.postId"
          class="navbar-style rounded-[24px] overflow-hidden shadow hover:shadow-lg transition cursor-pointer flex flex-col"
          @click="openPostDetail(post)"
        >
          <!-- Header -->
          <div class="flex items-center gap-2 p-2">
            <img
              :src="post.authorAvatar || 'https://picsum.photos/36/36?random=1'"
              :alt="post.authorName || 'User'"
              class="w-6 h-6 rounded-full object-cover"
              @error="
                $event.target.src = 'https://picsum.photos/36/36?random=1'
              "
            />
            <span class="text-sm">{{ post.authorName || "User Name" }}</span>
          </div>

          <!-- Image -->
          <img
            :src="
              post.previewImage ||
              post.coverURL ||
              post.imageUrl ||
              'https://picsum.photos/400/300?random'
            "
            alt="post image"
            class="w-full aspect-square object-cover"
          />

          <!-- Footer -->
          <div class="p-2 flex flex-col justify-between flex-grow">
            <p class="font-medium truncate">{{ post.content }}</p>
            <div
              class="mt-2 flex items-center justify-end text-gray-600 text-sm gap-4"
            >
              <div class="flex items-center gap-1">
                <span>❤️</span>
                <span>{{ post.favoriteCount || 0 }}</span>
              </div>
              <div class="flex items-center gap-1">
                <span>💬</span>
                <span>{{ post.commentCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div ref="scrollTrigger" class="h-10"></div>

      <!-- Skeleton loading（載入中顯示） -->
      <div
        v-if="isLoading"
        class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="n in 3"
          :key="n"
          class="animate-pulse border-none rounded-xl p-4 shadow"
        >
          <div class="w-full h-60 bg-gray-300 rounded-xl mb-3"></div>
          <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-300 rounded w-1/3 mb-1"></div>
          <div class="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>

      <div
        v-if="!isLoading && posts.length === 0"
        class="text-center text-gray-400 my-12"
      >
        尚無貼文，快來建立第一篇吧！
      </div>

      <div
        v-if="!hasMore && posts.length"
        class="text-center text-gray-400 my-4"
      >
        已載入所有貼文
      </div>

      <PostPopup
        v-if="showModal"
        :post="selectedPost"
        :is-visible="showModal"
        @close="closeModal"
        @update-post="updatePost"
      />

      <button
        class="animated-gradient-modern fixed bottom-6 right-6 text-4xl text-white px-5 py-3 rounded-full flex justify-center leading-none"
        @click="goToCreatePost"
      >
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.homepage-bg {
  background-image:
    radial-gradient(#999 1px, transparent 1px),
    linear-gradient(to right, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.08) 1px, transparent 1px);
  background-size:
    40px 40px,
    40px 40px,
    40px 40px;
  background-position:
    20px 20px,
    0px 0px,
    0px 0px;
  background-color: white;
}

.animated-gradient {
  background: linear-gradient(
    149.45deg,
    #ff6a38 7.6%,
    rgba(255, 56, 17, 0.22) 7.62%,
    #ffb2b2 19.41%,
    #e0d391 40.78%,
    #c6d544 58.91%,
    #9fd01e 65.23%,
    #8fcb40 71.26%,
    #009991 92.4%
  );
  background-size: 100% 100%;
  animation: gradientMove 2s ease infinite;
}
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
