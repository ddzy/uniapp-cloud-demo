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
	const db = await uniCloud.databaseForJQL();
	const replyCollection = await db.collection('reply');
	const params = {
		from: uid,
		to: event.to,
		comment_id: event.comment_id,
		content: event.content,
		avatar: event.avatar || '',
	};

	const { id } = await replyCollection.add(params);
	const replyCollectionTemp = await replyCollection
		.where({
			_id: id,
		})
		.getTemp();
	const { data } = await db.collection(replyCollectionTemp, 'user').get({
		getOne: true,
	});
	data.from = data.from[0];
	data.to = data.to[0];

	//返回数据给客户端
	return {
		code: 0,
		data,
	};
};
