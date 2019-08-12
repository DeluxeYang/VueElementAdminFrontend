import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    url: '/info',
    method: 'get'
  })
}
