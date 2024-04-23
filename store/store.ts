import { InjectionKey } from 'vue';
import { Store, createStore } from 'vuex';
import userModule, { IUserModuleState } from './modules/user';

export interface IRootModuleState {
	user: IUserModuleState;
}

export const store: Store<IRootModuleState> = createStore<IRootModuleState>({
	modules: {
		user: userModule,
	},
	state: {} as IRootModuleState,
	mutations: {},
	actions: {},
});
export const storeKey: InjectionKey<Store<IRootModuleState>> = Symbol();
