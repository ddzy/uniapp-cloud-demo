'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (verify.code !== 0) {
		return verify.data;
	}
	const params = {
		limit: event.limit || 15,
		skip: event.skip || 0,
		orderBy: event.orderBy || 'created_time asc',
		comment_id: event.comment_id || '',
	};
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const replyCollection = await db
		.collection('reply')
		.where({
			comment_id: params.comment_id,
		})
		.orderBy(params.orderBy)
		.skip(params.skip)
		.limit(params.limit)
		.getTemp();
	let res = await db.collection(replyCollection, 'user').get();
	res = res.data.map((v) => {
		return {
			...v,
			from: v.from[0],
			to: v.to[0],
		};
	});

	//返回数据给客户端
	return {
		code: 0,
		data: res,
	};
};
