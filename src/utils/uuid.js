export function getUUID() {
  const nowDate = new Date()
  const datestr = String(String(String(String(String(String(nowDate.getFullYear()) + nowDate.getMonth()) + nowDate.getDay()) +
      nowDate.getHours()) + nowDate.getMinutes()) + nowDate.getSeconds()) + nowDate.getMilliseconds()
  const randNum = Math.random() * (9999 - 1000) + 1000
  return String(datestr) + String(randNum)
}
