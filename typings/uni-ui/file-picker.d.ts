import { IUniCommonFile } from './common';

/**
 * https://uniapp.dcloud.net.cn/component/uniui/uni-file-picker.html
 */
export interface IUniFilePickerEvent {
	progress: number;
	index: number;
	tempFile: IUniCommonFile;
	tempFiles: IUniCommonFile[];
	tempFilePaths: string[];
}
