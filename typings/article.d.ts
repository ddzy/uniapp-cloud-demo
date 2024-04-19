import { IUser } from './user';
import { IUniCommonFile } from './uni-ui/uni-ui.d.ts';

export interface IArticle {
	_id: string;
	title: string;
	content: string;
	brief: string;
	avatar: string;
	avatar_file?: IUniCommonFile;
	author_id: IUser;
	create_date: number;
	update_date: number;
}
