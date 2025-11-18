<template>
  <div
    class="relative max-w-xl mx-auto p-5 rounded-2xl bg-[#878787]/60 shadow-md shadow-black/40 text-white h-[640px] w-[450px] scale-[0.75] sm:scale-100"
  >
    <button
      type="button"
      @click="handleClose"
      class="absolute top-2 right-2 text-xl"
    >
      <font-awesome-icon :icon="['fas', 'xmark']" />
    </button>
    <form
      @submit.prevent="scheduleSubmit"
      class="space-y-4 p-2 rounded max-w-xl mx-auto"
    >
      <span class="text-2xl font-bold">行程設定</span>

      <div class="relative">
        <img
          :src="coverPreviewUrl || defaultCover"
          class="w-full h-48 object-cover rounded-xl shadow-md shadow-black/10"
          alt="封面圖片"
        />
        <div class="absolute op-0 right-0 size-40">
          <button
            type="button"
            @click="uploadFile"
            class="bg-white px-3 py-1 rounded-full shadow flex items-center gap-1 text-[#878787]"
          >
            <font-awesome-icon :icon="['fas', 'pen-to-square']" />上傳圖片
          </button>
        </div>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          @change="handleFile"
          class="hidden"
        />
      </div>

      <div
        v-if="showCropper"
        class="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      >
        <div class="bg-white p-4 rounded-lg max-w-md w-full">
          <cropper
            ref="cropperRef"
            :src="cropImage"
            :stencil-props="{ aspect: 2 }"
            :autoZoom="true"
            :resizeImage="true"
            class="w-full h-64"
          />
          <div class="flex justify-end gap-2 mt-4">
            <button
              @click="showCropper = false"
              class="bg-gray-300 px-4 py-2 rounded"
            >
              取消
            </button>
            <button
              type="button"
              @click="applyCrop"
              class="bg-[#878787] hover:bg-[#c2c2c2] text-white px-4 py-2 rounded"
            >
              裁切
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="block mb-1"
          >行程名稱<span class="text-red-500">*</span></label
        >
        <input
          type="text"
          v-model="title"
          class="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="幫行程取個名字⸜(*ˊᗜˋ*)⸝"
        />
      </div>

      <div>
        <label class="block mb-1"
          >行程日期<span class="text-red-500">*</span></label
        >

        <div class="flex flex-col sm:flex-row gap-2 items-center">
          <div class="relative w-full sm:w-auto flex-1 min-w-[140px]">
            <input
              type="date"
              v-model="startDate"
              class="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
          <span class="hidden sm:inline">-</span>
          <div class="relative w-full sm:w-auto flex-1 min-w-[140px]">
            <input
              type="date"
              v-model="endDate"
              :min="startDate"
              class="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>

        <span v-if="days > 0" class="text-sm text-[#828282] mt-1 block">
          共 {{ days }} 天
        </span>
      </div>

      <div>
        <label class="block mb-1">行程描述(可選填)</label>
        <textarea
          v-model="description"
          class="p-2 h-18 border w-full rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
          placeholder="請簡單記錄一下自己的行程吧~(ﾉ˶>ᗜ​<˵)ﾉ"
        ></textarea>
      </div>

      <div class="flex justify-end gap-2">
        <button
          type="submit"
          :disabled="isLoading"
          class="bg-[#878787] hover:bg-[#c2c2c2] text-white px-4 py-2 rounded"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            儲存中...
          </span>
          <span v-else>建立</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import { Cropper } from "vue-advanced-cropper";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
const router = useRouter();
import "vue-advanced-cropper/dist/style.css";

const emit = defineEmits(["close", "submitted"]);

const file = ref(null);
const title = ref("");
const startDate = ref("");
const endDate = ref("");
const days = ref(0);
const description = ref("");
const isDirty = ref(false);
const showCropper = ref(false);
const cropImage = ref(null);
const cropperRef = ref(null);
const createdScheduleId = ref(null);
const isLoading = ref(false);

const coverPreviewUrl = ref("");
const defaultCover = `https://placehold.co/800x400?text=${encodeURIComponent('行程封面')}&font=noto`;

const fileInput = ref(null);

const uploadFile = () => {
  fileInput.value.click();
};

const handleFile = (event) => {
  file.value = event.target.files[0];
  if (file.value) {
    cropImage.value = URL.createObjectURL(file.value);
    showCropper.value = true;
  }
};

const applyCrop = () => {
  const canvas = cropperRef.value?.getResult()?.canvas;
  if (canvas) {
    canvas.toBlob((blob) => {
      file.value = new File([blob], `cropper-image.png`, { type: "image/png" });
      coverPreviewUrl.value = URL.createObjectURL(file.value);
      showCropper.value = false;
    }, "image/png");
  }
};

watch([startDate, endDate], () => {
  if (startDate.value && endDate.value) {
    const diff = dayjs(endDate.value).diff(dayjs(startDate.value), "day") + 1;
    days.value = diff > 0 ? diff : 0;
  } else {
    days.value = 0;
  }
});

watch([title, startDate, endDate, description, file], () => {
  isDirty.value = true;
});

const handleClose = () => {
  if (isDirty.value) {
    const confirmExit = confirm("您有尚未儲存的內容，確定要離開嗎?");
    if (!confirmExit) return;
  }
  emit("close");
};

const scheduleCancel = () => {
  file.value = null;
  coverPreviewUrl.value = "";
  title.value = "";
  startDate.value = "";
  endDate.value = "";
  days.value = 0;
  description.value = "";
  isDirty.value = false;
};

const scheduleSubmit = async () => {
  if (isLoading.value) return;
  if (!title.value || !startDate.value || !endDate.value) {
    alert("請填寫行程名稱及行程開始/結束日期");
    return;
  }

  const token = localStorage.getItem("token");
  const formData = new FormData();
  if (file.value) formData.append("cover", file.value);
  formData.append("title", title.value);
  formData.append("startDate", startDate.value);
  formData.append("endDate", endDate.value);
  formData.append("description", description.value);

  try {
    isLoading.value = true;
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/travelSchedule`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const newId = res.data.schedule.id;
    createdScheduleId.value = newId;

    alert("儲存成功，你可以關閉表單點擊行程進入編輯");
    isDirty.value = false;
    emit("submitted", newId);
  } catch (err) {
    alert("儲存失敗，請稍後再試");
  } finally {
    isLoading.value = false;
  }
};
</script>
