type Dict<T = any> = { [key: string]: T }
type Intersect<U> = (U extends any ? (arg: U) => void : never) extends ((arg: infer I) => void) ? I : never

function isNullable(value: any) {
  return value === null || value === undefined
}

function isObject(data: any) {
  return data && typeof data === 'object' && !Array.isArray(data)
}

function valueMap<T, U>(object: Dict<T>, transform: (value: T, key: string) => U): Dict<U> {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]))
}

interface Schema<T = any> extends Schema.Base<T> {
  (data: any): T
  new (data: any): T
  required(): this
  hidden(): this
  adaptive(): this
  default(value: T): this
  comment(text: string): this
  description(text: string): this
}

const Schema = function (options: Schema.Base) {
  const schema = function (data: any) {
    return Schema.resolve(data, schema)[0]
  } as Schema
  Object.setPrototypeOf(schema, Schema.prototype)
  Object.assign(schema, options)
  schema.meta ||= {}
  return schema
} as Schema.Static

Schema.prototype = Object.create(Function.prototype)

for (const key of ['required', 'hidden', 'adaptive']) {
  Object.assign(Schema.prototype, {
    [key]() {
      this.meta[key] = true
      return this
    },
  })
}

for (const key of ['default', 'comment', 'description']) {
  Object.assign(Schema.prototype, {
    [key](value: any) {
      this.meta[key] = value
      return this
    },
  })
}

const resolvers: Dict<Schema.Resolve> = {}

Schema.extend = function extend(type: string, resolve, keys, meta) {
  resolvers[type] = resolve
  if (!keys) return
  Schema[type] = (...args: any[]) => {
    const schema = new Schema({ type })
    keys.forEach((key, index) => {
      schema[key] = args[index] as never
    })
    Object.assign(schema.meta, meta)
    return schema
  }
}

Schema.resolve = function resolve(data, schema) {
  if (!schema) return [data]

  if (isNullable(data)) {
    if (schema.meta.required) throw new TypeError(`missing required value`)
    const fallback = schema.meta.default
    if (isNullable(fallback)) return [data]
    data = fallback
  }

  const callback = resolvers[schema.type]
  if (callback) return callback(data, schema)
  throw new TypeError(`unsupported type "${schema.type}"`)
}

Schema.property = function property(data, key, schema) {
  const [value, adapted] = Schema.resolve(data[key], schema)
  if (!isNullable(adapted)) data[key] = adapted
  return value
}

namespace Schema {
  export type TypeOf<T> = T extends Schema<infer U> ? U : never
  export type Resolve = (data: any, schema?: Schema) => [any, any?]
  export type HandleUnknown = 'inherit' | 'ignore' | 'throw'

  export interface Base<T = any> {
    type: string
    key?: string
    flag?: boolean
    value?: Schema
    alt?: Schema
    sDict?: Dict<string>
    list?: readonly Schema[]
    dict?: Dict<Schema>
    callback?: Function
    handleUnknown?: HandleUnknown
    meta?: Meta<T>
  }

  export interface Meta<T = any> {
    default?: T extends {} ? Partial<T> : T
    required?: boolean
    hidden?: boolean
    adaptive?: boolean
    description?: string
    comment?: string
  }

  type Tuple<T extends readonly unknown[]> = T extends readonly [infer U, ...infer R] ? [TypeOf<U>, ...Tuple<R>] : []
  type Inner<K extends keyof any, T extends Record<K, Schema>> = Intersect<TypeOf<T[K]>>
  type Decide<T extends Dict<Schema>, K extends string> = Inner<string, T> & { [P in K]: keyof T }

  export interface Types {
    any(): Schema<any>
    never(): Schema<never>
    string(): Schema<string>
    number(): Schema<number>
    boolean(): Schema<boolean>
    array<T>(value: Schema<T>): Schema<T[]>
    dict<T>(value: Schema<T>): Schema<Dict<T>>
    tuple<T extends readonly Schema[]>(list: T, handleUnknown?: HandleUnknown): Schema<Tuple<T>>
    object<T extends Dict<Schema>>(dict: T, handleUnknown?: HandleUnknown): Schema<{ [K in keyof T]?: TypeOf<T[K]> }>
    select<T extends string>(list: T[] | Record<T, string>): Schema<T>
    decide<T extends Dict<Schema>, K extends string>(key: K, dict: T, callback?: (data: any) => keyof T): Schema<Decide<T, K>>
    union<T extends readonly Schema[]>(list: T): Schema<TypeOf<T[number]>>
    intersect<T extends readonly Schema[]>(list: T): Schema<Inner<number, T>>
    adapt<S, T>(value: Schema<S>, alt: Schema<T>, callback: (value: T) => S): Schema<S>
  }

