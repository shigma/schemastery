import { Dict, Intersect, isNullable, valueMap } from './utils'

interface Schema<T = any> extends Schema.Base<T> {
  (data: any): T
  new (data: any): T
}

namespace Schema {
  export type Type<T extends Schema> = T extends Schema<infer U> ? U : never

  export interface Base<T = any> extends ExtraOptions<T> {
    type: string
    key?: string
    flag?: boolean
    value?: Schema
    alt?: Schema
    sDict?: Dict<string>
    list?: Schema[]
    dict?: Dict<Schema>
    callback?: Function
  }

  export interface ExtraOptions<T> {
    desc?: Extra
    default?: T extends {} ? Partial<T> : T
    required?: boolean
    hidden?: boolean
    comment?: string
  }

  export type Extra<T = any> = string | ExtraOptions<T>

  function create<T>(options: Base, desc: Extra) {
    const schema = function (data: any) {
      return resolve(data, schema)[0]
    } as any as Schema<T>
    Object.assign(schema, options)
    if (typeof desc === 'string') {
      schema.desc = desc
    } else {
      Object.assign(schema, desc)
    }
    return schema
  }

  export function any(desc?: Extra) {
    return create<any>({ type: 'any' }, desc)
  }

  export function never(desc?: Extra) {
    return create<never>({ type: 'never' }, desc)
  }

  export function string(desc?: Extra) {
    return create<string>({ type: 'string' }, desc)
  }

  export function number(desc?: Extra) {
    return create<number>({ type: 'number' }, desc)
  }

  export function boolean(desc?: Extra) {
    return create<boolean>({ type: 'boolean' }, desc)
  }

  export function array<T>(value: Schema<T>, desc?: Extra) {
    return create<T[]>({ type: 'array', value, default: [] }, desc)
  }

  export function dict<T>(value: Schema<T>, desc?: Extra) {
    return create<Dict<T>>({ type: 'dict', value, default: {} }, desc)
  }

  export function object<T extends Dict<Schema>>(dict: T, desc?: Extra): Schema<{ [K in keyof T]?: Type<T[K]> }>
  export function object<T extends Dict<Schema>>(dict: T, allowUnknown: true, desc?: Extra): Schema<{ [K in keyof T]?: Type<T[K]> }>
  export function object<T extends Dict<Schema>>(dict: T, ...args: any[]) {
    const desc = typeof args[args.length - 1] === 'string' ? args.pop() : undefined
    return create({ type: 'object', dict, flag: args[0], default: {} }, desc)
  }

  export function select<T extends string>(sList: T[], desc?: Extra): Schema<T>
  export function select<T extends string>(sDict: Record<T, string>, desc?: Extra): Schema<T>
  export function select(sDict: any, desc?: Extra) {
    if (Array.isArray(sDict)) sDict = Object.fromEntries(sDict.map(k => [k, k]))
    return create({ type: 'select', sDict }, desc)
  }

  type Inner<K extends keyof any, T extends Record<K, Schema>> = Intersect<Type<T[K]>>
  type Decide<T extends Dict<Schema>, K extends string> = Inner<string, T> & { [P in K]: keyof T }

  export function decide<T extends Dict<Schema>, K extends string>(key: K, dict: T, desc?: Extra): Schema<Decide<T, K>>
  export function decide<T extends Dict<Schema>, K extends string>(key: K, dict: T, callback: (data: any) => keyof T, desc?: Extra): Schema<Decide<T, K>>
  export function decide<T extends Dict<Schema>, K extends string>(key: K, dict: T, ...args: any[]) {
    const desc = typeof args[args.length - 1] === 'string' ? args.pop() : undefined
    return create({ type: 'decide', dict, key, callback: args[0] }, desc)
  }

  export function merge<T extends Schema[]>(list: T, desc?: Extra) {
    return create<Inner<number, T>>({ type: 'merge', list }, desc)
  }

  export function union<T extends Schema[]>(list: T, desc?: Extra) {
    return create<Type<T[number]>>({ type: 'union', list }, desc)
  }

  export function adapt<S, T>(value: Schema<S>, alt: Schema<T>, callback: (value: T) => S, desc?: Extra) {
    return create<S>({ type: 'adapt', value, alt, callback }, desc)
  }

  function isObject(data: any) {
    return data && typeof data === 'object' && !Array.isArray(data)
  }

  function getDefault(schema: Schema) {
    return schema.type === 'adapt'
      ? getDefault(schema.value)
      : schema.default
  }

  function property(data: any, key: keyof any, schema?: Schema) {
    const [value, adapted] = resolve(data[key], schema)
    if (!isNullable(adapted)) data[key] = adapted
    return value
  }

  function checkSelect(data: any, dict: Dict) {
    const choices = Object.keys(dict)
    if (choices.includes(data)) return [data]
    throw TypeError(`expected one of ${choices.join(', ')} but got ${data}`)
  }

  function resolve(data: any, schema?: Schema) {
    if (!schema) return [data]

    if (isNullable(data)) {
      if (schema.required) throw new TypeError(`missing required value`)
      const fallback = getDefault(schema)
      if (isNullable(fallback)) return [data]
      data = fallback
    }

    switch (schema.type) {
      case 'any': return [data]
      case 'never':
        throw new TypeError(`expected nullable but got ${data}`)

      case 'string':
      case 'number':
      case 'boolean': {
        if (typeof data === schema.type) return [data]
        throw new TypeError(`expected ${schema.type} but got ${data}`)
      }

      case 'array': {
        if (!Array.isArray(data)) throw new TypeError(`expected array but got ${data}`)
        return [data.map((_, index) => property(data, index, schema.value))]
      }

      case 'dict': {
        if (!isObject(data)) throw new TypeError(`expected dict but got ${data}`)
        return [valueMap(data, (_, key) => property(data, key, schema.value))]
      }

      case 'select':
        return checkSelect(data, schema.sDict)

      case 'decide': {
        if (!isObject(data)) throw new TypeError(`expected object but got ${data}`)
        let key = data[schema.key]
        if (isNullable(key)) {
          if (!schema.callback) throw new TypeError(`missing required value`)
          key = data[schema.key] = schema.callback(data)
        }
        checkSelect(key, schema.dict)
        const value = validate(data, schema.dict[key])
        value[schema.key] = key
        return [value]
      }

      case 'object': {
        if (!isObject(data)) throw new TypeError(`expected object but got ${data}`)
        const result = {}
        for (const key in schema.dict) {
          const value = property(data, key, schema.dict[key])
          if (!isNullable(value) || key in data) {
            result[key] = value
          }
        }
        if (schema.flag) {
          for (const key in data) {
            if (key in result) continue
            result[key] = data[key]
          }
        }
        return [result]
      }

      case 'merge': {
        const result = {}
        for (const inner of schema.list) {
          const value = validate(data, inner)
          Object.assign(result, value)
        }
        return [result]
      }

      case 'adapt': {
        try {
          return resolve(data, schema.value)
        } catch {
          const [value, adapted = data] = resolve(data, schema.alt)
          if (isObject(data)) {
            const temp = {}
            for (const key in value) {
              if (!(key in data)) continue
              temp[key] = data[key]
              delete data[key]
            }
            Object.assign(data, schema.callback(temp))
            return [schema.callback(value)]
          } else {
            return [schema.callback(value), schema.callback(adapted)]
          }
        }
      }

      default:
        throw new TypeError(`unsupported type "${schema.type}"`)
    }
  }

  export function validate(data: any, schema?: Schema) {
    return resolve(data, schema)[0]
  }
}

export = Schema
