<script setup>
import { ref, defineEmits, defineProps } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const emit = defineEmits(["submit"]);
const input = ref("");

const props = defineProps({
  isSubmitting: Boolean,
});

function safeSubmit() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("請先登入");
    router.push("/login");
    return;
  }
  const trimmed = input.value.trim();
  if (!trimmed) return;
  emit("submit", trimmed);
  input.value = "";
}

const handleSubmit = () => safeSubmit();
const emitSubmit   = () => safeSubmit(); 
</script>

<template>
  <div class="add-comment flex flex-wrap items-center gap-2 mt-4">
    <input
      v-model="input"
      placeholder="寫下你的留言..."
      rows="1"
      class="comment-input flex-1 min-w-0 p-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
      :disabled="isSubmitting"
      @keyup.enter="emitSubmit"
    />
    <button
      @click="handleSubmit"
      :disabled="!input.trim() || isSubmitting"
      class="submit-btn whitespace-nowrap px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-gray-300 hidden md:block"
    >
      {{ isSubmitting ? "送出中..." : "發表留言" }}
    </button>
    <button
      @click="handleSubmit"
      :disabled="!input.trim() || isSubmitting"
      class="submit-btn whitespace-nowrap px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition disabled:bg-gray-300  md:hidden"
    >
      {{ isSubmitting ? "送出中" : "➤" }}
    </button>
  </div>
</template>
