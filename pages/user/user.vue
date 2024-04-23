<template>
	<view class="container">
		<uni-group title="" class="common-section user-section" :top="0">
			<uni-list :border="false">
				<uni-list-item
					:title="computedIsLogined ? computedUserInfo.nickname : '立即登录'"
					:note="computedIsLogined ? computedUserInfo.brief : ''"
					:thumb="computedUserInfo.avatar"
					:rightText="computedIsLogined ? '编辑个人资料' : ''"
					:extra-icon="{ color: '#f0ad4e', size: '30', type: 'info-filled' }"
					:showExtraIcon="true"
					showArrow
					thumb-size="lg"
					clickable
					@click="login"
				/>
			</uni-list>
		</uni-group>
		<uni-group title="" margin-top="" class="common-section">
			<uni-list>
				<uni-list-item
					title="我创建的"
					note=""
					show-arrow
					clickable
					show-extra-icon
					:extra-icon="{ color: '', size: '22', type: 'checkbox' }"
				></uni-list-item>
				<uni-list-item
					title="我赞过的"
					note=""
					show-arrow
					thumb=""
					clickable
					show-extra-icon
					:extra-icon="{ color: '', size: '22', type: 'hand-up' }"
				></uni-list-item>
				<uni-list-item
					title="我关注的"
					note=""
					show-arrow
					thumb=""
					clickable
					show-extra-icon
					:extra-icon="{ color: '', size: '22', type: 'personadd' }"
					@click="toFollowPage"
				></uni-list-item>
				<uni-list-item
					title="我收藏的"
					note=""
					show-arrow
					thumb=""
					clickable
					show-extra-icon
					:extra-icon="{ color: '', size: '22', type: 'star' }"
				></uni-list-item>
			</uni-list>
		</uni-group>
		<uni-group title="" margin-top="" class="common-section">
			<uni-list>
				<uni-list-item
					title="设置"
					note=""
					show-arrow
					thumb=""
					clickable
					show-extra-icon
					:extra-icon="{ color: '', size: '22', type: 'gear' }"
				></uni-list-item>
			</uni-list>
		</uni-group>
		<uni-group
			v-if="computedIsLogined"
			title=""
			:top="30"
			class="common-section logout-section"
		>
			<uni-list>
				<uni-list-item
					title="退出登录"
					note=""
					thumb=""
					clickable
					@click="logout"
				></uni-list-item>
			</uni-list>
		</uni-group>
	</view>
</template>

<script lang="ts">
import { IUser } from '../../typings';
import constants from '../../constants/index';

export default {
	data() {
		return {
			isLogined: false,
		};
	},
	computed: {
		computedUserInfo() {
			return this.$store.state.user.userInfo as IUser;
		},
		computedIsLogined() {
			return this.$store.state.user.isLogined;
		},
	},
	onShow() {
		this.$store.dispatch('user/DISPATCH_USER_INFO');
	},
	methods: {
		toOperateUserPage() {
			uni.navigateTo({
				url: '/pages/operate-user/operate-user',
			});
		},
		toFollowPage() {
			uni.navigateTo({
				url: '/pages/follow/follow',
			});
		},
		async login() {
			if (this.computedIsLogined) {
				// 如果已经登录，则跳转到编辑个人资料页
				return this.toOperateUserPage();
			}

			const resOfModal = await uni.showModal({
				title: '温馨提示',
				content: '需要微信授权登录后继续使用',
			});
			if (resOfModal.confirm) {
				uni.showLoading({
					mask: true,
				});

				const { userInfo } = await uni.getUserProfile({
					lang: 'zh_CN',
					desc: '注册用户信息使用',
				});
				// 获取当前所处的小程序环境（微信小程序/支付宝小程序...）
				const { provider } = await uni.getProvider({
					service: 'oauth',
				});
				// 获取 code
				const { code } = await uni.login({
					provider: provider[0] as any,
				});
				// 根据 code，像自己的后台请求 openid
				const res = await uniCloud.callFunction({
					name: 'post-login',
					data: {
						code,
						avatar: userInfo.avatarUrl,
						nickname: userInfo.nickName,
					},
				});
				if (res.result.code === 0) {
					this.$store.commit('user/UPDATE_USER_INFO', res.result.data.user);
					this.$store.commit('user/UPDATE_IS_LOGINED', true);
					// 登录成功，存储token
					uni.setStorageSync(constants.token.TOKEN, res.result.data.token);
					uni.setStorageSync(
						constants.token.TOKEN_EXPIRED,
						res.result.data.tokenExpired,
					);
				}

				uni.hideLoading();
			}
		},
		async logout() {
			const resOfModal = await uni.showModal({
				title: '温馨提示',
				content: '确定要退出登录吗？',
			});
			if (resOfModal.confirm) {
				const res = await uniCloud.callFunction({
					name: 'post-logout',
					data: {},
				});
				if (res.errCode === 0) {
				}
			}
		},
	},
};
</script>

<style scoped lang="scss">
@mixin common-background() {
	background-repeat: no-repeat;
	background-position: center center;
	background-size: 100% 100%;
}

.container {
	min-height: 100vh;
	background-color: #f5f5f5;

	.common-section {
		:deep(.uni-group__content) {
			padding: 0;
		}
	}

	.user-section {
		:deep(.uni-group__content) {
			.uni-list-item__content-title {
				font-size: 18px;
			}
		}
	}

	.logout-section {
		:deep(.uni-list-item__content-title) {
			text-align: center;
			color: $uni-color-error;
		}
	}
}
</style>
