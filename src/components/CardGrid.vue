<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <div
      v-for="item in items"
      :key="item.id"
      class="solo-card-style rounded-xl overflow-hidden cursor-pointer group"
      @click="$emit('click-card', item.id)"
    >
      <div class="relative">
        <img
          :src="
            item.image ||
            item.coverImage ||
            item.imageUrl ||
            'https://picsum.photos/200/300'
          "
          @error="handleImageError"
          class="w-full h-50 object-cover rounded-t-lg"
          alt="預覽圖"
        />
        <div
          class="absolute inset-0 bg-opacity-20 flex justify-end items-start p-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
        </div>
      </div>
      <div class="p-4">
        <div class="font-semibold text-lg truncate">{{ item.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
});

const handleImageError = (e) => {
  e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
};
</script>


