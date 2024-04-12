'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	// event为客户端上传的参数;
	// token验证;
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (verify.code !== 0) {
		return verify;
	}

	const { openid } = verify.data;
	const db = uniCloud.databaseForJQL({
		event,
		context,
	});
	const foundUser = await db.collection('user').where({ openid }).get({
		getOne: true,
	});

	if (!foundUser.data) {
		return {
			code: 401003,
			message: cloudUtils.errorCode[401003],
		};
	}
	return {
		code: 0,
		data: foundUser.data,
	};
};
