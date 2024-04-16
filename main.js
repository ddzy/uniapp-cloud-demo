import constants from './constants/index';

// 需要重新登录的错误码
const ERROR_CODE_LOGIN_WHITELIST = [401000, 401001, 401002, 401003];
// 不需要全局 toast 的错误码
const ERROR_CODE_TOAST_BLACKLIST = [];

// callFunction 拦截器
uniCloud.addInterceptor('callFunction', {
	invoke(options) {
		if (!options.data) {
			options.data = {};
		}
		options.data.token = uni.getStorageSync(constants.token.TOKEN) || '';
	},
	async success(res) {
		if (!res.result) {
			return;
		}
		if (!ERROR_CODE_TOAST_BLACKLIST.includes(res.result.code)) {
			if (res.result.message) {
				uni.showToast({
					title: res.result.message,
					icon: 'none',
				});
			}
		}
		if (ERROR_CODE_LOGIN_WHITELIST.includes(res.result.code)) {
			// 清除 token
			await uni.removeStorage({
				key: constants.token.TOKEN,
			});
			// 需要重新登录
			store.commit('user/UPDATE_IS_LOGINED', false);
			await uni.switchTab({
				url: '/pages/user/user',
			});
		}
	},
});

uni.addInterceptor('request', {
	invoke(options) {},
	success() {},
	fail() {},
	complete() {},
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
