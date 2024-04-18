'use strict';

const cloudUtils = require('common-cloud-utils');
const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	const uniId = await uniIdCommon.createInstance({
		context,
	});
	// 第一次 token 鉴权，获取 uid
	const verify = await uniId.checkToken(event.uniIdToken);
	if (verify.errCode) {
		return verify;
	}
	const { uid } = verify;
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const userCollection = await db.collection('uni-id-users');

	// 退出登录时，更新 valid_token_date（uni-id内置的手动失效token的方式）
	await userCollection.doc(uid).update({
		valid_token_date: Date.now(),
	});

	const verifyAgain = await uniId.refreshToken({
		token: event.uniIdToken,
	});
	if (verifyAgain.errCode) {
		return verifyAgain;
	}

	//返回数据给客户端
	return verifyAgain;
};
