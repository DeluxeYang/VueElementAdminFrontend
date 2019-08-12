<template>
  <div
    ref="table"
    class="drag-tree-table">
    <div class="drag-tree-table-header">
      <column
        v-for="(item, index) in data.columns"
        :key="index"
        :width="item.width"
        :flex="item.flex"
        :align="item.align">
        <span :style="item.title_style">{{ item.title }}</span>
      </column>
    </div>
    <div
      :class="isDraing ? 'is-draging' : '' "
      class="drag-tree-table-body"
      @dragover="draging"
      @dragend="drop">
      <row
        v-for="(item, index) in data.lists"
        :key="index"
        :columns="data.columns"
        :model="item"
        depth="0" />
    </div>
  </div>
</template>

<script>
import row from './Row.vue'
import column from './Column.vue'

document.body.ondrop = function(event) {
  event.preventDefault()
  event.stopPropagation()
}
export default {
  name: 'DragTreeTable',
  components: {
    row,
    column
  },
  props: {
    data: {
      type: Object,
      default: null
    },
    onDrag: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      treeData: [],
      dragX: 0,
      dragY: 0,
      dragId: '',
      targetId: '',
      whereInsert: '',
      isDraing: false
    }
  },
  methods: {
    getElementLeft(element) {
      let actualLeft = element.offsetLeft
      let current = element.offsetParent
      while (current !== null) {
        actualLeft += current.offsetLeft
        current = current.offsetParent
      }
      return actualLeft
    },
    getElementTop(element) {
      // 如果表格在容器中滚动，需要做特殊计算
      const scrollTop = this.$refs.table.parentElement.scrollTop
      let actualTop = element.offsetTop - scrollTop
      let current = element.offsetParent
      while (current !== null) {
        actualTop += current.offsetTop
        current = current.offsetParent
      }
      return actualTop
    },
    draging(e) {
      this.isDraing = true
      if (this.dragX === e.pageX && e.pageY === this.dragY) return
      this.dragX = e.pageX
      this.dragY = e.pageY
      this.filter(e.pageX, e.pageY)
      if (e.clientY < 100) {
        window.scrollTo(0, scrollY - 6)
      } else if (e.clientY > (document.body.clientHeight - 160)) {
        window.scrollTo(0, scrollY + 6)
      }
    },
    drop() {
      this.clearHoverStatus()
      this.resetTreeData()
      this.isDraing = false
    },
    filter(x, y) {
      const rows = document.querySelectorAll('.tree-row')
      this.targetId = undefined
      const dragOriginElementTop = this.getElementTop(window.dragParentNode)
      const dragOriginElementLeft = this.getElementLeft(window.dragParentNode)
      const dragW = dragOriginElementLeft + window.dragParentNode.clientWidth
      const dragH = dragOriginElementTop + window.dragParentNode.clientHeight
      if (x >= dragOriginElementLeft && x <= dragW && y >= dragOriginElementTop && y <= dragH) {
        // 当前正在拖拽原始块不允许插入
        return
      }
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const rx = this.getElementLeft(row)
        const ry = this.getElementTop(row)
        const rw = row.clientWidth
        const rh = row.clientHeight
        if (x > rx && x < (rx + rw) && y > ry && y < (ry + rh)) {
          const diffY = y - ry
          const hoverBlock = row.children[row.children.length - 1]
          hoverBlock.style.display = 'block'
          this.targetId = row.getAttribute('tree-id')
          let whereInsert = ''
          const rowHeight = row.offsetHeight
          if (diffY / rowHeight > 3 / 4) {
            if (hoverBlock.children[2].style.opacity !== '0.5') {
              this.clearHoverStatus()
              hoverBlock.children[2].style.opacity = 0.5
            }
            whereInsert = 'bottom'
          } else if (diffY / rowHeight > 1 / 4) {
            if (hoverBlock.children[1].style.opacity !== '0.5') {
              this.clearHoverStatus()
              hoverBlock.children[1].style.opacity = 0.5
            }
            whereInsert = 'center'
          } else {
            if (hoverBlock.children[0].style.opacity !== '0.5') {
              this.clearHoverStatus()
              hoverBlock.children[0].style.opacity = 0.5
            }
            whereInsert = 'top'
          }
          this.whereInsert = whereInsert
        }
      }
    },
    clearHoverStatus() {
      const rows = document.querySelectorAll('.tree-row')
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const hoverBlock = row.children[row.children.length - 1]
        hoverBlock.style.display = 'none'
        hoverBlock.children[0].style.opacity = 0.1
        hoverBlock.children[1].style.opacity = 0.1
        hoverBlock.children[2].style.opacity = 0.1
      }
    },
    resetTreeData() {
      if (this.targetId === undefined) return
      const newList = []
      const curList = this.data.lists
      const _this = this
      function pushData(curList, needPushList) {
        for (let i = 0; i < curList.length; i++) {
          const item = curList[i]
          const obj = _this.deepClone(item)
          obj.lists = []
          if (_this.targetId === item.id) {
            const curDragItem = _this.getCurDragItem(_this.data.lists, window.dragId)
            if (_this.whereInsert === 'top') {
              curDragItem.parent_id = item.parent_id
              needPushList.push(curDragItem)
              needPushList.push(obj)
            } else if (_this.whereInsert === 'center') {
              curDragItem.parent_id = item.id
              obj.lists.push(curDragItem)
              needPushList.push(obj)
            } else {
              curDragItem.parent_id = item.parent_id
              needPushList.push(obj)
              needPushList.push(curDragItem)
            }
          } else {
            if (window.dragId !== item.id) {
              needPushList.push(obj)
            }
          }
          if (item.lists && item.lists.length) {
            pushData(item.lists, obj.lists)
          }
        }
      }
      pushData(curList, newList)
      this.resetOrder(newList)
      this.onDrag(newList)
    },
    resetOrder(list) {
      for (let i = 0; i < list.length; i++) {
        list[i].order = i
        if (list[i].lists && list[i].lists.length) {
          this.resetOrder(list[i].lists)
        }
      }
    },
    deepClone(aObject) {
      if (!aObject) {
        return aObject
      }
      let v
      const bObject = Array.isArray(aObject) ? [] : {}
      for (const k in aObject) {
        if (k === 'parent') {
          continue
        }
        if (aObject.hasOwnProperty(k)) {
          v = aObject[k]

          bObject[k] = (typeof v === 'object') ? this.deepClone(v) : v
        }
      }
      return bObject
    },
    getCurDragItem(lists, id) {
      let curItem = null

      function getChild(curList) {
        for (let i = 0; i < curList.length; i++) {
          const item = curList[i]
          if (item.id === id) {
            disconnectToParent(item)
            curItem = JSON.parse(JSON.stringify(item))
            break
          } else if (item.lists && item.lists.length) {
            getChild(item.lists)
          }
        }
      }

      function disconnectToParent(item) {
        item.parent = null
        if (item.lists && item.lists.length) {
          for (let i = 0; i < item.lists.length; i++) {
            disconnectToParent(item.lists[i])
          }
        }
      }
      getChild(lists)
      return curItem
    }

  }
}
</script>

<style lang="scss">
.drag-tree-table{
  margin: 0 0;
  color: #606266;
  font-size: 14px;
}
.drag-tree-table-header{
  display: flex;
  padding: 15px 10px;
  background: #f5f7fa;
  height: 66px;
  line-height: 36px;
  box-sizing: border-box;
  font-weight: 600;
  font-size: 18px;
}
.tree-icon-hidden{
  visibility: hidden;
}
.is-draging .tree-row:hover{
  background: transparent !important;
}
</style>
