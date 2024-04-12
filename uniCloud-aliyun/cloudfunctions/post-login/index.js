'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const res = await uniCloud.request({
		url: `https://api.weixin.qq.com/sns/jscode2session`,
		method: 'GET',
		data: {
			appid: 'wx28a5471917096b6d',
			secret: '9a652052457ae7dd7287cc3053934c61',
			js_code: event.code,
			grant_type: 'authorization_code',
		},
	});
	const { openid } = res.data;
	const db = uniCloud.databaseForJQL({
		event,
		context,
	});

	// 查询用户
	const foundExistingUsers = await db
		.collection('user')
		.where({
			openid,
		})
		.get({
			getOne: true,
		});
	// 如果用户已经存在（以 openid 作为查询标识）
	if (foundExistingUsers && foundExistingUsers.data) {
		// 生成 token
		const token = await cloudUtils.jwt.generateToken({
			openid,
			userid: foundExistingUsers.data._id,
		});

		return {
			code: 0,
			data: {
				user: foundExistingUsers.data,
				token,
			},
		};
	} else {
		// 如果用户不存在，那么创建新用户
		const createdUser = await db.collection('user').add({
			openid,
			avatar_url: event.avatar_url,
			nickname: event.nickname,
		});
		let foundUser = await db.collection('user').doc(createdUser.id).get({
			getOne: true,
		});
		// 生成 token
		const token = await cloudUtils.jwt.generateToken({
			openid,
			userid: foundUser.data._id,
		});

		return {
			code: 0,
			data: {
				user: foundUser.data,
				token,
			},
		};
	}
};
