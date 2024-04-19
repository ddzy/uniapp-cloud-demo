// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
module.exports = {
	trigger: {
		async beforeUpdate(
			// 确定要监听什么样的 JQL 指令
			{ where, updateData, docId } = {}
		) {
			// 当上述 JQL 指令被触发时，将执行这里的代码
			// 这里就是普通的 unicloud 代码，可以调用 unicloud 的各种 api
			if (where._id || docId) {
				// 更新修改时间
				updateData.update_date = Date.now();
			}
		},
	},
};
