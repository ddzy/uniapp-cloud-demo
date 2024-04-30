import { IChatSession } from './chat-session';
import { IUniCommonFile } from './uni-ui/common';
import { IUser } from './user';

export interface IChatMessage {
	_id: string;
	from_id: IUser;
	to_id: IUser;
	session_id: IChatSession;
	content: string;
	avatar: string;
	avatar_file: IUniCommonFile;
	create_date: number;
	update_date: number;
	read_status: boolean;
}
