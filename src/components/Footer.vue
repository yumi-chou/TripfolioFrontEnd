<template>
	<footer class="bg-gray-900 text-gray-400 py-8 px-4 sm:px-6 mt-20 rounded-t-3xl shadow-lg">
		<div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
			<div class="text-center sm:text-left text-sm">
				&copy; {{ currentYear }} TRIPFOLIO. All rights reserved.
			</div>

			<div class="flex flex-wrap justify-center sm:justify-end space-x-4">
				<RouterLink to="/privacy-policy" class="hover:text-white transition-colors duration-200 text-sm">
					隱私權政策
				</RouterLink>
				<span class="text-gray-600">|</span>
				<RouterLink to="/terms-of-service" class="hover:text-white transition-colors duration-200 text-sm">
					服務條款
				</RouterLink>
			</div>
		</div>
	</footer>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router'; 

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>

</style>
