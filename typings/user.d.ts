import { IUniCommonFile } from './uni-ui/common';

export interface IUser {
	_id: string;
	openid: string;
	nickname: string;
	avatar: string;
	avatar_file: IUniCommonFile;
	gender: IUserGender;
	brief: string;
	create_date: number;
	update_date: number;
}
export type IUserGender = 0 | 1 | 2;
