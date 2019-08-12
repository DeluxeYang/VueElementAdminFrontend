import request from '@/utils/request'

export function getRoles(params) {
  return request({
    url: '/roles',
    method: 'get',
    params: params
  })
}

export function createRole(data) {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

export function getRole(id) {
  return request({
    url: `/roles/${id}/`,
    method: 'get'
  })
}

export function updateRole(id, data) {
  return request({
    url: `/roles/${id}/`,
    method: 'put',
    data
  })
}


export function deleteRole(id) {
  return request({
    url: `/roles/${id}/`,
    method: 'delete'
  })
}

