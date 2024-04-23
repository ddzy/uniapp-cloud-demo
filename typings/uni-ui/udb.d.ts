export interface IUniUdb<D> {
	data: D;
	pagination: {
		size: number;
		current: number;
		count: number;
	};
	loading: boolean;
	hasMore: boolean;
	error: any;
	options: any;
}
