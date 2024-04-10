/**
 * 浅合并两个对象
 * @param {Record<string, any>} a 源对象
 * @param {Record<string, any>} b 目标对象
 * @return a 源对象
 */
export function mergeObj(a: Record<string, any>, b: Record<string, any>) {
	for (let key in a) {
		if (b.hasOwnProperty(key)) {
			a[key] = b[key];
		}
	}
	return a;
}

/**
 * uni-file-picker 回显
 * 上传图片后返回路径，刷新页面的时候，保持 uni-file-picker 的正常显示
 * @param {string} url
 * @return
 */
export function echoUniFilePicker(url: string):
	| {
			extname: string;
			name: string;
			url: string;
	  }
	| {} {
	if (!url) {
		return {};
	}

	const res = {
		extname: '',
		name: '',
		url: '',
	};

	res.name = url.substring(url.lastIndexOf('/') + 1);
	let splitedName = res.name.split('.');
	res.extname = splitedName.length === 2 ? splitedName[1] : '';
	res.url = url;

	return res;
}
