import request from '@/utils/request'

export function getMenus() {
  return request({
    url: '/menus',
    method: 'get'
  })
}

export function saveMenus(data) {
  return request({
    url: '/menus',
    method: 'post',
    data
  })
}
