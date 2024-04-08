import { Module } from 'vuex';
import { IUser } from '../../typings/index';
import { IRootModuleState } from '../store';

export interface IUserModuleState {
	userInfo: IUser;
}

const user: Module<IUserModuleState, IRootModuleState> = {
	namespaced: true,
	state: {
		userInfo: {
			_id: '',
			openid: '',
			nickname: '',
			avatar_url: '',
			gender: 'male',
			created_time: 0,
		},
	},
	mutations: {
		UPDATE_USER_INFO(state, payload) {
			state.userInfo = {
				...state.userInfo,
				...payload,
			};
		},
	},
	actions: {},
};

export default user;
