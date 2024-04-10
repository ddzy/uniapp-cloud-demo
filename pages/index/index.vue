<template>
	<view class="container">
		<view class="goods">
			<uni-list>
				<uni-list-item
					v-for="v in articles"
					:key="v._id"
					:title="v.title"
					:note="v.description"
					:thumb="v.avatar_url"
					:right-text="v.author || 'admin'"
					:clickable="true"
					thumbSize="lg"
					@click="toDetailPage(v)"
				></uni-list-item>
			</uni-list>
		</view>
		<view class="btn btn-create">
			<button type="primary" class="btn-inner" @click="toOperatePage">
				<uni-icons type="plusempty"></uni-icons>
			</button>
		</view>
	</view>
</template>

<script lang="ts">
export default {
	data() {
		return {
			queryParams: {
				limit: 15,
				skip: 0,
			},
			articles: [],
		};
	},
	onShow() {
		this.fetchList();
	},
	methods: {
		_paramsFilter() {
			const rtn: any = {};
			const params: any = this.queryParams;

			for (const key in params) {
				if (['limit', 'skip'].includes(key)) {
					rtn[key] = params[key];
				} else if (params[key] && params[key] !== 'all') {
					rtn[key] = params[key];
				}
			}

			return rtn;
		},
		async fetchList() {
			uni.showLoading({});
			const params = this._paramsFilter();
			const res = await uniCloud.callFunction({
				name: 'get-articles',
				data: params,
			});
			if (res && res.result && Array.isArray(res.result.data)) {
				this.articles = res.result.data.map((v) => {
					return {
						...v,
					};
				});
			}
			uni.hideLoading();
		},
		async toOperatePage() {
			uni.navigateTo({
				url: `/pages/operate-article/operate-article`,
			});
		},
		async toDetailPage(row) {
			uni.navigateTo({
				url: `/pages/article-detail/article-detail?articleId=${row._id}`,
			});
		},
	},
};
</script>

<style lang="scss">
.container {
	.btn-create {
		position: fixed;
		right: 40px;
		bottom: 40px;

		:deep(.uni-icons) {
			color: #fff !important;
		}
	}
}
</style>
