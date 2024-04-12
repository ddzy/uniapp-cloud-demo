'use strict';

const cloudUtils = require('common-cloud-utils');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const res = await cloudUtils.jwt.expireToken(event.token);

	//返回数据给客户端
	return res;
};
