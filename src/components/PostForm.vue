<template>
  <div
    class="homepage-bg min-h-screen w-full flex items-center justify-center relative overflow-hidden"
  >
    <!-- 背景動畫層 -->
    <div class="animated-gradient absolute inset-0 -z-10"></div>

    <!-- 表單區 -->
    <div
      class="postform-style mt-30 shadow-xl p-8 rounded-3xl w-full max-w-xl flex flex-col gap-6"
    >
      <!-- 行程選擇 -->
      <div>
        <label class="block text-lg font-medium mb-2 text-center"
          >選擇行程</label
        >
        <select
          v-model="selectedScheduleId"
          @change="onScheduleChange"
          class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option
            v-for="s in schedules"
            :key="s.id"
            :value="s.id"
            class="text-red"
          >
            {{ s.title }}
          </option>
        </select>
      </div>

      <!-- 主圖上傳 -->
      <div>
        <label class="block text-lg font-medium mb-2">貼文主圖</label>
        <p>（請上傳 JPG、PNG，檔案最高3MB）</p>
        <input
          type="file"
          accept="image/*"
          @change="handleImageUpload"
          class="w-full mt-2 px-4 py-2 rounded-xl cursor-pointer bg-white/30"
        />
        <div
          class="mt-3 rounded-xl shadow-lg w-full max-w-xs h-48 overflow-hidden flex items-center justify-center"
        >
          <img
            v-if="previewImage"
            :src="previewImage"
            alt="預覽"
            class="object-cover w-full h-full"
          />
        </div>
      </div>

      <!-- 內容 -->
      <div>
        <label class="block text-lg font-medium mb-2">貼文內容</label>
        <textarea
          v-model="content"
          rows="5"
          class="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
        />
      </div>

      <!-- 送出 -->
      <button
        @click="submitPost"
        class="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition"
      >
        送出貼文
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();
const schedules = ref([]);
const selectedScheduleId = ref(null);
const content = ref("");
const previewImage = ref(null);
const imageFile = ref(null);
const token = localStorage.getItem("token");

onMounted(async () => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/travelSchedule/user`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    schedules.value = res.data.schedules;
  } catch {
    alert("請先登入");
  }
});

function onScheduleChange() {
  const selected = schedules.value.find(
    (s) => s.id === selectedScheduleId.value,
  );
  if (selected) {
    content.value = selected.description;
    previewImage.value = selected.coverURL;
  }
}

function handleImageUpload(e) {
  const file = e.target?.files?.[0];
  if (!file) return;

  const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSizeBytes = 3145728;
  if (!acceptedTypes.includes(file.type) || file.size > maxSizeBytes) {
    alert("格式不支援或檔案太大。請上傳 JPG、PNG。檔案最高3MB");

    const selected = schedules.value.find(
      (s) => s.id === selectedScheduleId.value,
    );
    if (selected) {
      previewImage.value = selected.coverURL || null;
      imageFile.value = null;
    }
    e.target.value = "";
    return;
  }

  imageFile.value = file;
  previewImage.value = URL.createObjectURL(file);
}

async function submitPost() {
  const selected = schedules.value.find(
    (s) => s.id === selectedScheduleId.value,
  );

  const formData = new FormData();
  formData.append("scheduleId", selectedScheduleId.value);
  formData.append("content", content.value);

  // 添加行程 title
  if (selected) {
    formData.append("scheduleTitle", selected.title);
  }

  if (imageFile.value) {
    formData.append("cover", imageFile.value);
  } else if (previewImage.value?.startsWith("https://")) {
    formData.append("coverURL", previewImage.value);
  }

  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/community/community-posts`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      },
    );
    alert("發佈成功");
    router.push("/community");
  } catch (err) {
    alert("發佈貼文失敗，請填寫所有欄位");
  }
}
</script>

<style scoped>
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
  background-size: 400% 400%;
  animation: gradientMove 15s ease infinite;
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
