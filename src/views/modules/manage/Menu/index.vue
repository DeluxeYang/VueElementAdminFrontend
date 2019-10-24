<template>
  <div
    v-loading="listLoading"
    class="app-container">
    <div class="table-container">
      <dragTreeTable
        :data="treeData"
        :on-drag="onTreeDataChange"
        draggable="true" />
    </div>

    <el-dialog
      v-dialogDrag
      :title="dialogState[dialogStatus]"
      :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dialogData"
        label-position="left"
        label-width="70px"
        style="max-width: 85%; margin-left:50px;">
        <div
          v-for="(subItem, subIndex) in treeData.columns"
          :key="subIndex">
          <!-- 文本输入 -->
          <el-form-item
            v-if="subItem.formType === 'input'"
            :label="subItem.title"
            :prop="subItem.field">
            <el-input
              v-model="dialogData[subItem.field]"
              style="width: 100%;" />
          </el-form-item>

          <!-- 权限类型 -->
          <el-form-item
            v-if="subItem.formType === 'permission' && dialogData.menu_type === 1"
            :label="subItem.title"
            :prop="subItem.field">
            <el-input
              v-model="dialogData[subItem.field]"
              style="margin-bottom: 20px" />
            <el-tag
              v-for="(button, index) in dialogData.buttons"
              :key="index"
              :disable-transitions="false"
              :type="buttonTypes[button.menu_type - 2].tag_type"
              closable
              style="margin-right: 10px;"
              @close="onCloseTag(button)">
              {{ buttonTypes[button.menu_type - 2].label }}
            </el-tag>
            <el-select
              v-model="selectButtonTypesValue"
              placeholder="添加按键"
              style="width: 120px;"
              value=""
              @change="onButtonSelectChange">
              <el-option
                v-for="item in buttonTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                size="small" />
            </el-select>
          </el-form-item>

          <!-- 组件 -->
          <el-form-item
            v-if="subItem.formType === 'component' && dialogData.menu_type === 1"
            :label="subItem.title"
            :prop="subItem.field">
            <el-input v-model="dialogData[subItem.field]" />
          </el-form-item>

          <!-- 菜单类型 -->
          <el-form-item
            v-else-if="subItem.formType === 'select'"
            :label="subItem.title"
            :prop="subItem.field">
            <el-select
              v-model="dialogData[subItem.field]"
              placeholder="Please select"
              value=""
              style="width: 100%;"
              @change="onSelectMenuType(dialogData)">
              <el-option
                v-for="item in subItem['options']"
                :key="item.value"
                :label="item.title"
                :value="item.value" />
            </el-select>
          </el-form-item>

          <el-form-item
            v-else-if="subItem.formType === 'icon'"
            :label="subItem.title"
            :prop="subItem.field">
            <el-popover
              ref="iconListPopover"
              v-model="iconPopoverValue"
              placement="bottom-start"
              trigger="click">
              <div class="mod-menu__icon-inner">
                <div class="mod-menu__icon-list">
                  <el-button
                    v-for="(item, index) in iconsMap"
                    :key="index"
                    @click="onIconSelected(dialogData, subItem.field, item)">
                    <svg-icon :icon-class="item" />
                  </el-button>
                </div>
              </div>
              <el-input
                slot="reference"
                v-model="dialogData[subItem.field]"
                style="float: left; width: 90%;" />
            </el-popover>
            <span v-if="dialogData[subItem.field]">
              <svg-icon
                :icon-class="dialogData[subItem.field]"
                style="float: right; margin-top: 5px;width: 32px; height: 32px;" />
            </span>
          </el-form-item>
        </div>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus==='create'?createConfirm():editConfirm()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-row style="margin-top: 20px">
      <el-col
        :span="16"
        :offset="10">
        <el-button
          v-if="createFlag"
          :icon="icons.CREATE_ICON"
          type="primary"
          size="mini"
          style="width: 80px"
          @click="onCreate()">
          新增
        </el-button>

        <el-button
          v-if="updateFlag"
          :disabled="!isModified"
          :icon="icons.CHECK_ICON"
          type="success"
          size="mini"
          style="width: 80px"
          @click.stop.prevent="onSave()">
          保存
        </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getMenus, saveMenus } from '@/api/manage/menu'
import DragTreeTable from '@/components/DragTreeTable'
import { MessageBox } from 'element-ui'
import icons from './requireIcons'
import { viewButtonPermission } from '@/utils/permission'
import localIcons from '@/utils/icons'

