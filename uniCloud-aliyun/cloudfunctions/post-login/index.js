'use strict';

const cloudUtils = require('common-cloud-utils');
const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const uniId = await uniIdCommon.createInstance({
		context,
	});
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
	const { openid, session_key } = res.data;
	// 此处使用 databaseForJQL 会提示没有权限
	const db = await uniCloud.database();
	const userCollection = await db.collection('uni-id-users');

	// 查询用户
	const foundExistingUsers = await userCollection
		.where({
			wx_openid: {
				mp: openid,
			},
		})
		.get();
	// 如果用户已经存在（以 openid 作为查询标识）
	if (foundExistingUsers.data && foundExistingUsers.data.length) {
		// uni-id 生成 token
		const { token, tokenExpired } = await uniId.createToken({
			uid: foundExistingUsers.data[0]._id,
			role: ['admin'],
			permission: [],
		});

		return {
			code: 0,
			errCode: 0,
			errMsg: '',
			data: {
				user: foundExistingUsers.data[0],
				token,
				tokenExpired,
			},
		};
	} else {
		// 如果用户不存在，那么创建新用户
		const createdUser = await userCollection.add({
			avatar: event.avatar,
			nickname: event.nickname,
			username: cloudUtils.lodash.uniqueId('游客'),
			wx_openid: {
				mp: openid,
			},
			third_party: {
				mp_weixin: {
					session_key,
				},
			},
			create_date: Date.now(),
			update_date: Date.now(),
		});
		let foundUser = await userCollection.doc(createdUser.id).get();
		// uni-id 生成 token
		const { token, tokenExpired } = await uniId.createToken({
			uid: foundUser.data[0]._id,
			role: ['admin'],
			permission: [],
		});

		return {
			code: 0,
			errCode: 0,
			errMsg: '',
			data: {
				user: foundUser.data[0],
				token,
				tokenExpired,
			},
		};
	}
};
