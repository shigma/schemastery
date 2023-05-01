import { App, Component } from 'vue'
import Bitset from './extensions/bitset.vue'
import Group from './extensions/group.vue'
import Intersect from './extensions/intersect.vue'
import Object from './extensions/object.vue'
import Radio from './extensions/radio.vue'
import Table from './extensions/table.vue'
import Textarea from './extensions/textarea.vue'
import Tuple from './extensions/tuple.vue'
import Union from './extensions/union.vue'
import Schema from './schema.vue'

export * from './icons'
export * from './utils'

function form(app: App) {
  app.component('k-schema', Schema)
}

namespace form {
  export interface Extension {
    type: string
    role?: string
    validate?: (value: any, schema: any) => boolean
    component: Component
  }

  export const extensions = new Set<Extension>()

  extensions.add({
    type: 'bitset',
    component: Bitset,
    validate: value => typeof value === 'number',
  })

  extensions.add({
    type: 'array',
    component: Group,
    validate: value => Array.isArray(value),
  })

  extensions.add({
    type: 'dict',
    component: Group,
    validate: value => typeof value === 'object',
  })

  extensions.add({
    type: 'object',
    component: Object,
    validate: value => typeof value === 'object',
  })

  extensions.add({
    type: 'intersect',
    component: Intersect,
    validate: value => typeof value === 'object',
  })

  extensions.add({
    type: 'union',
    role: 'radio',
    component: Radio,
  })

  extensions.add({
    type: 'array',
    role: 'table',
    component: Table,
    validate: value => Array.isArray(value),
  })

  extensions.add({
    type: 'dict',
    role: 'table',
    component: Table,
    validate: value => typeof value === 'object',
  })

  extensions.add({
    type: 'string',
    role: 'textarea',
    component: Textarea,
    validate: value => typeof value === 'string',
  })

  extensions.add({
    type: 'tuple',
    component: Tuple,
    validate: value => Array.isArray(value),
  })

  extensions.add({
    type: 'union',
    component: Union,
  })
}

export default form
