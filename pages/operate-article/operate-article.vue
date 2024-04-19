<template>
	<view class="container">
		<uni-forms
			ref="form"
			:rules="rules"
			:modelValue="ruleForm"
			label-position="top"
			class="form"
		>
			<uni-forms-item label="标题" name="title">
				<uni-easyinput
					v-model="ruleForm.title"
					placeholder="请输入标题"
					:maxlength="24"
				/>
			</uni-forms-item>
			<uni-forms-item label="内容" name="content">
				<uni-easyinput
					v-model="ruleForm.content"
					autoHeight
					type="textarea"
					placeholder="请输入内容"
					:maxlength="-1"
				/>
			</uni-forms-item>
			<uni-forms-item label="缩略图" name="avatar_file">
				<view class="form-avatar">
					<uni-file-picker
						v-model="ruleForm.avatar_file"
						title=""
						limit="1"
						file-mediatype="image"
						return-type="object"
						:auto-upload="true"
						:return-type="'object'"
						@delete="deleteAvatar"
						@success="uploadAvatarSuccess"
					></uni-file-picker>
				</view>
			</uni-forms-item>
			<view class="fab-section">
				<uni-fab
					:pop-menu="false"
					:direction="'vertical'"
					:horizontal="'right'"
					:vertical="'bottom'"
					:content="[]"
					:popMenu="false"
					:pattern="pattern"
					@fabClick="submit"
				></uni-fab>
			</view>
		</uni-forms>
	</view>
</template>

<script lang="ts">
import * as utils from '../../utils/index';
import { IArticle, IUniFilePickerEvent } from '../../typings/index';

interface IRuleForm
	extends Pick<IArticle, 'title' | 'content' | 'avatar' | 'avatar_file'> {}

function genDefaultRuleForm(): IRuleForm {
	return {
		title: '',
		content: '',
		avatar: '',
		avatar_file: undefined,
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
							errorMessage: '标题不能为空',
						},
						{
							maxLength: 24,
							errorMessage: '标题不能超过24个字符',
						},
					],
				},
				content: {
					rules: [
						{
							required: true,
							errorMessage: '内容不能为空',
						},
					],
				},
			},
			articleId: '',
			pattern: {
				icon: 'checkmarkempty',
			},
		};
	},
	computed: {
		computedIsEdit() {
			return !!this.articleId;
		},
	},
	onLoad(option: { articleId: string }) {
		this.articleId = option.articleId || '';
		if (this.articleId) {
			this.fetchArticle();
		}
	},
	methods: {
		_paramsFilter() {
			const params = this.ruleForm as any;
			const result = {} as any;

			for (let key in params) {
				if (params[key] && params[key] !== 'all') {
					result[key] = params[key];
				}
			}
			return result;
		},
		async fetchArticle() {
			const {
				result: { errCode, data },
			} = await uniCloud.callFunction({
				name: 'get-article',
				data: {
					_id: this.articleId,
				},
			});
			if (errCode === 0) {
				this.$lodash.forIn(this.ruleForm, (value, key) => {
					if (this.$lodash.has(data, key) && data[key]) {
						this.$lodash.set(this.ruleForm, key, data[key]);
					}
				});
			}
		},
		deleteAvatar() {
			this.ruleForm.avatar = '';
		},
		uploadAvatarSuccess(e: IUniFilePickerEvent) {
			this.ruleForm.avatar = e.tempFilePaths[0];
		},
		async submit() {
			const form: any = this.$refs.form;
			try {
				await form.validate();
				this.computedIsEdit
					? this.submitForEdit(this.ruleForm)
					: this.submitForCreate(this.ruleForm);
			} catch (e) {
				//TODO handle the exception
			}
		},
		async submitForCreate(params: IRuleForm) {
			const res = await uniCloud.callFunction({
				name: 'post-article',
				data: params,
			});
			if (res && res.result && res.result.errCode === 0) {
				uni.showToast({
					icon: 'success',
					title: '创建成功',
				});
				uni.navigateBack();
			}
		},
		async submitForEdit(params: IRuleForm) {
			const {
				result: { errCode },
			} = await uniCloud.callFunction({
				name: 'put-article',
				data: {
					_id: this.articleId,
					params,
				},
			});
			if (errCode === 0) {
				uni.showToast({
					icon: 'success',
					title: '修改成功',
				});
				uni.navigateBack();
			}
		},
	},
};
</script>

<style lang="scss">
.form {
	.form-avatar {
		padding: 10px;
	}
}

.btn-submit {
	position: fixed;
	right: 40px;
	bottom: 40px;

	:deep(.uni-icons) {
		color: #fff !important;
		font-size: 20px;
	}
}
</style>
