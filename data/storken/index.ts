import { createStore } from 'storken'
import { StorkenStorage } from 'storken-storage'
import getters from './getters'

const storage = StorkenStorage({
  storage: typeof window !== 'undefined' ? window.localStorage : (null as any)
})

export const [Storken, { useStorken }] = createStore({
  storkenOptions: {
    credentials: {
      loading: true,
      plugins: { storage }
    },
    theme: {
      plugins: { storage }
    }
  },
  getters,
  initialValues: {
    isAuth: false,
    code: {}
  }
})

export default { Storken, useStorken }
