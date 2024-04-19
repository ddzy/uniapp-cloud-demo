'use strict';

const cloudUtils = require('common-cloud-utils');
const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	const uniId = await uniIdCommon.createInstance({
		context,
	});
	const verify = await uniId.checkToken(event.uniIdToken);
	if (verify.errCode) {
		return verify;
	}
	const { uid } = verify;
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const commentCollection = await db.collection('comment');
	const params = {
		author_id: uid,
		article_id: event.article_id || '',
		content: event.content || '',
	};

	const res = await commentCollection.add(params);

	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '',
		data: res,
	};
};
