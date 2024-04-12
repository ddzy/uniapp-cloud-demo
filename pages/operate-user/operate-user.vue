<template>
	<view class="container">
		<uni-forms ref="form" :rules="rules" :model="ruleForm" label-position="top">
			<view class="form-avatar_url">
				<uni-forms-item label="" name="avatar_url">
					<button
						class="form-avatar_url-btn"
						type="default"
						open-type="chooseAvatar"
						@chooseavatar="chooseAvatar"
					>
						<image
							:src="ruleForm.avatar_url"
							mode=""
							class="form-avatar_url-image"
						></image>
						<uni-icons
							type="camera-filled"
							class="form-avatar_url-icon"
							color="#007aff"
							:size="24"
						></uni-icons>
					</button>
				</uni-forms-item>
			</view>
			<uni-forms-item label="昵称" name="nickname" :required="true">
				<uni-easyinput
					v-model="ruleForm.nickname"
					ref="nicknameInputRef"
					placeholder="不能超过12个字符"
					type="nickname"
					:maxlength="12"
				/>
			</uni-forms-item>
			<uni-forms-item label="性别" name="gender">
				<view class="form-gender">
					<uni-data-checkbox
						v-model="ruleForm.gender"
						:multiple="false"
						:localdata="genders"
					/>
				</view>
			</uni-forms-item>
			<uni-forms-item label="一句话简介" name="brief">
				<view class="form-brief">
					<uni-easyinput
						v-model="ruleForm.brief"
						placeholder="不能超过24个字符"
						:maxlength="24"
					/>
				</view>
			</uni-forms-item>
			<uni-fab
				:pop-menu="false"
				:direction="'vertical'"
				:horizontal="'right'"
				:vertical="'bottom'"
				:content="[]"
				:popMenu="false"
				:pattern="{
					icon: 'checkmarkempty',
				}"
				@fabClick="submit"
			></uni-fab>
		</uni-forms>
	</view>
</template>

<script lang="ts">
import { IUser } from '../../typings/index';

interface IRuleForm
	extends Pick<IUser, 'avatar_url' | 'nickname' | 'gender' | 'brief'> {}

function genDefaultRuleForm(): IRuleForm {
	return {
		avatar_url: '',
		nickname: '',
		gender: 'male',
		brief: '',
	};
}

export default {
	data() {
		return {
			ruleForm: genDefaultRuleForm(),
			rules: {
				nickname: {
					rules: [
						{
							required: true,
							errorMessage: '昵称不能为空',
						},
						{
							maxLength: 12,
							errorMessage: '昵称不能超过{maxLength}个字符',
						},
					],
				},
				brief: {
					rules: [
						{
							maxLength: 24,
							errorMessage: '简介不能超过{maxLength}个字符',
						},
					],
				},
			},
			genders: [
				{
					value: 'male',
					text: '男♂',
				},
				{
					value: 'female',
					text: '女♀',
				},
			],
		};
	},
	watch: {
		'$store.state.user.userInfo': {
			handler(newValue: IRuleForm) {
				this.ruleForm = {
					...this.ruleForm,
					...newValue,
				};
			},
		},
	},
	mounted() {
		this.$store.dispatch('user/DISPATCH_USER_INFO');
	},
	methods: {
		async chooseAvatar(e: any) {
			this.ruleForm.avatar_url = e.detail.avatarUrl;
		},
		async submit() {
			uni.showLoading({
				mask: true,
			});
			try {
				const form = this.$refs.form as any;
				const params = await form.validate();
				const res = await uniCloud.callFunction({
					name: 'put-user',
					data: params,
				});
				if (res.result.code === 0) {
					uni.showToast({
						icon: 'success',
						title: '保存成功',
					});
				}
				uni.hideLoading();
				uni.navigateBack();
			} catch (e) {
				//TODO handle the exception
				uni.hideLoading();
			}
		},
	},
};
</script>

<style scoped lang="scss">
@mixin common-background() {
	background-repeat: no-repeat;
	background-position: center center;
	background-size: 100% 100%;
}

.container {
	padding: 32px;
	.form-avatar_url {
		:deep(.uni-forms-item__label) {
			display: none;
		}
		:deep(.uni-forms-item__content) {
			text-align: center;
			.form-avatar_url-btn {
				position: relative;
				display: inline-block;
				overflow: visible;
				padding: 0;
				background-color: transparent;
				&::after {
					border: none;
				}
			}
			.form-avatar_url-image {
				display: block;
				width: 80px;
				height: 80px;
				border-radius: 50%;
				background-color: #f7f8f9;
			}
			.form-avatar_url-icon {
				position: absolute;
				right: -12px;
				bottom: -12px;
				line-height: initial;
			}
		}
	}
	.form-gender {
		.form-gender-radio {
			transform: scale(0.8);
		}
	}

	.form-submit {
		margin-top: 80px !important;
	}
}
</style>
