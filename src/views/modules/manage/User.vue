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

    <el-table
      ref="table"
      v-loading="listLoading"
      :data="list"
      row-key="id"
      highlight-current-row
      style="width: 100%; margin-top: 20px;"
      @expand-change="onExpandChange"
      @row-click="rowExpand">
      <el-table-column
        type="expand"
        width="40">
        <template slot="header">
          <i
            v-if="rowLoading"
            class="el-icon-more-outline" />
        </template>

        <template slot-scope="scope">
          <el-row :gutter="20">
            <el-col
              :span="12"
              :offset="6">
              <el-transfer
                :ref="'transfer'+scope.row.id"
                v-model="scope.row.roles"
                v-loading="scope.row.loading"
                :data="scope.row.rolesData"
                :titles="['未关联角色', '已关联角色']" />
            </el-col>
          </el-row>
        </template>
      </el-table-column>

      <el-table-column
        prop="index"
        label="#"
        align="center"
        width="50" />

      <el-table-column
        label="用户名"
        align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.edit"
            @click.stop>
            <el-input
              v-model="scope.row.username"
              :disabled="scope.row.loading"
              size="small" />
          </span>
          <span v-else> {{ scope.row.username }} </span>
        </template>
      </el-table-column>

      <el-table-column
        label="邮箱"
        align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.edit"
            @click.stop>
            <el-input
              v-model="scope.row.email"
              :disabled="scope.row.loading"
              size="small" />
          </span>
          <span v-else> {{ scope.row.email }} </span>
        </template>
      </el-table-column>

      <el-table-column
        label="电话"
        align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.edit"
            @click.stop>
            <el-input
              v-model="scope.row.mobile"
              :disabled="scope.row.loading"
              size="small" />
          </span>
          <span v-else> {{ scope.row.mobile }} </span>
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.edit"
            @click.stop>
            <el-radio-group
              v-model="scope.row.state"
              size="small">
              <el-radio-button :label="0">
                禁用
              </el-radio-button>
              <el-radio-button :label="1">
                启用
              </el-radio-button>
            </el-radio-group>
          </span>
          <span v-else>
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
        width="200">
        <template slot-scope="scope">
          <span v-if="!scope.row.isNew">
            <span v-if="scope.row.edit">
              <el-button
                v-if="updateFlag"
                :loading="scope.row.loading"
                :icon="icons.CHECK_ICON"
                type="success"
                size="mini"
                @click.prevent.stop="onEditConfirm(scope.row)">
                确认
              </el-button>
            </span>
            <span v-else>
              <el-button
                v-if="updateFlag"
                :loading="scope.row.loading"
                :icon="icons.UPDATE_ICON"
                type="primary"
                size="mini"
                @click.prevent.stop="onEdit(scope.row)">
                编辑
              </el-button>
            </span>
            <span v-if="scope.row.edit">
              <el-button
                v-if="updateFlag"
                :loading="scope.row.loading"
                :icon="icons.CLOSE_ICON"
                type="warning"
                size="mini"
                style="margin-left: 10px"
                @click.prevent.stop="onEditCancel(scope.row)">
                取消
              </el-button>
            </span>
            <span v-else>
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
            </span>
          </span>
          <span v-else>
            <el-button
              v-if="createFlag"
              :loading="scope.row.loading"
              :icon="icons.CHECK_ICON"
              type="success"
              size="mini"
              @click.prevent.stop="onCreateConfirm(scope.row)">
              确认
            </el-button>

            <el-button
              v-if="createFlag"
              :icon="icons.CLOSE_ICON"
              :loading="scope.row.loading"
              type="warning"
              size="mini"
              style="margin-left: 10px"
              @click.prevent.stop="onCreateCancel(scope.row)">
              取消
            </el-button>
          </span>
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
</template>

<script>
import { getUsers, updateUser, createUser, deleteUser, getUser } from '@/api/manage/user'
import { getRoles } from '@/api/manage/role'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { seq } from '@/utils/seq'
import { viewButtonPermission } from '@/utils/permission'
import icons from '@/utils/icons'

