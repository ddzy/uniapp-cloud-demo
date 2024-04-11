'use strict';

const cloudUtils = require('common-cloud-utils');
const db = uniCloud.database();

exports.main = async (event, context) => {
	// token验证
	const verify = await cloudUtils.jwt.verifyToken(event.token);
	if (!verify.pass) {
		return verify.payload;
	}
	const { openid } = verify.payload;
	const articleCollection = await db.collection('article');
	const userCollection = await db.collection('user');
	//event为客户端上传的参数
	const params = {
		title: '',
		content: '',
		author_id: '',
		avatar_url: '',
		description: '',
	};
	for (const key in params) {
		if (event.hasOwnProperty(key)) {
			params[key] = event[key];
		}
	}
	params.description = params.content.slice(0, 60);

	// 设置作者
	const author = await userCollection.where({ openid }).get();
	if (author.data && author.data.length) {
		params.author_id = author.data[0]._id;
	}

	try {
		let res = await articleCollection.add(params);
		return {
			code: 0,
			data: res,
		};
	} catch (e) {
		return {
			code: -1,
			message: '创建出错',
			error: e,
		};
	}
};
