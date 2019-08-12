export function QQ(rule, value, callback) {
  if (value === '') {
    callback(new Error('输入QQ号'))
  } else if (/^[1-9][0-9]{4,10}$/.test(value)) {
    callback()
  } else {
    callback(new Error('输入正确的QQ号'))
  }
}

// 类似金钱,首位不为0,最多2位小数
export function checkNumPot2(rule, value, callback) {
  const reg = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/
  if (!value) {
    return callback(new Error('请填写数字'))
  } else if (!reg.test(value)) {
    return callback(new Error('请填写数字,最多2位小数'))
  } else {
    callback()
  }
}

// 身份证
export function checkIdNum(rule, value, callback) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!value) {
    return callback(new Error('证件号码不能为空'))
  } else if (!reg.test(value)) {
    return callback(new Error('证件号码不正确'))
  } else {
    callback()
  }
}

export function checkUserName(rule, value, callback) {
  const reg = /^[a-zA-Z][\w]{4,15}$/
  if (!value) {
    return callback(new Error('请输入用户名'))
  } else if (!reg.test(value)) {
    return callback(new Error('用户名只能包含字母，数字, 且必须为字母开头，长度5-16位'))
  } else {
    callback()
  }
}

// 整数
export function checkIntNum(rule, value, callback) {
  const reg = /^[0-9]*[1-9][0-9]*$/
  if (!value) {
    return callback(new Error('请填写整数'))
  } else if (!reg.test(value)) {
    return callback(new Error('请输入整数'))
  } else {
    callback()
  }
}

// 整数
export function notNull(rule, value, callback) {
  if (!value) {
    return callback(new Error('该值不能为空'))
  } else {
    callback()
  }
}

export default {
  QQ: [{ required: true, validator: QQ, trigger: 'blur' }],
  mobile: [{ required: false, pattern: /^[0-9/-]{6,12}$/, message: '长度需在6-12位，仅包含数字和"-"', trigger: ['blur', 'change'] }],
  money: [{ required: true, validator: checkNumPot2, trigger: 'blur' }],
  int: [{ required: true, validator: checkIntNum, trigger: 'blur' }],
  ID: [{ required: true, validator: checkIdNum, trigger: 'blur' }],
  username: [{ required: true, validator: checkUserName, trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址，如"xxx@xxx.xx"', trigger: ['blur', 'change'] }
  ]
}
