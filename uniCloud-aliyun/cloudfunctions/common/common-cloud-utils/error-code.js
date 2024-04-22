const errorCodeMap = {
	401000: 'Unauthorized',
	401001: 'Bad Token',
	401002: 'Token Expired',
	401003: 'User Not Exist',

	500000: 'Internal Server Error',
	500001: '不能关注自己',
};

module.exports = errorCodeMap;
