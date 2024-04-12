<template>
	<view class="container">
		<view v-if="computedAvatarUrl" class="banner-section">
			<img class="banner" :src="computedAvatarUrl" alt="" />
		</view>
		<uni-title class="title-section" type="h1" align="center" :title="computedTitle"></uni-title>
		<uni-list class="user-section" :border="false">
			<uni-list-item :title="computedAuthorName" :note="computedCreatedTime" :thumb="computedAuthorAvatar">
				<template #footer>
					<view class="user-follow">
						<uni-fav
							:star="false"
							:checked="isFollowed"
							:content-text="{
								contentDefault: '关注',
								contentFav: '已关注',
							}"
							@click="follow"
						/>
					</view>
				</template>
			</uni-list-item>
		</uni-list>
		<view class="content-section">{{ computedContent }}</view>
		<view class="extra-section">
			<text>{{ computedModifiedTime }}</text>
		</view>
		<view class="fab-section">
			<uni-fab :pop-menu="true" :direction="'vertical'" :horizontal="'right'" :vertical="'bottom'" :content="fabs" @trigger="fabTrigger"></uni-fab>
		</view>
	</view>
</template>

<script lang="ts">
import { IArticle, IUniFabContent } from '../../typings';

interface IData {
	articleId: string;
	articleInfo?: IArticle;
	isFollowed: boolean;
	fabs: IUniFabContent[];
}

export default {
	data(): IData {
		return {
			articleId: '',
			articleInfo: undefined,
			isFollowed: false,
			fabs: [
				{
					iconPath: '/static/images/edit-box-line.png',
					selectedIconPath: '/static/images/edit-box-fill-primary.png',
					text: '编辑',
					active: false,
				},
				{
					iconPath: '/static/images/bookmark-line.png',
					selectedIconPath: '/static/images/bookmark-fill-primary.png',
					text: '收藏',
					active: false,
				},
			],
		};
	},
	computed: {
		computedTitle() {
			return (this.articleInfo && this.articleInfo.title) || '';
		},
		computedContent() {
			return (this.articleInfo && this.articleInfo.content) || '';
		},
		computedCreatedTime() {
			let time = this.$dayjs(this.articleInfo?.created_time).format('YYYY-MM-DD HH:mm:ss');
			return `发表于：${time}`;
		},
		computedModifiedTime() {
			let time = this.$dayjs(this.articleInfo?.modified_time).fromNow();
			return `最近更新于：${time}`;
		},
		computedAvatarUrl() {
			return (this.articleInfo && this.articleInfo.avatar_url) || '';
		},
		computedAuthorName() {
			return this.articleInfo?.author_id?.nickname ?? '';
		},
		computedAuthorAvatar() {
			return this.articleInfo?.author_id?.avatar_url ?? '';
		},
	},
	onLoad(options) {
		this.articleId = options.articleId || '';
	},
	onShow() {
		if (this.articleId) {
			this.fetchInfo();
		}
	},
	methods: {
		async fetchInfo() {
			uni.showLoading({});
			const res = await uniCloud.callFunction({
				name: 'get-article',
				data: {
					_id: this.articleId,
				},
			});
			if (res && res.result && res.result.code === 0) {
				this.articleInfo = res.result.data;
			}
			uni.hideLoading();
		},
		toOperatePage() {
			uni.navigateTo({
				url: `/pages/operate-article/operate-article?articleId=${this.articleId}`,
			});
		},
		async fabTrigger(e) {
			switch (e.item.text) {
				case '编辑':
					this.toOperatePage();
					break;
				case '收藏':
					this.fabs[e.index].active = !e.item.active;
					break;
				default:
					break;
			}
		},
		async follow() {
			this.isFollowed = !this.isFollowed;
		},
	},
};
</script>

<style lang="scss">
.banner-section {
	height: 200px;
	text-align: center;

	.banner {
		max-width: 100%;
		max-height: 100%;
	}
}

.title-section {
	:deep(.uni-title__box) {
		padding: 8px;
	}
}

.user-section {
	:deep(.uni-list-item__container) {
		align-items: center;
	}
}

.content-section {
	padding: $uni-spacing-col-base $uni-spacing-row-base;
	white-space: pre-wrap;
}

.extra-section {
	padding: $uni-spacing-col-lg $uni-spacing-row-base;
	font-size: $uni-font-size-base;
	color: $uni-text-color-grey;
	text-align: right;
}

.btn-edit {
	position: fixed;
	right: 40px;
	bottom: 40px;

	:deep(.uni-icons) {
		color: #fff !important;
	}
}
</style>
