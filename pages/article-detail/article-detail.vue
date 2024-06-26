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
								:checked="computedIsFollowed"
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
				<template v-for="(v, i) in comments" :key="v._id">
					<uni-list-item
						:title="v.author_id.nickname"
						:note="v.content"
						:thumb="v.author_id.avatar"
						:right-text="v.create_date"
						thumb-size="sm"
						clickable
						@click="reply(v, v.author_id, i)"
					>
					</uni-list-item>
					<unicloud-db
						v-slot:default="{ data, error, pagination, hasMore, loading }"
						:collection="[
							replyCollection
								.where({
									comment_id: v._id,
								})
								.field('from,to,_id,content,create_date')
								.orderBy('create_date', 'desc')
								.getTemp(),
							userCollection.field('_id,nickname,avatar').getTemp(),
						]"
						:ref="`replyDBRef-${v._id}`"
						:getone="false"
						:getcount="true"
						:loadtime="'manual'"
						:page-size="5"
						@load="replyLoad"
					>
						<view v-if="error">{{ error.message }}</view>
						<template v-else-if="!!pagination.count">
							<view class="reply-section">
								<uni-list :border="false">
									<uni-list-item
										v-for="vv in data"
										thumb-size="sm"
										clickable
										:key="vv._id"
										:thumb="vv.from.avatar"
										:right-text="vv.create_date"
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
								<view
									v-if="hasMore"
									class="reply-loadmore"
									@click="replyLoadMore(v._id)"
								>
									<text class="reply-loadmore-text">
										查看剩余{{ pagination.count - data.length }}条回复
									</text>
									<uni-icons
										class="reply-loadmore-icon"
										type="down"
									></uni-icons>
								</view>
							</view>
						</template>
					</unicloud-db>
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
		<view class="edit-section">
			<uni-fab
				:pop-menu="false"
				:direction="'vertical'"
				:horizontal="'right'"
				:vertical="'bottom'"
				:content="[]"
				:popMenu="false"
				:pattern="{
					icon: 'compose',
				}"
				@fabClick="toOperatePage"
			></uni-fab>
		</view>
	</view>
</template>

<script lang="ts">
import { IComment, IReply, IUser, IArticle } from '../../typings';

interface ILocalComment extends IComment {}
interface ILocalReply extends Omit<IReply, 'create_date'> {
	create_date: string;
}

const db = uniCloud.databaseForJQL();

