import { IUser } from './user';

export interface IArticle {
	_id: string;
	title: string;
	content: string;
	description: string;
	avatar_url: string;
	author_id: IUser;
	created_time: number;
	modified_time: number;
}
