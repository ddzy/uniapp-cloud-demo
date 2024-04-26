<template>
	<view class="container">
		<view class="message-section">
			<view class="message">
				<unicloud-db
					v-slot:default="{
						data,
						loading,
						error,
						options,
					}: IUniUdb<ITableData[]>"
					:collection="collection"
					loadtime="manual"
					ref="udbRef"
					@load="formatData"
				>
					<view v-if="error">{{ error.message }}</view>
					<view v-else>
						<uni-list class="message-list">
							<uni-list-item
								v-for="v in data"
								:class="{
									'message-item': true,
									'is-current-user': v.__isCurrentUser__,
								}"
								:key="v._id"
								:title="v.content"
								:thumb="v.from_id.avatar"
								:right-text="v.create_date"
								:border="false"
								clickable
							></uni-list-item>
						</uni-list>
					</view>
				</unicloud-db>
			</view>
		</view>
		<view class="inputbox-section">
			<uni-search-bar
				v-model="inputValue"
				:cancel-button="'none'"
				placeholder="文明你我他"
				@confirm="handleConfirm"
				@input="handleInput"
			>
				<template #searchIcon>
					<uni-icons type="chat"></uni-icons>
				</template>
			</uni-search-bar>
		</view>
	</view>
</template>

<script lang="ts">
import { IChatMessage, IUniUdb } from '../../typings/index';

interface ITableData extends IChatMessage {
	__isCurrentUser__: boolean;
}

const db = uniCloud.databaseForJQL();
const chatMessageCollection = db.collection('chat-message');
const userCollection = db.collection('uni-id-users');

export default {
	data() {
		return {
			pushClientId: '',
			toId: '',
			sessionId: '',
			inputValue: '',
			collection: 'chat-message' as any,
		};
	},
	computed: {
		computedUserId() {
			return this.$store.state.user.userInfo._id;
		},
	},
	async onLoad(options: { toId: string; sessionId: string }) {
		this.toId = options.toId || '';
		this.sessionId = options.sessionId ?? '';
		const { cid } = await uni.getPushClientId({});
		this.pushClientId = cid || '';
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

		// 作为接收方，监听实时的消息推送
		uni.onPushMessage((result) => {
			switch (result.type) {
				case 'receive':
					let payload = result.data.payload as {
						session_id: string;
					};
					// 接收到新消息，获取最新的消息列表
					this.sessionId = payload.session_id || '';
					this.fetchData(true);
					break;
				default:
					break;
			}
		});
	},
	onPullDownRefresh() {
		this.fetchData(true);
	},
	methods: {
		async fetchData(isFirstlyFetch = false) {
			const udb = this.$refs.udbRef as any;
			if (isFirstlyFetch) {
				// 获取首屏数据
				udb.loadData();
			} else {
			}
		},
		formatData(data: ITableData[]) {
			data.forEach((v) => {
				// @ts-ignore
				v.from_id = v.from_id[0];
				// @ts-ignore
				v.to_id = v.to_id[0];
				// @ts-ignore
				v.create_date = this.$dayjs(v.create_date).fromNow();
				// @ts-ignore
				v.update_date = this.$dayjs(v.update_date).fromNow();
				// 当前用户是否为消息的发送方，便于设置不同的样式
				v.__isCurrentUser__ = this.computedUserId === v.from_id._id;
			});
			uni.stopPullDownRefresh();
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
				// 作为发送方，成功发送消息
				this.sessionId = res.result.data?.session_id ?? this.sessionId;
				this.fetchData(true);
			}
		},
		handleInput() {},
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
		padding: $uni-spacing-col-base $uni-spacing-row-base 0;
		.message {
			overflow-x: hidden;
			overflow-y: auto;
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
			&:not(:first-child) {
				margin-top: $uni-spacing-col-lg;
			}
			&.is-current-user {
				:deep(.uni-list-item) {
					.uni-list-item__container {
						flex-direction: row-reverse !important;
						background-color: $uni-bg-color-grey;
						.uni-list-item__content {
							text-align: right;
						}
					}
				}
			}
			:deep(.uni-list-item) {
				.uni-list-item__container {
					padding: $uni-spacing-col-sm $uni-spacing-row-sm;
				}
				.uni-list-item__icon {
					margin-right: 0px !important;
				}
			}
		}
	}

	.inputbox-section {
		flex-shrink: 0;
	}
}
</style>
