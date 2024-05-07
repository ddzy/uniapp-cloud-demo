<template>
	<view class="container">
		<unicloud-db
			v-slot:default="{ data, loading, error, options }: IUniUdb<ITableData[]>"
			:collection="collection"
			loadtime="manual"
			ref="udbRef"
			@load="formatData"
		>
			<view v-if="error">{{ error.message }}</view>
			<view v-else>
				<uni-list class="session-list">
					<uni-list-item
						v-for="v in data"
						:key="v._id"
						:title="v.from_id.nickname"
						:note="v.last_message_id.content"
						:thumb="v.from_id.avatar"
						:right-text="v.last_message_id.create_date"
						:clickable="true"
						thumb-size="lg"
						class="session-item"
						@click="toChatDetailPage(v)"
					>
						<template #header>
							<view class="session-item__header">
								<uni-badge
									:text="v.__unreadCount__"
									type="error"
									absolute="rightTop"
								>
									<image
										:src="v.from_id.avatar"
										class="session-avatar"
										mode="scaleToFill"
									></image>
								</uni-badge>
							</view>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
		</unicloud-db>
	</view>
</template>

<script lang="ts">
import { IChatSession, IUniUdb } from '../../typings';

interface ITableData extends IChatSession {
	__unreadCount__: number;
}

const db = uniCloud.databaseForJQL();
const chatSessionCollection = db.collection('chat-session');
const chatMessageCollection = db.collection('chat-message');
const chatUnreadMessageCollection = db.collection('chat-message-unread');
const userCollection = db.collection('uni-id-users');

export default {
	data() {
		return {
			collection: 'chat-session' as any,
		};
	},
	computed: {
		computedUserId() {
			return this.$store.state.user.userInfo._id;
		},
	},
	watch: {
		computedUserId: {
			handler(newValue: string) {
				if (newValue) {
					const foundChatSessionsTemp = chatSessionCollection
						.where(`from_id == "${newValue}" || to_id == "${newValue}"`)
						.field('_id,from_id,to_id,last_message_id,create_date')
						.orderBy('create_date', 'desc')
						.getTemp();
					const foundChatMessageTemp = chatMessageCollection
						.field('_id,content,avatar,create_date')
						.getTemp();
					const foundUserTemp = userCollection
						.field('_id,nickname,avatar')
						.getTemp();
					this.collection = [
						foundChatSessionsTemp,
						foundChatMessageTemp,
						foundUserTemp,
					];
					this.$nextTick(() => {
						// 获取首屏数据
						const udb = this.$refs.udbRef as any;
						udb.loadData({}, () => {
							setTimeout(() => {
								// 获取到会话之后，获取会话的未读消息数量
								this.fetchUnreadCount();
							}, 0);
						});
					});
				}
			},
		},
	},
	onPullDownRefresh() {
		const udb = this.$refs.udbRef as any;
		udb.loadData({ clear: true }, () => {
			setTimeout(() => {
				// 获取到会话之后，获取会话的未读消息数量
				this.fetchUnreadCount();
			}, 0);
		});
	},
	methods: {
		async fetchUnreadCount() {
			const udb = this.$refs.udbRef as any;
			udb.dataList.forEach(async (v: ITableData) => {
				// 查询每个会话的未读消息数量
				const { data: foundUnreadMessage } = await chatUnreadMessageCollection
					.where(
						`user_id == '${this.computedUserId}' && session_id == '${v._id}'`,
					)
					.get({
						getOne: true,
					});
				if (foundUnreadMessage) {
					const lastReadMessageDate =
						foundUnreadMessage.last_read_message_create_date;
					const { total } = await chatMessageCollection
						.where(
							`(from_id == '${this.computedUserId}' || to_id == '${this.computedUserId}') && create_date > ${lastReadMessageDate}`,
						)
						.count();
					v.__unreadCount__ = total;
				}
			});
		},
		formatData(data: ITableData[]) {
			data.forEach((v) => {
				// @ts-ignore
				v.from_id = v.from_id[0];
				// @ts-ignore
				v.to_id = v.to_id[0];
				// 会话列表始终显示消息接收方的信息
				if (this.computedUserId === v.from_id._id) {
					[v.from_id, v.to_id] = [v.to_id, v.from_id];
				}
				// @ts-ignore
				v.last_message_id = v.last_message_id[0];
				// @ts-ignore
				v.last_message_id.create_date = this.$dayjs(
					v.last_message_id.create_date,
				).fromNow();
			});
			// 获取到数据后关闭下拉刷新
			uni.stopPullDownRefresh();
		},
		toChatDetailPage(row: ITableData) {
			let toId = row.to_id._id;
			let toNickname = row.to_id.nickname;
			// 如果当前用户是会话的被发起方
			if (this.computedUserId === row.to_id._id) {
				toId = row.from_id._id;
				toNickname = row.from_id.nickname;
			}

			uni.navigateTo({
				url: `/pages/chat-detail/chat-detail?sessionId=${row._id}&toId=${toId}&toNickname=${toNickname}`,
			});
		},
	},
};
</script>

<style lang="scss" scoped>
.container {
	.session-item {
		:deep(.uni-list-item) {
			.session-item__header {
				display: flex;
				align-items: center;
				margin-right: $uni-spacing-row-lg;
				.session-avatar {
					width: 36px;
					height: 36px;
				}
			}
		}
	}
}
</style>
