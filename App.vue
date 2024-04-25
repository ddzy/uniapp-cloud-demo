<script lang="ts">
import constants from './constants/index';

export default {
	onLaunch: function () {
		console.log('App Launch');
	},
	onShow: async function () {
		this.$store.dispatch('user/DISPATCH_USER_INFO');
		this.$store.dispatch('chat/DISPATCH_PUSH_CLIENT_ID');

		uniCloud.onRefreshToken((result) => {
			// refreshToken刷新成功，存储token
			uni.setStorageSync(constants.token.TOKEN, result?.token ?? '');
			uni.setStorageSync(
				constants.token.TOKEN_EXPIRED,
				result?.tokenExpired || 0,
			);
			// 重新获取客户端唯一推送标识
			this.$store.dispatch('chat/DISPATCH_PUSH_CLIENT_ID');
			this.$store.commit('user/UPDATE_IS_LOGINED', true);
		});
	},
	onHide: function () {
		console.log('App Hide');
	},
};
</script>

<style>
/*每个页面公共css */
</style>
