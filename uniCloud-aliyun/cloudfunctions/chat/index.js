'use strict';

const uniIdCommon = require('uni-id-common');
const uniPush = uniCloud.getPushManager({
	appId: '__UNI__E827569',
});

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const uniId = await uniIdCommon.createInstance({
		context,
	});
	const verify = await uniId.checkToken(event.uniIdToken);
	if (verify.errCode) {
		return verify;
	}
	const { uid } = verify;

	return await uniPush.sendMessage({
		title: '测试标题',
		content: '测试内容',
		push_clientid: event.push_clientid,
		payload: {
			text: '测试uni-cloud-push',
		},
	});
};
