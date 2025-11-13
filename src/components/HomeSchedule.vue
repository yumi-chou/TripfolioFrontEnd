<template>
  <Swiper
  direction="vertical"
  :modules="[Autoplay]" 
  :autoplay="{ delay: 1000 }"
  :loop="true"
  :centeredSlides="true"
  slidesPerView="3"
  class="w-full max-w-[320px] h-[360px] md:w-[300px] md:h-[450px] "
  :spaceBetween="20" 
>
    <SwiperSlide
      v-for="(place, index) in places"
      :key="index"
      class="transition-transform duration-300 "
    >
      <img
        :src="place.img"
        class="w-full h-full object-contain rounded-3xl"
        alt="Place Image"
      />
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/autoplay'
import schedule1 from '@/assets/HomePage/schedule1.png'
import schedule2 from '@/assets/HomePage/schedule2.png'
import schedule3 from '@/assets/HomePage/schedule3.png'
import schedule4 from '@/assets/HomePage/schedule4.png'
import schedule5 from '@/assets/HomePage/schedule5.png'


const places = [
  {img: schedule1 },
  {img: schedule2 },
  {img: schedule3 },
  {img: schedule4 },
  {img: schedule5 },
]

</script>

<style scoped>
.swiper-slide {
  transition: transform 0.6s ease-in-out;
  height: 200px;
}

.swiper-slide-active {
  transform: scale(1) ;
  z-index: 10;
}

.swiper-slide-prev,
.swiper-slide-next {
  transform: scale(0.9);
  z-index: 5;
}

</style>