'use strict';

const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	// event为客户端上传的参数;
	// uni-id token验证
	const uniId = await uniIdCommon.createInstance({
		context,
	});
	const verify = await uniId.checkToken(event.uniIdToken);
	if (verify.errCode) {
		return verify;
	}
	const { uid } = verify;
	const db = uniCloud.databaseForJQL({
		event,
		context,
	});
	const userCollection = await db.collection('uni-id-users');

	const foundUser = await userCollection.doc(uid).get({
		getOne: true,
	});

	return {
		code: 0,
		errCode: 0,
		errMsg: '',
		data: foundUser.data,
	};
};
