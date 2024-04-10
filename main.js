import App from './App';
import store from './store/store';

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

// #ifndef VUE3
import Vue from 'vue';
import './uni.promisify.adaptor';
Vue.config.productionTip = false;
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

	return {
		app,
		store,
	};
}
// #endif
