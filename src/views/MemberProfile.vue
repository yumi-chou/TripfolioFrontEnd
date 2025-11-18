<template>
  <div
    class="solo-card-style rounded-2xl p-6 sm:p-8 w-full max-w-xl text-gray-800 space-y-6 max-h-[80vh] overflow-y-auto"
  >
    <h2 class="text-2xl font-semibold text-center text-white">會員資料修改</h2>

    <div
      v-if="showCropper"
      class="fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50"
    >
      <Cropper
        ref="cropperRef"
        :src="previewUrl"
        :stensil-props="{ aspectRatio: 1 }"
        class="w-40 h-40 rounded-full"
      />
      <button
        @click="saveAvatar"
        class="mt-4 px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
      >
        儲存大頭貼
      </button>
    </div>

    <form @submit.prevent="saveProfile" class="space-y-2">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium mb-1">名稱</label>
          <input
            type="text"
            v-model="profileData.name"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="請輸入名稱"
          />
        </div>

        <div>
          <label class="block font-medium mb-1">性別</label>
          <select
            v-model="profileData.gender"
            class="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block font-medium mb-1">手機號碼</label>
        <input
          type="tel"
          v-model="profileData.phone"
          class="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="請輸入手機號碼"
        />
        <p v-if="phoneError" class="text-red-500 text-sm mt-1">
          {{ phoneError }}
        </p>
      </div>

      <div>
        <label class="block font-medium mb-1">生日</label>
        <input
          type="date"
          v-model="profileData.birthday"
          class="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>

      <div class="text-center">
        <button
          type="submit"
          class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          儲存會員資料
        </button>
      </div>
    </form>

    <div>
      <h2 class="text-xl font-bold mt-6 mb-4 text-center">密碼修改</h2>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div class="relative">
          <input
            :type="showOld ? 'text' : 'password'"
            v-model="passwordData.oldPassword"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="舊密碼"
          />
          <span
            class="absolute right-3 top-3 text-gray-500 cursor-pointer"
            @click="showOld = !showOld"
          >
            <font-awesome-icon :icon="showOld ? 'fa-eye-slash' : 'fa-eye'" />
          </span>
        </div>

        <div class="relative">
          <input
            :type="showNew ? 'text' : 'password'"
            v-model="passwordData.newPassword"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="新密碼"
          />
          <span
            class="absolute right-3 top-3 text-gray-500 cursor-pointer"
            @click="showNew = !showNew"
          >
            <font-awesome-icon :icon="showNew ? 'fa-eye-slash' : 'fa-eye'" />
          </span>
          <p class="text-sm text-gray-500 mt-1">需 8 字元以上，含英文與數字</p>
          <p v-if="passwordError" class="text-red-500 text-sm">
            {{ passwordError }}
          </p>
        </div>

        <div class="relative">
          <input
            :type="showConfirm ? 'text' : 'password'"
            v-model="passwordData.confirmPassword"
            class="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="再次輸入新密碼"
          />
          <span
            class="absolute right-3 top-3 text-gray-500 cursor-pointer"
            @click="showConfirm = !showConfirm"
          >
            <font-awesome-icon
              :icon="showConfirm ? 'fa-eye-slash' : 'fa-eye'"
            />
          </span>
        </div>

        <div class="text-center">
          <button
            type="submit"
            class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            送出修改密碼
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, defineEmits } from "vue";
import axios from "axios";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import dayjs from "dayjs";

const emit = defineEmits(["close-modal", "profile-updated"]);

const token = localStorage.getItem("token");
if (!token) {
  alert("請先登入會員");
  throw new Error("token 不存在");
}

const profileData = ref({
  name: "",
  gender: "",
  phone: "",
  birthday: "",
  avatar: "",
});

onMounted(async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = res.data;


    if (data.birthday) {
      data.birthday = dayjs(data.birthday).format("YYYY-MM-DD");
    }

    profileData.value = {
      ...data,
      avatar: data.avatar || "",
    };
  } catch (error) {
    alert("無法取得會員資料，請稍後再試");
  }
});

const avatarFile = ref(null);
const previewUrl = ref("");
const cropperRef = ref(null);
const showCropper = ref(false);

const uploadAvatar = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  avatarFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  showCropper.value = true;
};

const saveAvatar = async () => {
  const canvas = cropperRef.value.getResult().canvas;
  if (!canvas) {
    alert("請先裁切圖片");
    return;
  }

  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append("avatar", blob, avatarFile.value.name);

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/upload-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      alert("大頭貼上傳成功");

      const profileRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      profileData.value = profileRes.data;
      previewUrl.value = "";
      showCropper.value = false;

      emit('update-profile');
      
    } catch (err) {

    }
  }, "image/jpeg");
};


const phoneError = ref("");

watch(
  () => profileData.value.phone,
  (newPhone) => {
    const phoneNumber = /^09\d{8}$/;
    if (!phoneNumber.test(newPhone)) {
      phoneError.value = "手機格式錯誤，範例：0912345678";
    } else {
      phoneError.value = "";
    }
  },
);

const saveProfile = async () => {
  try {
    const res = await axios.put(
      `${import.meta.env.VITE_API_URL}/profile`,
      profileData.value,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    alert("儲存成功");
    profileData.value = res.data;
    emit("profile-updated", {
      name: res.data.name,
      avatar: res.data.avatar || "",
    });
  } catch (err) {
    alert("儲存失敗");
  }
};

const passwordData = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const passwordError = ref("");
const showOld = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);

watch(
  () => passwordData.value.newPassword,
  (newPwd) => {
    const hasMinLength = newPwd.length >= 8;
    const hasLetter = /[A-Za-z]/.test(newPwd);
    const hasNumber = /\d/.test(newPwd);
    const isSameAsName = newPwd === profileData.value.name;

    if (!hasMinLength) {
      passwordError.value = "密碼至少需8個字元";
    } else if (!hasLetter) {
      passwordError.value = "密碼需包含英文字母";
    } else if (!hasNumber) {
      passwordError.value = "密碼需包含數字";
    } else if (isSameAsName) {
      passwordError.value = "密碼不可與姓名相同";
    } else {
      passwordError.value = "";
    }
  },
);

const changePassword = async () => {
  if (
    !passwordData.value.oldPassword ||
    !passwordData.value.newPassword ||
    !passwordData.value.confirmPassword
  ) {
    alert("請填寫所有欄位");
    return;
  }
  if (passwordError.value) {
    alert(passwordError.value);
    return;
  }
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    alert("新密碼輸入不一致，請重新輸入");
    return;
  }

  try {
    await axios.put(
      `${import.meta.env.VITE_API_URL}/profile/users/password`,
      {
        oldPassword: passwordData.value.oldPassword,
        newPassword: passwordData.value.newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    alert("密碼修改成功");

    passwordData.value.oldPassword = "";
    passwordData.value.newPassword = "";
    passwordData.value.confirmPassword = "";
  } catch (err) {
    const errorMessage = err.response?.data?.error || "舊密碼錯誤";
    alert(errorMessage);
  }
};
</script>

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
</style>
