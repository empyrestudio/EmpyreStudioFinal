const mem = new Map()
const sessMem = new Map()

function backend(prefer) {
  for (const name of prefer) {
    try {
      const s = window[name]
      const k = '__empyre_probe'
      s.setItem(k, '1')
      s.removeItem(k)
      return s
    } catch {
      /* private mode, file protocol, or sandbox */
    }
  }
  return null
}

const store = backend(['localStorage', 'sessionStorage'])
const session = backend(['sessionStorage']) || store

function wrap(target, fallback) {
  return {
    get(key) {
      try {
        if (target) return target.getItem(key)
      } catch {
        /* ignore */
      }
      return fallback.has(key) ? fallback.get(key) : null
    },
    set(key, value) {
      try {
        if (target) {
          target.setItem(key, value)
          return
        }
      } catch {
        /* ignore */
      }
      fallback.set(key, String(value))
    },
    remove(key) {
      try {
        if (target) target.removeItem(key)
      } catch {
        /* ignore */
      }
      fallback.delete(key)
    },
  }
}

const dataApi = wrap(store, mem)
const sessionApi = wrap(session, sessMem)

export const storeGet = (k) => dataApi.get(k)
export const storeSet = (k, v) => dataApi.set(k, v)
export const storeRemove = (k) => dataApi.remove(k)
export const sessionGet = (k) => sessionApi.get(k)
export const sessionSet = (k, v) => sessionApi.set(k, v)
export const sessionRemove = (k) => sessionApi.remove(k)
