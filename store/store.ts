import { InjectionKey } from 'vue';
import { Store, createStore } from 'vuex';
import userModule, { IUserModuleState } from './modules/user';
import chatModule, { IChatModuleState } from './modules/chat';

export interface IRootModuleState {
	user: IUserModuleState;
	chat: IChatModuleState;
}

export const store: Store<IRootModuleState> = createStore<IRootModuleState>({
	modules: {
		user: userModule,
		chat: chatModule,
	},
	state: {} as IRootModuleState,
	mutations: {},
	actions: {},
});
export const storeKey: InjectionKey<Store<IRootModuleState>> = Symbol();
