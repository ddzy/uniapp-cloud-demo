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

	const orderBy = params.orderBy
		.split(',')
		.filter(Boolean)
		.map((v) => {
			v = v.trim();
			let pair = v.split('=');
			return {
				field: pair[0],
				direction: pair[1],
			};
		});
	let res = articleCollection.limit(params.limit).skip(params.skip);
	orderBy.forEach(async (v) => {
		res = await res.orderBy(v.field, v.direction);
	});
	res = await res.get();

	//返回数据给客户端
	return res;
};
