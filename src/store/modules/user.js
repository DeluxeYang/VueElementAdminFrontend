import { login, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  roles: [],
  menus: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_MENUS: (state, menus) => {
    state.menus = menus
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const data = {
      username: userInfo.username.trim(),
      password: userInfo.password.trim(),
      captcha: userInfo.captcha.trim()
    }
    return new Promise((resolve, reject) => {
      login(data).then(response => {
        // 登录成功
        if ('token' in response.data) {
          const data = response.data
          setToken(data.token)
          commit('SET_TOKEN', data.token)
        } else {
          setToken('logged') // session方式登录，把token设成一个登录标志
          commit('SET_TOKEN', 'logged')
        }
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const data = response.data
        if (data.menus && Object.keys(data.menus).length > 0) { // 验证返回的menus是否是一个非空数组
          commit('SET_MENUS', data.menus)
        } else {
          reject(Error('当前用户未关联任何角色或角色无任何菜单权限！'))
        }
        commit('SET_NAME', data.name)
        commit('SET_AVATAR', data.avatar)
        resolve(data.menus)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  logout({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_MENUS', [])
      removeToken()
      resetRouter()
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

