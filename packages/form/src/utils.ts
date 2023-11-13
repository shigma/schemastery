import Schema from 'schemastery'
import { clone, deepEqual, Dict, isNullable, valueMap } from 'cosmokit'
import { computed, getCurrentInstance, ref, watch, WatchStopHandle } from 'vue'
import { fallbackWithLocaleChain } from '@intlify/core-base'
import { useI18n } from 'vue-i18n'
import form from '.'

export { Schema }

const extensions = new Set<form.Extension>()
export default extensions

export function useI18nText() {
  const composer = useI18n()
  const context: any = {}
  return (message: string | Dict<string>) => {
    if (!message || typeof message === 'string') return message as string
    const locales = fallbackWithLocaleChain(context, composer.fallbackLocale.value, composer.locale.value)
    for (const locale of locales) {
      if (locale in message) return message[locale]
    }
  }
}

const dynamic = ['function', 'transform', 'is']

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

function optional(schema: Schema): Schema {
  if (schema.type === 'const') return schema
  if (schema.type === 'transform') return optional(schema.inner)
  schema = new Schema(schema).required(false)
  if (schema.type === 'object') {
    schema.dict = valueMap(schema.dict, optional)
  } else if (schema.type === 'tuple') {
    schema.list = schema.list.map(optional)
  } else if (schema.type === 'intersect') {
    schema.list = schema.list.map(optional)
  } else if (schema.type === 'union') {
    schema.list = schema.list.map(optional)
  } else if (schema.type === 'dict') {
    schema.inner = optional(schema.inner)
  } else if (schema.type === 'array') {
    schema.inner = optional(schema.inner)
  }
  return schema
}

export function check(schema: any, value: any) {
  try {
    optional(schema)(value)
    return true
  } catch {
    return false
  }
}

export function explain(schema: Schema, value: any): readonly [string, any[]?] {
  if (isNullable(value)) return
  if (schema.type !== 'string') return
  if (schema.meta.pattern) {
    const { source, flags } = schema.meta.pattern
    const regexp = new RegExp(source, flags)
    if (!regexp.test(value)) {
      return ['errors.regexp-not-matched', [regexp.toString()]]
    }
  }
}

export function useDisabled() {
  const { props } = getCurrentInstance() as any
  return computed(() => props.disabled || props.schema?.meta?.disabled)
}

interface ConfigOptions<T> {
  strict?: boolean
  input?(value: any): T
  output?(value: T): any
}

export function useModel<T = any>(options?: ConfigOptions<T>) {
  let stop: WatchStopHandle
  const config = ref<T>()
  const { props, emit } = getCurrentInstance() as any

  const doWatch = () => watch(config, (value) => {
    try {
      if (options?.output) value = options.output(value)
      const schema = optional(Schema(props.schema))
      if (deepEqual(schema(value), props.schema.meta.default, options?.strict)) value = null
    } catch {
      return
    }
    emit('update:modelValue', value)
  }, { deep: true })

  watch(() => [props.modelValue, props.schema], ([value, schema]) => {
    stop?.()
    value ??= getFallback(schema)
    if (options?.input) value = options.input(value)
    config.value = value
    stop = doWatch()
  }, { deep: true, immediate: true })

  return config
}

export function useEntries() {
  const { props } = getCurrentInstance() as any

  const entries = useModel<[string, any][]>({
    strict: true,
    input: (config) => Object.entries(config),
    output: (config) => {
      if (props.schema.type === 'array') {
        return config.map(([, value]) => value)
      }
      const result: any = {}
      for (const [key, value] of config) {
        if (key in result) throw new Error('duplicate entries')
        result[key] = value
      }
      return result
    },
  })

  return {
    entries,
    up(index: number) {
      if (props.schema.type === 'dict') {
        entries.value.splice(index - 1, 0, ...entries.value.splice(index, 1))
      } else {
        const temp = entries.value[index][1]
        entries.value[index][1] = entries.value[index - 1][1]
        entries.value[index - 1][1] = temp
      }
    },
    down(index: number) {
      if (props.schema.type === 'dict') {
        entries.value.splice(index + 1, 0, ...entries.value.splice(index, 1))
      } else {
        const temp = entries.value[index][1]
        entries.value[index][1] = entries.value[index + 1][1]
        entries.value[index + 1][1] = temp
      }
    },
    del(index: number) {
      entries.value.splice(index, 1)
    },
    insert(index: number) {
      entries.value.splice(index, 0, ['', null])
    },
  }
}
