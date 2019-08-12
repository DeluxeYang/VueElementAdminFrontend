import { MessageBox, Notification } from 'element-ui'

export function batchDelete(selectedList, wholeList, row, callback, refresh, key = 'id', name = 'name') {
  const list = row ? [row] : selectedList
  const deleteList = []
  const itemNames = []
  for (let i = 0; i < list.length; i++) {
    deleteList.push(list[i][key])
    itemNames.push(list[i][name])
  }
  MessageBox.confirm(`是否确认删除【${itemNames.join(', ')}】？`, '提示', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'error',
    center: true
  }).then(() => {
    callback(deleteList).then(response => {
      const succeedList = []
      list.filter(item => {
        if (response.data.indexOf(item[key]) !== -1) { // 如果当前item在response.data中，则说明该项目操作成功
          succeedList.push(item[name])
          return true
        } else {
          Notification.error({
            title: '删除失败',
            message: item[name],
            duration: 3000
          })
          return false
        }
      })
      refresh()
      Notification.success({
        title: '删除成功',
        message: succeedList.join(', '),
        duration: 2000
      })
    }).catch(() => {
      Notification.error({
        title: '失败',
        message: '删除失败',
        type: 'error',
        duration: 2000
      })
    })
  }).catch(() => {})
}

export function batchOperationWithConfirm(selectedList, wholeList, row, callback, status = false, key = 'id', name = 'name', operationName = '') {
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
    callback(idList).then(response => {
      const succeedList = []
      list.filter(item => {
        if (response.data.indexOf(item[key]) !== -1) { // 如果当前item在response.data中，则说明该项目操作成功
          if (status !== false) {
            item.status = status
          }
          succeedList.push(item[name])
          return true
        } else {
          Notification.error({
            title: '操作失败',
            message: item[name],
            duration: 3000
          })
          return false
        }
      })

      Notification.success({
        title: '操作成功',
        message: succeedList.join(', '),
        duration: 2000
      })
    })
  }).catch(() => {})
}

export function batchOperation(selectedList, wholeList, row, callback, status = false, key = 'id', name = 'name') {
  const list = row ? [row] : selectedList
  const idList = []
  for (let i = 0; i < list.length; i++) {
    idList.push(list[i][key])
  }
  callback(idList).then(response => {
    const succeedList = []
    list.filter(item => {
      if (response.data.indexOf(item[key]) !== -1) { // 如果当前item在response.data中，则说明该项目操作成功
        if (status !== false) {
          item.status = status
        }
        succeedList.push(item[name])
        return true
      } else {
        Notification.error({
          title: '操作失败',
          message: item[name],
          duration: 3000
        })
        return false
      }
    })

    Notification.success({
      title: '操作成功',
      message: succeedList.join(', '),
      duration: 2000
    })
  })
}
