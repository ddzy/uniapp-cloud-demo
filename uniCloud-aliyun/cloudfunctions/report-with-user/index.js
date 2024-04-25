'use strict';

const uniIdCommon = require('uni-id-common');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const uniId = uniIdCommon.createInstance({
		context,
	});
	const verify = await uniId.checkToken(event.uniIdToken);
	if (verify.errCode) {
		return verify;
	}
	const { uid } = verify;
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const deviceCollection = await db.collection('uni-id-device');
	const opendbDeviceCollection = await db.collection('opendb-device');
	const clientInfos = await uniCloud.getClientInfos();

	clientInfos.forEach(async (client) => {
		let updateData = {
			user_id: uid,
			ua: client.ua || '',
			uuid: client.uuid || '',
			os_name: client.osName || '',
			os_version: client.osVersion || '',
			os_language: client.osLanguage || '',
			os_theme: client.osTheme || '',
			vendor: client.vendor || '',
			push_clientid: event.push_clientid || '',
			device_id: client.deviceId || '',
			imei: client.imei || '',
			oaid: client.oaid || '',
			idfa: client.idfa || '',
			model: client.deviceModel || '',
			platform: client.platform || '',
			last_active_ip: client.clientIP || '',
		};
		let updateOpendbData = {
			appid: client.appId || '',
			device_id: client.deviceId || '',
			vendor: client.deviceBrand || '',
			push_clientid: event.push_clientid || '',
			model: client.deviceModel || '',
			platform: client.platform || '',
			uni_platform: client.uniPlatform || '',
			os_name: client.osName || '',
			os_version: client.osVersion || '',
			os_language: client.osLanguage || '',
			os_theme: client.osTheme || '',
			pixel_ratio: client.pixelRatio || '',
			network_model: client.networkModel || '',
			window_width: `${client.windowWidth}` || '',
			window_height: `${client.windowHeight}` || '',
			screen_width: `${client.screenWidth}` || '',
			screen_height: `${client.screenHeight}` || '',
			rom_name: client.romName || '',
			rom_version: client.romVersion || '',
			location_latitude: client.locationLatitude || '',
			location_longitude: client.locationLongitude || '',
			location_country: client.locationCountry || '',
			location_province: client.locationProvince || '',
			location_city: client.locationCity || '',
		};

		let { data: foundDevice } = await deviceCollection
			.where({
				user_id: uid,
			})
			.get({
				getOne: true,
			});

		// 更新 userid 和 push_clientid 的对照表
		if (foundDevice) {
			await deviceCollection.where({ user_id: uid }).update(updateData);
		} else {
			await deviceCollection.add(updateData);
		}

		// 更新设备的 opendb 表
		const foundOpendbDevice = await opendbDeviceCollection.where({
			device_id: updateData.device_id,
		});
		if (foundOpendbDevice) {
			await opendbDeviceCollection
				.where({
					device_id: updateData.device_id,
				})
				.update(updateOpendbData);
		} else {
			await opendbDeviceCollection.add(updateOpendbData);
		}
	});

	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '',
		data: null,
	};
};
