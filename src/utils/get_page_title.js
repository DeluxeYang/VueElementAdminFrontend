import defaultSettings from './../settings'

const title = defaultSettings.title.replace(/\s*/g, '')

export default function get_page_title(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}
