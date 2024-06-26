import constants from './constants/index';

// 需要跳转到登录页的错误码
const ERROR_CODE_SHOULD_GO_LOGIN = [
	'uni-id-token-expired',
	'uni-id-check-token-failed',
];
// 需要将全局登录状态设置为 未登录 的状态码
const ERROR_CODE_SHOULD_SET_LOGOUT_GLOBALLY = [
	'uni-id-token-expired',
	'uni-id-check-token-failed',
];
// 不需要全局 toast 的错误码
const ERROR_CODE_NOT_TOAST_GLOBALLY = [];
// 需要清除 token 的错误码
const ERROR_CODE_SHOULD_CLEAR_TOKEN = [
	'uni-id-token-expired',
	'uni-id-check-token-failed',
];

// callFunction 拦截器
uniCloud.addInterceptor('callFunction', {
	invoke(options) {
		if (!options.data) {
			options.data = {};
		}
	},
	async success(res) {
		if (!res.result) {
			return;
		}
		if (
			res.result.errCode &&
			!ERROR_CODE_NOT_TOAST_GLOBALLY.includes(res.result.errCode)
		) {
			if (res.result.errMsg) {
				await uni.showToast({
					title: res.result.errMsg,
					icon: 'none',
				});
			}
		}
		if (ERROR_CODE_SHOULD_CLEAR_TOKEN.includes(res.result.errCode)) {
			// 清除 token
			uni.removeStorageSync(constants.token.TOKEN);
			uni.removeStorageSync(constants.token.TOKEN_EXPIRED);
		}
		if (ERROR_CODE_SHOULD_SET_LOGOUT_GLOBALLY.includes(res.result.errCode)) {
			await store.commit('user/UPDATE_IS_LOGINED', false);
		}
	},
	fail(res) {
		// 云函数 throw 抛出的错误
		uni.showToast({
			title: res.message,
			icon: 'none',
		});
	},
});

uni.addInterceptor('request', {
	invoke(options) {},
	success() {},
	fail() {},
	complete() {},
});

import * as lodash from 'lodash';
import dayjs from 'dayjs';
import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
import dayjsUpdateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/zh-cn';
import App from './App';
import { store, storeKey } from './store/store';

dayjs.locale('zh-cn');
dayjs.extend(dayjsRelativeTime);
dayjs.extend(dayjsUpdateLocale);

// #ifndef VUE3
import Vue from 'vue';
import './uni.promisify.adaptor';
Vue.config.productionTip = false;
Vue.prototype.$dayjs = dayjs;
Vue.prototype.$lodash = lodash;
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
	app.config.globalProperties.$lodash = lodash;
	app.use(store, storeKey);

	return {
		app,
		store,
	};
}
// #endif
