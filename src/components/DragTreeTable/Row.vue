<template>
  <div
    class="tree-block"
    draggable="true"
    ondragenter="event.preventDefault()"
    ondragover="event.preventDefault()"
    @dragstart="dragstart($event)"
    @dragend="dragend($event)">
    <div
      :tree-id="model.id"
      :tree-p-id="model.parent_id"
      class="tree-row"
      @click="toggle">
      <column
        v-for="(subItem, subIndex) in columns"
        :key="subIndex"
        :class="'align-' + subItem.align"
        :field="subItem.field"
        :width="subItem.width"
        :flex="subItem.flex">
        <span v-if="subItem.type === 'selection'">
          <space :depth="depth" />
          <span
            v-if="model.lists && model.lists.length"
            :class="[model.open ? 'arrow-bottom' : 'arrow-right']"
            class="zip-icon" />
          <span
            v-else
            class="zip-icon arrow-transparent" />
          <span
            v-if="subItem.formatter">
            {{ subItem.formatter(model) }}
          </span>
          <span v-else>
            {{ model[subItem.field] }}
          </span>
        </span>
        <span v-else-if="subItem.type === 'action'">
          <a
            v-for="(acItem, acIndex) in subItem.actions"
            :key="acIndex">
            <el-button
              :type="acItem.tag"
              :icon="acItem.icon"
              size="mini"
              @click.stop.prevent="acItem.onclick(model)">
              {{ acItem.text }}
            </el-button>
            &nbsp;
          </a>
        </span>

        <span v-else-if="subItem.type === 'option'">
          <el-tag :type="subItem.options[model[subItem.field]].tag">
            {{ subItem.options[model[subItem.field]].title }}
          </el-tag>
        </span>

        <span v-else-if="subItem.type === 'component'">
          <el-tooltip
            effect="dark"
            content="前端组件固定代码"
            placement="top">
            <el-tag v-if="model[subItem.field]">{{ model[subItem.field] }}</el-tag>
          </el-tooltip>
        </span>

        <span v-else-if="subItem.type === 'permission'">
          <el-tooltip
            effect="dark"
            content="后端访问权限固定代码"
            placement="top">
            <el-tag
              v-if="model[subItem.field]"
              type="info">
              {{ model[subItem.field] }}
            </el-tag>
          </el-tooltip>
        </span>

        <span v-else-if="subItem.type === 'icon'">
          <span v-if="model[subItem.field]">
            <svg-icon
              :icon-class="model[subItem.field]"
              style="width: 20px; height: 20px;" />
          </span>
        </span>

        <span v-else>
          <span
            v-if="subItem.formatter">
            {{ subItem.formatter(model) }}
          </span>
          <span v-else>{{ model[subItem.field] }}</span>
        </span>
      </column>
      <div
        class="hover-model"
        style="display: none">
        <div class="hover-block prev-block">
          <i class="el-icon-caret-top" />
        </div>
        <div class="hover-block center-block">
          <i class="el-icon-caret-right" />
        </div>
        <div class="hover-block next-block">
          <i class="el-icon-caret-bottom" />
        </div>
      </div>
    </div>
    <row
      v-for="(item, index) in model.lists"
      v-show="model.open"
      :key="index"
      :model="item"
      :columns="columns"
      :depth="depth * 1 + 1" />
  </div>
</template>
<script>
import column from './Column.vue'
import space from './Space.vue'
export default {
  name: 'Row',
  components: {
    column,
    space
  },
  props: {
    model: {
      type: Object,
      default: null
    },
    depth: {
      type: [Number, String],
      default: null
    },
    columns: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      open: false,
      visibility: 'visible'
    }
  },
  computed: {
    isFolder() {
      return this.model.lists && this.model.lists.length
    }
  },
  methods: {
    toggle() {
      if (this.isFolder) {
        this.model.open = !this.model.open
      }
    },
    dragstart(e) {
      if (navigator.userAgent.indexOf('Firefox') >= 0) {
        // Firefox drag have a bug
        e.dataTransfer.setData('Text', this.id)
      }
      window.dragId = e.target.children[0].getAttribute('tree-id')
      window.dragParentNode = e.target
      e.target.style.opacity = 0.2
    },
    dragend(e) {
      e.target.style.opacity = 1
    }
  }
}
</script>

<style lang="scss">
.tree-block{
  width: 100%;
  background: rgba(255,255,255,0.8)
}
.tree-row{
  position: relative;
  display: flex;
  padding: 10px 10px 10px 10px;
  border-bottom: 1px solid #eee;
  line-height: 32px;
  &:hover{
      background: #ecf5ff
  }
  .align-left{
      text-align: left;
  }
  .align-right{
      text-align: right;
  }
  .align-center{
      text-align: center;
  }
}
.hover-model{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255,255,255,0.6);
}
.hover-block{
    display: flex;
    opacity: 0.1;
    transition: opacity 0.5s;
    justify-content: center;
    align-items: center;
    i{
        color: #FFF;
    }
}
.prev-block{
    height: 25%;
    background: #a0c8f7;
}
.center-block{
    height: 50%;
    background: #a0c8f7;
}
.next-block{
    height: 25%;
    background: #a0c8f7;
}
.action-item{
    color: #409eff;
    cursor: pointer;
    i{
        font-style: normal;
    }
}
.zip-icon{
    display: inline-block;
    width: 8px;
    height: 8px;
    vertical-align: middle;
    background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAf0lEQVQ4T7XT0Q2AMAhF0dvNdALdSEdzBB3BDXQD85LGRNMCauS7nAKBxMdIhfwemIAtYpeAEeiANoLUgAGYI4gFqAMX8QAXiQBCNFDNRBVdIgpUkSfADjT3KqLACmg/XrWw5J+Li+VVYCZrMBbgJluA+tXA3Hv45ZgiR3i+OQBeSyYRPEyeUAAAAABJRU5ErkJggg==') no-repeat center;
    background-size: cover;
}
.arrow-transparent{
    visibility: hidden;
}
.arrow-right{

}
.arrow-bottom{
    transform: rotate(90deg)
}
[draggable=true] {
-khtml-user-drag: element;
}
</style>
