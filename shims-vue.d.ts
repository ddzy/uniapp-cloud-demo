import * as utils from './utils/index';
import store from './store/store';

// add types in vue
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$utils : typeof utils;
		$store : typeof store;
	}
}