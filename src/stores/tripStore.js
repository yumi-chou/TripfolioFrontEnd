import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/travelSchedule`;

export function generateDaysArray(trip) {
  if (!trip || !trip.startDate || !trip.endDate) return [];

  const start = dayjs(trip.startDate);
  const end = dayjs(trip.endDate);
  const days = [];

  for (let d = start; d.isSameOrBefore(end); d = d.add(1, "day")) {
    days.push({
      date: d.format("YYYY-MM-DD"),
      spots: [],
    });
  }
  return days;
}

export const useTripStore = defineStore("trip", () => {
  const trips = ref([]);
  const selectedTrip = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const selectedTripId = ref(null);

  const tripDays = computed(() => {
    return selectedTrip.value ? generateDaysArray(selectedTrip.value) : [];
  });

  async function fetchTrips() {
    isLoading.value = true;
    error.value = null;
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const scheduleData =
        response.data && Array.isArray(response.data.schedules)
          ? response.data.schedules
          : [];

      if (Array.isArray(scheduleData)) {
        trips.value = scheduleData.map((trip) => ({
          ...trip,
          days: generateDaysArray(trip),
        }));
      } else {
        trips.value = [];
        error.value = "獲取行程資料格式不正確。";
      }
    } catch (err) {
      error.value = err.message || "獲取行程失敗";
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTripById(id) {
    isLoading.value = true;
    error.value = null;
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      selectedTrip.value = {
        ...response.data,
        days: generateDaysArray(response.data),
      };
    } catch (err) {
      error.value = err.message || "獲取單一行程失敗";
    } finally {
      isLoading.value = false;
    }
  }

  async function updateTrip(tripId, updatedData) {
    if (!selectedTrip.value || selectedTrip.value.id !== tripId) {
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      for (const key in updatedData) {
        if (key === "cover" && updatedData[key] instanceof Blob) {
          formData.append(key, updatedData[key], "cover.jpeg");
        } else if (updatedData[key] !== undefined) {
          formData.append(key, updatedData[key]);
        }
      }

      const response = await axios.patch(
        `${API_BASE_URL}/${tripId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const updatedTripFromServer = response.data;

      if (selectedTrip.value && selectedTrip.value.id === tripId) {
        Object.assign(selectedTrip.value, updatedTripFromServer);
        selectedTrip.value.days = generateDaysArray(selectedTrip.value);
      }
      const index = trips.value.findIndex((t) => t.id === tripId);
      if (index !== -1) {
        Object.assign(trips.value[index], updatedTripFromServer);
        trips.value[index].days = generateDaysArray(trips.value[index]);
      }

      alert("行程更新成功！");
    } catch (error) {
      alert("更新行程失敗，請稍後再試。");
    }
  }

  async function deleteTrip(tripId) {
    isLoading.value = true;
    error.value = null;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_BASE_URL}/${tripId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      trips.value = trips.value.filter((trip) => trip.id !== tripId);
      if (selectedTrip.value && selectedTrip.value.id === tripId) {
        selectedTrip.value = null;
        selectedTripId.value = null;
      }
      alert("行程刪除成功！");
    } catch (err) {
      error.value = err.message || "刪除行程失敗";
      alert("刪除行程失敗，請稍後再試。");
    } finally {
      isLoading.value = false;
    }
  }

  async function addDay(tripId) {
    const trip = selectedTrip.value;
    if (trip && trip.id === tripId) {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
          `${API_BASE_URL}/${tripId}/addDay`,
          {},
          { headers: { Authorization: `Bearer ${token}` } },
        );

        const updatedTripFromServer = response.data;

        if (selectedTrip.value && selectedTrip.value.id === tripId) {
          Object.assign(selectedTrip.value, updatedTripFromServer);
          selectedTrip.value.days = generateDaysArray(selectedTrip.value);
        }

        const index = trips.value.findIndex((t) => t.id === tripId);
        if (index !== -1) {
          Object.assign(trips.value[index], updatedTripFromServer);
          trips.value[index].days = generateDaysArray(trips.value[index]);
        }
        alert("成功新增一天！");
        return updatedTripFromServer;
      } catch (error) {
        alert("新增天數失敗，請稍後再試。");
        throw error;
      }
    }
  }

  async function selectTrip(id) {
    selectedTripId.value = id;
    await fetchTripById(id);
  }

  return {
    trips,
    selectedTrip,
    isLoading,
    error,
    tripDays,
    selectedTripId,
    fetchTrips,
    fetchTripById,
    updateTrip,
    deleteTrip,
    addDay,
    selectTrip,
  };
});