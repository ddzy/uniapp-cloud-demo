// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
module.exports = {
	trigger: {
		async beforeUpdate({ updateData } = {}) {
			// 每次修改用户信息时自动更新修改时间
			updateData.modified_time = Date.now();
		},
	},
};
