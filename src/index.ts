type Dict<T = any, K extends string = string> = { [key in K]?: T }
type Intersect<U> = (U extends any ? (arg: U) => void : never) extends ((arg: infer I) => void) ? I : never

function isNullable(value: any) {
  return value === null || value === undefined
}

function isObject(data: any) {
  return data && typeof data === 'object' && !Array.isArray(data)
}

export interface Schema<S = any, T = S> extends Schema.Base<T> {
  (data: S): T
  (data?: null): T
  new (data: S): T
  new (data?: null): T
  toJSON(): Schema.Base<T>
  required(): Schema<S, T>
  hidden(): Schema<S, T>
  adaptive(): Schema<S, T>
  default(value: T): Schema<S, T>
  comment(text: string): Schema<S, T>
  description(text: string): Schema<S, T>
}

export namespace Schema {
  export type TypeS<X> = X extends Schema<infer S, unknown> ? S : never
  export type TypeT<X> = ReturnType<Extract<X, Schema>> // X extends Schema<unknown, infer T> ? T : never
  export type Resolve = (data: any, schema?: Schema, strict?: boolean) => [any, any?]

  export interface Base<T = any> {
    type: string
    sKey?: Schema
    inner?: Schema
    list?: Schema[]
    dict?: Dict<Schema>
    callback?: Function
    value?: T
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

  type TupleS<X extends readonly unknown[]> = X extends readonly [infer L, ...infer R] ? [TypeS<L>?, ...TupleS<R>] : any[]
  type TupleT<X extends readonly unknown[]> = X extends readonly [infer L, ...infer R] ? [TypeT<L>?, ...TupleT<R>] : any[]
  type ObjectS<X extends Dict<Schema>> = { [K in keyof X]?: TypeS<X[K]> } & Dict
  type ObjectT<X extends Dict<Schema>> = { [K in keyof X]?: TypeT<X[K]> } & Dict

  export interface Types {
    any(): Schema<any>
    never(): Schema<never>
    const<T>(value: T): Schema<T>
    string(): Schema<string>
    number(): Schema<number>
    boolean(): Schema<boolean>
    array<S, T>(inner: Schema<S, T>): Schema<S[], T[]>
    dict<S, T, U extends string, V extends string>(inner: Schema<S, T>, sKey?: Schema<U, V>): Schema<Dict<S, U>, Dict<T, V>>
    tuple<X extends readonly Schema[]>(list: X): Schema<TupleS<X>, TupleT<X>>
    object<X extends Dict<Schema>>(dict: X): Schema<ObjectS<X>, ObjectT<X>>
    union<X extends Schema>(list: readonly X[]): Schema<TypeS<X>, TypeT<X>>
    intersect<X extends Schema>(list: readonly X[]): Schema<Intersect<TypeS<X>>, Intersect<TypeT<X>>>
    transform<S, T>(inner: Schema<S>, callback: (value: S) => T): Schema<S, T>
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

export const Schema = function (options: Schema.Base) {
  const schema = function (data: any) {
    return Schema.resolve(data, schema)[0]
  } as Schema
  Object.setPrototypeOf(schema, Schema.prototype)
  Object.assign(schema, options)
  schema.meta ||= {}
  return schema
} as Schema.Static

Schema.prototype = Object.create(Function.prototype)

Schema.prototype.toJSON = function toJSON() {
  return { ...this }
}

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

Schema.resolve = function resolve(data, schema, hint) {
  if (!schema) return [data]

  if (isNullable(data)) {
    if (schema.meta.required) throw new TypeError(`missing required value`)
    const fallback = schema.meta.default
    if (isNullable(fallback)) return [data] as [any]
    data = fallback
  }

  const callback = resolvers[schema.type]
  if (callback) return callback(data, schema, hint)
  throw new TypeError(`unsupported type "${schema.type}"`)
}

Schema.property = function property(data, key, schema) {
  const [value, adapted] = Schema.resolve(data[key], schema)
  if (!isNullable(adapted)) data[key] = adapted
  return value
}

Schema.extend('any', (data) => {
  return [data]
}, [])

Schema.extend('never', (data) => {
  throw new TypeError(`expected nullable but got ${data}`)
}, [])

Schema.extend('const', (data, { value }) => {
  if (data === value) return [value]
  throw new TypeError(`expected ${value} but got ${data}`)
}, ['value'])

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

Schema.extend('array', (data, { inner }) => {
  if (!Array.isArray(data)) throw new TypeError(`expected array but got ${data}`)
  return [data.map((_, index) => Schema.property(data, index, inner))]
}, ['inner'])

Schema.extend('dict', (data, { inner, sKey }, strict) => {
  if (!isObject(data)) throw new TypeError(`expected dict but got ${data}`)
  const result = {}
  for (const key in data) {
    let rKey: string
    try {
      rKey = Schema.resolve(key, sKey)[0]
    } catch (error) {
      if (strict) continue
      throw error
    }
    result[rKey] = Schema.property(data, key, inner)
    data[rKey] = data[key]
    delete data[key]
  }
  return [result]
}, ['inner', 'sKey'])

Schema.extend('tuple', (data, { list }, strict) => {
  if (!Array.isArray(data)) throw new TypeError(`expected array but got ${data}`)
  const result = list.map((inner, index) => Schema.property(data, index, inner))
  if (strict) return [result]
  result.push(...data.slice(list.length))
  return [result]
}, ['list'])

function merge(result: any, data: any) {
  for (const key in data) {
    if (key in result) continue
    result[key] = data[key]
  }
}

Schema.extend('object', (data, { dict }, strict) => {
  if (!isObject(data)) throw new TypeError(`expected object but got ${data}`)
  const result = {}
  for (const key in dict) {
    const value = Schema.property(data, key, dict[key])
    if (!isNullable(value) || key in data) {
      result[key] = value
    }
  }
  if (!strict) merge(result, data)
  return [result]
}, ['dict'])

Schema.extend('union', (data, { list }) => {
  const messages: string[] = []
  for (const inner of list) {
    try {
      return Schema.resolve(data, inner)
    } catch (error) {
      messages.push(error.message)
    }
  }
  throw new TypeError(`expected union but got ${JSON.stringify(data)}`)
}, ['list'])

Schema.extend('intersect', (data, { list }) => {
  const result = {}
  for (const inner of list) {
    const value = Schema.resolve(data, inner, true)[0]
    Object.assign(result, value)
  }
  if (isObject(data)) merge(result, data)
  return [result]
}, ['list'])

Schema.extend('transform', (data, { inner, callback }) => {
  const [result, adapted = data] = Schema.resolve(data, inner, true)
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
}, ['inner', 'callback'])

export default Schema
