// callFunction 拦截器
uniCloud.addInterceptor('callFunction', {
	invoke(options) {
		if (!options.data) {
			options.data = {};
		}
		options.data.token = uni.getStorageSync('__token__') || '';
	},
	async success(res) {
		if (res.result.code === 401) {
			// 重新登录
			store.commit('user/UPDATE_IS_LOGINED', false);
			await uni.switchTab({
				url: '/pages/user/user',
			});
		}
	},
});

import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import dayjsUpdateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/zh-cn';
import App from './App';
import store from './store/store';

dayjs.locale('zh-cn');
dayjs.extend(dayjsRelativeTime);
dayjs.extend(dayjsUpdateLocale);

// #ifndef VUE3
import Vue from 'vue';
import './uni.promisify.adaptor';
Vue.config.productionTip = false;
Vue.prototype.$dayjs = dayjs;
App.mpType = 'app';
const app = new Vue({
	...App,
	store,
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
export function createApp() {
	const app = createSSRApp(App);
	app.config.globalProperties.$store = store;
	app.config.globalProperties.$dayjs = dayjs;

	return {
		app,
		store,
	};
}
// #endif
