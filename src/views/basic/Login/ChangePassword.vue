<template>
  <div class="app-container">
    <el-row
      :gutter="20"
      style="margin-top: 100px">
      <el-col
        :span="8"
        :offset="8">
        <el-form
          ref="pwdForm"
          :model="passwordForm"
          :rules="rules"
          label-position="left"
          label-width="80px">
          <el-form-item
            label="原密码"
            prop="password">
            <el-input
              v-model="passwordForm.password"
              :type="oldPwdType"
              name="username"
              class="old_password" />
            <span
              class="show-pwd"
              @click="showOldPwd">
              <svg-icon :icon-class="oldPwdType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>

          <el-form-item
            label="新密码"
            prop="newPassword">
            <el-input
              v-model="passwordForm.newPassword"
              :type="newPwdType"
              name="password"
              class="new_password" />
            <span
              class="show-pwd"
              @click="showNewPwd">
              <svg-icon :icon-class="newPwdType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>

          <el-form-item
            label="密码确认"
            prop="newPasswordAgain">
            <el-input
              v-model="passwordForm.newPasswordAgain"
              :type="newPwdType" />
            <span
              class="show-pwd"
              @click="showNewPwd">
              <svg-icon :icon-class="newPwdType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>

          <el-form-item>
            <el-row>
              <el-col
                :span="12"
                :offset="6">
                <el-button
                  type="primary"
                  style="width:100%;"
                  align="center"
                  @click.native.prevent="onChangePassword">
                  修改密码
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { changePassword } from '@/api/login'

export default {
  name: 'ChangePassword',
  data() {
    const validateNewPassword = (rule, value, callback) => {
      if (value.length < 1) {
        callback(new Error('请再次输入新密码'))
      } else if (this.passwordForm.newPassword !== this.passwordForm.newPasswordAgain) {
        callback(new Error('两次密码输入不一致'))
      } else {
        callback()
      }
    }
    return {
      passwordForm: {
        password: '',
        newPassword: '',
        newPasswordAgain: ''
      },
      oldPwdType: 'password',
      newPwdType: 'password',
      rules: {
        password: [{ required: true, trigger: 'blur', message: '请输入原密码' }],
        newPassword: [{ required: true, trigger: 'blur', message: '请输入新密码' }],
        newPasswordAgain: [{ required: true, trigger: 'blur', validator: validateNewPassword }]
      }
    }
  },
  methods: {
    showOldPwd() {
      if (this.oldPwdType === 'password') {
        this.oldPwdType = ''
      } else {
        this.oldPwdType = 'password'
      }
    },
    showNewPwd() {
      if (this.newPwdType === 'password') {
        this.newPwdType = ''
      } else {
        this.newPwdType = 'password'
      }
    },
    onChangePassword() {
      this.$refs['pwdForm'].validate((valid) => {
        if (valid) {
          changePassword(this.passwordForm).then(() => {
            this.$notify({
              title: '成功',
              message: '密码修改成功，请重新登录！',
              type: 'success',
              duration: 2000
            })
            this.$router.push('/')
          }).catch(error => {
            this.$notify({
              title: '密码修改失败',
              message: error,
              type: 'error',
              duration: 3000
            })
          })
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
$dark_gray:#889aa4;
.show-pwd {
  position: absolute;
  right: 10px;
  top: 2px;
  font-size: 16px;
  color: $dark_gray;
  cursor: pointer;
  user-select: none;
}
</style>
