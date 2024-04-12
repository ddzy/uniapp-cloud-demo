// schema扩展相关文档请参阅：https://uniapp.dcloud.net.cn/uniCloud/jql-schema-ext.html
module.exports = {
	trigger: {
		async beforeCreate({ addDataList } = {}) {
			for (let v of addDataList) {
				if (!v.content) {
					throw new Error('缺少`content`字段');
				}
				// 每次创建文章时，自动生成文章描述
				v.description = v.content.slice(0, 60);
			}
		},
		async beforeUpdate(
			// 确定要监听什么样的 JQL 指令
			{ where, updateData } = {}
		) {
			// 当上述 JQL 指令被触发时，将执行这里的代码
			// 这里就是普通的 unicloud 代码，可以调用 unicloud 的各种 api
			if (
				typeof where._id === 'string' &&
				typeof where.author_id === 'string'
			) {
				if (updateData.content) {
					// 每次更新文章时，同样根据文章的内容生成描述
					updateData.description = updateData.content.slice(0, 60);
				}
				// 更新修改时间
				updateData.modified_time = Date.now();
			}
		},
	},
};
