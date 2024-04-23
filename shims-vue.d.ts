import * as lodash from 'lodash';
import * as dayjs from 'dayjs';
import * as utils from './utils/index';
import { store } from './store/store';

// add types in vue
declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$utils: typeof utils;
		$store: typeof store;
		$dayjs: typeof dayjs;
		$lodash: typeof lodash;
	}
}

export {};
