'use strict';

const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	//event为客户端上传的参数
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
	const { avatar, avatar_file, nickname, gender, brief } = event;
	const userCollection = db.collection('uni-id-users');

	await userCollection.doc(uid).update({
		avatar,
		avatar_file,
		nickname,
		gender,
		brief,
	});

	//返回数据给客户端
	return {
		code: 0,
		errCode: 0,
		errMsg: '',
		message: '',
	};
};
