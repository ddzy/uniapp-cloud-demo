import { IComment } from './comment';
import { IUser } from './user';

export interface IReply {
	_id: string;
	from: IUser;
	to: IUser;
	comment_id: IComment;
	content: string;
	avatar: string;
	created_time: number;
}
