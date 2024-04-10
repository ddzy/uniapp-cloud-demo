'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	const articleCollection = await db.collection('article');
	//event为客户端上传的参数
	const params = {
		title: '',
		content: '',
		author_id: '',
		avatar_url: '',
		description: '',
	};
	for (const key in params) {
		if (event.hasOwnProperty(key)) {
			params[key] = event[key];
		}
	}
	params.description = params.content.slice(0, 60);

	try {
		let res = await articleCollection.add(params);
		return {
			code: 0,
			data: res,
		};
	} catch (e) {
		return {
			code: -1,
			message: '创建出错',
			error: e,
		};
	}
};
