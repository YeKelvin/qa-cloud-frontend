import { JSEncrypt } from 'jsencrypt'
import { defineStore } from 'pinia'

import * as AuthService from '@/api/usercenter/auth'
import * as UserService from '@/api/usercenter/user'
import userDefaultAvatar from '@/assets/images/layout/user_avatar.gif'
import { getToken, removeToken, setToken } from '@/utils/auth'

/**
 * 获取加密公钥
 */
const getPublicKey = async () => {
  const response = await AuthService.encryptionFactor()
  return {
    index: response.data.index,
    publicKey: response.data.publicKey
  }
}

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      token: getToken(),
      number: '',
      name: '',
      avatar: '',
      sso: false,
      roles: [],
      settings: {}
    }
  },
  getters: {},
  actions: {
    async login({ loginName, password, accountType }) {
      // rsa公钥加密
      const factor = await getPublicKey()
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(factor.publicKey)
      // 登录
      let response = null
      if (accountType === 'enterprise') {
        // 企业账号登录
        response = await UserService.loginByEnterprise({
          email: loginName.trim(),
          password: encryptor.encrypt(password),
          index: factor.index
        })
      } else {
        // 平台账号登录
        response = await UserService.login({
          loginName: loginName.trim(),
          password: encryptor.encrypt(password),
          index: factor.index
        })
      }
      setToken(response.data.accessToken)
      this.token = response.data.accessToken
    },

    queryInfo() {
      return new Promise((resolve, reject) => {
        UserService.queryInfo()
          .then(response => {
            if (!response) {
              reject(new Error('身份认证失败或失效，请重新登录'))
              return
            }
            if (response && (response.code !== 200 || !response.data)) {
              reject(new Error('身份认证失败或失效，请重新登录'))
              return
            }

            this.avatar = userDefaultAvatar
            this.number = response.data.userNo
            this.name = response.data.userName
            this.sso = response.data.sso
            this.roles = response.data.roles
            this.settings = response.data.settings
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    logout() {
      return new Promise((resolve, reject) => {
        UserService.logout(this.token)
          .then(() => {
            removeToken() // must remove token first
            this.resetState()
            resolve()
          })
          .catch(error => {
            reject(error)
          })
      })
    },

    resetToken() {
      return new Promise(resolve => {
        removeToken() // must remove token first
        this.resetState()
        resolve()
      })
    },

    resetState() {
      this.token = getToken()
      this.number = ''
      this.name = ''
      this.avatar = ''
      this.roles = []
    }
  }
})
