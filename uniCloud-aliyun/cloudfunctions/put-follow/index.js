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
	const followCollection = await db.collection('follow');
	const params = {
		from: uid,
		to: event.to || '',
		status: event.status || false,
	};

	// 如果关注者和被关注者是同一个人
	if (params.from === params.to) {
		return {
			errCode: 500001,
			errMsg: cloudUtils.errorCode[500001],
			data: null,
		};
	}

	const { data: foundFollow } = await followCollection
		.where(`from == "${uid}" && to == "${event.to}"`)
		.get({ getOne: true });
	if (foundFollow) {
		params.from = foundFollow.from;
		params.to = foundFollow.to;
		await followCollection
			.where({
				from: params.from,
				to: params.to,
			})
			.update(params);

		return {
			errCode: 0,
			errMsg: '',
			data: {
				status: params.status,
			},
		};
	} else {
		await followCollection.add(params);

		return {
			errCode: 0,
			errMsg: '',
			data: {
				status: params.status,
			},
		};
	}
};
