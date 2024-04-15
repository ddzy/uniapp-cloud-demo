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
				<template v-for="v in comments" :key="v._id">
					<uni-list-item
						:title="v.author_id.nickname"
						:note="v.content"
						:thumb="v.author_id.avatar_url"
						:right-text="v.created_time"
						thumb-size="sm"
						clickable
						@click="reply(v, v.author_id)"
					>
					</uni-list-item>
					<view v-if="!!v.replies.length" class="reply-section">
						<uni-list :border="false">
							<uni-list-item
								v-for="vv in v.replies"
								thumb-size="sm"
								clickable
								:key="vv._id"
								:thumb="vv.from.avatar_url"
								:right-text="vv.created_time"
							>
								<template #body>
									<view class="reply-body">
										<view class="reply-nickname">
											<text class="replay-nickname-from">{{
												vv.from.nickname
											}}</text>
										</view>
										<view class="reply-content">
											<text>
												<text>回复</text>
												<text class="reply-content-nickname"
													>@{{ vv.to.nickname }}
												</text>
												<text>：</text>
											</text>
											<text>{{ vv.content }}</text>
										</view>
									</view>
								</template>
							</uni-list-item>
						</uni-list>
					</view>
				</template>
			</uni-list>
		</uni-group>
		<view class="fab-section">
			<view class="fab-inner">
				<view class="fab-inputer">
					<uni-search-bar
						v-model="inputValue"
						:focus="isInputFocus"
						:cancel-button="'none'"
						:placeholder="computedInputPlaceholder"
						@confirm="confirmInput"
						@cancel="cancelInput"
						@blur="blurInput"
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
import { IComment, IReply, IUser } from '../../typings';

interface ILocalComment extends IComment {
	replies: ILocalReply[];
}
interface ILocalReply extends IReply {}

export default {
	data() {
		return {
			articleId: '',
			articleInfo: undefined,
			isFollowed: false,
			inputValue: '',
			isInputCommitting: false,
			isInputFocus: false,
			comments: [] as ILocalComment[],
			isReply: false, // 当前是评论还是回复
			replyInfo: {
				to: {
					_id: '',
					nickname: '',
				},
				comment: {
					_id: '',
				},
			},
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
		computedInputPlaceholder() {
			return this.isReply ? `回复 ${this.replyInfo.to.nickname}` : `理性评论`;
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
						replies: v.replies.map((vv) => {
							return {
								...vv,
								created_time: this.$dayjs(vv.created_time).fromNow(),
							};
						}),
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
		async confirmInput(v: string) {
			this.isReply ? this.sendReply() : this.sendComment();
		},
		async cancelInput(v: string) {
			console.log('v :>> ', v);
		},
		async blurInput() {
			this.isReply = false;
			this.isInputFocus = false;
		},
		async reply(comment: ILocalComment, to: IUser) {
			this.isReply = true;
			this.isInputFocus = true;
			this.replyInfo.comment = comment;
			this.replyInfo.to = to;
		},
		async sendComment() {
			this.isInputCommitting = true;

			try {
				const res = await uniCloud.callFunction({
					name: 'post-comment',
					data: {
						article_id: this.articleId,
						content: this.inputValue,
					},
				});
				if (res.result.code === 0) {
					uni.showToast({
						icon: 'none',
						title: '评论成功',
					});
					this.inputValue = '';
					this.fetchComments();
				}
				this.isInputCommitting = false;
			} catch (e) {
				//TODO handle the exception
				this.isInputCommitting = false;
			}
		},
		async sendReply() {
			this.isInputCommitting = true;

			try {
				const res = await uniCloud.callFunction({
					name: 'post-reply',
					data: {
						comment_id: this.replyInfo.comment._id,
						to: this.replyInfo.to._id,
						content: this.inputValue,
					},
				});
				if (res.result.code === 0) {
					uni.showToast({
						icon: 'none',
						title: '回复成功',
					});
					this.inputValue = '';
					this.fetchComments();
				}
				this.isInputCommitting = false;
			} catch (e) {
				//TODO handle the exception
				this.isInputCommitting = false;
			}
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
	.banner {
		width: 100%;
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
	:deep(.uni-group__content) {
		padding: 0 10px;
	}
	:deep(.uni-list-item) {
		.comment-footer {
		}
	}
}

.reply-section {
	margin-left: 20px;
	margin-bottom: 10px;
	padding: 10px;
	background-color: $uni-bg-color;
	:deep(.uni-list-item__container) {
		padding: 5px !important;
	}
	.reply-body {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-right: 8px;
		color: #3b4144;
		.reply-nickname {
			overflow: hidden;
			font-size: 14px;
			color: #3b4144;
			.replay-nickname-to {
				color: $uni-color-primary;
			}
		}
		.reply-content {
			overflow: hidden;
			margin-top: 6rpx;
			color: #999;
			font-size: 12px;
			.reply-content-nickname {
				color: $uni-color-primary;
			}
		}
	}
}
</style>
