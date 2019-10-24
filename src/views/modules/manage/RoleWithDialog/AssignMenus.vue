<template>
  <el-dialog
    v-dialogDrag
    :visible.sync="dialogVisible"
    :before-close="beforeClose"
    title="为角色分配菜单权限"
    width="600px"
    @open="fetchRoleMappedMenus"
    @closed="onClosed">
    <div style="margin-left: 50px">
      <el-tree
        ref="menuTree"
        v-loading="loading"
        :data="menuTree"
        :default-checked-keys="granted"
        show-checkbox
        node-key="id"
        @check="onChange">
        <span
          slot-scope="{ node, data }"
          style="margin-left: 10px">
          <span v-if="data.type === 2">
            <el-tag
              v-if="data.name === 'list'"
              type="primary"
              size="mini">
              {{ data.title }}
            </el-tag>
            <el-tag
              v-else
              :type="menuButtonTypes[data.name].tag_type"
              size="mini">
              {{ menuButtonTypes[data.name].label }}
            </el-tag>
          </span>
          <span v-else>
            <el-link>{{ data.title }}</el-link>
          </span>
        </span>
      </el-tree>
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
import { getRoleMappedMenus, mappingRole } from '@/api/manage/role'
import { getMenus } from '@/api/manage/menu'
import settings from '@/settings'
export default {
  name: 'AssignMenus',
  props: {
    assignMenusDialogVisible: {
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
      menuButtonTypes: settings.menuButtonTypes,
      loading: false,
      menuTree: [],
      granted: [],
      changed: false,
      menuTreeData: []
    }
  },
  computed: {
    dialogVisible: {
      get() {
        return this.assignMenusDialogVisible
      },
      set(val) {
        this.$emit('update:assignMenusDialogVisible', val)
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
    this.fetchMenuData()
  },
  methods: {
    fetchRoleMappedMenus() {
      this.loading = true
      this.menuTree = []
      for (let i = 0; i < this.menuTreeData.length; i++) { // 从原始菜单数据中生成tree数据
        this.menuDFS(this.menuTreeData[i], this.menuTree) // 每次重新生成一次是因为该数据必须deep copy
      }
      getRoleMappedMenus(this.id).then(response => {
        this.$refs['menuTree'].setCheckedKeys(response.data.granted)
        // this.granted = response.data.granted
        this.loading = false
      }).catch(error => {
        this.$message.error(error.message)
        this.loading = false
      })
    },

    fetchMenuData() {
      getMenus().then(response => {
        this.menuTreeData = response.data
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
      this.granted = []
      this.menuTree = []
      this.loading = false
      this.changed = false
    },

    onSubmit() {
      this.loading = true
      const granted = this.getCheckedMenuItems()
      mappingRole(this.id, granted).then(response => {
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

    getCheckedMenuItems() {
      let checkedItems = this.$refs['menuTree'].getCheckedKeys() // 获取全选节点
      checkedItems = checkedItems.concat(this.$refs['menuTree'].getHalfCheckedKeys()) // 获取半选节点
      for (let i = 0; i < checkedItems.length; i++) {
        const prefix = checkedItems[i].substr(0, 5)
        if (prefix === '__1__') {
          checkedItems.splice(i--, 1)
        } else if (prefix === '__0__') {
          checkedItems[i] = checkedItems[i].substr(5)
        }
      }
      return checkedItems
    },


    /**
     * 递归深拷贝菜单树数据，并设置disabled
     * @Param source
     * @Param target
     * @Param disabled
     */
    menuDFS(source, target) {
      const menu = {
        id: '__1__' + source.id,
        originId: source.id,
        name: source.name,
        title: source.title,
        type: source.type,
        children: []
      }
      if (menu.type === 1) { // 如果是页面，
        menu.children.push({ // 首先加入查询节点
          id: source.id,
          name: 'list',
          title: '查询',
          type: 2
        })
        if (source.buttons) {
          for (let i = 0; i < source.buttons.length; i++) {
            menu.children.push({ // 然后按已有按键加入节点
              id: source.buttons[i].id,
              name: source.buttons[i].name,
              title: source.buttons[i].name,
              type: 2
            })
          }
        }
      } else if (menu.type === 0 && source.children) { // 如果是目录
        menu.id = '__0__' + source.id
        for (let i = 0; i < source.children.length; i++) {
          this.menuDFS(source.children[i], menu.children) // 向下遍历
        }
      }
      target.push(menu)
    }
  }
}
</script>

<style scoped>
</style>
