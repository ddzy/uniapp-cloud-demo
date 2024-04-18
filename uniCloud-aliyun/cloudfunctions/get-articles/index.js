'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const db = uniCloud.databaseForJQL({
		event,
		context,
	});
	const articleCollection = db.collection('article');

	const params = {
		limit: 0,
		skip: 0,
		orderBy: '',
		...event,
	};

	const foundArticlesTemp = await articleCollection
		.orderBy(params.orderBy)
		.getTemp();
	let foundArticles = await db
		.collection(foundArticlesTemp, 'uni-id-users')
		.get();
	foundArticles = foundArticles.data.map((v) => {
		return {
			...v,
			author_id: v.author_id[0],
		};
	});

	return {
		code: 0,
		data: foundArticles,
	};
};
