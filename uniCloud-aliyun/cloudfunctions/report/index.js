'use strict';

exports.main = async (event, context) => {
	//event为客户端上传的参数
	const db = await uniCloud.databaseForJQL({
		event,
		context,
	});
	const opendbDeviceCollection = await db.collection('opendb-device');
	const clientInfos = await uniCloud.getClientInfos();

	clientInfos.forEach(async (client) => {
		let updateData = {
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
		const { data: foundDevice } = await opendbDeviceCollection
			.where({
				device_id: client.deviceId,
			})
			.get({
				getOne: true,
			});
		if (foundDevice) {
			// 如果设备已存在
			updateData = {
				...updateData,
				...foundDevice,
			};
			let res = await opendbDeviceCollection
				.where({
					device_id: client.deviceId,
				})
				.update(updateData);
		} else {
			// 如果设备不存在
			let res = await opendbDeviceCollection.add(updateData);
		}
	});

	//返回数据给客户端
	return {
		errCode: 0,
		errMsg: '',
		data: null,
	};
};
