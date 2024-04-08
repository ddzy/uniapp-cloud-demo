'use strict';

const cloudUtils = require('common-cloud-utils');
const db = uniCloud.database();

exports.main = async (event, context) => {
	// token验证
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (!verify.pass) {
		return verify.payload;
	}

	//event为客户端上传的参数
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
