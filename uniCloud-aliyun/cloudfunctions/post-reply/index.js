'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	// 验证 token
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (verify.code !== 0) {
		return verify.data;
	}
	const { userid } = verify.data;
	const db = await uniCloud.databaseForJQL();
	const replyCollection = await db.collection('reply');
	const params = {
		from: userid,
		to: event.to,
		comment_id: event.comment_id,
		content: event.content,
		avatar_url: event.avatar_url || '',
	};

	const res = await replyCollection.add(params);

	//返回数据给客户端
	return {
		code: 0,
		data: res,
	};
};
