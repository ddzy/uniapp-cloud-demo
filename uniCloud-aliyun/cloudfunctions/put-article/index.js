'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	// token验证
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (!verify.pass) {
		return verify.payload;
	}

	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const articleCollection = await db.collection('article');

	const res = await articleCollection.doc(event._id).update(event.params);
	//返回数据给客户端
	return {
		code: 0,
		data: res,
	};
};
