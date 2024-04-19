'use strict';

const cloudUtils = require('common-cloud-utils');
const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	const uniId = await uniIdCommon.createInstance({
		context,
	});
	const verify = await uniId.checkToken(event.uniIdToken);
	if (verify.errCode) {
		return verify;
	}

	const { uid } = verify;
	const db = await uniCloud.database();
	const articleCollection = await db.collection('article');

	// 只允许用户修改自己的文章
	const res = await articleCollection
		.where({
			_id: event._id,
			author_id: uid,
		})
		.update({
			...event.params,
			avatar_file: event.params.avatar_file
				? event.params.avatar_file
				: db.command.remove(),
		});

	return {
		errCode: 0,
		errMsg: '',
		data: res,
	};
};
