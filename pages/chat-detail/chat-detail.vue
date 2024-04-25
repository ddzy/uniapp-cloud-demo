<template>
	<view class="container">
		<view class="message-section">
			<view class="message">
				<uni-list class="message-list">
					<uni-list-item
						v-for="v in messages"
						:class="{
							'message-item': true,
							'is-current-user': v.is_current_user,
						}"
						:key="v._id"
						:title="v.content"
						:thumb="v.avatar"
						:right-text="v.create_time"
						:border="false"
						clickable
					></uni-list-item>
				</uni-list>
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
export default {
	data() {
		return {
			to: '',
			inputValue: '',
			messages: [
				{
					_id: '1',
					content: '测试消息内容',
					avatar:
						'https://mp-65e620ad-f99b-46f7-a8c3-43f2c3a83942.cdn.bspapp.com/cloudstorage/94b1e4bb-a247-4e9c-a564-188b5d57ecbf.jpeg',
					avatar_file: {},
					create_time: this.$dayjs(Date.now()).fromNow(),
					is_current_user: false,
				},
				{
					_id: '2',
					content: '测试消息内容',
					avatar:
						'https://mp-65e620ad-f99b-46f7-a8c3-43f2c3a83942.cdn.bspapp.com/cloudstorage/94b1e4bb-a247-4e9c-a564-188b5d57ecbf.jpeg',
					avatar_file: {},
					create_time: this.$dayjs(Date.now()).fromNow(),
					is_current_user: true,
				},
			],
		};
	},
	computed: {
		computedPushClientId() {
			return this.$store.state.chat.pushClientId;
		},
	},
	onLoad(options: { to: string }) {
		this.to = options.to || '';
	},
	async onReady() {
		uni.onPushMessage((result) => {
			console.log('result :>> ', result);
		});
	},
	methods: {
		async handleConfirm() {
			await uniCloud.callFunction({
				name: 'chat',
				data: {
					push_clientid: this.computedPushClientId,
				},
			});
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
