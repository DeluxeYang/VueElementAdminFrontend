<script>
export default {
  beforeCreate() {
    const { params, query } = this.$route
    let { path } = params
    if (path === undefined) {
      path = ''
    }
    this.$router.replace({ path: '/' + path, query })
  },
  render: function(h) {
    return h() // avoid warning message
  }
}
</script>
