import { Store, createStore } from 'vuex';
import userModule, { IUserModuleState } from './modules/user';

export interface IRootModuleState {
	user : IUserModuleState
}

const store : Store<IRootModuleState> = createStore({
	modules: {
		user: userModule,
	},
	state: {
	} as IRootModuleState,
	mutations: {},
	actions: {},
});

export default store;