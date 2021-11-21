type Dict<T = any> = { [key: string]: T }
type Intersect<U> = (U extends any ? (arg: U) => void : never) extends ((arg: infer I) => void) ? I : never

function isNullable(value: any) {
  return value === null || value === undefined
}

function valueMap<T, U>(object: Dict<T>, transform: (value: T, key: string) => U): Dict<U> {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]))
}

interface Schema<T = any> extends Schema.Chainable<T> {
  (data: any): T
  new (data: any): T
}

namespace Schema {
  export type Type<T extends Schema> = T extends Schema<infer U> ? U : never

  export interface Base<T = any> {
    type: string
    desc?: string
    key?: string
    flag?: boolean
    value?: Schema
    alt?: Schema
    sDict?: Dict<string>
    list?: Schema[]
    dict?: Dict<Schema>
    callback?: Function
    meta?: Meta<T>
  }

  export interface Meta<T> {
    default?: T extends {} ? Partial<T> : T
    required?: boolean
    hidden?: boolean
    comment?: string
  }

  export function from<T = any>(options: Base<T>, desc?: string) {
    const schema = function (data: any) {
      return resolve(data, schema)[0]
    } as Schema<T>
    Object.setPrototypeOf(schema, Chainable.prototype)
    Object.assign(schema, options)
    schema.meta = {}
    if (desc) schema.desc = desc
    return schema
  }

  export interface Chainable<T = any> extends Base<T> {}

  export class Chainable<T = any> {
    toJSON() {
      return { ...this }
    }

    default(value: T) {
      this.meta.default = value
      return this
    }

    required() {
      this.meta.required = true
      return this
    }

    hidden() {
      this.meta.hidden = true
      return this
    }

    comment(text: string) {
      this.meta.comment = text
      return this
    }
  }

  Object.setPrototypeOf(Chainable.prototype, Function.prototype)

  export function any(desc?: string) {
    return from<any>({ type: 'any' }, desc)
  }

  export function never(desc?: string) {
    return from<never>({ type: 'never' }, desc)
  }

  export function string(desc?: string) {
    return from<string>({ type: 'string' }, desc)
  }

  export function number(desc?: string) {
    return from<number>({ type: 'number' }, desc)
  }

  export function boolean(desc?: string) {
    return from<boolean>({ type: 'boolean' }, desc)
  }

  export function array<T>(value: Schema<T>, desc?: string) {
    return from<T[]>({ type: 'array', value }, desc).default([])
  }

  export function dict<T>(value: Schema<T>, desc?: string) {
    return from<Dict<T>>({ type: 'dict', value }, desc).default({})
  }

  export function object<T extends Dict<Schema>>(dict: T, desc?: string): Schema<{ [K in keyof T]?: Type<T[K]> }>
  export function object<T extends Dict<Schema>>(dict: T, allowUnknown: true, desc?: string): Schema<{ [K in keyof T]?: Type<T[K]> }>
  export function object<T extends Dict<Schema>>(dict: T, ...args: any[]) {
    const desc = typeof args[args.length - 1] === 'string' ? args.pop() : undefined
    return from({ type: 'object', dict, flag: args[0] }, desc).default({})
  }

  export function select<T extends string>(sList: T[], desc?: string): Schema<T>
  export function select<T extends string>(sDict: Record<T, string>, desc?: string): Schema<T>
  export function select(sDict: any, desc?: string) {
    if (Array.isArray(sDict)) sDict = Object.fromEntries(sDict.map(k => [k, k]))
    return from({ type: 'select', sDict }, desc)
  }

  type Inner<K extends keyof any, T extends Record<K, Schema>> = Intersect<Type<T[K]>>
  type Decide<T extends Dict<Schema>, K extends string> = Inner<string, T> & { [P in K]: keyof T }

  export function decide<T extends Dict<Schema>, K extends string>(key: K, dict: T, desc?: string): Schema<Decide<T, K>>
  export function decide<T extends Dict<Schema>, K extends string>(key: K, dict: T, callback: (data: any) => keyof T, desc?: string): Schema<Decide<T, K>>
  export function decide<T extends Dict<Schema>, K extends string>(key: K, dict: T, ...args: any[]) {
    const desc = typeof args[args.length - 1] === 'string' ? args.pop() : undefined
    return from({ type: 'decide', dict, key, callback: args[0] }, desc)
  }

  export function intersect<T extends Schema[]>(list: T, desc?: string) {
    return from<Inner<number, T>>({ type: 'intersect', list }, desc)
  }

  export function union<T extends Schema[]>(list: T, desc?: string) {
    return from<Type<T[number]>>({ type: 'union', list }, desc)
  }

  export function adapt<S, T>(value: Schema<S>, alt: Schema<T>, callback: (value: T) => S, desc?: string) {
    return from<S>({ type: 'adapt', value, alt, callback }, desc)
  }

  function isObject(data: any) {
    return data && typeof data === 'object' && !Array.isArray(data)
  }
  
  function getDefault(schema: Schema) {
    return schema.type === 'adapt'
      ? getDefault(schema.value)
      : schema.meta.default
  }
  
  function checkSelect(data: any, dict: Dict) {
    const choices = Object.keys(dict)
    if (choices.includes(data)) return [data]
    throw TypeError(`expected one of ${choices.join(', ')} but got ${data}`)
  }

  function property(data: any, key: keyof any, schema?: Schema) {
    const [value, adapted] = resolve(data[key], schema)
    if (!isNullable(adapted)) data[key] = adapted
    return value
  }

  function resolve(data: any, schema?: Schema) {
    if (!schema) return [data]

    if (isNullable(data)) {
      if (schema.meta.required) throw new TypeError(`missing required value`)
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
        const value = resolve(data, schema.dict[key])[0]
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

      case 'intersect': {
        const result = {}
        for (const inner of schema.list) {
          const value = resolve(data, inner)[0]
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
}

export = Schema
