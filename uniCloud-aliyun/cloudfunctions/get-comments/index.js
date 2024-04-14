'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (verify.code !== 0) {
		return verify.data;
	}
	const { userid } = await verify.data;
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const commentCollection = await db
		.collection('comment')
		.where({
			article_id: event.article_id,
		})
		.orderBy(event.sort)
		.getTemp();

	let res = await db.collection(commentCollection, 'user').get();
	res = res.data.map((v) => {
		return {
			...v,
			author_id: v.author_id[0] || null,
		};
	});

	//返回数据给客户端
	return {
		code: 0,
		data: res,
	};
};
