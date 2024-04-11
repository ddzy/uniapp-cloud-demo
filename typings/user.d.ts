export interface IUser {
	_id: string;
	openid: string;
	nickname: string;
	avatar_url: string;
	gender: IUserGender;
	brief: string;
	created_time: number;
	modified_time: number;
}
export type IUserGender = 'male' | 'female';
