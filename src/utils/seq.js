/**
 * list加序号
 * @Param list
 * @Param page
 * @Param limit
 * @returns {*}
 */
export function seq(list, page, limit) {
  let index = limit * (page - 1) + 1
  for (let i = 0; i < list.length; i++) {
    list[i].index = index
    index++
  }
  return list
}
