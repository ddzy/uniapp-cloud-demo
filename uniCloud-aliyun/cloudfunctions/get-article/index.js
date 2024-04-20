'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const articleCollection = await db.collection('article');
	const userCollection = await db.collection('uni-id-users');

	const foundArticleTemp = await articleCollection
		.where({
			_id: event._id,
		})
		.field(
			'author_id,title,content,brief,avatar,avatar_file,create_date,update_date'
		)
		.getTemp();
	const foundUserTemp = await userCollection
		.field('_id,nickname,avatar')
		.getTemp();

	let res = await db
		.collection(foundArticleTemp, foundUserTemp)
		.get({ getOne: true });
	res = res.data;
	res.author_id = res.author_id[0];

	return {
		errCode: 0,
		errMsg: '',
		data: res,
	};
};
