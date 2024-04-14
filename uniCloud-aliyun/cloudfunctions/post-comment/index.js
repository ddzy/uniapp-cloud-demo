'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (verify.code !== 0) {
		return verify.data;
	}
	const { userid } = await verify.data;
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const commentCollection = await db.collection('comment');
	const params = {
		author_id: userid,
		article_id: '',
		content: '',
		avatar_url: '',
	};

	for (let key in params) {
		if (event.hasOwnProperty(key)) {
			params[key] = event[key];
		}
	}

	const res = await commentCollection.add(params);

	//返回数据给客户端
	return {
		code: 0,
		data: res,
	};
};
