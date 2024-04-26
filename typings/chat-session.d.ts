import { IChatMessage } from './chat-message';
import { IUser } from './user';

export interface IChatSession {
	_id: string;
	from_id: IUser;
	to_id: IUser;
	create_date: number;
	last_message_id: IChatMessage;
}
