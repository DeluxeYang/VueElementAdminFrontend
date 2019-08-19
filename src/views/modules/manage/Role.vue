<template>
  <div class="app-container">
    <div class="filter-container">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input
            v-if="searchFlag"
            v-model="listQuery.key"
            size="mini"
            placeholder="搜索角色名称"
            clearable
            @clear="onSearch"
            @keyup.enter.native="onSearch" />
        </el-col>

        <el-button
          v-if="searchFlag"
          v-waves
          :icon="icons.SEARCH_ICON"
          size="mini"
          type="primary"
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
            <el-col :span="8">
              <el-tree
                :ref="'tree'+scope.row.id"
                v-loading="scope.row.loading"
                :data="scope.row.menuTreeData"
                :default-checked-keys="scope.row.menu"
                show-checkbox
                node-key="id">
                <span
                  slot-scope="{ node, data }"
                  style="margin-left: 10px">
                  <span v-if="data.menu_type >= 2">
                    <el-tag
                      v-if="data.menu_type === 2"
                      type="success"
                      size="mini">查询</el-tag>
                    <el-tag
                      v-else-if="data.menu_type === 3"
                      size="mini">新增</el-tag>
                    <el-tag
                      v-else-if="data.menu_type === 4"
                      type="info"
                      size="mini">编辑</el-tag>
                    <el-tag
                      v-else-if="data.menu_type === 5"
                      type="warning"
                      size="mini">删除</el-tag>
                    <el-tag
                      v-else-if="data.menu_type === 6"
                      type="danger"
                      size="mini">导出</el-tag>
                  </span>
                  <span v-else>
                    <el-link :underline="false">{{ data.menu_name }}</el-link>
                  </span>
                </span>
              </el-tree>
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
        prop="name"
        label="角色名称"
        align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.edit"
            @click.stop>
            <el-input
              v-model="scope.row.role_name"
              :disabled="scope.row.loading"
              size="small" />
          </span>
          <span v-else> {{ scope.row.role_name }} </span>
        </template>
      </el-table-column>

      <el-table-column
        prop="remark"
        label="备注"
        align="center">
        <template slot-scope="scope">
          <span
            v-if="scope.row.edit"
            @click.stop>
            <el-input
              v-model="scope.row.remark"
              :disabled="scope.row.loading"
              size="small" />
          </span>
          <span v-else> {{ scope.row.remark }} </span>
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
                :disabled="scope.row.loading"
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
              :disabled="scope.row.loading"
              :icon="icons.CHECK_ICON"
              type="success"
              size="mini"
              @click.prevent.stop="onCreateConfirm(scope.row)">
              确认
            </el-button>

            <el-button
              v-if="createFlag"
              :icon="icons.CLOSE_ICON"
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
import { getRoles, updateRole, createRole, deleteRole, getRole } from '@/api/manage/role'
import { getMenus } from '@/api/manage/menu'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { seq } from '@/utils/seq'
import { viewButtonPermission } from '@/utils/permission'
import icons from '@/utils/icons'

