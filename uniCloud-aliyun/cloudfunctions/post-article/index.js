'use strict';

const cloudUtils = require('common-cloud-utils');
const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	const uniId = uniIdCommon.createInstance({
		context,
	});
	// token验证
	const verify = await uniId.checkToken(event.uniIdToken);
	if (verify.errCode) {
		return verify;
	}
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const { uid } = verify;
	const articleCollection = await db.collection('article');
	//event为客户端上传的参数
	const params = {
		title: '',
		content: '',
		author_id: uid,
		avatar: '',
	};
	for (const key in params) {
		if (event.hasOwnProperty(key)) {
			params[key] = event[key];
		}
	}

	try {
		let res = await articleCollection.add(params);
		return {
			code: 0,
			data: res,
		};
	} catch (e) {
		return {
			code: 500000,
			message: cloudUtils.errorCode[500000],
			error: e,
		};
	}
};
