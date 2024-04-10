'use strict';

const cloudUtils = require('common-cloud-utils');
const db = uniCloud.database();

exports.main = async (event, context) => {
	//event为客户端上传的参数
	// token验证
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (!verify.pass) {
		return verify.payload;
	}
	const { openid } = verify.payload;
	const { avatar_url, nickname, gender, brief } = event;
	const userCollection = db.collection('user');

	await userCollection.where({ openid }).update({
		avatar_url,
		nickname,
		gender,
		brief,
	});

	//返回数据给客户端
	return {
		code: 0,
		message: '',
	};
};
