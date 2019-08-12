<template>
  <span class="space-container">
    <span
      v-for="(item, index) in spaces"
      :key="index"
      class="space" />
  </span>
</template>
<script>
export default {
  name: 'Space',
  props: {
    depth: {
      type: [Number, String],
      default: null
    }
  },
  computed: {
    spaces() {
      const aArr = []
      for (let i = 0; i < this.depth; i++) {
        aArr.push('')
      }
      return aArr
    }
  }
}
</script>
<style>
.space{
  display: inline-block;
  width: 15px;
}
</style>
