import { Module } from 'vuex';
import { IRootModuleState } from '../store';

export interface IChatModuleState {}

const chat: Module<IChatModuleState, IRootModuleState> = {
	namespaced: true,
	state: {},
	mutations: {},
	actions: {},
};

export default chat;
