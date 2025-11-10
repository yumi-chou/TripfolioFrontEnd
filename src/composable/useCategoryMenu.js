import { ref } from "vue";

export function useCategoryMenu(
  initialCategories = [],
  initialPlaceCategories = [],
  maxCategoryCount = 4,
) {
  const categories = ref([...initialCategories]);
  const placeCategories = ref([...initialPlaceCategories]);
  const showCustomCategory = ref(false);
  const menuRef = ref(null);

  function addCategory(item) {
    const exists = categories.value.some((cat) => cat.type === item.type);
    if (exists) return;
    if (categories.value.length >= maxCategoryCount) {
      alert("已達上限，最多只能選擇 4 種類別");
      return;
    }
    categories.value.push(item);
    placeCategories.value = placeCategories.value.filter(
      (cat) => cat.type !== item.type,
    );
  }

  function removeCategory(item) {
    categories.value = categories.value.filter((cat) => cat.type !== item.type);

    const exists = placeCategories.value.some((cat) => cat.type === item.type);
    if (!exists) {
      placeCategories.value.push(item);
    }
  }

  function handleClickOutside(event) {
    if (menuRef.value && !menuRef.value.contains(event.target)) {
      showCustomCategory.value = false;
    }
  }

  return {
    categories,
    placeCategories,
    showCustomCategory,
    menuRef,
    addCategory,
    removeCategory,
    handleClickOutside,
  };
}
