import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Layout from '@/views/basic/Layout' // 固定排版

export const constantRouters = [
  {
    path: '/f',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/f/:path*',
        component: () => import('@/views/basic/Redirect')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/basic/Login'),
    hidden: true
  },
  {
    path: '/404',
    component: Layout,
    children: [{
      path: '',
      name: 'NotFound',
      meta: { title: '404' },
      component: () => import('@/views/basic/NotFound.vue')
    }],
    hidden: true
  },
  {
    path: '/change_password',
    component: Layout,
    children: [{
      path: '',
      name: 'ChangePassword',
      component: () => import('@/views/basic/Login/ChangePassword'),
      meta: { title: '修改密码' }
    }],
    hidden: true
  }
]

export const componentPool = {
  'Layout': Layout,
  '404': () => import('@/views/basic/NotFound'),
  'Nested': () => import('@/views/basic/Nested'),
  'UserManage': () => import('@/views/modules/manage/User'),
  'RoleManage': () => import('@/views/modules/manage/Role'),
  'MenuManage': () => import('@/views/modules/manage/Menu'),
  'Template': () => import('@/views/modules/manage/Template')
}

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouters
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
