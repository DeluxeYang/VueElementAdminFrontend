<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="dialogVisible"
    :before-close="beforeClose"
    :title="title"
    @open="fetchRole"
    @closed="onClosed">
    <el-form
      ref="dataForm"
      v-loading="loading"
      label-width="80px"
      :model="data"
      :rules="rules"
      style="margin: 0 30px 0 30px;">
      <el-form-item
        label="角色名称"
        prop="name">
        <el-input
          v-model="data.name"
          @input="onChange" />
      </el-form-item>

      <el-form-item
        label="角色描述"
        prop="remark">
        <el-input
          v-model="data.remark"
          @input="onChange" />
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      style="margin-right: 30px;">
      <el-button
        :disabled="loading || !changed"
        type="primary"
        size="small"
        @click="onCreateOrUpdate()">
        提交
      </el-button>
    </span>
  </el-dialog>
</template>


<script>
import { getRole, updateRole, createRole } from '@/api/manage/role'

export default {
  name: 'RoleCreateOrModify',
  props: {
    roleCreateOrUpdateDialogVisible: {
      required: true,
      type: Boolean,
      default: false
    },
    roleId: {
      required: true,
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      data: {
        id: this.id,
        name: '',
        remark: ''
      },
      changed: false,
      rules: {
        name: [{ required: true, message: '请填写角色名称', trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.roleCreateOrUpdateDialogVisible
      },
      set(val) {
        this.$emit('update:roleCreateOrUpdateDialogVisible', val)
      }
    },
    id: {
      get() {
        return this.roleId
      },
      set(val) {
        this.$emit('update:roleId', val)
      }
    },
    title: function () {
      return this.id === '' ? '新增角色' : '修改角色'
    }
  },
  methods: {
    fetchRole() {
      if (this.id) {
        this.loading = true
        getRole(this.id).then(response => {
          this.data = response.data
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
      this.$refs['dataForm'].resetFields()
    },

    onCreateOrUpdate() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const callback = this.id === '' ? createRole : updateRole
          this.loading = true
          callback(this.data).then(() => {
            this.$notify.success({ title: '成功', message: this.data.name })
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
    }
  }
}
</script>

<style scoped>

</style>
