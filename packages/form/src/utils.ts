import Schema from 'schemastery'
import { clone, deepEqual, valueMap } from 'cosmokit'
import { getCurrentInstance, ref, watch, WatchStopHandle } from 'vue'

export * from 'cosmokit'
export { Schema }

const primitive = ['string', 'number', 'boolean', 'bitset', 'const']
const dynamic = ['function', 'transform', 'is']
const composite = ['array', 'dict']

export function isObjectSchema(schema: Schema): boolean {
  if (schema.type === 'object') {
    return true
  } else if (schema.type === 'intersect') {
    return schema.list.every(isObjectSchema)
  } else if (schema.type === 'union') {
    return getChoices(schema).every(isObjectSchema)
  } else {
    return false
  }
}

export function getChoices(schema: Schema) {
  const inner: Schema[] = []
  const choices = schema.list.filter((item) => {
    if (item.meta.hidden) return
    if (item.type === 'transform') inner.push(item.inner)
    return !dynamic.includes(item.type)
  })
  return choices.length ? choices : inner
}

export function getFallback(schema: Schema, required = false) {
  if (!schema || schema.type === 'union' && getChoices(schema).length === 1) return
  return clone(schema.meta.default) ?? (required ? inferFallback(schema) : undefined)
}

export function inferFallback(schema: Schema) {
  if (schema.type === 'string') return ''
  if (schema.type === 'number') return 0
  if (schema.type === 'boolean') return false
  if (['dict', 'object', 'intersect'].includes(schema.type)) return {}
}

export function validate(schema: Schema): boolean {
  if (!schema || schema.meta.hidden) return true
  if (schema.type === 'object') {
    return Object.values(schema.dict).every(validate)
  } else if (schema.type === 'intersect') {
    return schema.list.every(isObjectSchema)
  } else if (schema.type === 'union') {
    const choices = getChoices(schema)
    return choices.length === 1 || choices.every(item => validate(item))
  } else if (composite.includes(schema.type)) {
    return validate(schema.inner)
  } else if (schema.type === 'tuple') {
    return schema.list.every(item => primitive.includes(item.type))
  } else {
    return primitive.includes(schema.type)
  }
}

export function hasTitle(schema: Schema, root?: boolean): boolean {
  if (!schema) return true
  if (schema.type === 'object') {
    if (schema.meta.description) return true
    const keys = Object.keys(schema.dict)
    if (!keys.length) return true
    return hasTitle(schema.dict[keys[0]])
  } else if (schema.type === 'intersect') {
    return hasTitle(schema.list[0])
  } else if (schema.type === 'union') {
    const choices = getChoices(schema)
    return choices.length === 1 ? hasTitle(choices[0]) : false
  } else if (root && composite.includes(schema.type) && validate(schema.inner)) {
    return true
  } else {
    return false
  }
}

function optional(schema: Schema): Schema {
  if (schema.type === 'const') return schema
  if (schema.type === 'object') {
    return Schema.object(valueMap(schema.dict, optional))
  } else if (schema.type === 'tuple') {
    return Schema.tuple(schema.list.map(optional))
  } else if (schema.type === 'intersect') {
    return Schema.intersect(schema.list.map(optional))
  } else if (schema.type === 'union') {
    return Schema.union(schema.list.map(optional))
  } else if (schema.type === 'dict') {
    return Schema.dict(optional(schema.inner))
  } else if (schema.type === 'array') {
    return Schema.array(optional(schema.inner))
  } else {
    return Schema(schema).required(false)
  }
}

export function check(schema: any, value: any) {
  try {
    optional(schema)(value)
    return true
  } catch {
    return false
  }
}

export function useEntries() {
  let stop: WatchStopHandle
  const entries = ref<any[]>()
  const { props, emit } = getCurrentInstance() as any

  const doWatch = () => watch(entries, () => {
    if (props.schema.type === 'dict') {
      const result: any = {}
      for (const [key, value] of entries.value) {
        if (key in result) return
        result[key] = value
      }
      emit('update:modelValue', result)
    } else {
      emit('update:modelValue', entries.value.map(([, value]) => value))
    }
  }, { deep: true })

  watch(() => props.modelValue, (value) => {
    stop?.()
    entries.value = Object.entries(value || {})
    stop = doWatch()
  }, { immediate: true, deep: true })

  return entries
}

export function useConfig() {
  const config = ref()
  let stop: WatchStopHandle
  const { props, emit } = getCurrentInstance() as any

  const doWatch = () => watch(config, (value) => {
    emit('update:modelValue', deepEqual(value, props.schema.meta.default) ? undefined : value)
  }, { deep: true })

  watch(() => [props.modelValue, props.schema], ([value, schema]) => {
    stop?.()
    config.value = value ?? getFallback(schema)
    stop = doWatch()
  }, { immediate: true, deep: true })

  return config
}
