<template>
	<view class="container">
		<view class="goods-section">
			<uni-list>
				<uni-list-item
					v-for="v in articles"
					:key="v._id"
					:title="v.title"
					:note="v.brief"
					:thumb="v.avatar"
					:right-text="formatTime(v.update_date)"
					:clickable="true"
					thumbSize="lg"
					@click="toDetailPage(v)"
				></uni-list-item>
			</uni-list>
		</view>
		<view class="fab-section">
			<uni-fab
				:pop-menu="false"
				:direction="'vertical'"
				:horizontal="'right'"
				:vertical="'bottom'"
				:content="[]"
				:popMenu="false"
				@fabClick="fabClick"
			></uni-fab>
		</view>
	</view>
</template>

<script lang="ts">
import { IArticle } from '../../typings';

export default {
	data() {
		return {
			queryParams: {
				limit: 15,
				skip: 0,
				orderBy: 'update_date desc,create_date desc',
			},
			articles: [] as IArticle[],
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
			if (res.result.errCode === 0) {
				this.articles = res.result.data.map((v: IArticle) => {
					return {
						...v,
					};
				});
			}
			uni.hideLoading();
		},
		formatTime(v: number) {
			return this.$dayjs(v).fromNow();
		},
		fabClick() {
			this.toOperatePage();
		},
		async toOperatePage() {
			uni.navigateTo({
				url: `/pages/operate-article/operate-article`,
			});
		},
		async toDetailPage(row: IArticle) {
			uni.navigateTo({
				url: `/pages/article-detail/article-detail?articleId=${row._id}`,
			});
		},
	},
};
</script>

<style lang="scss">
.container {
}
</style>
