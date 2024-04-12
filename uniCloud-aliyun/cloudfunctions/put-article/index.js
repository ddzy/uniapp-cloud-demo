'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	// token验证
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (verify.code !== 0) {
		return verify;
	}

	const { openid, userid } = verify.data;
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const articleCollection = await db.collection('article');

	// 只允许用户修改自己的文章
	const res = await articleCollection
		.where({
			author_id: userid,
		})
		.update(event.params);

	return {
		code: 0,
		data: res,
	};
};
