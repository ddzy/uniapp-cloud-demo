<template>
	<view class="container">
		<view class="message-section">
			<scroll-view
				:scroll-y="true"
				:scroll-top="scrollTop"
				:scroll-with-animation="false"
				class="message"
				@scrolltolower="handleScrollToLower"
				@scroll="handleScroll"
			>
				<unicloud-db
					v-slot:default="{
						data,
						loading,
						error,
						options,
						pagination,
					}: IUniUdb<ITableData[]>"
					:collection="collection"
					loadtime="manual"
					ref="udbRef"
					@load="formatData"
				>
					<view v-if="error">{{ error.message }}</view>
					<view v-else class="">
						<uni-list class="message-list">
							<uni-list-item
								v-for="(v, i) in data"
								:class="{
									'message-item': true,
									'is-current-user': v.__isCurrentUser__,
								}"
								:key="`${v._id}-${i}`"
								:border="false"
								:data-_id="v._id"
								:data-__isunread__="v.__isunread__"
								:data-create_date="v.create_date"
								clickable
							>
								<template #header>
									<view class="message-item__header">
										<image
											:src="v.from_id.avatar"
											mode="scaleToFill"
											class="message-item__avatar"
										></image>
									</view>
								</template>
								<template #body>
									<view class="message-item__body">
										<view class="message-item__content">
											<text>{{ v.content }}</text>
										</view>
										<view class="message-item__time">
											<text>{{ v.__createDate__ }}</text>
										</view>
									</view>
								</template>
								<template #footer>
									<view class="message-item__footer">
										<uni-badge
											:text="v.__isunread__ ? '未读' : '已读'"
											:type="v.__isunread__ ? 'error' : 'success'"
										></uni-badge>
									</view>
								</template>
							</uni-list-item>
						</uni-list>
					</view>
				</unicloud-db>
			</scroll-view>
		</view>
		<view class="inputbox-section">
			<uni-search-bar
				v-model="inputValue"
				:cancel-button="'none'"
				placeholder="文明你我他"
				@confirm="handleConfirm"
			>
				<template #searchIcon>
					<uni-icons type="chat"></uni-icons>
				</template>
			</uni-search-bar>
		</view>
	</view>
</template>

<script lang="ts">
import {
	IChatMessage,
	IUniUdb,
	IUniScrollViewEvent,
} from '../../typings/index';

interface ITableData extends IChatMessage {
	__isCurrentUser__: boolean;
	__createDate__: string;
	__isunread__: boolean;
}

const db = uniCloud.databaseForJQL();
const chatMessageCollection = db.collection('chat-message');
const userCollection = db.collection('uni-id-users');
const chatMessageUnreadCollection = db.collection('chat-message-unread');

