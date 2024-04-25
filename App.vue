<script lang="ts">
import constants from './constants/index';

export default {
	async onLaunch() {
		console.log('App Launch');
		// 获取客户端唯一推送标识
		const { cid } = await uni.getPushClientId({});
		// 启动应用时，上报数据
		uniCloud.callFunction({
			name: 'report',
			data: {
				push_clientid: cid,
			},
		});

		// 获取用户信息
		this.$store.dispatch('user/DISPATCH_USER_INFO');

		// 监听 token 刷新
		uniCloud.onRefreshToken(async (result) => {
			// refreshToken刷新成功，存储token
			uni.setStorageSync(constants.token.TOKEN, result?.token ?? '');
			uni.setStorageSync(
				constants.token.TOKEN_EXPIRED,
				result?.tokenExpired || 0,
			);
			// 重新获取用户信息
			this.$store.dispatch('user/DISPATCH_USER_INFO');
			// 重新获取客户端唯一推送标识
			const { cid } = await uni.getPushClientId({});
			// token刷新和登录后重新关联用户和推送标识
			await uniCloud.callFunction({
				name: 'report-with-user',
				data: {
					push_clientid: cid,
				},
			});
		});
	},
	async onShow() {
		console.log('App Show');
	},
	async onHide() {
		console.log('App Hide');
	},
};
</script>

<style>
/*每个页面公共css */
</style>
