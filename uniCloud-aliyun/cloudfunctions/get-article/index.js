'use strict';

const cloudUtils = require('common-cloud-utils');
const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	const uniId = await uniIdCommon.createInstance({
		context,
	});
	const verify = await uniId.checkToken(event.uniIdToken);
	let uid = '';
	if (verify.errCode) {
		uid = '';
	} else {
		uid = verify.uid;
	}
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const articleCollection = await db.collection('article');
	const userCollection = await db.collection('uni-id-users');
	const followCollection = await db.collection('follow');

	// 查找文章
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

	let { data: foundArticle } = await db
		.collection(foundArticleTemp, foundUserTemp)
		.get({ getOne: true });
	foundArticle.author_id = foundArticle.author_id[0];
	foundArticle.author_id.follow_status = false;

	// 查找当前登录用户和文章作者的关注状态
	let { data: foundFollow } = await followCollection
		.where({
			from: uid,
			to: foundArticle.author_id._id,
		})
		.get({
			getOne: true,
		});
	if (foundFollow) {
		foundArticle.author_id.follow_status = foundFollow.status;
	}

	return {
		errCode: 0,
		errMsg: '',
		data: foundArticle,
	};
};
