'use strict';

const uniIdCommon = require('uni-id-common');
const cloudUtils = require('common-cloud-utils');

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
	const chatMessageCollection = await db.collection('chat-message');
	const chatMessageUnreadCollection = await db.collection(
		'chat-message-unread',
	);

	// 查找消息的ID
	const { data: foundChatMessage } = await chatMessageCollection
		.where({
			_id: event._id,
		})
		.get({ getOne: true });

	// 查找已有的未读消息记录
	let { data: foundUnreadChatMessage } = await chatMessageUnreadCollection
		.where({
			session_id: event.session_id,
			user_id: uid,
		})
		.get({ getOne: true });
	if (foundChatMessage) {
		if (!foundUnreadChatMessage) {
			await chatMessageUnreadCollection.add({
				session_id: event.session_id,
				user_id: uid,
				last_read_message_id: foundChatMessage._id,
				last_read_message_create_date: foundChatMessage.create_date,
			});
		} else {
			await chatMessageUnreadCollection
				.where({
					session_id: event.session_id,
					user_id: uid,
				})
				.update({
					last_read_message_id: foundChatMessage._id,
					last_read_message_create_date: foundChatMessage.create_date,
				});
		}
	}

	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '',
		data: null,
	};
};
