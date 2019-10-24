<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="dialogVisible"
    :before-close="beforeClose"
    title="为用户分配角色"
    width="1000px"
    @open="fetchMapped"
    @closed="onClosed">
    <div v-loading="loading">
      <el-transfer
        v-model="assignData"
        :data="userList"
        :titles="['未分配用户', '已分配用户']"
        :button-texts="['取消关联', '关联用户']"
        :props="{key: 'id', label: 'userName'}"
        :filter-method="filterMethod"
        filter-placeholder="可搜索用户姓名/用户账号/保险公司名称"
        filterable
        class="assign-user"
        style="text-align: left; display: inline-block;"
        @change="onChange">
        <span slot-scope="{ option }">
          <el-tooltip
            placement="right"
            effect="light">
            <div slot="content">
              <p>用户姓名: {{ option.userName }}</p>
              <p>用户账号: {{ option.userCode }}</p>
              <p>保险公司: {{ option.companyName }}</p>
            </div>
            <div>
              <el-link type="primary">
                {{ option.userName }}
              </el-link>
              <span v-if="option.userCode">
                -
                {{ option.userCode }}
              </span>
              <span v-if="option.companyName">
                -
                {{ option.companyName }}
              </span>
            </div>
          </el-tooltip>
        </span>
      </el-transfer>
    </div>
    <div style="text-align: center;margin-top: 20px;">
      <el-button
        :disabled="loading || !changed"
        type="primary"
        size="small"
        @click="onSubmit()">
        提交
      </el-button>
    </div>
  </el-dialog>
</template>


<script>
import { getRoleMappedUsers, mappingRoleUsers } from '@/api/manage/role'
import { getUserAll } from '@/api/manage/user'
import { getAllCompanies } from '@/api/manage/company'

export default {
  name: 'AssignUsers',
  props: {
    assignUsersDialogVisible: {
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
      assignData: [],
      changed: false,
      userList: [],
      companyMap: {}
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.assignUsersDialogVisible
      },
      set(val) {
        this.$emit('update:assignUsersDialogVisible', val)
      }
    },
    id: {
      get() {
        return this.roleId
      },
      set(val) {
        this.$emit('update:roleId', val)
      }
    }
  },
  created() {
    this.fetchAllCompanies()
  },
  methods: {
    fetchMapped() {
      this.loading = true
      getRoleMappedUsers(this.id).then(response => {
        this.assignData = response.data
        this.loading = false
      }).catch(error => {
        this.loading = false
        this.$message.error(error.message)
      })
    },

    fetchAllUsers() {
      getUserAll().then(response => {
        this.userList = response.data
        this.userList.map(item => {
          item.companyName = this.companyMap[item.companyCode]
        })
      }).catch(error => {
        this.$message.error(error.message)
      })
    },

    fetchAllCompanies() {
      getAllCompanies().then(response => {
        response.data.map(item => {
          this.companyMap[item.companyCode] = item.companyName
        })
        this.fetchAllUsers()
      }).catch(error => {
        this.$message.error(error.message)
      })
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
      this.assignData = []
    },

    onSubmit() {
      this.loading = true
      mappingRoleUsers(this.id, this.assignData).then(response => {
        this.$notify.success({ title: '成功', message: response.message })
        this.changed = false
        this.loading = false
      }).catch(error => {
        this.loading = false
        this.$notify.error({ title: '失败', message: error.message })
      })
    },

    onChange() {
      this.changed = true
    },

    filterMethod(query, item) {
      if (item.userName.indexOf(query) > -1) {
        return true
      } else if (item.userCode && item.userCode.indexOf(query) > -1) {
        return true
      } else if (item.companyName && item.companyName.indexOf(query) > -1) {
        return true
      }
      return false
    }
  }
}
</script>

<style>
  .assign-user .el-transfer-panel {
    width: 400px;
  }
</style>
