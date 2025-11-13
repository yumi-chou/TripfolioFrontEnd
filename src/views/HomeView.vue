<template>
  <div class="homepage-bg overflow-x-hidden">
    <section class="min-h-screen md:min-h-[100px]">
      <div class="landing fixed inset-0 bg-white text-gray-500 flex justify-center items-center " v-if="show">
        <div class="loading text-3xl md:text-5xl tracking-[0.4em] whitespace-no-wrap" >
          <span style="--i: 0">T</span>
          <span style="--i: 1">R</span>
          <span style="--i: 2">I</span>
          <span style="--i: 3">P</span>
          <span style="--i: 4">F</span>
          <span style="--i: 5">O</span>
          <span style="--i: 6">L</span>
          <span style="--i: 7">I</span>
          <span style="--i: 8;; margin-right: -0.4em;">O</span>
        </div>
      </div>
      <div class="w-[100vw] relative">
          <div class="mt-25 ml-4 mr-4 h-[600px] flex ">
            <img :src="img1" alt="首圖" class="mx-auto w-full h-full object-cover rounded-[3rem]" loading="lazy" />
          </div>
            <div class="w-[60vw] mx-auto z-10 absolute top-130 left-0 right-0">
              <section class="bg-gray-800/30 navbar-style backdrop-blur-[10px] text-white rounded-4xl py-3 px-6 shadow-md">
                <div
                  class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4"
                >
                  <div class="relative w-fit">
                    <select
                      :value="route.query.city || 'none'"
                      @change="onCityChange($event)"
                      class="appearance-none bg-gray-800/80 text-white text-sm py-2 pl-4 pr-10 rounded-full focus:outline-none hover:bg-gray-400 transition duration-200 cursor-pointer shadow-inner"
                    >
                      <option value="none">當前</option>
                      <option
                        v-for="city in cities"
                        :key="city.name"
                        :value="city.name"
                      >
                        {{ city.name }}
                      </option>
                    </select>
                    <svg
                      class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <div class="relative w-full bg-gray-600 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white pointer-events-none"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                    <input
                      type="text"
                      v-model="searchQuery"
                      placeholder="輸入地點"
                      class="w-full rounded-full border-none text-white px-9 py-1.5 box-border text-base placeholder-white focus:outline-none"
                      ref="searchInput"
                      @keyup.enter="searchPlace"
                    />
                    <button
                      @click.prevent="searchPlace"
                      class="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 px-2.5 py-1.5 rounded-full border-none cursor-pointer text-xs text-white"
                    >
                      搜尋
                    </button>
                  </div>
                </div>
                <div class="mt-4 flex flex-wrap gap-2">
                  <button
                    v-for="item in categories"
                    :key="item.type"
                    @click="searchByCategory(item.type)"
                    class="bg-gray-700 px-3 py-1 rounded-full flex items-center space-x-1 hover:bg-blue-100"
                  >
                    {{ item.label }}
                  </button>
                  <div class="relative" ref="menuRef">
                    <button
                      @click="showCustomCategory = !showCustomCategory"
                      class="block w-full text-left px-3 py-2 rounded-full hover:bg-gray-600 text-white font-semibold left-3.5"
                    >
                      + others
                    </button>
                    <div
                      v-if="showCustomCategory"
                      class="absolute z-10 bg-gray-400/90 rounded-4xl p-3 w-80 shadow-md bottom-1 left-18 transform transition-all duration-300 ease-in-out translate-x-0 opacity-100"
                    >
                      <button
                        @click="removeCategory(item)"
                        v-for="item in categories"
                        :key="item.type"
                        class="m-4"
                      >
                        {{ item.label }} ❌
                      </button>
                      <hr />
                      <button
                        @click="addCategory(item)"
                        v-for="item in placeCategories"
                        :key="item.type"
                        class="m-4 cursor-pointer"
                      >
                        {{ item.label }}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
      </div>
    </section>

    <section
        class="min-h-[600px] flex flex-col md:flex-row items-center justify-between relative
          md:mt-[max(100px,calc(env(safe-area-inset-top)+80px))] mt-[max(100px,calc(env(safe-area-inset-top)+150px))] mb-20 px-6 md:px-16 "
    >
      <!-- 左：標題＋內文＋三個黑按鈕 -->
      <div
        class="relative w-full md:w-1/2 flex flex-col justify-center z-20 text-center md:text-left md:pl-20"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <h2 class="text-3xl md:text-5xl font-bold tracking-wide mb-3 md:mb-6">
          探索你的地圖
        </h2>
      
        <p
          class="text-base md:text-xl font-medium tracking-wide md:tracking-wider whitespace-normal break-words mb-8 md:mb-15"
        >
          標記景點留下足跡，每段旅程都是值得收藏的人生篇章
        </p>
      
        <!-- 三顆黑按鈕 -->
        <div class="flex flex-col items-center md:items-start gap-3 md:gap-7 relative">
          <div
            class="bg-black rounded-full flex items-center justify-center text-white px-5 py-2 md:px-6 md:py-2 shadow-lg transition-transform duration-300 hover:scale-105"
            data-aos="fade-right"
            data-aos-delay="100"
          >
            一站式完成資訊蒐集
          </div>
        
          <div
            class="bg-black rounded-full flex items-center justify-center text-white px-6 py-2 md:px-6 md:py-2 shadow-lg md:ml-40 transition-transform duration-300 hover:scale-105"
            data-aos="fade-right"
            data-aos-delay="200"
          >
            快速排程
          </div>
        
          <div
            class="bg-black rounded-full flex items-center justify-center text-white px-6 py-2 md:px-6 md:py-2 shadow-lg md:ml-20 transition-transform duration-300 hover:scale-105"
            data-aos="fade-right"
            data-aos-delay="300"
          >
            隨意拖動行程
          </div>
        </div>
      </div>
    
      <!-- 右：地圖區 -->
      <div
        class="relative w-full md:w-1/2 mt-10 md:mt-0 flex justify-center"
        data-aos="fade-left"
        data-aos-duration="1000"
      >
        <img
          :src="taiwan"
          alt="台灣地圖"
          ref="mapImg"
          class="w-full md:w-auto max-w-[520px] h-auto object-contain opacity-95 "
          data-aos="fade-left"
          loading="lazy"
        />
    
        <!-- marker 標記 -->
        <img
          src="/mapIcons/amusement_park.svg"
          v-show="showMarker1"
          alt="marker"
          class="absolute z-30 top-[18%] left-[40%] w-10 md:w-14 h-10 md:h-14 will-change-transform "
          data-aos="fade-left"
          loading="lazy"
        />
        <img
          src="/mapIcons/restaurant.svg"
          v-show="showMarker2"
          alt="marker"
          class="absolute z-30 top-[30%] left-[60%] w-10 md:w-14 h-10 md:h-14 will-change-transform "
          data-aos="fade-left"
          loading="lazy"
        />
        <img
          src="/mapIcons/cafe.svg"
          v-show="showMarker3"
          alt="marker"
          class="absolute z-30 top-[50%] left-[30%] w-10 md:w-14 h-10 md:h-14 will-change-transform "
          data-aos="fade-left"
          loading="lazy"
        />
      </div>
    </section>
  
    <section
  class="h-auto sm:h-[500px] w-full sm:w-[80vw] flex flex-col sm:flex-row
         items-center space-y-10 sm:space-y-0 sm:space-x-0
         relative mx-auto rounded-3xl my-10 px-4 sm:px-0"