export default {
	data() {
		return {
			pushClientId: '',
			toId: '',
			sessionId: '',
			inputValue: '',
			collection: 'chat-message' as any,
			scrollTop: 0,
			hasScrollToBottom: false,
			observer: undefined as UniApp.IntersectionObserver | undefined,
			lastReadMessageId: '',
			lastReadMessageDate: Number.MAX_SAFE_INTEGER,
		};
	},
	computed: {
		computedUserId() {
			return this.$store.state.user.userInfo._id;
		},
	},
	async onLoad(options: {
		toId: string;
		toNickname: string;
		sessionId: string;
	}) {
		this.toId = options.toId || '';
		this.sessionId = options.sessionId ?? '';
		const { cid } = await uni.getPushClientId({});
		this.pushClientId = cid || '';
		// 设置标题
		uni.setNavigationBarTitle({
			title: options.toNickname || '会话',
		});
	},
	async onReady() {
		const foundChatMessagesTemp = await chatMessageCollection
			.where(`session_id == '${this.sessionId}'`)
			.field(
				'_id,from_id,to_id,session_id,content,avatar,create_date,update_date',
			)
			.orderBy('create_date', 'desc')
			.getTemp();
		const foundUserTemp = await userCollection
			.field('_id,nickname,avatar')
			.getTemp();
		this.collection = [foundChatMessagesTemp, foundUserTemp];
		this.$nextTick(() => {
			this.fetchData(true);
		});

		// 首次进入页面时，查找未读消息的时间点
		const { data: foundUnreadMessage } = await chatMessageUnreadCollection
			.where(
				`session_id == '${this.sessionId}' && user_id == '${this.computedUserId}'`,
			)
			.field(`_id,last_read_message_create_date`)
			.get({
				getOne: true,
			});
		this.lastReadMessageDate =
			foundUnreadMessage?.last_read_message_create_date ??
			this.lastReadMessageDate;

		// 监听实时的消息推送
		uni.onPushMessage((result) => {
			switch (result.type) {
				case 'receive':
					let payload = result.data.payload as {
						session_id: string;
						message: ITableData;
					};
					this.sessionId = payload.session_id || '';
					this.appendData(payload.message);
					break;
				default:
					break;
			}
		});
	},
	onUnload() {
		if (this.observer) {
			this.observer.disconnect();
		}
		uniCloud.callFunction({
			name: 'put-chat-message-read-status',
			data: {
				_id: this.lastReadMessageId,
				session_id: this.sessionId,
			},
		});
	},
	methods: {
		async fetchData(fetchNewest = false) {
			const udb = this.$refs.udbRef as any;
			if (fetchNewest) {
				// 获取最新的聊天记录
				udb.loadData({
					clear: true,
				});
			} else {
				udb.loadMore();
			}
		},
		async formatData(data: ITableData[]) {
			data.reverse();
			data.forEach((v) => {
				// @ts-ignore
				v.from_id = v.from_id[0];
				// @ts-ignore
				v.to_id = v.to_id[0];
				v.__createDate__ = this.$dayjs(v.create_date).fromNow();
				// 当前用户是否为消息的发送方，便于设置不同的样式
				v.__isCurrentUser__ = this.computedUserId === v.from_id._id;
				// 当前消息是否未读
				v.__isunread__ = v.create_date > this.lastReadMessageDate;
			});
			uni.stopPullDownRefresh();
			// 获取到数据后，自动滚动到底部
			setTimeout(() => {
				this.scrollToBottom();
				this.observeReadStatus();
			}, 0);
		},
		async appendData(data: ITableData) {
			const udb = this.$refs.udbRef as any;
			// @ts-ignore
			data.from_id = data.from_id[0];
			// @ts-ignore
			data.to_id = data.to_id[0];
			data.__createDate__ = this.$dayjs(data.create_date).fromNow();
			// 当前用户是否为消息的发送方，便于设置不同的样式
			data.__isCurrentUser__ = this.computedUserId === data.from_id._id;
			// 当前消息是否未读
			data.__isunread__ = data.create_date > this.lastReadMessageDate;

			if (udb) {
				udb.dataList = udb.dataList.concat(data);
				setTimeout(() => {
					// 如果新消息是当前用户发送的，那么列表自动滚动到底部
					if (data.from_id._id === this.computedUserId) {
						this.scrollToBottom();
					} else if (this.hasScrollToBottom) {
						// 如果接收方当前正处于列表底部，那么自动滚动到底部
						this.scrollToBottom();
					}
					this.observeReadStatus();
				}, 0);
			}
		},
		scrollToBottom() {
			// 解决除了首次滚动之外的其他滚动不生效的问题
			this.scrollTop -= 1;
			setTimeout(() => {
				this.scrollTop = Number.MAX_SAFE_INTEGER;
			}, 0);
		},
		observeReadStatus() {
			if (this.observer) {
				this.observer.disconnect();
			}
			this.observer = uni
				.createIntersectionObserver(this, {
					observeAll: true,
					// initialRatio: 1,
					thresholds: [0.5],
					initialRatio: 0,
				})
				.relativeTo('.message');
			this.observer.observe('.message-item', (res) => {
				if (res.intersectionRatio >= 0.5) {
					// 如果消息的DOM超过一半可见
					if ('dataset' in res) {
						const dataset = res.dataset as ITableData;
						// 如果消息可见，并且未读
						if (dataset.__isunread__) {
							// 更新最近一次的未读消息ID
							this.lastReadMessageId = dataset._id;
						}
					}
				}
			});
		},
		handleScrollToLower() {
			this.hasScrollToBottom = true;
			console.log('1 :>> ', 1);
		},
		handleScroll() {
			this.hasScrollToBottom = false;
			console.log('2 :>> ', 2);
		},
		async handleConfirm() {
			const res = await uniCloud.callFunction({
				name: 'post-chat-message',
				data: {
					push_clientid: this.pushClientId,
					to_id: this.toId,
					content: this.inputValue,
					session_id: this.sessionId,
				},
			});
			if (res.result.errCode === 0) {
				// 清空输入框
				this.inputValue = '';
				// 作为发送方，成功发送消息
				this.sessionId = res.result.data?.session_id ?? this.sessionId;
			}
		},
	},
};
</script>

<style lang="scss">
page {
	height: 100%;
}
</style>
<style lang="scss" scoped>
.container {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
	.message-section {
		box-sizing: border-box;
		flex: 1;
		overflow: auto;
		padding: $uni-spacing-col-base $uni-spacing-row-base 0;
		:deep(.message) {
			height: 100%;
		}
		.message-list {
			:deep(.uni-list) {
				.uni-list--border-top,
				.uni-list--border-bottom {
					display: none !important;
				}
			}
		}
		.message-item {
			&.is-current-user {
				:deep(.uni-list-item) {
					.uni-list-item__container {
						flex-direction: row-reverse !important;
						.message-item__avatar {
							margin-left: $uni-spacing-row-base;
							margin-right: 0;
						}
						.message-item__content {
							background-color: $uni-color-primary;
							color: $uni-bg-color;
							border-radius: 10px 0px 10px 10px;
						}
						.message-item__time {
							text-align: right;
						}
					}
				}
			}
			:deep(.uni-list-item) {
				.uni-list-item__container {
					padding: $uni-spacing-col-sm $uni-spacing-row-sm;
					.message-item__header {
					}
					.message-item__avatar {
						width: 36px;
						height: 36px;
						border-radius: $uni-border-radius-circle;
						margin-right: $uni-spacing-row-base;
					}
					.message-item__body {
					}
					.message-item__content {
						position: relative;
						padding: $uni-spacing-col-lg $uni-spacing-row-base;
						background-color: $uni-bg-color-grey;
						border-radius: 0px 10px 10px 10px;
						color: $uni-text-color;
					}
					.message-item__time {
						margin-top: $uni-spacing-col-base;
						color: $uni-text-color-grey;
						font-size: $uni-font-size-sm;
					}
					.message-item__footer {
					}
				}
			}
		}
	}

	.inputbox-section {
		flex-shrink: 0;
	}
}
</style>
