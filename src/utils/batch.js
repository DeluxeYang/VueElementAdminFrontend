import { MessageBox, Notification } from 'element-ui'

export function batchOperationWithConfirm(selectedList, row, callback, refreshCallback, key = 'id', name = 'name', operationName = '') {
  const list = row ? [row] : selectedList
  const idList = []
  const itemNames = []
  for (let i = 0; i < list.length; i++) {
    idList.push(list[i][key])
    itemNames.push(list[i][name])
  }
  MessageBox.confirm(`是否确认${operationName}【${itemNames.join(', ')}】？`, '提示', {
    confirmButtonText: operationName,
    cancelButtonText: '取消',
    type: 'warning',
    center: true
  }).then(() => {
    callback(idList).then(() => {
      Notification.success({ title: '成功', message: `${operationName}成功` })
      refreshCallback()
    }).catch(error => {
      Notification.error({ title: `${operationName}失败`, message: error.message })
    })
  }).catch(() => {})
}

export function batchOperation(selectedList, row, callback, refreshCallback, key = 'id', operationName = '') {
  const list = row ? [row] : selectedList
  const idList = []
  for (let i = 0; i < list.length; i++) {
    idList.push(list[i][key])
  }
  callback(idList).then(() => {
    Notification.success({ title: '成功', message: `${operationName}成功` })
    refreshCallback()
  }).catch(error => {
    Notification.error({ title: `${operationName}失败`, message: error.message })
  })
}
