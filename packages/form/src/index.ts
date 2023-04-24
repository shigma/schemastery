import { App } from 'vue'
import Schema from './schema'

export * from './icons'
export * from './utils'

export default function (app: App) {
  app.component('k-schema', Schema)
}
