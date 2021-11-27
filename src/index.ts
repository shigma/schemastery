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

interface Schema<S = any, T = S> extends Schema.Base<T> {
  (data: S): T
  new (data: S): T
  required(): Schema<S, T>
  hidden(): Schema<S, T>
  adaptive(): Schema<S, T>
  default(value: T): Schema<S, T>
  comment(text: string): Schema<S, T>
  description(text: string): Schema<S, T>
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

  Object.assign(Schema, {
    [type](...args: any[]) {
      const schema = new Schema({ type })
      keys.forEach((key, index) => {
        schema[key] = args[index] as never
      })
      Object.assign(schema.meta, meta)
      return schema
    },
  })
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
  export type TypeS<X> = X extends Schema<infer S, unknown> ? S : never
  export type TypeT<X> = ((arg: X) => void) extends (arg: Schema<unknown, infer T>) => void ? T : never
  export type Resolve = (data: any, schema?: Schema) => [any, any?]
  export type HandleUnknown = 'inherit' | 'ignore' | 'throw'

  export interface Base<T = any> {
    type: string
    key?: string
    flag?: boolean
    value?: Schema
    alt?: Schema
    sDict?: Dict<string>
    vList?: readonly Schema[]
    vDict?: Dict<Schema>
    callback?: Function
    unknown?: HandleUnknown
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

  type TupleS<X extends readonly unknown[]> = X extends readonly [infer L, ...infer R] ? [TypeS<L>, ...TupleS<R>] : []
  type TupleT<X extends readonly unknown[]> = X extends readonly [infer L, ...infer R] ? [TypeT<L>, ...TupleT<R>] : []
  type ObjectS<X extends Dict<Schema>> = { [K in keyof X]: TypeS<X[K]> }
  type ObjectT<X extends Dict<Schema>> = { [K in keyof X]: TypeT<X[K]> }
  type Decide<X extends Dict<Schema>, K extends string> = Intersect<TypeT<X[K]>> & { [P in K]: keyof X }

  export interface Types {
    any(): Schema<any>
    never(): Schema<never>
    string(): Schema<string>
    number(): Schema<number>
    boolean(): Schema<boolean>
    array<S, T>(value: Schema<S, T>): Schema<S[], T[]>
    dict<S, T>(value: Schema<S, T>): Schema<Dict<S>, Dict<T>>
    tuple<X extends readonly Schema[]>(vList: X, unknown?: HandleUnknown): Schema<TupleS<X>, TupleT<X>>
    object<X extends Dict<Schema>>(vDict: X, unknown?: HandleUnknown): Schema<ObjectS<X>, ObjectT<X>>
    union<X extends Schema>(vList: readonly X[]): Schema<TypeS<X>, TypeT<X>>
    intersect<X extends Schema>(vList: readonly X[]): Schema<Intersect<TypeS<X>>, TypeT<X>>
    transform<S, T>(value: Schema<S>, callback: (value: S) => T): Schema<S, T>
    select<T extends string>(kList: T[] | Record<T, string>): Schema<T>
    decide<T extends Dict<Schema>, K extends string>(key: K, vDict: T, callback?: (data: any) => keyof T): Schema<Decide<T, K>>
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

Schema.extend('tuple', (data, { vList, unknown }) => {
  if (!Array.isArray(data)) throw new TypeError(`expected array but got ${data}`)
  const result = vList.map((inner, index) => Schema.property(data, index, inner))
  if (unknown === 'ignore') return [result]
  if (unknown === 'throw' && data.length > vList.length) {
    throw new TypeError(`expected tuple with length ${vList.length} but got ${data.length}`)
  }
  result.push(...data.slice(vList.length))
  return [result]
}, ['vList', 'unknown'], { default: [] })

Schema.extend('object', (data, { vDict, unknown }) => {
  if (!isObject(data)) throw new TypeError(`expected object but got ${data}`)
  const result = {}
  for (const key in vDict) {
    const value = Schema.property(data, key, vDict[key])
    if (!isNullable(value) || key in data) {
      result[key] = value
    }
  }
  if (unknown === 'ignore') return [result]
  for (const key in data) {
    if (key in result) continue
    if (unknown === 'throw') throw new TypeError(`unknown key "${key}"`)
    result[key] = data[key]
  }
  return [result]
}, ['vDict', 'unknown'], { default: {} })

Schema.extend('union', (data, { vList }) => {
  for (const inner of vList) {
    try {
      return Schema.resolve(data, inner)
    } catch {}
  }
  console.log(vList[0], vList[1])
  throw new TypeError(`expected union but got ${JSON.stringify(data)}`)
}, ['vList'])

Schema.extend('intersect', (data, { vList }) => {
  const result = {}
  for (const inner of vList) {
    const value = Schema.resolve(data, inner)[0]
    Object.assign(result, value)
  }
  return [result]
}, ['vList'])

Schema.extend('transform', (data, { value, callback }) => {
  const [result, adapted = data] = Schema.resolve(data, value)
  if (isObject(data)) {
    const temp = {}
    for (const key in result) {
      if (!(key in data)) continue
      temp[key] = data[key]
      delete data[key]
    }
    Object.assign(data, callback(temp))
    return [callback(result)]
  } else {
    return [callback(result), callback(adapted)]
  }
}, ['value', 'callback'])

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
  checkSelect(key, schema.vDict)
  const value = Schema.resolve(data, schema.vDict[key])[0]
  value[schema.key] = key
  return [value]
}, ['key', 'vDict', 'callback'])

export = Schema
