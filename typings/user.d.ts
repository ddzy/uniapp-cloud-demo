export interface IUser {
	_id : string;
	openid : string;
	nickname : string;
	avatar_url : string;
	gender : IUserGender;
	created_time : number;
}
export type IUserGender = 'male' | 'female';