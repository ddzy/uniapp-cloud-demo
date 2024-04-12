'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});

	// 1. 直接使用虚拟联表查询（性能较差）
	// const res = await db.collection('article,user').get();

	// 2. 先过滤获取主表的临时表，再联表查询
	// 临时表field方法内需要包含关联字段，否则无法建立关联关系
	const articleCollection = await db
		.collection('article')
		.where({
			_id: event._id,
		})
		.getTemp();
	// 注意collection方法内需要传入所有用到的表名，用逗号分隔，主表需要放在第一位
	let res = await db
		.collection(articleCollection, 'user')
		.get({ getOne: true });
	res = res.data;
	res.author_id =
		Array.isArray(res.author_id) && res.author_id.length
			? res.author_id[0]
			: null;

	return {
		code: 0,
		data: res,
	};
};