>
  <!-- 桌機版行程卡：一樣維持原本隱藏手機 -->
  <div
    class="relative hidden sm:block z-10 py-10 sm:pl-6
           flex-col-reverse sm:flex-row items-center px-6 sm:px-20"
  >
    <HomeSchedule />
  </div>

  <div
    class="relative w-full min-h-[650px] sm:min-h-[300px] h-full
           shadow-xl rounded-3xl overflow-hidden z-0"
  >
    <img :src="map" class="w-full h-full object-cover absolute inset-0 z-0" />

    <!-- 標題：手機置中、桌機維持左對齊 -->
    <div
      class="absolute z-40
             top-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap
             sm:left-20 sm:translate-x-0 sm:text-left sm:top-20"
    >
      <h2
        class="text-3xl sm:text-4xl font-bold tracking-wide sm:tracking-wider"
        data-aos="fade-right"
        data-aos-duration="2000"
      >
        高自由度行程規劃
      </h2>
      <p
        class="mt-5 text-lg sm:text-xl font-medium
               tracking-wide sm:tracking-wider"
        data-aos="fade-left"
        data-aos-duration="2000"
      >
        景點隨心拖曳排序 輕鬆管理你的旅程
      </p>
    </div>

    <!-- 手機版行程卡：置中＋限制寬度，避免跑出畫面 -->
    <div
      class="block sm:hidden absolute z-40
             left-1/2 -translate-x-1/2 top-[25%]
             w-[88%]"
    >
      <HomeSchedule />
    </div>
  </div>
