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
	const replyCollection = await db.collection('reply');
	const userCollection = await db.collection('uni-id-users');
	const params = {
		from: uid,
		to: event.to,
		comment_id: event.comment_id,
		content: event.content,
		avatar: event.avatar || '',
	};

	const { id } = await replyCollection.add(params);
	const foundReplyTemp = await replyCollection
		.where({
			_id: id,
		})
		.field('from,to,content,create_date')
		.getTemp();
	const foundUserTemp = await userCollection
		.field('_id,nickname,avatar')
		.getTemp();
	const { data } = await db.collection(foundReplyTemp, foundUserTemp).get({
		getOne: true,
	});
	data.from = data.from[0];
	data.to = data.to[0];

	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '',
		data,
	};
};
