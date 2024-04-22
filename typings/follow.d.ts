import { IUser } from './user';

export interface IFollow {
	_id: string;
	from: IUser;
	to: IUser;
	status: boolean;
	create_date: number;
	update_date: number;
}