export default {
  name: 'Role',
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

      originMenuData: [],

      permissionLabel: {
        list: '查询',
        create: '添加',
        update: '编辑',
        delete: '删除',
        export: '导出'
      }
    }
  },
  created() {
    this.fetchList() // 获取角色列表
    this.fetchMenuData() // 获取原始菜单数据
    viewButtonPermission(this)
  },
  methods: {
    /**
     * 获取角色列表
     */
    fetchList() {
      this.listLoading = true
      getRoles(this.listQuery).then(response => { // 初次获取数据
        this.list = seq(response.data.list, response.data.page, response.data.limit)
        for (let i = 0; i < this.list.length; i++) {
          this.list[i].menuTreeData = [] // 初始化树结构数据字段
          this.list[i].edit = false // 初始化编辑状态字段
          this.list[i].expand = false // 初始化展开状态字段
          this.list[i].loading = false // 初始化展开状态字段
          this.$nextTick(() => {
            this.$refs.table.toggleRowExpansion(this.list[i], false)
          })
        }
        this.total = response.data.total
        this.listQuery.limit = response.data.limit
        this.listQuery.page = response.data.page
        this.listLoading = false
      }).catch(message => {
        this.$message.error(message)
      })
    },

    /**
     * 获取原始菜单数据
     */
    fetchMenuData() {
      getMenus().then(response => {
        this.originMenuData = response.data
      }).catch(message => {
        this.$message.error(message)
      })
    },

    onSearch() {
      this.listQuery.page = 1
      this.fetchList()
    },

    /**
     * 创建一个新角色：在this.list中推入一个新对象，并打开该行的编辑模式
     */
    onCreate() { // 创建
      const id = Math.random().toString(36).substr(2)
      const row = {
        id: id,
        role_name: '',
        remark: '',

        menuTreeData: [],
        menu: [],

        edit: true,
        isNew: true,
        expand: false
      }
      this.list.push(row) // 创建一个新role对象，推入list中
      this.onEdit(row) // 打开edit
    },

    /**
     * 创建一个新角色：在this.list中推入一个新对象，并打开该行的编辑模式
     */
    onCreateConfirm(row) { // 创建确认: 后端
      if (row.role_name === '') { // 角色名不能为空
        this.$notify.error({ title: '失败', message: '新建角色名不能为空' })
      } else {
        if (this.$refs.hasOwnProperty('tree' + row.id) && this.$refs['tree' + row.id]) {
          this.changeRowLoadingStatus(true, row)
          const data = {
            id: 0,
            role_name: row.role_name,
            remark: row.remark,
            menu: this.getCheckedMenuItems(row) // 向后台发送所有全选和半选节点
          }
          createRole(data).then(response => {
            if (response.data.menu) { // 如果有菜单权限数据
              this.$refs['tree' + row.id].setCheckedKeys(response.data.menu)
              row.menu = response.data.menu // 角色菜单权限
            }
            row.edit = false
            row.isNew = false
            this.total++
            row.index = this.total
            row = Object.assign(row, response.data)
            this.changeRowLoadingStatus(false, row)
            this.refreshRoleData(row) // 刷新展开框Tree数据
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
    },

    /**
     * 在编辑模式下，点击确认时调用的方法
     */
    onEditConfirm(row) { // 编辑确认: 后端
      if (this.$refs.hasOwnProperty('tree' + row.id) && this.$refs['tree' + row.id]) {
        this.changeRowLoadingStatus(true, row)
        const data = {
          id: row.id,
          role_name: row.role_name,
          remark: row.remark,
          menu: this.getCheckedMenuItems(row)
        }
        updateRole(row.id, data).then(response => {
          row.edit = false
          row = Object.assign(row, response.data)
          if (response.data.menu) { // 如果有菜单权限数据
            this.$refs['tree' + row.id].setCheckedKeys(response.data.menu)
            row.menu = response.data.menu // 角色菜单权限
          }
          this.changeRowLoadingStatus(false, row)
          this.refreshRoleData(row) // 刷新展开框Tree数据
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
      getRole(row.id).then((response) => {
        row = Object.assign(row, response.data)
        row.edit = false
        if (response.data.menu) { // 如果有菜单权限数据
          this.$refs['tree' + row.id].setCheckedKeys(response.data.menu)
          row.menu = response.data.menu // 角色菜单权限
        }
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
      this.$confirm(`是否确认删除【${row.role_name}】？`, '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'error',
        center: true
      }).then(() => {
        deleteRole(row.id).then(response => {
          for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].id === row.id) {
              this.list.splice(i, 1)
              break
            }
          }
          this.$notify.success({ title: '删除成功', message: response.data.role_name })
        }).catch(message => {
          this.$notify.error({ title: '失败', message: message })
        })
      }).catch(() => {})
    },

    /**
     * 行展开或关闭
     */
    rowExpand(row) {
      this.$refs.table.toggleRowExpansion(row, !row.expand)
    },

    /** ******************************************************
     * 每当行展开或者行合并时的回调
     * 如果当前行没有menu字段且不是新角色，则去后台获取权限数据
     */
    onExpandChange(row, expandedRows) {
      if (expandedRows.indexOf(row) === -1) { // 当前row，不在expandedRows中，则正在关闭当前行
        if (row.edit) { // 如果编辑模式已经打开，这不能关闭展开行
          this.$refs.table.toggleRowExpansion(row, true)
          row.expand = true
        } else {
          row.expand = false
        }
      } else { // 当前row，在expandedRows中，则正在展开当前行
        if (!row.isNew && !row.menu) { // 如果不是新角色and没有menu字段
          this.fetchRolePermission(row) // 获取权限数据
        }
        this.refreshRoleData(row) // 刷新展开框Tree数据
        row.expand = true
      }
    },

    /**
     * 获取该角色菜单权限。仅获取页面和按键的权限，不获取目录的权限
     */
    fetchRolePermission(row) {
      this.changeRowLoadingStatus(true, row)
      getRole(row.id).then(response => {
        if (response.data.menu) { // 如果有菜单权限数据
          this.$refs['tree' + row.id].setCheckedKeys(response.data.menu)
          row.menu = response.data.menu // 角色菜单权限
        }
        this.changeRowLoadingStatus(false, row)
      }).catch(() => {
        this.changeRowLoadingStatus(false, row)
        this.$notify.error({ title: '失败', message: '获取角色权限失败' })
        row.edit = false
      })
    },

    /**
     * 刷新当前行的展开数据，设置tree数据的disabled字段
     */
    refreshRoleData(row) {
      row.menuTreeData = [] // 重置菜单数据
      for (let i = 0; i < this.originMenuData.length; i++) { // 从原始菜单数据中生成tree数据
        this.menuDFS(this.originMenuData[i], row.menuTreeData, !row.edit) // 每次重新生成一次是因为该数据必须deep copy
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

    /**
     * 在树存在的情况下，从树节点中获取被选中的节点，并筛选掉前缀为____的节点，并赋值给row.menu
     */
    getCheckedMenuItems(row) {
      let checkedItems = this.$refs['tree' + row.id].getCheckedKeys() // 获取全选节点
      const halfCheckedItems = this.$refs['tree' + row.id].getHalfCheckedKeys() // 获取半选节点
      checkedItems = checkedItems.concat(halfCheckedItems) // 获取半选节点
      return checkedItems.map(item => {
        if (item < 0) {
          return -item
        }
        return item
      })
    },

    /**
     * 递归深拷贝菜单树数据，并设置disabled
     * @param source
     * @param target
     * @param disabled
     */
    menuDFS(source, target, disabled) {
      const menu = {
        id: source.id,
        menu_name: source.menu_name,
        menu_type: source.menu_type,
        disabled: disabled,
        children: []
      }
      if (menu.menu_type < 2) {
        for (let i = 0; i < source.children.length; i++) {
          this.menuDFS(source.children[i], menu.children, disabled) // 向下遍历
        }
        menu.id = -menu.id
      }
      target.push(menu)
    }
  }
}
</script>

<style>

</style>
