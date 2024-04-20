'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const commentCollection = await db.collection('comment');
	const userCollection = await db.collection('uni-id-users');
	const params = {
		limit: event.limit || 15,
		skip: event.skip || 0,
		orderBy: event.orderBy || 'create_date asc',
		article_id: event.article_id || '',
	};

	const foundCommentsTemp = await commentCollection
		.where({
			article_id: params.article_id,
		})
		.field('author_id,_id,content,create_date')
		.orderBy(params.orderBy)
		.getTemp();
	const foundUserTemp = await userCollection
		.field('_id,nickname,avatar')
		.getTemp();
	let { data } = await db.collection(foundCommentsTemp, foundUserTemp).get();
	data = data.map((v) => {
		return {
			...v,
			author_id: v.author_id[0],
		};
	});

	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '',
		data,
	};
};
