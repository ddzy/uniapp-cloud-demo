const jwt = require('jsonwebtoken');
const errorCode = require('./error-code.js');

const JWT_SECRET = '__jwt_secret__';
const db = uniCloud.databaseForJQL();
const tokenCollection = db.collection('token-blacklist');

/**
 * 生成 token
 * @param {Object} payload
 * @param {string} payload.openid
 */
function generateToken(payload) {
	return new Promise((resolve, reject) => {
		try {
			let token = jwt.sign(payload, JWT_SECRET, {
				expiresIn: 60 * 60,
			});
			resolve(token);
		} catch (e) {
			//TODO handle the exception
			reject();
		}
	});
}

/**
 * 验证 token
 * @param {string} token
 */
async function verifyToken(token) {
	return new Promise(async (resolve, reject) => {
		try {
			// 判断 token 是否已经失效（即存在于黑名单中)
			let { total } = await tokenCollection.where({ token }).count();
			if (total) {
				throw new Error(1);
			}
			// 验证 token
			let payload = jwt.verify(token, JWT_SECRET);
			resolve({
				code: 0,
				data: payload,
			});
		} catch (e) {
			//TODO handle the exception
			resolve({
				code: 401002,
				data: null,
				message: errorCode[401002],
			});
		}
	});
}

/**
 * 手动让 token 过期
 * @param {string} token
 */
async function expireToken(token) {
	// 将 token 存入黑名单，每次检验 token 时，如果 token 存在于黑名单中则表明 token 失效
	return new Promise(async (resolve) => {
		try {
			const { total } = await tokenCollection
				.where({
					token,
				})
				.count();
			if (!total) {
				await tokenCollection.add({
					token,
				});
			}

			resolve({
				code: 401002,
				data: null,
				message: errorCode[401002],
			});
		} catch (e) {
			//TODO handle the exception
			resolve({
				code: 500000,
				data: null,
				message: errorCode[500000],
			});
		}
	});
}

module.exports = {
	generateToken,
	verifyToken,
	expireToken,
};
