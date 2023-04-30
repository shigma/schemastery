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
    component: Component
  }

  export const extensions = new Set<Extension>()

  extensions.add({
    type: 'bitset',
    component: Bitset,
  })

  extensions.add({
    type: 'array',
    component: Group,
  })

  extensions.add({
    type: 'dict',
    component: Group,
  })

  extensions.add({
    type: 'object',
    component: Object,
  })

  extensions.add({
    type: 'intersect',
    component: Intersect,
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
  })

  extensions.add({
    type: 'dict',
    role: 'table',
    component: Table,
  })

  extensions.add({
    type: 'string',
    role: 'textarea',
    component: Textarea,
  })

  extensions.add({
    type: 'tuple',
    component: Tuple,
  })

  extensions.add({
    type: 'union',
    component: Union,
  })
}

export default form
