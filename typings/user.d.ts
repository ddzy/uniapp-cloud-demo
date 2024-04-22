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

	// 未在数据库声明
	follow_status: boolean;
}
export type IUserGender = 0 | 1 | 2;
