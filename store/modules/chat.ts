import { Module } from 'vuex';
import { IRootModuleState } from '../store';

export interface IChatModuleState {
	pushClientId: string;
}

const chat: Module<IChatModuleState, IRootModuleState> = {
	namespaced: true,
	state: {
		pushClientId: '',
	},
	mutations: {
		UPDATE_PUSH_CLIENT_ID(state, payload) {
			state.pushClientId = payload;
		},
	},
	actions: {
		async DISPATCH_PUSH_CLIENT_ID(store) {
			const { cid } = await uni.getPushClientId({});
			store.commit('UPDATE_PUSH_CLIENT_ID', cid);
		},
	},
};

export default chat;
