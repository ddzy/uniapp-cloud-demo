import { Module } from 'vuex';
import { IUser } from '../../typings/index';
import { IRootModuleState } from '../store';

export interface IUserModuleState {
	userInfo: IUser;
	isLogined: boolean;
}

function genDefaultUserInfo(): IUser {
	return {
		_id: '',
		openid: '',
		nickname: '',
		avatar: '',
		avatar_file: {
			cloudPath: '',
			extname: '',
			fileID: '',
			fileType: '',
			image: {
				width: 0,
				height: 0,
				location: '',
			},
			name: '',
			path: '',
			size: 0,
			status: '',
			url: '',
			uuid: 0,
		},
		gender: 0,
		brief: '',
		create_date: 0,
		update_date: 0,
		follow_status: false,
	};
}

const user: Module<IUserModuleState, IRootModuleState> = {
	namespaced: true,
	state: {
		userInfo: genDefaultUserInfo(),
		isLogined: false,
	},
	mutations: {
		UPDATE_USER_INFO(state, payload) {
			state.userInfo = {
				...state.userInfo,
				...payload,
			};
		},
		UPDATE_IS_LOGINED(state, payload) {
			state.isLogined = !!payload;
			if (!state.isLogined) {
				state.userInfo = genDefaultUserInfo();
			}
		},
	},
	actions: {
		async DISPATCH_USER_INFO(store) {
			const res = await uniCloud.callFunction({
				name: 'get-user',
				data: {},
			});
			if (res.result && res.result.errCode === 0) {
				store.commit('UPDATE_USER_INFO', res.result.data);
				store.commit('UPDATE_IS_LOGINED', true);
			}
		},
	},
};

export default user;
