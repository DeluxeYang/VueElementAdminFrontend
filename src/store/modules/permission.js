import { componentPool, constantRouters } from '@/router'

function generateAsyncRouter(menus, asyncRouter, isRootMenu) {
  for (let i = 0; i < menus.length; i++) {
    const menu = menus[i]
    const router = {
      path: menu.path ? menu.path : '',
      name: Math.random().toString(36).substr(2),
      meta: { title: menu.menu_name, icon: menu.icon }
    }

    if (isRootMenu) { // 如果是根菜单
      router.component = componentPool['Layout'] // 则组件必须为Layout
      router.path = '/' + router.path // path也要加个/
      if (menu.menu_type === 1) { // 该菜单类型为1，即页面
        router.children = [
          {
            path: router.path,
            component: componentPool[menu.component],
            meta: { title: menu.menu_name, icon: menu.icon },
            name: Math.random().toString(36).substr(2)
          }
        ]
        delete router.name
      }
    } else if (menu.menu_type === 1) { // 如果不是根菜单，且菜单类型为1，即页面
      router.component = componentPool[menu.component]
    } else { // 如果不是根菜单，也不是页面，即二级及以上的目录
      router.component = componentPool['Nested']
    }

    // 是不是根目录都需要以下处理
    if (menu.menu_type === 0) { // 如果menu类型为0，即目录，则需要向下递归
      router.children = []
      router.redirect = generateAsyncRouter(menu.children, router.children, false) // 生成下级路由，并返回下级路由的第一个path，作为目录的redirect
    } else { // 页面
      router.meta.buttons = []
      if (menu.children) { // 则遍历buttons, buttons中传来的数据也为对象，而此处仅需要字符串
        for (let i = 0; i < menu.children.length; i++) {
          router.meta.buttons.push(menu.children[i].menu_type)
        }
      }
    }
    asyncRouter.push(router)
  }
  if (asyncRouter.length > 0) {
    if (asyncRouter[0].redirect) {
      return asyncRouter[0].path + '/' + asyncRouter[0].redirect
    } else {
      return asyncRouter[0].path
    }
  }
}

const state = {
  routers: [],
  addRouters: []
}

const mutations = {
  SET_ROUTERS: (state, routers) => {
    state.addRouters = routers
    state.routers = constantRouters.concat(routers)
  }
}

const actions = {
  generateRouters({ commit }, menus) {
    return new Promise(resolve => {
      const asyncRouters = []
      const defaultRouter = generateAsyncRouter(menus, asyncRouters, true) // 返回值为第一个路由
      let hasDefaultPath = false
      for (let i = 0; i < asyncRouters.length; i++) { // 循环检测是否有'/'路由
        if (asyncRouters[i].path === '/') {
          hasDefaultPath = true
        }
      }
      if (!hasDefaultPath) { // 如果已有path = '\' 的路由，就不再添加默认路由
        asyncRouters.push({ path: '/', redirect: defaultRouter, hidden: true })
      }
      asyncRouters.push({ path: '*', redirect: '/404', hidden: true })
      commit('SET_ROUTERS', asyncRouters)
      resolve(asyncRouters)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
