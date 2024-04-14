import { IArticle } from './article';
import { IUser } from './user';

export interface IComment {
	_id: string;
	article_id: IArticle;
	author_id: IUser;
	content: string;
	avatar_url: string;
	created_time: number;
}
