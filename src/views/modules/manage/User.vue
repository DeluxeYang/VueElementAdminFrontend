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
          <div v-loading="scope.row.loading">
            <el-divider content-position="left">
              关联角色
            </el-divider>
            <el-tooltip
              v-for="(item, index) in originRolesData"
              :key="index"
              :content="item.remark"
              placement="top">
              <el-tag
                v-if="scope.row.roles && scope.row.roles.indexOf(item.id) > -1"
                style="margin-left: 0; margin-right: 20px">
                {{ item.role_name }}
              </el-tag>
            </el-tooltip>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="index"
        label="#"
        align="center"
        width="50" />

      <el-table-column
        label="用户名"
        align="center"
        prop="username" />

      <el-table-column
        label="邮箱"
        align="center"
        prop="email" />

      <el-table-column
        label="电话"
        align="center"
        prop="mobile" />

      <el-table-column
        label="状态"
        align="center"
        width="160">
        <template slot-scope="scope">
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
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="操作"
        width="300">
        <template slot-scope="scope">
          <el-button
            v-if="updateFlag"
            :icon="icons.UPDATE_ICON"
            type="primary"
            size="mini"
            @click.prevent.stop="onEdit(scope.row)">
            编辑
          </el-button>

          <el-button
            v-if="deleteFlag"
            :icon="icons.DELETE_ICON"
            type="danger"
            size="mini"
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

    <el-dialog
      v-dialogDrag
      :title="dialogState[dialogStatus]"
      :visible.sync="dialogVisible">
      <el-form
        ref="dataForm"
        v-loading="dialogData.loading"
        :rules="rules"
        :model="dialogData"
        label-position="left"
        label-width="70px"
        style="max-width: 80%; margin-left:50px;">
        <el-form-item
          label="用户名"
          prop="username">
          <el-input v-model="dialogData.username" />
        </el-form-item>

        <el-form-item
          label="密码"
          prop="username">
          <el-input v-model="dialogData.password" />
        </el-form-item>

        <el-form-item
          label="邮箱"
          prop="email">
          <el-input v-model="dialogData.email" />
        </el-form-item>

        <el-form-item
          label="电话"
          prop="mobile">
          <el-input v-model="dialogData.mobile" />
        </el-form-item>

        <el-form-item
          label="状态"
          prop="status">
          <el-radio-group
            v-model="dialogData.state"
            size="small">
            <el-radio-button :label="0">
              禁用
            </el-radio-button>
            <el-radio-button :label="1">
              启用
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          label="关联角色"
          prop="roles">
          <el-checkbox-group
            v-model="dialogData.roles"
            size="small">
            <el-tooltip
              v-for="(item, index) in originRolesData"
              :key="index"
              :content="item.remark"
              placement="top">
              <el-checkbox
                :label="item.id"
                border
                style="margin-left: 0; margin-right: 20px">
                {{ item.role_name }}
              </el-checkbox>
            </el-tooltip>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer">
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createConfirm():editConfirm()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUsers, updateUser, createUser, deleteUser, getUser } from '@/api/manage/user'
import { getRoles } from '@/api/manage/role'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import rules from '@/utils/rules'
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

      dialogVisible: false,
      dialogStatus: '',
      dialogData: {
        id: '',
        username: null,
        email: null,
        mobile: null,
        state: 1,
        expand: false,
        loading: false,
        roles: []
      },
      dialogModel: null,
      dialogState: {
        'update': '编辑',
        'create': '新增'
      },

      rules: {
        username: [{ required: true, message: '请填写用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请填写密码', trigger: 'blur' }],
        email: rules.email
      },
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
        this.list.map(item => {
          item.roles = []
          item.expand = false
          item.loading = false
          this.$nextTick(() => {
            this.$refs.table.toggleRowExpansion(item, false)
          })
        })
        this.total = response.data.total
        this.listQuery.page = response.data.page
        this.listQuery.limit = response.data.limit
        this.listLoading = false
      }).catch(message => {
        this.$message.error({ message: message })
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
        this.$message.error({ message: message })
      })
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
      row.expand = expandedRows.indexOf(row) !== -1
      if (row.expand) {
        this.changeRowLoadingStatus(true, row)
        getUser(row.id).then(response => {
          row = Object.assign(row, response.data)
          this.changeRowLoadingStatus(false, row)
        }).catch(message => {
          this.changeRowLoadingStatus(false, row)
          this.$message.error({ message: message })
        })
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

    onSearch() {
      this.listQuery.page = 1
      this.fetchList()
    },

    /**
     * 创建新用户
     */
    onCreate() {
      this.dialogVisible = true
      this.dialogModel = null
      this.dialogData = {
        id: 0,
        username: null,
        password: null,
        email: null,
        mobile: null,
        state: 1,
        expand: false,
        loading: false,
        roles: []
      }
      this.dialogStatus = 'create'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    /**
     * 确认创建新用户
     */
    createConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createUser(this.dialogData).then(() => {
            this.fetchList()
            this.dialogVisible = false
            this.$notify.success({ title: '成功', message: '添加成功' })
          }).catch(message => {
            this.$notify.error({ title: '添加失败', message: message })
          })
        }
      })
    },

    /**
     * 打开编辑对话框
     * @param model
     */
    onEdit(model) {
      model.loading = true
      this.dialogVisible = true // 打开对话框
      this.dialogData = { ...model } // 初始数据
      getUser(model.id).then((response) => { // 更新数据
        model.loading = false
        model = Object.assign(model, response.data)
        model.roles = model.roles || []
        this.dialogModel = model
        this.dialogData = { ...model } // 复制对象到对话框临时数据
        this.dialogStatus = 'update'
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      }).catch(message => {
        this.$message.error({ message: message })
      })
    },

    /**
     * 确认编辑
     */
    editConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateUser(this.dialogData.id, this.dialogData).then(() => {
            this.dialogVisible = false
            this.fetchList()
            this.$notify.success({ title: '成功', message: '更新成功' })
          }).catch(message => {
            this.$notify.error({ title: '失败', message: message })
          })
        }
      })
    },

    onDelete(row) {
      this.$confirm(`是否确认删除【${row.username}】？`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      }).then(() => {
        deleteUser(row.id).then(response => {
          this.fetchList()
          this.$notify.success({ title: '删除成功', message: response.data.username })
        }).catch(message => {
          this.$notify.error({ title: '失败', message: message })
        })
      }).catch(() => {})
    }
  }
}
</script>

<style>
</style>
