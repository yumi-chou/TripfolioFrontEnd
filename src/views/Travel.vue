<template>
  <div class="homepage-bg relative">
    <div class="flex flex-col lg:flex-row h-screen">
      <div
        class="h-[65%] lg:h-full lg:w-4/6 relative overflow-hidden mb-2 shadow-2xl"
      >
        <div class="w-full h-full relative overflow-hidden">
          <GoogleMapView
            ref="mapRef"
            :trip="selectedTrip"
            :selected-place="selectedPlace"
            :current-day-index="currentDayIndex"
            :daily-plan-ref="dailyPlanRef"
            :schedule-detail-ref="scheduleDetailRef"
            :default-image="defaultImage"
            @place-added="handlePlaceAdded"
          />
        </div>
      </div>

      <div class="flex-1 lg:w-2/6 h-[45%] lg:h-full overflow-y-auto">
        <div v-if="!editingTripId" class="fixed bottom-5 right-6 z-50">
          <button
            @click="handleOpenForm"
            class="animated-gradient-modern text-white text-xl px-10 py-3 rounded-full shadow-md shadow-black/40 cursor-pointer bg-gradient-trip hover:bg-gradient-trip-hover"
          >
            建立行程
          </button>
        </div>

        <div>
          <div v-if="!editingTripId" class="rounded-2xl p-7 m-5">
            <div
              v-if="tripStore.trips.length > 0"
              class="mt-2 space-y-4 rounded-xl"
            >
              <div
                v-for="item in tripStore.trips"
                :key="item.id"
                @click="editingTripId = item.id"
                class="navbar-style rounded-2xl shadow-md shadow-black/40 verflow-hidden relative cursor-pointer hover:ring-2 hover:ring-gray-400 transition"
              >
                <img
                  :src="
                    item.coverURL || 'https://placehold.co/600x300?text=封面圖'
                  "
                  class="w-full h-60 object-cover rounded-tl-xl rounded-tr-xl mb-3"
                  alt="行程封面照"
                />
                <div class="px-5">
                  <h2 class="text-xl text-white font-bold mb-1">
                    {{ item.title }}
                  </h2>
                  <p class="text-white text-m">
                    {{ item.startDate }} - {{ item.endDate }}
                  </p>
                  <p class="text-white text-m mt-2">{{ item.description }}</p>
                </div>
                <button
                  @click.stop="deleteSchedule(item.id)"
                  title="刪除行程"
                  class="absolute bottom-2 right-2 text-gray-600 bg-white px-2 rounded-2xl hover:text-red-500 text-md"
                >
                  刪除行程
                </button>
              </div>
            </div>
            <div v-else class="text-gray-400 text-center">尚未建立任何行程</div>
          </div>

          <ScheduleDetail
            v-else
            :trip-id="editingTripId"
            :selected-date="selectedTrip?.days?.[currentDayIndex]?.date"
            ref="scheduleDetailRef"
            @back="handleCloseDetail"
            @day-changed="currentDayIndex = $event"
            class="w-[50%] lg:w-full"
          />
        </div>
      </div>

      <div
        v-if="showForm"
        class="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 overflow-auto p-4"
      >
        <div>
          <TravelSchedule @close="handleCloseForm" />
        </div>
      </div>

      <PaymentModal
        v-if="showPayModal"
        :result="payResult"
        @close="showPayModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import TravelSchedule from "@/components/TravelSchedule.vue";
import axios from "axios";
import GoogleMapView from "@/views/GoogleMapView.vue";
import ScheduleDetail from "@/views/scheduleDetail.vue";
import { useTripStore } from "@/stores/tripStore";
import PaymentModal from "@/components/PaymentModal.vue";
import { APP_LOGOUT_EVENT, checkLoginStatus } from "@/composable/authUtils";


const router = useRouter();
const route = useRoute();
const editingTripId = ref(null);
const tripStore = useTripStore();
const showForm = ref(false);
const isPremium = ref(false);
const showPayModal = ref(false);
const selectedPlace = ref(null);
const defaultImage = "https://picsum.photos/1000?image";
const currentDayIndex = ref(0);
const itineraryRef = ref(null);
const dailyPlanRef = ref(null);
const mapRef = ref(null);
const scheduleDetailRef = ref(null);
const payResult = ref(null);

const selectedTrip = computed(() => {
  return tripStore.trips.find((t) => t.id === editingTripId.value);
});

const fetchIsPremium = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    isPremium.value = res.data.isPremium;
  } catch (err) {
    console.error("無法取得會員資料");
  }
};

onMounted(() => {
  if (checkLoginStatus()) {
    tripStore.fetchTrips();
  } else {
   tripStore.trips = []; 
  }
  fetchIsPremium();

 window.addEventListener(APP_LOGOUT_EVENT, handleLogoutEvent);


  if (
    route.query.linepayResult === "success" ||
    route.query.linepayResult === "fail"
  ) {
    payResult.value = route.query.linepayResult;
    showPayModal.value = true;
  }
});

const handleOpenForm = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("請先登入會員");
    return;
  }

  const count = tripStore.trips.length;

  if (isPremium.value || count < 1) {
    showForm.value = true;
  } else {
    showPayModal.value = true;
  }
};

const goToPay = () => {
  showPayModal.value = false;
  router.push("/payment");
};

function handlePlaceAdded() {
  if (scheduleDetailRef.value?.refreshDailyPlan) {
    scheduleDetailRef.value.refreshDailyPlan();
  }
}

function refreshDailyPlan() {
  dailyPlanRef.value?.refresh?.();
}

const handleCloseForm = () => {
  showForm.value = false;
  tripStore.fetchTrips();
  fetchIsPremium();
};

const handleCloseDetail = () => {
  editingTripId.value = null;
  tripStore.fetchTrips();
};

const deleteSchedule = async (id) => {
  const confirmed = confirm("確定刪除這個行程嗎?");
  if (!confirmed) return;

  const token = localStorage.getItem("token");

  try {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/travelSchedule/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    tripStore.trips = tripStore.trips.filter((s) => s.id !== id);
    alert("刪除成功");
  } catch (err) {
    alert("刪除失敗，請稍後再試");
  }
};

function handlePlaceSelect(place) {
  selectedPlace.value = place;
}

function callItinerary() {
  mapRef.value?.callItinerary();
}

defineExpose({
  refreshDailyPlan,
  dailyPlanRef,
});

onBeforeUnmount(() => {
  window.removeEventListener(APP_LOGOUT_EVENT, handleLogoutEvent);
});

function handleLogoutEvent() {
  tripStore.trips = [];
  editingTripId.value = null;
  showForm.value = false;
  showPayModal.value = false;
}
</script>

<style scoped></style>
