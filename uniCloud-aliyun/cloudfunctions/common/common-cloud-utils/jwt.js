const jwt = require('jsonwebtoken');

const SECRET = '__jwt_secret__';

function generateToken(payload) {
	return new Promise((resolve, reject) => {
		try {
			let token = jwt.sign(payload, SECRET, {
				expiresIn: 60 * 60,
			});
			resolve(token);
		} catch (e) {
			//TODO handle the exception
			reject();
		}
	});
}
function verifyToken(token) {
	return new Promise((resolve, reject) => {
		try {
			let payload = jwt.verify(token, SECRET);
			resolve({
				pass: true,
				payload,
			});
		} catch (e) {
			//TODO handle the exception
			resolve({
				pass: false,
				payload: {
					code: 401,
					message: 'BAD TOKEN',
				},
			});
		}
	});
}

module.exports = {
	generateToken,
	verifyToken,
};
