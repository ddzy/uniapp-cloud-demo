<template>
	<view class="container">
		<uni-group title="" :top="0">
			<view v-if="computedAvatarUrl" class="banner-section">
				<image
					class="banner"
					:mode="'aspectFit'"
					:src="computedAvatarUrl"
				></image>
			</view>
			<uni-title
				class="title-section"
				type="h1"
				align="center"
				:title="computedTitle"
			></uni-title>
			<uni-list class="user-section" :border="false">
				<uni-list-item
					:title="computedAuthorName"
					:note="computedCreatedTime"
					:thumb="computedAuthorAvatar"
				>
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
		</uni-group>
		<uni-group title="评论" :top="0" class="comment-section">
			<uni-list :border="false">
				<uni-list-item
					v-for="v in comments"
					:key="v._id"
					:title="v.author_id.nickname"
					:note="v.content"
					:thumb="v.author_id.avatar_url"
				>
					<template #footer>
						<view class="comment-footer">
							<view class="comment-time">
								<text>{{ v.created_time }}</text>
							</view>
							<view class="comment-vote">
								<uni-icons type="hand-up" :size="22"></uni-icons>
							</view>
						</view>
					</template>
				</uni-list-item>
			</uni-list>
		</uni-group>
		<view class="fab-section">
			<view class="fab-inner">
				<view class="fab-inputer">
					<uni-search-bar
						v-model="commentValue"
						:focus="false"
						:cancel-button="'none'"
						placeholder="友好评论"
						@confirm="confirmComment"
						@cancel="cancelComment"
					>
						<template v-slot:searchIcon>
							<uni-icons color="#999999" size="22" type="compose" />
						</template>
					</uni-search-bar>
				</view>
				<view class="fab-btns">
					<ul class="fab-btns-list">
						<li class="fab-btns-item">
							<uni-icons type="redo"></uni-icons>
						</li>
						<li class="fab-btns-item">
							<uni-icons type="star"></uni-icons>
						</li>
						<li class="fab-btns-item">
							<uni-icons type="hand-up"></uni-icons>
						</li>
					</ul>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import { IArticle, IComment, IUniFabContent } from '../../typings';

interface ILocalComment extends IComment {}

export default {
	data() {
		return {
			articleId: '',
			articleInfo: undefined,
			isFollowed: false,
			commentValue: '',
			isCommenting: false,
			comments: [] as ILocalComment[],
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
			let time = this.$dayjs(this.articleInfo?.created_time).format(
				'YYYY-MM-DD HH:mm:ss'
			);
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
		computedCurrentUserId() {
			return this.$store.state.user.userInfo._id || '';
		},
	},
	onLoad(options) {
		this.articleId = options.articleId || '';
	},
	onShow() {
		if (this.articleId) {
			this.fetchInfo();
			this.fetchComments();
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
				// 判断当前登录的用户是否是文章的作者
				if (this.articleInfo.author_id._id === this.computedCurrentUserId) {
				} else {
					// 反之，显示【收藏文章】按钮
				}
			}
			uni.hideLoading();
		},
		async fetchComments() {
			const res = await uniCloud.callFunction({
				name: 'get-comments',
				data: {
					article_id: this.articleId,
					sort: 'created_time desc',
				},
			});
			if (res.result.code === 0) {
				this.comments = res.result.data.map((v: ILocalComment) => {
					return {
						...v,
						created_time: this.$dayjs(v.created_time).fromNow(),
					};
				});
			}
		},
		toOperatePage() {
			uni.navigateTo({
				url: `/pages/operate-article/operate-article?articleId=${this.articleId}`,
			});
		},
		async follow() {
			this.isFollowed = !this.isFollowed;
		},
		async confirmComment(v: string) {
			this.isCommenting = true;

			try {
				const res = await uniCloud.callFunction({
					name: 'post-comment',
					data: {
						article_id: this.articleId,
						content: this.commentValue,
					},
				});
				if (res.result.code === 0) {
					uni.showToast({
						icon: 'none',
						title: '评论成功',
					});
					this.commentValue = '';
					this.fetchComments();
				}
				this.isCommenting = false;
			} catch (e) {
				//TODO handle the exception
				this.isCommenting = false;
			}
		},
		async cancelComment(v: string) {
			console.log('v :>> ', v);
		},
	},
};
</script>

<style lang="scss" scoped>
.container {
	padding-bottom: 60px;
}

.banner-section {
	text-align: center;
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

.fab-section {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #fff;
	.fab-inner {
		display: flex;
		align-items: center;
		height: 60px;
	}
	.fab-inputer {
		flex: 1;
	}
	.fab-btns {
		flex-shrink: 0;
		.fab-btns-list {
			display: flex;
			align-items: center;
		}
		.fab-btns-item {
			margin-right: $uni-spacing-row-base;
			:deep(.uni-icons) {
				font-size: 22px !important;
			}
		}
	}
}

.comment-section {
	.comment-footer {
		display: flex;
		align-items: center;
		flex-direction: column;
	}
	.comment-time {
		color: #999;
		font-size: 12px;
	}
	.comment-vote {
		margin-top: 6px;
		:deep(.uni-icons) {
			color: #999;
		}
	}
	:deep(.uni-list-item) {
		.comment-footer {
		}
	}
}
</style>
