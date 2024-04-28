export interface IUniScrollViewEvent {
	detail: {
		scrollLeft: number;
		scrollTop: number;
		scrollHeight: number;
		scrollWidth: number;
		deltaX: number;
		deltaY: number;
	};
}
