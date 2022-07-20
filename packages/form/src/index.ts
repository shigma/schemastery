import { App } from 'vue'
import Form from './form.vue'
import Markdown from './markdown.vue'
import Schema from './schema.vue'

export * from './icons'
export * from './utils'

export default function (app: App) {
  app.component('k-form', Form)
  app.component('k-markdown', Markdown)
  app.component('k-schema', Schema)
}