  export interface Static extends Types {
    prototype: Schema
    resolve: Resolve
    property(data: any, key: keyof any, schema?: Schema): any
    extend<K extends keyof Types>(type: K, resolve: Resolve, keys?: (keyof Base)[], meta?: Meta): void
    <T = any>(options: Base<T>): Schema<T>
    new <T = any>(options: Base<T>): Schema<T>
  }
}

Schema.extend('any', (data) => {
  return [data]
}, [])

Schema.extend('never', (data) => {
  throw new TypeError(`expected nullable but got ${data}`)
}, [])

Schema.extend('string', (data) => {
  if (typeof data === 'string') return [data]
  throw new TypeError(`expected string but got ${data}`)
}, [])

Schema.extend('number', (data) => {
  if (typeof data === 'number') return [data]
  throw new TypeError(`expected number but got ${data}`)
}, [])

Schema.extend('boolean', (data) => {
  if (typeof data === 'boolean') return [data]
  throw new TypeError(`expected boolean but got ${data}`)
}, [])

Schema.extend('array', (data, { value }) => {
  if (!Array.isArray(data)) throw new TypeError(`expected array but got ${data}`)
  return [data.map((_, index) => Schema.property(data, index, value))]
}, ['value'], { default: [] })

Schema.extend('dict', (data, { value }) => {
  if (!isObject(data)) throw new TypeError(`expected dict but got ${data}`)
  return [valueMap(data, (_, key) => Schema.property(data, key, value))]
}, ['value'], { default: {} })

Schema.extend('tuple', (data, { list }) => {
  if (!Array.isArray(data)) throw new TypeError(`expected array but got ${data}`)
  const value = data.map((_, index) => Schema.property(data, index, list[index]))
  for (let index = value.length; index < list.length; index++) {
    value.push(Schema.resolve(undefined, list[index])[0])
  }
  return [value]
}, ['list', 'handleUnknown'], { default: [] })

Schema.extend('object', (data, { dict, handleUnknown }) => {
  if (!isObject(data)) throw new TypeError(`expected object but got ${data}`)
  const result = {}
  for (const key in dict) {
    const value = Schema.property(data, key, dict[key])
    if (!isNullable(value) || key in data) {
      result[key] = value
    }
  }
  if (handleUnknown === 'inherit') {
    for (const key in data) {
      if (key in result) continue
      result[key] = data[key]
    }
  }
  return [result]
}, ['dict', 'handleUnknown'], { default: {} })

Schema.extend('intersect', (data, schema) => {
  const result = {}
  for (const inner of schema.list) {
    const value = Schema.resolve(data, inner)[0]
    Object.assign(result, value)
  }
  return [result]
}, ['list'])

Schema.extend('adapt', (data, schema) => {
  try {
    return Schema.resolve(data, schema.value)
  } catch {
    const [value, adapted = data] = Schema.resolve(data, schema.alt)
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
})

Schema.adapt = function adapt(value, alt, callback) {
  return new Schema({ type: 'adapt', value, alt, callback }).default(value.meta.default)
}

function checkSelect(data: any, dict: Dict) {
  const choices = Object.keys(dict)
  if (choices.includes(data)) return [data] as [any]
  throw TypeError(`expected one of ${choices.join(', ')} but got ${data}`)
}

Schema.extend('select', (data, schema) => {
  return checkSelect(data, schema.sDict)
})

Schema.select = function select(sDict: any) {
  if (Array.isArray(sDict)) sDict = Object.fromEntries(sDict.map(k => [k, k]))
  return new Schema({ type: 'select', sDict })
}

Schema.extend('decide', (data, schema) => {
  if (!isObject(data)) throw new TypeError(`expected object but got ${data}`)
  let key = data[schema.key]
  if (isNullable(key)) {
    if (!schema.callback) throw new TypeError(`missing required value`)
    key = data[schema.key] = schema.callback(data)
  }
  checkSelect(key, schema.dict)
  const value = Schema.resolve(data, schema.dict[key])[0]
  value[schema.key] = key
  return [value]
}, ['key', 'dict', 'callback'])

export = Schema
