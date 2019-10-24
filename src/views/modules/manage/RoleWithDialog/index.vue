<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row>
        <el-col>
          <el-form
            v-if="searchFlag"
            :inline="true"
            :model="listQuery">
            <el-form-item
              label="角色名称"
              size="mini">
              <el-input
                v-model="listQuery.name"
                placeholder="角色名称"
                clearable
                @keyup.enter.native="onSearch" />
            </el-form-item>

            <el-form-item
              label="状态"
              size="mini">
              <el-select
                v-model="listQuery.state"
                placeholder="状态"
                value=""
                clearable>
                <el-option
                  label="全部"
                  value="" />
                <el-option
                  v-for="(item, index) in tagTypes"
                  :key="index"
                  :label="item"
                  :value="index" />
              </el-select>
            </el-form-item>

            <el-form-item size="mini">
              <el-button
                v-waves
                :icon="settings.SEARCH_ICON"
                size="mini"
                type="primary"
                @click="onSearch()">
                搜索
              </el-button>
            </el-form-item>

            <el-form-item size="mini">
              <el-button
                v-waves
                :icon="settings.REFRESH_ICON"
                size="mini"
                @click="onEmpty()">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-button
            v-if="createFlag"
            :icon="settings.menuButtonTypes.create.icon_in_filter"
            :type="settings.menuButtonTypes.create.type_in_filter"
            size="mini"
            @click="onCreate">
            新增
          </el-button>

          <el-button
            v-if="updateFlag"
            :disabled="multipleSelection.length === 0"
            :icon="settings.menuButtonTypes.enable.icon_in_filter"
            :type="settings.menuButtonTypes.enable.type_in_filter"
            size="mini"
            @click="onEnable()">
            批量启用
          </el-button>

          <el-button
            v-if="updateFlag"
            :disabled="multipleSelection.length === 0"
            :icon="settings.menuButtonTypes.disable.icon_in_filter"
            :type="settings.menuButtonTypes.disable.type_in_filter"
            size="mini"
            @click="onDisable()">
            批量禁用
          </el-button>

          <el-button
            v-if="deleteFlag"
            :disabled="multipleSelection.length === 0"
            :icon="settings.menuButtonTypes.delete.icon_in_filter"
            :type="settings.menuButtonTypes.delete.type_in_filter"
            size="mini"
            @click="onDelete()">
            批量删除
          </el-button>
        </el-col>
      </el-row>
    </div>

    <div class="table-container">
      <el-table
        ref="table"
        v-loading="listLoading"
        :data="list"
        border
        row-key="id"
        highlight-current-row
        header-row-class-name="table-header"
        header-cell-class-name="table-header-cell"
        @cell-click="rowClick"
        @selection-change="onSelectionChange">
        <el-table-column
          type="selection"
          width="50"
          align="center" />

        <el-table-column
          prop="index"
          label="#"
          align="center"
          width="50" />

        <el-table-column
          prop="name"
          label="角色名称" />

        <el-table-column
          prop="remark"
          label="角色描述" />

        <el-table-column
          label="状态"
          align="center"
          width="80">
          <template slot-scope="scope">
            <div class="state-text">
              {{ tagTypes[scope.row.state] }}
            </div>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          label="操作"
          width="400px">
          <template slot-scope="scope">
            <el-tooltip
              content="只有已启用的角色才能被分配菜单权限"
              :disabled="scope.row.state===1"
              style="margin-right: 5px">
              <span>
                <el-button
                  v-if="mapFlag"
                  :icon="settings.menuButtonTypes.map.icon_in_form"
                  :type="settings.menuButtonTypes.map.type_in_form"
                  :disabled="scope.row.state!==1"
                  size="mini"
                  @click.prevent.stop="onAssign(scope.row)">
                  分配菜单权限
                </el-button>
              </span>
            </el-tooltip>
            <el-divider direction="vertical" />
            <el-tooltip
              content="只有已启用的角色才能被分配用户权限"
              :disabled="scope.row.state===1">
              <span>
                <el-button
                  v-if="mapFlag"
                  :icon="settings.menuButtonTypes.map.icon_in_form"
                  :type="settings.menuButtonTypes.map.type_in_form"
                  :disabled="scope.row.state!==1"
                  size="mini"
                  @click.prevent.stop="onAssignUsers(scope.row)">
                  分配用户权限
                </el-button>
              </span>
            </el-tooltip>
            <el-divider direction="vertical" />
            <el-button
              v-if="disableFlag && scope.row.state!==1"
              :icon="settings.menuButtonTypes.enable.icon_in_form"
              :type="settings.menuButtonTypes.enable.type_in_form"
              size="mini"
              @click.prevent.stop="onEnable(scope.row)">
              启用
            </el-button>

            <el-button
              v-else-if="enableFlag"
              :icon="settings.menuButtonTypes.disable.icon_in_form"
              :type="settings.menuButtonTypes.disable.type_in_form"
              size="mini"
              @click.prevent.stop="onDisable(scope.row)">
              禁用
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              v-if="updateFlag"
              :icon="settings.menuButtonTypes.update.icon_in_form"
              :type="settings.menuButtonTypes.update.type_in_form"
              size="mini"
              @click.prevent.stop="onModify(scope.row)">
              修改
            </el-button>
            <el-divider direction="vertical" />
            <el-button
              v-if="deleteFlag"
              :icon="settings.menuButtonTypes.delete.icon_in_form"
              :type="settings.menuButtonTypes.delete.type_in_form"
              size="mini"
              @click.prevent.stop="onDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        style="text-align: center;"
        @pagination="fetchList" />
    </div>

    <role-create-or-modify
      :role-create-or-update-dialog-visible.sync="createOrModifyDialogVisible"
      :role-id="dialogRoleId"
      @refreshList="fetchList" />

    <assign-menus
      :assign-menus-dialog-visible.sync="assignMenusDialogVisible"
      :role-id="dialogRoleId" />

    <assign-users
      :assign-users-dialog-visible.sync="assignUsersDialogVisible"
      :role-id="dialogRoleId" />
  </div>
