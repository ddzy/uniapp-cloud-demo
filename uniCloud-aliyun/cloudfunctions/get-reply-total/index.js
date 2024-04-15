'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (verify.code !== 0) {
		return verify.data;
	}
	const params = {
		comment_id: event.comment_id || '',
	};
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const replyCollection = await db.collection('reply');

	const { total } = await replyCollection
		.where({
			comment_id: params.comment_id,
		})
		.count();

	//返回数据给客户端
	return {
		code: 0,
		data: total,
	};
};
