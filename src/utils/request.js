import axios from 'axios'
import { MessageBox } from 'element-ui'
import store from '../store'
import { getToken } from '@/utils/auth'

axios.defaults.withCredentials = true // axios默认withCredentials为false，即不携带cookie信息

// 创建axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // api 的 base_url
  timeout: 60000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (store.getters.token) {
      config.headers['token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    // Do something with request error
    console.log(error) // for debug
    Promise.reject(error)
  }
)

// response 拦截器
service.interceptors.response.use(
  response => { // http请求正常
    /**
     * code为非200是抛错 可结合自己业务进行修改
     */
    const res = response.data
    if (res.code !== 200) { // http请求正常，但服务器返回的数据中的code不等于200，即后端自定义的错误
      if (res.code === 10004 || res.code === 10006 || res.code === 10008) {
        MessageBox.confirm(
          res.message + '，可以点击取消继续浏览该页面，或者重新登录',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '取消',
            type: 'warning'
          }
        ).then(() => {
          store.dispatch('user/logout').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
        }).catch(() => {})
      }
      return Promise.reject(res)
    } else { // http请求正常，且后端返回数据中code=200
      return res
    }
  },
  error => { // http请求失败
    return Promise.reject(error)
  }
)

export default service
