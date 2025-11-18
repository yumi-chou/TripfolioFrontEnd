<template>
  <div class="homepage-bg min-h-screen relative bg-cover bg-center">
    <div class="member-center min-w-[70%] sm:w-[70%] mx-auto">
      <main class="navbar-style mt-25 rounded-2xl min-h-140">
        <header class="header rounded-tl-2xl rounded-tr-2xl">
          <h5>會員中心</h5>
        </header>

        <section class="user-info  ">
          <img :src="user.avatar + '?t=' + avatarTimestamp" alt="使用者頭像" class="avatar" />
          <div>
            <h1 class="text-xl mb-3 ml-2">{{ user.name }}</h1>
            <div  class="flex space-x-1 items-center ">
                <a
                  class="text-gray text-sm cursor-pointer bg-black/30 rounded-full px-5 py-0.5"
                  href="#"
                  @click.prevent="showMemberProfile = true"
                  >編輯</a
                >
                <hr />
                <a class="text-gray text-sm cursor-pointer  bg-black/30 rounded-full px-5 py-0.5" href="#" @click.prevent="goToLogin" >登出</a>
            </div>
          </div>       
        </section>

        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            :class="{ active: activeTab === tab.key }"
          >
            {{ tab.label }}
          </button>
        </div>

        <section class="tab-content">
          <template v-if="activeTab === 'travels'">
            <CardGrid :items="travels" @click-card="goToTravel" />
          </template>
          <template v-if="activeTab === 'posts'">
            <CardGrid :items="posts" @click-card="goToPost" />
          </template>
          <template v-else-if="activeTab === 'collected'">
            <CardGrid :items="collectedPosts" @click-card="goToPost" />
          </template>
          <template v-else-if="activeTab === 'notifications'">
            <EmailSettings />
          </template>
        </section>
      </main>

      <div
        v-if="showMemberProfile"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        @click.self="showMemberProfile = false"
      >
        <div class="relative">
          <MemberProfile
            @close-modal="showMemberProfile = false"
            @update-profile="
              fetchData();
              avatarTimestamp.value = Date.now();
              showMemberProfile = false;
            "
            @profile-updated="handleProfileUpdated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import CardGrid from "@/components/CardGrid.vue";
import MemberProfile from "../views/MemberProfile.vue";
import EmailSettings from "../views/EmailSettings.vue";

const router = useRouter();
const route = useRoute();

const user = ref({ name: "", avatar: "" });
const travels = ref([]);
const posts = ref([]);
const collectedPosts = ref([]);
const showMemberProfile = ref(false);
const avatarTimestamp = ref(Date.now());

const tabs = [
  { key: "travels", label: "我建立的行程" },
  { key: "posts", label: "我建立的貼文" },
  { key: "collected", label: "我收藏的貼文" },
];
const activeTab = ref("travels");

const fetchData = async () => {
  const token = localStorage.getItem("token");
  if (!token) return alert("請先登入會員");

  const decoded = jwtDecode(token);
  const memberId = decoded.id;

  try {
    const [userRes, travelRes, postRes, collectRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${import.meta.env.VITE_API_URL}/travelSchedule/user`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(
        `${import.meta.env.VITE_API_URL}/allposts?page=1&limit=100`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ),
      axios.get(
        `${import.meta.env.VITE_API_URL}/favorites/user/${memberId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ),
    ]);
    user.value = {
      name: userRes.data.name || "訪客",
      avatar: userRes.data.avatar || "http://picsum.photos/300/200",
    };

    travels.value = travelRes.data.schedules.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.coverURL,
    }));

    posts.value = postRes.data.posts
      .filter((item) => item.id === memberId)
      .map((item) => ({
        id: item.postId,
        title: item.content || "未命名貼文",
        coverImage: item.imageUrl,
      }));

    collectedPosts.value = collectRes.data.map((item) => ({
      id: item.postId,
      title: item.postTitle || "未命名貼文",
      coverImage: item.postImageUrl,
    }));
  } catch (err) {
    console.warn("取得資料失敗", err);
  }
};
const handleProfileUpdated = (newData) => {
  user.value.name = newData.name;
  user.value.avatar = newData.avatar;
};

onMounted(fetchData);
watch(() => route.fullPath, fetchData);


const goToTravel = () => {
  router.push({ path: "/schedule" });
};

const goToPost = (id) =>
  router.push({ path: "/community", query: { postId: id } });

const goToLogin = () => {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("login-status-changed"));
  router.push("/login");
};
</script>

<style scoped>
.member-center {
  padding: 2rem;
}

.header {
  background: #666;
  padding: 1rem;
  font-weight: bold;
}
.user-info {
  display: flex;
  align-items: center;
  gap:2rem;
  padding: 1rem;
}
.avatar {
  width: 80px;
  height: 80px;
  border-radius: 9999px;
  object-fit: cover;
}
.tabs {
  display: flex;
  gap: 1rem;
  padding: 1rem;
}
.tabs button.active {
  border-bottom: 2px solid #ffffff;
  color: white;
}
.tab-content {
  padding: 1rem;
}
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
}
</style>
