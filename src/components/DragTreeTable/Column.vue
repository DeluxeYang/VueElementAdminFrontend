<template>
  <div
    v-if="flex"
    :style="{ width: width + 'px', flex: flex}"
    class="tree-column">
    <slot />
  </div>
  <div
    v-else
    :style="{ width: width + 'px', 'text-align': align}"
    class="tree-column">
    <slot />
  </div>
</template>
<script>
export default {
  name: 'Column',
  props: {
    width: {
      type: Number,
      default: null
    },
    field: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    flex: {
      type: Number,
      default: null
    },
    align: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      open: false
    }
  }
}
</script>
<style>
  .tree-column{
    padding: 0 4px;
    min-width: 60px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
