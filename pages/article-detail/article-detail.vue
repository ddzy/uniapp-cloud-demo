<template>
	<view class="container">
		<view class="avatar">
			<img class="avatar-img" :src="computedAvatarUrl" alt="" />
		</view>
		<uni-section class="mb-10" type="line" titleFontSize="20px" :title="computedTitle" :sub-title="computedAuthor"
			padding="0 20px 20px">{{computedContent}}</uni-section>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				articleId: '',
				articleInfo: {},
			}
		},
		computed: {
			computedTitle() {
				return this.articleInfo.title || ''
			},
			computedContent() {
				return this.articleInfo.content || ''
			},
			computedAvatarUrl() {
				return this.articleInfo.avatar_url || ''
			},
			computedAuthor() {
				return this.articleInfo.author || 'admin'
			},
		},
		onLoad(options) {
			this.articleId = options.articleId || '';
			if (this.articleId) {
				this.fetchInfo();
			}
		},
		methods: {
			async fetchInfo() {
				uni.showLoading({})
				const res = await uniCloud.callFunction({
					name: 'get-article',
					data: {
						_id: this.articleId,
					},
				})
				if (res && res.result) {
					this.articleInfo = res.result;
				}
				uni.hideLoading()
			},
		},
	}
</script>

<style lang="scss">
	.avatar {
		height: 200px;
		text-align: center;

		.avatar-img {
			max-width: 100%;
			max-height: 100%;

		}
	}

	:deep(.uni-section-content) {
		white-space: pre-wrap;
	}
</style>