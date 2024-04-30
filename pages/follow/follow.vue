<template>
	<view class="container">
		<unicloud-db
			v-slot:default="{ data, loading, error, options }: IUniUdb<IFollow[]>"
			ref="udbRef"
			:collection="collection.length ? collection : 'follow'"
			:getone="false"
			:loadtime="'manual'"
			@load="formatList"
		>
			<view v-if="error">{{ error.message }}</view>
			<view v-else class="list">
				<uni-list>
					<uni-list-item
						v-for="v in data"
						:key="v._id"
						:title="v.to.nickname"
						:thumb="v.to.avatar"
						:right-text="v.create_date"
						clickable
						@click="toChatDetailPage(v)"
					>
						<template #right>
							<uni-fav
								:checked="v.status"
								:contentText="{
									contentDefault: '关注',
									contentFav: '已关注',
								}"
								@click="follow(v)"
							></uni-fav>
						</template>
					</uni-list-item>
				</uni-list>
			</view>
		</unicloud-db>
	</view>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { IFollow, IUniUdb } from '../../typings/index';

const db = uniCloud.databaseForJQL();
const followCollection = db.collection('follow');
const userCollection = db.collection('uni-id-users');

export default defineComponent({
	data() {
		return {
			collection: [] as never[] as any[],
		};
	},
	computed: {
		computedUserId() {
			return this.$store.state.user.userInfo._id;
		},
	},
	watch: {
		computedUserId: {
			handler(newValue) {
				if (newValue) {
					this.collection = [
						followCollection
							.where({
								from: this.computedUserId,
								status: true,
							})
							.field('_id,to,status,create_date')
							.orderBy('create_date', 'desc')
							.getTemp(),
						userCollection.field('_id,nickname,avatar').getTemp(),
					];
					this.$nextTick(() => {
						// 手动获取首屏数据
						const udb = this.$refs.udbRef as any;
						udb && udb.loadData();
					});
				}
			},
			immediate: true,
		},
	},
	methods: {
		formatList(data: IFollow[]) {
			data.forEach((v) => {
				// @ts-ignore
				v.create_date = this.$dayjs(v.create_date).fromNow();
				// @ts-ignore
				v.to = v.to[0];
			});
		},
		follow(row: IFollow) {},
		toChatDetailPage(row: IFollow) {
			uni.navigateTo({
				url: `/pages/chat-detail/chat-detail?toId=${row.to._id}&toNickname=${row.to.nickname}`,
			});
		},
	},
	mounted() {},
});
</script>

<style scoped lang="scss">
.container {
}
</style>