</template>

<script>
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { viewButtonPermission } from '@/utils/permission'
import settings from '@/settings'
import { batchOperationWithConfirm, batchOperation } from '@/utils/batch'
import { getRoles, deleteRoles, disableRoles, enableRoles } from '@/api/manage/role'


import { seq } from '@/utils/seq'
import AssignMenus from './AssignMenus'
import AssignUsers from './AssignUsers'
import RoleCreateOrModify from './RoleCreateOrModify'

export default {
  name: 'Template',
  components: {
    Pagination,
    RoleCreateOrModify,
    AssignMenus,
    AssignUsers
  },
  directives: { waves },
  data() {
    return {
      settings: settings,

      listLoading: false,
      exportLoading: false,

      createFlag: false,
      updateFlag: false,
      deleteFlag: false,
      searchFlag: true,
      disableFlag: false,
      enableFlag: false,
      mapFlag: false,

      total: 0,
      listQuery: {
        page: 1,
        limit: 10,
        name: '',
        state: ''
      },
      list: [],
      tagTypes: {
        0: '已禁用',
        1: '已启用'
      },

      multipleSelection: [],

      createOrModifyDialogVisible: false,
      assignMenusDialogVisible: false,
      assignUsersDialogVisible: false,
      dialogRoleId: ''
    }
  },
  created() {
    this.fetchList() // 获取后端数据
    viewButtonPermission(this)
  },
  methods: {
    fetchList() {
      this.listLoading = true
      getRoles(this.listQuery).then(response => {
        this.list = seq(response.data.list, response.data.page, response.data.limit)
        this.total = response.data.total
        this.listQuery.page = response.data.page
        this.listQuery.limit = response.data.limit
        this.listLoading = false
      }).catch(error => {
        this.$message.error(error.message)
      })
    },

    onSearch() {
      this.listQuery.page = 1
      this.fetchList()
    },

    onEmpty() {
      this.listQuery.name = ''
      this.listQuery.state = ''
    },

    onCreate() {
      this.dialogRoleId = ''
      this.createOrModifyDialogVisible = true
    },

    onModify(row) {
      this.dialogRoleId = row.id
      this.createOrModifyDialogVisible = true
    },

    onAssign(row) {
      this.dialogRoleId = row.id
      this.assignMenusDialogVisible = true
    },

    onAssignUsers(row) {
      this.dialogRoleId = row.id
      this.assignUsersDialogVisible = true
    },

    onDelete(row) {
      batchOperationWithConfirm(this.multipleSelection, row, deleteRoles, this.fetchList, 'id', 'name', '删除')
    },

    onDisable(row) {
      batchOperation(this.multipleSelection, row, disableRoles, this.fetchList, 'id', '禁用')
    },

    onEnable(row) {
      batchOperation(this.multipleSelection, row, enableRoles, this.fetchList, 'id', '启用')
    },

    onSelectionChange(val) {
      this.multipleSelection = val
    },

    rowClick(row) {
      this.$refs.table.toggleRowSelection(row)
    }
  }
}
</script>

<style scoped>

</style>
