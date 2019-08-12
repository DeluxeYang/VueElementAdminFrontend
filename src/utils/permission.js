import store from '@/store'

export function viewButtonPermission(that) {
  const _this = that
  const currentPathList = _this.$route.fullPath.split('/')
  const result = {}
  routerDFS(store.getters.routers, currentPathList, 1, result)
  if (result.meta.buttons) {
    for (let i = 0; i < result.meta.buttons.length; i++) {
      const button = result.meta.buttons[i]
      if (button === 3) {
        _this.createFlag = true
      } else if (button === 4) {
        _this.updateFlag = true
      } else if (button === 5) {
        _this.deleteFlag = true
      } else if (button === 6) {
        _this.exportFlag = true
      }
    }
  }
}

function routerDFS(routers, currentPathList, level, result) {
  for (let i = 0; i < routers.length; i++) {
    if (routers[i].path === currentPathList[level] ||
      routers[i].path === '/' + currentPathList[level]) {
      if (routers[i].children && routers[i].children.length > 1) {
        routerDFS(routers[i].children, currentPathList, level + 1, result)
      } else {
        result = Object.assign(result, routers[i])
      }
      break
    } else if (routers[i].path === '' || routers[i].path === '/') {
      if (routers[i].children) {
        routerDFS(routers[i].children, currentPathList, level, result)
      } else {
        result = Object.assign(result, routers[i])
      }
      break
    }
  }
}
