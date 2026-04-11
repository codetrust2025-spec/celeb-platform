// Shared utility to build absolute file URLs from relative /uploads paths
const ABSOLUTE_URL_RE = /^https?:\/\//i
const LOCALHOST_URL_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i

export const FILES_BASE_URL = (
  process.env.REACT_APP_FILES_BASE_URL ||
  (process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace(/\/api\/?$/, '') : '') ||
  'http://localhost:5000'
).replace(/\/$/, '')

export const buildFileURL = (p) => {
  if (!p) return ''
  if (ABSOLUTE_URL_RE.test(p) && !LOCALHOST_URL_RE.test(p)) return p
  const relative = p.replace(LOCALHOST_URL_RE, '')
  return `${FILES_BASE_URL}${relative.startsWith('/') ? '' : '/'}${relative}`
}
