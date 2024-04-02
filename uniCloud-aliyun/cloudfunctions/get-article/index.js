'use strict';

const db = uniCloud.database();

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const res = await db.collection('article').doc(event._id).get();

	if (Array.isArray(res.data) && res.data.length) {
		return res.data[0];
	} else {
		return null;
	}
};