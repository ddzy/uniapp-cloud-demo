'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const articleCollection = await db.collection('article');
	try {
		const res = await articleCollection.doc(event._id).update(event.params);
		//返回数据给客户端
		return {
			code: 0,
			data: res,
		}
	} catch (e) {
		//TODO handle the exception
		return {
			code: -1,
			message: '',
			error: e,
		}
	}
};