</section>


    <section class="min-h-[600px] px-6 py-16">

      <h2 class="text-3xl sm:text-4xl font-bold text-center mb-20 mt-10" data-aos="fade-up" data-aos-duration="1000" data-aos-anchor-placement="top-center">
        讓分享，成為彼此的路標
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        <div class="rounded-3xl bg-white shadow-md overflow-hidden" data-aos="fade-up" data-aos-delay="700">
          <div class="relative h-[300px] bg-gray-300">
            <img :src="s1" alt="行程圖" class="w-full h-full object-cover " loading="lazy"/>
            <div class="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full flex items-center space-x-2">
              <img :src="s2" alt="avatar" class="w-5 h-5 rounded-full object-cover ml-0.5 mr-2" />
              <p class="mr-2">Kris</p>
            </div>
          </div>
          <div class="p-4 flex justify-between items-center">
            <p class="text-sm font-medium">慢遊台灣五日行</p>
            <button class="text-xl">♡</button>
          </div>
        </div>


        <div class="rounded-3xl bg-white shadow-md overflow-hidden" data-aos="fade-up" data-aos-delay="1000">
          <div class="relative h-[300px] bg-gray-300">
            <img :src="s2" alt="行程圖" class="w-full h-full object-cover" loading="lazy"/>
            <div class="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full flex items-center space-x-2">
              <img :src="p1" alt="avatar" class="w-5 h-5 rounded-full object-cover ml-0.5 mr-2" />
              <p class="mr-2">May</p>
            </div>
          </div>
          <div class="p-4 flex justify-between items-center">
            <p class="text-sm font-medium">一步一景，小島旅行中</p>
            <button class="text-xl">♡</button>
          </div>
        </div>

        <div class="rounded-3xl bg-white shadow-md overflow-hidden" data-aos="fade-up" data-aos-delay="1300">
          <div class="relative h-[300px] bg-gray-300">
            <img :src="s3" alt="行程圖" class="w-full h-full object-cover" loading="lazy" />
            <div class="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full flex items-center space-x-2">
              <img :src="p2" alt="avatar" class="w-5 h-5 rounded-full object-cover ml-0.5 mr-2" />
              <p class="mr-2">Kiwi</p>
            </div>
          </div>
          <div class="p-4 flex justify-between items-center">
            <p class="text-sm font-medium">台北三天兩夜攻略</p>
            <button class="text-xl">♡</button>
          </div>
        </div>
      </div>
    </section>

      <RouterLink to="/schedule" class="flex justify-center mt-20 mb-25" >
        <input
          type="image"
          :src="btn"
          class="w-80 cursor-pointer"
        />
      </RouterLink>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { cities } from "../constants/city";
import { rawCategories, rawPlaceCategories } from "../constants/category";
import { useCategoryMenu } from "../composable/useCategoryMenu";
import AOS from 'aos'
import 'aos/dist/aos.css'
import img1 from '@/assets/HomePage/1.png'
import HomeCarousel from '../components/HomeCarousel.vue';
import HomeSchedule from "../components/HomeSchedule.vue";
import Footer from '../components/Footer.vue'; 
import taiwan from '../assets/HomePage/taiwan.png';
import s1 from '../assets/HomePage/s1.png';
import s2 from '../assets/HomePage/s2.png';
import s3 from '../assets/HomePage/s3.png';
import p1 from '../assets/HomePage/p1.png';
import p2 from '../assets/HomePage/p2.png';
import btn from '../assets/HomePage/btn.svg';
import map from '../assets/HomePage/map.png';

const show = ref(true)
const showMarker1 = ref(false)
const showMarker2 = ref(false)
const showMarker3 = ref(false)

const mapImg = ref(null)

const {
  categories,
  placeCategories,
  showCustomCategory,
  menuRef,
  addCategory,
  removeCategory,
  handleClickOutside,
} = useCategoryMenu(rawCategories, rawPlaceCategories, maxCategoryCount);

const route = useRoute();
const router = useRouter();

const searchQuery = ref("");
const searchInput = ref(null);
const hasMoreResults = ref(false);
const selectedPlace = ref(null);
const selectedCityName = ref("none");
const maxCategoryCount = 5;

function searchPlace() {
  if (!searchQuery.value) return;
  router.push({
    path: "/schedule",
    query: {
      searchQuery: searchQuery.value,
    },
  });
}

function searchByCategory(type) {
  if (!type) return;

  searchQuery.value = "";

  router.push({
    path: "/schedule",
    query: {
      searchQuery: type,
      city: selectedCityName.value || "none",
    },
  });
}

function onCityChange(event) {
  const cityName = event.target.value;
  selectedCityName.value = cityName;

  router.push({
    path: "/schedule",
    query: {
      searchQuery: searchQuery.value || "tourist_attraction",
      city: cityName || "none",
      t: Date.now(),
    },
  });
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  setTimeout(() => {
    show.value = false;
  }, 3000);

  AOS.init({ once: false, duration: 500 });

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !showMarker1.value) {
      showMarker1.value = true;
      setTimeout(() => (showMarker2.value = true), 500);
      setTimeout(() => (showMarker3.value = true), 1000);
    }
  }, { threshold: 0.4 });

  if (mapImg.value) {
    observer.observe(mapImg.value);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.landing {
  animation: fadeout 3s forwards;
  z-index: 9999;
}

.loading span {
  animation: blur 1.5s calc(var(--i) / 5 * 1s) alternate;
}

.fade-in-down {
  animation: fadeInDown 0.6s ease-out forwards;
}

.solo-card-style {
  background-color: rgba(50, 50, 50, 0.3);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(27px);
}


@keyframes fadeout {
  0% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes blur {
  to {
    filter: blur(0px);
  }
  from {
    filter: blur(5px);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>