<template>
	<view class="container"> chat </view>
</template>

<script lang="ts">
export default {
	data() {
		return {};
	},
	computed: {
		computedUserInfo() {
			return this.$store.state.user.userInfo;
		},
	},
	mounted() {},
	methods: {},
};
</script>

<style lang="scss" scoped>
.container {
}
</style>
