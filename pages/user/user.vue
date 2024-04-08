<template>
	<view class="container">
		<view class="user-section">
			<view
				class="user-avatar"
				:style="{
					backgroundImage: `url(${computedUserInfo.avatar_url})`,
				}"
			></view>
			<view v-if="computedIsLogined" class="user-profile">
				<text class="user-profile-nickname">{{ computedUserInfo.nickname }}</text>
				<text class="user-profile-brief">{{ computedUserInfo.brief }}</text>
				<view class="user-profile-gender">
					<uni-tag :text="computedUserInfo.gender" type="primary" inverted size="mini"></uni-tag>
				</view>
			</view>
			<view v-else class="user-login">
				<text @click="login">立即登录></text>
			</view>
			<view class="user-editor">
				<text>编辑个人资料</text>
			</view>
		</view>
		<view class="article-section">
			<uni-list>
				<uni-list-item title="我创建的" note="" show-arrow thumb=""></uni-list-item>
				<uni-list-item title="我赞过的" note="" show-arrow thumb=""></uni-list-item>
				<uni-list-item title="我看过的" note="" show-arrow thumb=""></uni-list-item>
				<uni-list-item title="我收藏的" note="" show-arrow thumb=""></uni-list-item>
			</uni-list>
		</view>
		<view class="extra-section">
			<uni-list>
				<uni-list-item title="设置" note="" show-arrow thumb=""></uni-list-item>
			</uni-list>
		</view>
		<view class="logout-section">
			<button type="warn">退出登录</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isLogined: false,
		};
	},
	computed: {
		computedUserInfo() {
			return this.$store.state.user.userInfo;
		},
		computedIsLogined() {
			return this.computedUserInfo && this.computedUserInfo._id;
		},
	},
	methods: {
		async login() {
			const resOfModal = await uni.showModal({
				title: '温馨提示',
				content: '需要微信授权登录后继续使用',
			});
			if (resOfModal.confirm) {
				const { userInfo } = await uni.getUserProfile({
					lang: 'zh_CN',
					desc: '注册用户信息使用',
				});
				const { code } = await uni.login({
					provider: 'weixin',
				});
				const res = await uniCloud.callFunction({
					name: 'post-login',
					data: {
						code,
						avatar_url: userInfo.avatarUrl,
						nickname: userInfo.nickName,
					},
				});
				if (res.result.code === 0) {
					this.$store.commit('user/UPDATE_USER_INFO', res.result.data);
				}
			}
		},
	},
};
</script>

<style scoped lang="scss">
@import './user.scss';
</style>
