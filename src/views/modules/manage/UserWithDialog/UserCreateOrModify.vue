<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="dialogVisible"
    :before-close="beforeClose"
    :title="title"
    @open="fetchUser"
    @closed="onClosed">
    <el-form
      ref="dataForm"
      v-loading="loading"
      label-width="80px"
      :model="data"
      :rules="rules">
      <el-row :gutter="5">
        <el-col :span="12">
          <el-form-item
            label="用户账号"
            prop="username">
            <el-input
              v-model="data.username"
              @input="onChange" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <span v-if="isChangePassword || id === 0">
            <el-form-item
              label="用户密码"
              prop="password">
              <el-input
                v-model="data.password"
                clearable
                @input="onChange" />
              <el-button
                v-if="id !== ''"
                class="dis-pwd"
                icon="el-icon-close"
                type="text"
                @click="notChangePassword" />
            </el-form-item>
          </span>

          <span v-else>
            <el-form-item
              label="用户密码"
              prop="noPassword">
              <el-button
                style="width: 100%"
                @click="changePassword">
                修改密码
              </el-button>
            </el-form-item>
          </span>
        </el-col>
      </el-row>
      <el-row :gutter="5">
        <el-col :span="12">
          <el-form-item
            label="联系电话"
            prop="mobile">
            <el-input
              v-model="data.mobile"
              @input="onChange" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item
            label="电子邮箱"
            prop="email">
            <el-input
              v-model="data.email"
              @input="onChange" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item
        label="状态"
        prop="state">
        <el-radio-group
          v-model="data.state"
          size="small"
          @change="onChange">
          <el-radio-button :label="0">
            禁用
          </el-radio-button>
          <el-radio-button :label="1">
            启用
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div style="text-align: center;margin-top: 20px;">
      <el-button
        :disabled="loading || !changed"
        type="primary"
        size="small"
        @click="onCreateOrUpdate()">
        提交
      </el-button>
    </div>
  </el-dialog>
</template>


<script>
import { getUser, updateUser, createUser } from '@/api/manage/user'
export default {
  name: 'UserCreateOrModify',
  props: {
    userCreateOrUpdateDialogVisible: {
      required: true,
      type: Boolean,
      default: false
    },
    userId: {
      required: true,
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loading: false,
      data: {
        id: this.id,
        username: '',
        email: '',
        mobile: '',
        password: '',
        state: 0,
        roles: []
      },
      rules: {
        username: [{ required: true, message: '请填写用户账号', trigger: 'blur' }],
        mobile: [{ required: true, message: '请填写用户联系电话', trigger: 'blur' }],
        email: [{ required: true, message: '请填写电子邮件', trigger: 'blur' }],
        password: [{ required: true, message: '请填写密码', trigger: 'blur' }]
      },
      isChangePassword: false,
      changed: false
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.userCreateOrUpdateDialogVisible
      },
      set(val) {
        this.$emit('update:userCreateOrUpdateDialogVisible', val)
      }
    },
    id: {
      get() {
        return this.userId
      },
      set(val) {
        this.$emit('update:userId', val)
      }
    },
    title: function () {
      return this.id === 0 ? '新增用户' : '修改用户'
    }
  },
  methods: {
    fetchUser() {
      if (this.id) {
        this.loading = true
        getUser(this.id).then(response => {
          this.data.username = response.data.username
          this.data.email = response.data.email
          this.data.mobile = response.data.mobile
          this.data.roles = response.data.roles
          this.data.state = response.data.state
          this.loading = false
        }).catch(error => {
          this.$message.error(error.message)
          this.loading = false
        })
      }
    },

    beforeClose(done) {
      if (this.changed) {
        this.$msgbox.confirm('尚未提交，是否退出？', '提示', {
          confirmButtonText: '退出',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          done()
        }).catch(() => {})
      } else {
        done()
      }
    },

    onClosed() {
      this.changed = false
      this.loading = false
      this.isChangePassword = false
      this.data.password = ''
      this.$refs['dataForm'].resetFields()
    },

    onCreateOrUpdate() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {

          const data = {
            username: this.data.username,
            email: this.data.email,
            mobile: this.data.mobile,
            state: this.data.state,
            roles: this.data.roles
          }
          if (this.isChangePassword || this.id === 0) {
            data.password = this.data.password
          }

          const callback = this.id === 0 ? createUser : updateUser
          this.loading = true

          callback(data, this.id).then(() => {
            this.$notify.success({ title: '成功', message: this.data.userName })
            this.$emit('refreshList')
            this.dialogVisible = false
            this.loading = false
          }).catch(error => {
            this.loading = false
            this.$notify.error({ title: '失败', message: error.message })
          })
        }
      })
    },

    onChange() {
      this.changed = true
    },

    changePassword() {
      this.isChangePassword = true
      this.data.password = ''
    },

    notChangePassword() {
      this.isChangePassword = false
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  $dark_gray:#889aa4;
  .dis-pwd {
    position: absolute;
    right: 10px;
    top: 0;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
</style>
