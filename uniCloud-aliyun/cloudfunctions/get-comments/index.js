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
		article_id: event.article_id || '',
	};
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const commentCollection = await db
		.collection('comment')
		.where({
			article_id: params.article_id,
		})
		.orderBy(params.orderBy)
		.getTemp();

	const comments = [];
	let res = await db.collection(commentCollection, 'user').get();
	for (let comment of res.data) {
		// 查询该评论下的回复
		const {
			result: { data: replies },
		} = await uniCloud.callFunction({
			name: 'get-replies',
			data: {
				comment_id: comment._id,
				orderBy: params.orderBy,
				token: event.token,
			},
		});
		comments.push({
			...comment,
			author_id: comment.author_id[0],
			replies,
		});
	}

	//返回数据给客户端
	return {
		code: 0,
		data: comments,
	};
};