export default {
	data() {
		return {
			articleId: '',
			articleInfo: undefined as IArticle | undefined,
			isFollowCommitting: false,
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
				commentIndex: 0,
			},
			replyCollection: db.collection('reply'),
			userCollection: db.collection('uni-id-users'),
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
			let time = this.$dayjs(this.articleInfo?.create_date).format(
				'YYYY-MM-DD HH:mm:ss',
			);
			return `发表于：${time}`;
		},
		computedModifiedTime() {
			let time = this.$dayjs(this.articleInfo?.update_date).fromNow();
			return `最近更新于：${time}`;
		},
		computedAvatarUrl() {
			return (this.articleInfo && this.articleInfo.avatar) || '';
		},
		computedAuthorId() {
			return this.articleInfo?.author_id?._id ?? '';
		},
		computedAuthorName() {
			return this.articleInfo?.author_id?.nickname ?? '';
		},
		computedAuthorAvatar() {
			return this.articleInfo?.author_id?.avatar ?? '';
		},
		computedCurrentUserId() {
			return this.$store.state.user.userInfo._id || '';
		},
		computedInputPlaceholder() {
			return this.isReply ? `回复 ${this.replyInfo.to.nickname}` : `理性评论`;
		},
		computedIsFollowed() {
			return !!this.articleInfo?.author_id.follow_status;
		},
	},
	onLoad(options: { articleId: string }) {
		this.articleId = options.articleId || '';
	},
	onReady() {
		if (this.articleId) {
			this.fetchInfo();
			this.fetchComments(true);
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
			if (res && res.result.errCode === 0) {
				this.articleInfo = res.result.data;
			}
			uni.hideLoading();
		},
		async fetchComments(isFirstlyFetch = false) {
			const res = await uniCloud.callFunction({
				name: 'get-comments',
				data: {
					article_id: this.articleId,
					orderBy: 'create_date desc',
				},
			});
			if (res.result.errCode === 0) {
				this.comments = res.result.data.map((v: ILocalComment) => {
					return {
						...v,
						create_date: this.$dayjs(v.create_date).fromNow(),
					};
				});
				if (isFirstlyFetch) {
					this.replyLoadFirstly();
				}
			}
		},
		async replyLoadFirstly() {
			setTimeout(() => {
				this.comments.forEach((v, i) => {
					const dbs = (this.$refs[`replyDBRef-${v._id}`] as any[])[0];
					dbs.loadData();
				});
			}, 0);
		},
		async replyLoad(data: ILocalReply[]) {
			data.forEach((v) => {
				v.create_date = this.$dayjs(v.create_date).fromNow();
				// @ts-ignore
				v.from = v.from[0];
				// @ts-ignore
				v.to = v.to[0];
			});
		},
		async replyLoadMore(commentId: string) {
			const dbs = (this.$refs[`replyDBRef-${commentId}`] as Vue[])[0];
			// @ts-ignore
			dbs.loadMore();
		},
		async replyAppend(row: ILocalReply) {
			// 如果列表本来没有数据，那么创建评论后手动获取一次初始数据
			// @ts-ignore
			const dbs = this.$refs[`replyDBRef-${this.replyInfo.comment._id}`][0];
			if (!dbs.dataList.length) {
				dbs.loadData();
			} else {
				// 反之，将刚刚创建的评论追加到当前列表尾部
				row.create_date = this.$dayjs(row.create_date).fromNow();
				dbs.dataList = dbs.dataList.concat(row);
			}
		},
		toOperatePage() {
			uni.navigateTo({
				url: `/pages/operate-article/operate-article?articleId=${this.articleId}`,
			});
		},
		async follow() {
			if (this.isFollowCommitting) {
				return;
			}
			this.isFollowCommitting = true;
			try {
				const nextStatus = !this.articleInfo?.author_id.follow_status;
				const res = await uniCloud.callFunction({
					name: 'put-follow',
					data: {
						to: this.computedAuthorId,
						status: nextStatus,
					},
				});
				if (this.articleInfo) {
					this.articleInfo.author_id.follow_status = res.result.data.status;
				}
				this.isFollowCommitting = false;
			} catch (e) {
				//TODO handle the exception
				this.isFollowCommitting = false;
			}
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
		async reply(comment: ILocalComment, to: IUser, commentIndex: number) {
			this.isReply = true;
			this.isInputFocus = true;
			this.replyInfo.comment = comment;
			this.replyInfo.commentIndex = commentIndex;
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
				if (res.result.errCode === 0) {
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
				if (res.result.errCode === 0) {
					uni.showToast({
						icon: 'none',
						title: '回复成功',
					});
					this.inputValue = '';
				}
				this.isInputCommitting = false;
				this.replyAppend(res.result.data);
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
		.uni-list-item__content-title {
			color: #999;
			font-size: 12px;
		}
		.uni-list-item__content-note {
			font-size: 14px;
			color: #3b4144;
		}
	}
}

.reply-section {
	margin-left: 20px;
	margin-bottom: 10px;
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
			color: #999;
			font-size: 12px;
			.replay-nickname-to {
				color: $uni-color-primary;
			}
		}
		.reply-content {
			overflow: hidden;
			margin-top: 6rpx;
			font-size: 14px;
			color: #3b4144;
			.reply-content-nickname {
				color: $uni-color-primary;
			}
		}
	}
	.reply-loadmore {
		text-align: center;
		.reply-loadmore-text {
			font-size: 14px;
			color: $uni-color-primary;
		}
		.reply-loadmore-icon {
			:deep(.uni-icons) {
				color: $uni-color-primary !important;
				font-size: 14px !important;
			}
		}
	}
}

.edit-section {
	:deep(.uni-fab__circle) {
		bottom: 60px;
	}
}
</style>
