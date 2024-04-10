'use strict';

const cloudUtils = require('common-cloud-utils');
const db = uniCloud.database();

exports.main = async (event, context) => {
	// token验证
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (!verify.pass) {
		return verify.payload;
	}

	//event为客户端上传的参数
	const res = await db.collection('article').doc(event._id).get();
	return {
		code: 0,
		data: res.data[0],
	};
};
