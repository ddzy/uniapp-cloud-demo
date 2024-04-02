<template>
	<view>
		<uni-forms ref="form" :rules="rules" :modelValue="ruleForm" label-position="top" class="form">
			<uni-forms-item label="标题" name="title">
				<uni-easyinput v-model="ruleForm.title" placeholder="请输入标题" :maxlength="24" />
			</uni-forms-item>
			<uni-forms-item label="内容" name="content">
				<uni-easyinput v-model="ruleForm.content" autoHeight type="textarea" placeholder="请输入内容" :maxlength="-1" />
			</uni-forms-item>
			<uni-forms-item label="缩略图" name="avatar_url">
				<view class="form-avatar_url">
					<uni-file-picker v-model="ruleForm.avatar_url" title="" limit="1" file-mediatype="image"
						return-type="object"></uni-file-picker>
				</view>
			</uni-forms-item>
			<button type="primary" @click="submit">保存</button>
		</uni-forms>
	</view>
</template>

<script lang="ts">
	function genDefaultRuleForm() {
		return {
			title: '',
			content: '',
			avatar_url: "",
		};
	}

	export default {
		data() {
			return {
				ruleForm: genDefaultRuleForm(),
				rules: {
					title: {
						rules: [
							{
								required: true,
								errorMessage: '标题不能为空'
							},
							{
								maxLength: 24,
								errorMessage: '标题不能超过24个字符'
							},
						],
					},
					content: {
						rules: [
							{
								required: true,
								errorMessage: '内容不能为空'
							},
						],
					},
				},
				articleId: '',
			};
		},
		computed: {
			computedIsEdit() {
				return !!this.articleId;
			},
		},
		onLoad(option) {
			this.articleId = option.article_id || '';
			if (this.articleId) {
				this.fetchArticle();
			}
		},
		methods: {
			_paramsFilter() {
				const params = this.ruleForm as any;
				const result = {} as any;

				for (let key in params) {
					if (key === 'avatar_url') {
						result[key] = params[key].url;
					}
					else if (params[key] && params[key] !== 'all') {
						result[key] = params[key];
					}
				}
				return result;
			},
			async fetchArticle() {
				const res = await uniCloud.callFunction({
					name: 'get-article',
					data: {
						article_id: this.articleId,
					},
				})
				if (res && res.data) {
					console.log('res: ', res);
				}
			},
			async submit() {
				const form : any = this.$refs.form;
				try {
					await form.validate();
					const res = await uniCloud.callFunction({
						name: 'post-article',
						data: this._paramsFilter(),
					})

					if (res && res.result && res.result.code === 0) {
						uni.showToast({
							icon: 'success',
							title: '创建成功',
						})
						uni.navigateBack();
					}
				} catch (e) {
					//TODO handle the exception
				}
			},
		},
	}
</script>

<style lang="scss">
	.form {
		.form-avatar_url {
			padding: 10px;
		}
	}
</style>