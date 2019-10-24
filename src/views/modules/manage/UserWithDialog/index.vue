<!--author: YangZe -->
<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            v-if="searchFlag"
            v-model="listQuery.key"
            size="mini"
            placeholder="搜索用户名、邮箱"
            clearable
            @clear="onSearch"
            @keyup.enter.native="onSearch" />
        </el-col>

        <el-button
          v-if="searchFlag"
          v-waves
          :icon="icons.SEARCH_ICON"
          type="primary"
          size="mini"
          @click="onSearch">
          搜索
        </el-button>

        <el-button
          v-if="createFlag"
          :icon="icons.CREATE_ICON"
          size="mini"
          type="primary"
          @click="onCreate">
          新增
        </el-button>
      </el-row>
    </div>

    <div class="table-container">
      <el-table
        ref="table"
        v-loading="listLoading"
        :data="list"
        row-key="id"
        highlight-current-row
        header-row-class-name="table-header"
        header-cell-class-name="table-header-cell">
        <el-table-column
          prop="index"
          label="#"
          align="center"
          width="50" />

        <el-table-column
          label="用户名"
          prop="username"
          align="center" />

        <el-table-column
          label="邮箱"
          prop="email"
          align="center" />

        <el-table-column
          label="电话"
          prop="mobile"
          align="center" />

        <el-table-column
          label="状态"
          align="center">
          <template slot-scope="scope">
            <span>
              <el-tag
                v-if="scope.row.state === 1"
                type="success">
                启用
              </el-tag>
              <el-tag
                v-else-if="scope.row.state === 0"
                type="danger">
                禁用
              </el-tag>
            </span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          label="操作"
          width="350">
          <template slot-scope="scope">
            <el-button
              v-if="updateFlag"
              :loading="scope.row.loading"
              :icon="icons.UPDATE_ICON"
              size="mini"
              @click.prevent.stop="onAssign(scope.row)">
              分配角色
            </el-button>

            <el-button
              v-if="updateFlag"
              :loading="scope.row.loading"
              :icon="icons.UPDATE_ICON"
              type="primary"
              size="mini"
              @click.prevent.stop="onEdit(scope.row)">
              编辑
            </el-button>

            <el-button
              v-if="deleteFlag"
              :loading="scope.row.loading"
              :icon="icons.DELETE_ICON"
              type="danger"
              size="mini"
              style="margin-left: 10px"
              @click.prevent.stop="onDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        style="text-align: center;"
        @pagination="fetchList" />
    </div>

    <user-create-or-modify
      :user-create-or-update-dialog-visible.sync="createOrModifyDialogVisible"
      :user-id.sync="dialogUserId"
      @refreshList="fetchList" />

    <assign-roles
      :assign-roles-dialog-visible.sync="assignRolesDialogVisible"
      :user-id.sync="dialogUserId"
      :roles-list="originRolesData"
      @refreshList="fetchList" />
  </div>
</template>

<script>
import { getUsers, deleteUser } from '@/api/manage/user'
import { getRoles } from '@/api/manage/role'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { seq } from '@/utils/seq'
import { viewButtonPermission } from '@/utils/permission'
import icons from '@/utils/icons'
import UserCreateOrModify from './UserCreateOrModify'
import AssignRoles from './AssignRoles'
import { batchOperationWithConfirm } from '@/utils/batch'


export default {
  name: 'User',
  components: { Pagination, UserCreateOrModify, AssignRoles },
  directives: { waves },
  data() {
    return {
      icons: icons,

      listLoading: false,
      exportLoading: false,
      createFlag: false,
      updateFlag: false,
      deleteFlag: false,
      exportFlag: false,
      searchFlag: true,

      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        key: ''
      },
      list: [],
      rowLoading: false,

      originRolesData: [],
      rolesTotal: 0,
      rolesQuery: {
        page: 1,
        limit: 1000,
        key: ''
      },

      createOrModifyDialogVisible: false,
      assignRolesDialogVisible: false,
      dialogUserId: 0
    }
  },
  created() {
    this.fetchList() // 获取后端数据
    this.fetchRoles() // 获取角色数据
    viewButtonPermission(this)
  },
  methods: {
    /**
       * 获取用户列表，并初始化roles/expand/loading字段
       */
    fetchList() { // 获取用户列表
      this.listLoading = true
      getUsers(this.listQuery).then(response => {
        this.list = seq(response.data.list, response.data.page, response.data.limit)
        this.total = response.data.total
        this.listQuery.page = response.data.page
        this.listQuery.limit = response.data.limit
        this.listLoading = false
      }).catch(message => {
        this.$message.error(message)
      })
    },

    /**
       * 递归加载全部的分页的角色数据
       */
    fetchRoles() {
      getRoles(this.rolesQuery).then(response => {
        this.originRolesData = this.originRolesData.concat(response.data.list)
        this.rolesTotal = response.data.total
        this.rolesQuery.limit = response.data.limit
        this.rolesQuery.page = response.data.page
        if (this.rolesTotal > this.originRolesData.length) { // 如果角色总数 > 当前已加载角色总数
          this.rolesQuery.page++
          this.fetchRoles()
        }
      }).catch(message => {
        this.$message.error(message)
      })
    },

    onSearch() {
      this.listQuery.page = 1
      this.fetchList()
    },

    /**
       * 创建新用户
       */
    onCreate() {
      this.dialogUserId = 0
      this.createOrModifyDialogVisible = true
    },

    onAssign(row) {
      this.dialogUserId = row.id
      this.assignRolesDialogVisible = true
    },

    /**
       * 打开编辑模式
       */
    onEdit(row) {
      this.dialogUserId = row.id
      this.createOrModifyDialogVisible = true
    },

    /**
       * 点击删除时的回调
       */
    onDelete(row) {
      batchOperationWithConfirm([], row, deleteUser, this.fetchList, 'id', 'username', '删除')
    }
  }
}
</script>

<style>
</style>