export default {
  name: 'Menu',
  components: { DragTreeTable },
  data() {
    return {
      icons: localIcons,

      listLoading: false,
      exportLoading: false,
      createFlag: false,
      updateFlag: false,
      deleteFlag: false,
      exportFlag: false,
      searchFlag: true,
      isModified: false,
      newID: -1,
      dialogFormVisible: false,
      dialogStatus: '',
      dialogData: {
        title: null,
        name: null,
        component: null,
        path: null,
        type: null,
        icon: null
      },
      dialogModel: null,
      dialogState: {
        'update': '编辑',
        'create': '新建'
      },
      rules: {
        title: [{ required: true, message: '必须输入菜单名', trigger: 'change' }],
        component: [{ required: true, message: '必须输入组件名', trigger: 'change' }],
        name: [{ required: true, message: '必须输入菜单标识', trigger: 'change' }]
      },
      selectButtonTypesValue: null,
      buttonTypes: [{
        value: 2,
        label: '查询',
        tag_type: 'info'
      }, {
        value: 3,
        label: '新增',
        tag_type: 'success'
      }, {
        value: 4,
        label: '编辑',
        tag_type: 'primary'
      }, {
        value: 5,
        label: '删除',
        tag_type: 'danger'
      }, {
        value: 6,
        label: '导出',
        tag_type: 'info'
      }],
      dialogIconVisible: false,
      iconsMap: icons,
      iconPopoverValue: false,
      treeData: {
        lists: [],
        columns: [
          {
            type: 'selection',
            formType: 'input',
            title: '名称',
            field: 'menu_name',
            width: 300,
            align: 'left',
            titleFormatter: () => {
              return '<p style="margin-top: 0; padding-top: 0; margin-left: 15px;">名称</p>'
            },
            formatter: (item) => {
              return item.menu_name
            }
          }, {
            title: '类型',
            field: 'menu_type',
            formType: 'select',
            type: 'option',
            options: [{
              value: 0,
              title: '目录',
              tag: 'info'
            }, {
              value: 1,
              title: '页面',
              tag: 'success'
            }
            ],
            width: 200,
            align: 'left'
          }, {
            title: '路径',
            formType: 'input',
            field: 'path',
            width: 200,
            align: 'left'
          }, {
            title: '组件',
            formType: 'component',
            type: 'component',
            field: 'component',
            width: 200,
            align: 'left'
          }, {
            title: '权限标识',
            type: 'permission',
            formType: 'permission',
            field: 'permission_tag',
            width: 200,
            align: 'left'
          }, {
            title: '图标',
            type: 'icon',
            formType: 'icon',
            field: 'icon',
            width: 200,
            align: 'left'
          }
        ]
      }
    }
  },

  /**
   * 页面载入后的勾子函数
   */
  created() {
    this.fetchMenu() // 获取后端数据
    viewButtonPermission(this)
    const actions = { // 推送操作到columns中
      title: '操作',
      type: 'action',
      width: 300,
      align: 'left',
      actions: []
    }
    if (this.updateFlag) {
      actions.actions.push({
        text: '编辑',
        tag: 'primary',
        icon: this.icons.UPDATE_ICON,
        onclick: this.onEdit
      })
    }
    if (this.deleteFlag) {
      actions.actions.push({
        text: '删除',
        tag: 'danger',
        icon: this.icons.DELETE_ICON,
        onclick: this.onDelete
      })
    }
    this.treeData.columns.push(actions)
    this.$set(this.treeData, 'columns', this.treeData.columns) // 更新
  },

  beforeDestroy() {
    if (this.isModified) {
      MessageBox.confirm('菜单尚未保存，是否保存？', '提示', {
        confirmButtonText: '保存',
        cancelButtonText: '放弃',
        type: 'warning',
        center: true
      }).then(() => {
        this.onSave()
        this.isModified = false
      }).catch(() => {})
    }
  },
  methods: {
    /**
     * 获取树数据
     */
    fetchMenu() {
      this.listLoading = true
      getMenus().then(response => {
        this.treeData.lists = this.menuTreeDFS(response.data, null)
        console.log(this.treeData.lists)
        this.listLoading = false
      }).catch(error => {
        this.$message.error({ message: error.message })
      })
    },

    /**
     * 遍历菜单数据，并格式化
     * @param list
     * @param parent
     * @returns {*}
     */
    menuTreeDFS(list, parent) { // 遍历从服务端获取的数据，
      list.forEach(item => {
        item.originID = item.id
        item.id = item.id.toString()
        if (item.menu_type === 0) { // 如果菜单类型为目录
          item.lists = item.children
          delete item.children
          this.menuTreeDFS(item.lists, item) // 递归下一级
        } else { // 如果菜单类型为页面
          item.lists = []
          item.buttons = item.children
          delete item.children
        }
        item.parent = parent
        item.open = false
      })
      return list
    },

    /**
     * 树结构改变时的回调
     * @param list
     */
    onTreeDataChange(list) {
      if (this.inspectMenuData(list, null)) { // 检查树结构是否合规
        this.treeData.lists = list
        this.isModified = true
      }
    },

    /**
     * 检查页面树结构的菜单数据，主要是检查拖拽时，页面节点不能有child
     * @param list
     * @param parent
     * @returns {boolean}
     */
    inspectMenuData(list, parent) {
      let flag = true
      const no_repeat = {}
      for (let i = 0; i < list.length; i++) {
        const item = list[i]
        item.parent = parent
        if (item.type === 1 && item.lists.length > 0) { // 如果是页面但是却拥有子节点，则不合格
          flag = false
          this.$notify.error({ title: '失败', message: '只能移动到目录下或根结点下', duration: 3000 })
        } else if (no_repeat.hasOwnProperty(item.path) ||
          (item.path === '' && no_repeat.hasOwnProperty(null)) ||
          (item.path === null && no_repeat.hasOwnProperty(''))) { // 检查是否有路径重复
          flag = false
          this.$notify.error({ title: '失败', message: '同一父节点下的菜单路径不能重复', duration: 3000 })
        } else { // 检查下级路径
          flag = this.inspectMenuData(item.lists, item)
        }
        if (!flag) {
          break
        }
        no_repeat[item.path] = 1
      }
      return flag
    },

    /**
     * 点击编辑时的回调
     * @param model
     */
    onEdit(model) {
      this.dialogFormVisible = true
      this.dialogModel = model
      this.dialogData = this.deepCopy(model) // copy obj
      this.dialogStatus = 'update'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    /**
     * 针对树数据的深拷贝
     * @param obj
     * @returns {*}
     */
    deepCopy(obj) {
      const result = Array.isArray(obj) ? [] : {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (key === 'buttons') {
            result[key] = this.deepCopy(obj[key]) // 递归复制
          } else {
            result[key] = obj[key]
          }
        }
      }
      return result
    },

    /**
     * 编辑确认时的回调
     */
    editConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid && this.checkPathRepeat(this.dialogData, this.dialogModel.parent || this.treeData)) {
          this.dialogModel = Object.assign(this.dialogModel, this.dialogData)
          if (this.dialogModel.menu_type === 0) { // 如果当前结点为目录
            this.dialogModel.component = '' // 则组件置空
          } else { // 如果当前结点为页面，则把它已有的下级菜单移动到根目录下
            for (const index in this.dialogModel.lists) { // 将该的子节点转移到根目录下
              if (this.dialogModel.lists.hasOwnProperty(index)) {
                const item = this.dialogModel.lists[index]
                item.parent = this.treeData
                this.treeData.lists.push(item)
              }
            }
            this.dialogModel.lists = []
          }
          this.dialogFormVisible = false
          this.isModified = true
        }
      })
    },

    /**
     * 点击删除时的回调
     * @param model
     */
    onDelete(model) {
      MessageBox.confirm('是否确认删除菜单【' + model.menu_name + '】及其下级子菜单？', '提示', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        if (model.parent) { // 从上一级移除
          const index = model.parent.lists.indexOf(model)
          model.parent.lists.splice(index, 1)
        } else { // 从上一级移除
          const index = this.treeData.lists.indexOf(model)
          this.treeData.lists.splice(index, 1)
        }
        this.isModified = true
      }).catch(() => {})
    },

    /**
     * 点击创建时的回调
     */
    onCreate() {
      this.dialogFormVisible = true
      this.dialogData = {
        originID: 0,
        menu_name: '',
        menu_type: 0,
        path: '',
        icon: '',
        permission_tag: '',
        component: ''
      }
      this.dialogStatus = 'create'
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    /**
     * 确认创建
     */
    createConfirm() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid && this.checkPathRepeat(this.dialogData, this.treeData)) {
          this.dialogModel = { ...this.dialogData }
          if (this.dialogModel.menu_type === 0) { // 如果当前结点为目录
            this.dialogModel.component = '' // 则组件置空
          }
          this.dialogModel.id = (this.newID--).toString()
          this.dialogModel.originID = 0
          this.dialogModel.lists = []
          this.dialogModel.parent = this.treeData
          this.dialogModel.open = false
          this.treeData.lists.push(this.dialogModel)
          this.dialogFormVisible = false
          this.isModified = true
        }
      })
    },

    /**
     * 检查路径重复
     */
    checkPathRepeat(item, parent) {
      for (let i = 0; i < parent.lists.length; i++) {
        if (item.id !== parent.lists[i].id && // 首先：排除item自己
            (parent.lists[i].path === item.path || // 若path相同
            (item.path === '' && parent.lists[i].path === null))) { // 或path为‘’，且同级存在null
          this.$notify.error({ title: '失败', message: '同一父节点下的菜单路径不能重复', duration: 3000 })
          return false
        }
      }
      return true
    },

    /**
     * 保存
     */
    onSave() { // 保存菜单数据
      const data = []
      for (let i = 0; i < this.treeData.lists.length; i++) {
        data.push(this.serializeMenu(this.treeData.lists[i]))
      }
      saveMenus(data).then(() => {
        this.$notify.success({ title: '保存成功', message: '保存成功', duration: 3000 })
        this.isModified = false
        this.fetchMenu()
      }).catch(error => {
        this.$notify.error({ title: '保存失败', message: error.message, duration: 3000 })
      })
    },

    /**
     * 当该菜单的类型为1时，即页面，这该菜单应有buttons
     * @param model
     */
    onSelectMenuType(model) {
      if (model.menu_type === 1) {
        if (!model.hasOwnProperty('buttons')) {
          model.buttons = []
        }
      }
      console.log(model)
    },

    /**
     * 创建buttons时的回调，判断当前菜单是否已有该button
     * @param value
     */
    onButtonSelectChange(value) {
      let flag = true
      for (let i = 0; i < this.dialogData.buttons.length; i++) { // 检查权限类型是否已经重复
        if (this.dialogData.buttons[i].menu_type === value) {
          flag = false
          break
        }
      }
      if (flag) {
        this.dialogData.buttons.push({
          menu_name: this.buttonTypes[value - 2].label,
          menu_type: value
        })
      }
      this.selectButtonTypesValue = null
    },

    /**
     * 关闭（删除）按键标签时调用
     * @param button
     */
    onCloseTag(button) { // 关闭（删除）按键标签时调用
      this.dialogData.buttons.splice(this.dialogData.buttons.indexOf(button), 1)
    },

    /**
     * 图标被选择时的回调
     * @param dialogData
     * @param index
     * @param item
     */
    onIconSelected(dialogData, index, item) {
      dialogData[index] = item
      this.iconPopoverValue = false
    },

    /**
     * 序列化惨淡数据
     * @param item
     * @returns {{path: *, component: *, menu_type: (number|*), children: Array, menu_name: (string), permission_tag: string, icon: *, remark: string, id: *}}
     */
    serializeMenu(item) { // 序列化菜单数据，仅提取出所需的字段
      const menu = {
        id: typeof item.id === 'number' ? item.id : item.originID,
        menu_name: item.menu_name,
        menu_type: item.menu_type,
        remark: '',
        component: item.component,
        permission_tag: item.permission_tag,
        path: item.path,
        icon: item.icon,
        children: []
      }
      if (item.menu_type === 0) {
        for (let i = 0; i < item.lists.length; i++) {
          menu.children.push(this.serializeMenu(item.lists[i]))
        }
      } else if (item.menu_type === 1) {
        for (let i = 0; i < item.buttons.length; i++) {
          menu.children.push(this.serializeMenu(item.buttons[i]))
        }
      }
      return menu
    }
  }
}
</script>

<style lang="scss">
  .mod-menu {
    .menu-list__input,
    .icon-list__input {
      > .el-input__inner {
        cursor: pointer;
      }
    }
    &__icon-popover {
      width: 430px;
      overflow: hidden;
    }
    &__icon-inner {
      width: 440px;
      max-height: 258px;
      overflow-x: hidden;
      overflow-y: auto;
    }
    &__icon-list {
      width: 440px;
      padding: 0;
      margin: -8px 0 0 -8px;
      > .el-button {
        padding: 8px;
        margin: 8px 0 0 8px;
        > span {
          display: inline-block;
          vertical-align: middle;
          width: 18px;
          height: 18px;
          font-size: 18px;
        }
      }
    }
    .icon-list__tips {
      font-size: 18px;
      text-align: center;
      color: #e6a23c;
      cursor: pointer;
    }
  }
</style>

