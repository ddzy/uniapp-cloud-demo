'use strict';

const cloudUtils = require('common-cloud-utils');
const db = uniCloud.database();

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
	const foundExistingUsers = await db
		.collection('user')
		.where({
			openid,
		})
		.get();
	const token = await cloudUtils.jwt.generateToken({
		openid,
	});

	// 如果用户已经存在（以 openid 作为查询标识）
	if (foundExistingUsers && foundExistingUsers.data && foundExistingUsers.data.length) {
		return {
			code: 0,
			data: {
				user: foundExistingUsers.data[0],
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
		const foundUser = await db.collection('user').doc(createdUser._id);

		return {
			code: 0,
			data: {
				user: foundUser,
				token,
			},
		};
	}
};