export default {
  name: 'User',
  components: { Pagination },
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
      }
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
        for (let i = 0; i < this.list.length; i++) {
          this.list[i].roles = []
          this.list[i].rolesData = []
          this.list[i].edit = false // 初始化编辑状态字段
          this.list[i].expand = false // 初始化展开状态字段
          this.list[i].loading = false // 初始化展开状态字段
          this.$nextTick(() => {
            this.$refs.table.toggleRowExpansion(this.list[i], false)
          })
        }
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
    onCreate() { // 创建
      const id = Math.random().toString(36).substr(2)
      const row = {
        id: id,
        username: '',
        email: '',
        mobile: '',
        state: 1,

        rolesData: [],
        roles: [],

        edit: true,
        isNew: true,
        expand: false
      }
      this.list.push(row) // 创建一个新role对象，推入list中
      this.onEdit(row) // 打开edit
    },

    /**
     * 创建一个新用户
     */
    onCreateConfirm(row) { // 创建确认: 后端
      if (row.username === '') {
        this.$notify.error({ title: '失败', message: '用户名不能为空' })
      } if (row.email === '') {
        this.$notify.error({ title: '失败', message: '邮箱不能为空' })
      } else {
        if (this.$refs.hasOwnProperty('transfer' + row.id) && this.$refs['transfer' + row.id]) {
          this.changeRowLoadingStatus(true, row)
          const data = {
            id: 0,
            username: row.username,
            email: row.email,
            mobile: row.mobile,
            state: row.state,
            roles: row.roles
          }
          createUser(data).then(response => {
            row.isNew = false
            this.total++
            row.index = this.total
            row = Object.assign(row, response.data)
            row.edit = false
            this.refreshRoleData(row) // 刷新展开框Tree数据
            this.changeRowLoadingStatus(false, row)
            this.$notify.success({ title: '成功', message: '添加成功' })
          }).catch(message => {
            this.changeRowLoadingStatus(false, row)
            this.$notify.error({ title: '添加失败', message: message })
          })
        }
      }
    },

    /**
     * 取消创建，并从this.list中删除
     */
    onCreateCancel(row) { // 取消创建
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },

    /**
     * 打开编辑模式
     */
    onEdit(row) { // 编辑
      row.edit = true // 编辑模式打开
      this.rowExpand(row) // 行展开
      this.refreshRoleData(row)
    },

    /**
     * 在编辑模式下，点击确认时调用的方法
     */
    onEditConfirm(row) { // 编辑确认: 后端
      if (this.$refs.hasOwnProperty('transfer' + row.id) && this.$refs['transfer' + row.id]) {
        this.changeRowLoadingStatus(true, row)
        updateUser(row.id, row).then(response => {
          row = Object.assign(row, response.data)
          row.edit = false
          this.refreshRoleData(row) // 刷新展开框Tree数据
          this.changeRowLoadingStatus(false, row)
          this.$notify.success({ title: '成功', message: '编辑成功' })
        }).catch(message => {
          this.changeRowLoadingStatus(false, row)
          this.$notify.error({ title: '编辑失败', message: message })
        })
      }
    },

    /**
     *编辑模式下，点击取消
     */
    onEditCancel(row) {
      this.changeRowLoadingStatus(true, row)
      getUser(row.id).then((response) => {
        row = Object.assign(row, response.data)
        row.edit = false
        this.refreshRoleData(row)
        this.changeRowLoadingStatus(false, row)
      }).catch(message => {
        this.$message.error(message)
      })
    },

    /**
     * 点击删除时的回调
     */
    onDelete(row) { // 删除确认: 后端
      this.$confirm(`是否确认删除【${row.username}】？`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      }).then(() => {
        deleteUser(row.id).then(response => {
          for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].id === row.id) {
              this.list.splice(i, 1)
              break
            }
          }
          this.$notify.success({ title: '删除成功', message: response.data.username })
        }).catch(message => {
          this.$notify.error({ title: '失败', message: message })
        })
      }).catch(() => {})
    },

    /**
     * 行展开，并获取row.granted数据
     */
    rowExpand(row) {
      this.$refs.table.toggleRowExpansion(row, !row.expand)
    },

    /**
     * 每当行展开或者行合并时的回调
     */
    onExpandChange(row, expandedRows) {
      if (expandedRows.indexOf(row) === -1) { // 当前row，不在expandedRows中，则正在关闭当前行
        if (row.edit) { // 如果编辑模式已经打开，这不能关闭展开行
          this.$refs.table.toggleRowExpansion(row, true)
          row.expand = true
        } else { // 否则，直接关闭
          row.expand = false
        }
      } else { // 当前row，在expandedRows中，则正在展开当前行
        if (!row.isNew && row.roles) { // 如果不是新用户
          this.changeRowLoadingStatus(true, row)
          getUser(row.id).then(response => {
            row.roles = response.data.roles
            this.refreshRoleData(row)
            this.changeRowLoadingStatus(false, row)
          }).catch(message => {
            this.$message.error(message)
            row.edit = false
            this.refreshRoleData(row)
            this.changeRowLoadingStatus(false, row)
          })
        }
        row.expand = true
      }
    },

    /**
     * 改变该行的loading状态，并！更！新！视！图！
     */
    changeRowLoadingStatus(loading, row) {
      row.loading = loading
      this.rowLoading = loading
      this.$set(this.list, this.list.indexOf(row), row)
    },

    refreshRoleData(row) {
      row.rolesData = [] // 重置菜单数据
      for (let i = 0; i < this.originRolesData.length; i++) { // 从原始菜单数据中生成tree数据
        const item = this.originRolesData[i]
        row.rolesData.push({
          key: item.id,
          label: item.role_name,
          remark: item.remark,
          disabled: !row.edit
        })
      }
    }
  }
}
</script>

<style>
</style>
