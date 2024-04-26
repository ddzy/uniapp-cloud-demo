'use strict';

const cloudUtils = require('common-cloud-utils');
const uniIdCommon = require('uni-id-common');
const uniPush = uniCloud.getPushManager({
	appId: '__UNI__E827569',
});

exports.main = async (event, context) => {
	//event为客户端上传的参数
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
	const chatSessionCollection = await db.collection('chat-session');
	const chatMessageCollection = await db.collection('chat-message');
	const deviceCollection = await db.collection('uni-id-device');

	// 查找聊天会话
	let { data: foundChatSession } = await chatSessionCollection
		.where({
			_id: event.session_id,
		})
		.get({
			getOne: true,
		});
	if (!foundChatSession) {
		foundChatSession = await chatSessionCollection.add({
			from_id: uid,
			to_id: event.to_id,
		});
	}
	let foundChatSessionId = foundChatSession._id || foundChatSession.id || '';

	// 创建聊天消息
	let { id: foundChatMessageId } = await chatMessageCollection.add({
		from_id: uid,
		to_id: event.to_id,
		session_id: foundChatSessionId,
		content: event.content || '',
		avatar: event.avatar || '',
	});

	// 再次更新聊天会话，记录最近一次的聊天消息（即刚刚创建的消息）
	await chatSessionCollection
		.where({
			_id: foundChatSessionId,
		})
		.update({
			last_message_id: foundChatMessageId,
		});

	// 查找消息接收方的 push_clientid
	const { data: foundToUser } = await deviceCollection
		.where({
			user_id: event.to_id,
		})
		.get({
			getOne: true,
		});

	if (foundToUser) {
		await uniPush.sendMessage({
			title: '你收到一条消息',
			content: event.content,
			push_clientid: foundToUser.push_clientid,
			payload: {
				session_id: foundChatSessionId,
			},
		});
		return {
			errCode: 0,
			errMsg: '',
			data: {
				session_id: foundChatSessionId,
			},
		};
	} else {
		return {
			errCode: 500002,
			errMsg: cloudUtils.errorCode[500002],
			data: {
				session_id: foundChatSessionId,
			},
		};
	}
};