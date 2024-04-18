import { IUniCommonFile } from './uni-ui/common';

export interface IUser {
	_id: string;
	openid: string;
	nickname: string;
	avatar: string;
	avatar_file: IUniCommonFile;
	gender: IUserGender;
	brief: string;
	created_time: number;
	modified_time: number;
}
export type IUserGender = 0 | 1 | 2;
