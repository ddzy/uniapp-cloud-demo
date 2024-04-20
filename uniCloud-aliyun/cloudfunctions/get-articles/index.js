'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const articleCollection = await db.collection('article');
	const userCollection = await db.collection('uni-id-users');
	const params = {
		limit: 0,
		skip: 0,
		orderBy: '',
		...event,
	};

	const foundArticlesTemp = await articleCollection
		.field('_id,author_id,title,content,brief,avatar,create_date,update_date')
		.orderBy(params.orderBy)
		.getTemp();
	// 副表的临时表必须加上主表的 foreignKey 指向的字段，此处为 _id，即主表的 author_id 指向 _id
	const foundUserTemp = await userCollection
		.field('_id,nickname,avatar')
		.getTemp();

	let foundArticles = await db
		.collection(foundArticlesTemp, foundUserTemp)
		.get();
	foundArticles = foundArticles.data.map((v) => {
		return {
			...v,
			author_id: v.author_id[0],
		};
	});

	return {
		errCode: 0,
		errMsg: '',
		data: foundArticles,
	};
};
