<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="dialogVisible"
    :before-close="beforeClose"
    title="为用户分配角色"
    width="600px"
    @open="fetchUser"
    @closed="onClosed">
    <div
      v-loading="loading"
      style="text-align: center">
      <el-transfer
        v-model="data.roles"
        :data="rolesList"
        :titles="['未关联角色', '已关联角色']"
        :button-texts="['取消关联', '关联角色']"
        :props="{key: 'id', label: 'role_name'}"
        filterable
        style="text-align: left; display: inline-block"
        @change="onChange" />
    </div>
    <div style="text-align: center;margin-top: 20px;">
      <el-button
        :disabled="loading || !changed"
        type="primary"
        size="small"
        @click="onSubmit()">
        保存
      </el-button>
    </div>
  </el-dialog>
</template>


<script>
import { getUser, updateUser } from '@/api/manage/user'
export default {
  name: 'AssignRoles',
  props: {
    assignRolesDialogVisible: {
      required: true,
      type: Boolean,
      default: false
    },
    userId: {
      required: true,
      type: Number,
      default: 0
    },
    rolesList: {
      required: true,
      type: Array,
      default: null
    }
  },
  data() {
    return {
      loading: false,
      data: {},
      changed: false
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.assignRolesDialogVisible
      },
      set(val) {
        this.$emit('update:assignRolesDialogVisible', val)
      }
    },
    id: {
      get() {
        return this.userId
      },
      set(val) {
        this.$emit('update:userId', val)
      }
    }
  },
  methods: {
    fetchUser() {
      if (this.id) {
        this.loading = true
        getUser(this.id).then(response => {
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
        this.$msgbox.confirm('尚未提交，是否提交？', '提示', {
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
      this.roles = []
    },

    onSubmit() {
      this.loading = true
      updateUser(this.data, this.id).then(() => {
        this.$notify.success({ title: '成功', message: this.data.username })
        this.$emit('refreshList')
        this.dialogVisible = false
        this.loading = false
      }).catch(error => {
        this.loading = false
        this.$notify.error({ title: '失败', message: error.message })
      })
    },

    onChange() {
      this.changed = true
    }
  }
}
</script>

<style scoped>
  .transfer-footer {
    margin-left: 10px;
    padding: 6px 5px;
  }
</style>
