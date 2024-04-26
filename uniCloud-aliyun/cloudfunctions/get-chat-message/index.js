'use strict';

const uniIdCommon = require('uni-id-common');
const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const uniId = uniIdCommon.createInstance({
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
	const chatMessageCollection = await db.collection('chat-message');
	const userCollection = await db.collection('uni-id-users');

	const params = {
		limit: event.limit || cloudUtils.query.queryParams.limit,
		skip: event.skip || cloudUtils.query.queryParams.skip,
		orderBy: event.orderBy || cloudUtils.query.queryParams.orderBy,
		session_id: event.session_id || '',
	};

	// 根据会话ID查询聊天记录
	const foundChatMessagesTemp = await chatMessageCollection
		.where({
			session_id: event.session_id,
		})
		.field('_id,session_id,from_id,to_id,content,create_date,avatar')
		.orderBy(params.orderBy)
		.limit(params.limit)
		.skip(params.skip)
		.getTemp();
	const foundUserTemp = await userCollection
		.field('_id,nickname,avatar')
		.getTemp();
	const { data: foundChatMessages } = await db
		.collection(foundChatMessagesTemp, foundUserTemp)
		.get();

	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '',
		data: foundChatMessages,
	};
};
