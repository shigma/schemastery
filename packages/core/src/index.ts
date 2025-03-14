import { Binary, clone, deepEqual, Dict, filterKeys, isNullable, isPlainObject, pick, valueMap } from 'cosmokit'

const kSchema = Symbol.for('schemastery')
const kValidationError = Symbol.for('ValidationError')

declare global {
  namespace Schemastery {
    export type From<X> =
      | X extends string | number | boolean ? Schema<X>
      : X extends Schema ? X
      : X extends typeof String ? Schema<string>
      : X extends typeof Number ? Schema<number>
      : X extends typeof Boolean ? Schema<boolean>
      : X extends typeof Function ? Schema<Function, (...args: any[]) => any>
      : X extends Constructor<infer S> ? Schema<S>
      : never

    type TypeS1<X> = X extends Schema<infer S, unknown> ? S : never
    type Inverse<X> = X extends Schema<any, infer Y> ? (arg: Y) => void : never

    export type TypeS<X> = TypeS1<From<X>>
    export type TypeT<X> = ReturnType<From<X>>
    export type Resolve = (data: any, schema: Schema, options: Options, strict?: boolean) => [any, any?]

    export type IntersectS<X> = From<X> extends Schema<infer S, unknown> ? S : never
    export type IntersectT<X> = Inverse<From<X>> extends ((arg: infer T) => void) ? T : never

    type TupleS<X extends readonly any[]> = X extends readonly [infer L, ...infer R] ? [TypeS<L>?, ...TupleS<R>] : any[]
    type TupleT<X extends readonly any[]> = X extends readonly [infer L, ...infer R] ? [TypeT<L>?, ...TupleT<R>] : any[]
    type ObjectS<X extends Dict> = { [K in keyof X]?: TypeS<X[K]> | null } & Dict
    type ObjectT<X extends Dict> = { [K in keyof X]: TypeT<X[K]> } & Dict
    type Constructor<T = any> = new (...args: any[]) => T

    export interface Static {
      <T = any>(options: Partial<Schema<T>>): Schema<T>
      new <T = any>(options: Partial<Schema<T>>): Schema<T>
      prototype: Schema
      resolve: Resolve
      from<X = any>(source?: X): From<X>
      extend(type: string, resolve: Resolve): void
      any<T = any>(): Schema<T>
      never(): Schema<never>
      const<const T>(value: T): Schema<T>
      string(): Schema<string>
      number(): Schema<number>
      natural(): Schema<number>
      percent(): Schema<number>
      boolean(): Schema<boolean>
      date(): Schema<string | Date, Date>
      regExp(flag?: string): Schema<string | RegExp, RegExp>
      arrayBuffer(): Schema<Binary.Source, ArrayBufferLike>
      arrayBuffer(encoding: 'hex' | 'base64'): Schema<Binary.Source | string, ArrayBufferLike>
      bitset<K extends string>(bits: Partial<Record<K, number>>): Schema<number | readonly K[], number>
      function(): Schema<Function, (...args: any[]) => any>
      is<T>(constructor: Constructor<T>): Schema<T>
      array<X>(inner: X): Schema<TypeS<X>[], TypeT<X>[]>
      dict<X, Y extends Schema<any, string> = Schema<string>>(inner: X, sKey?: Y): Schema<Dict<TypeS<X>, TypeS<Y>>, Dict<TypeT<X>, TypeT<Y>>>
      tuple<const X extends readonly any[]>(list: X): Schema<TupleS<X>, TupleT<X>>
      object<X extends Dict>(dict: X): Schema<ObjectS<X>, ObjectT<X>>
      union<const X>(list: readonly X[]): Schema<TypeS<X>, TypeT<X>>
      intersect<const X>(list: readonly X[]): Schema<IntersectS<X>, IntersectT<X>>
      transform<X, T>(inner: X, callback: (value: TypeS<X>, options: Schemastery.Options) => T, preserve?: boolean): Schema<TypeS<X>, T>
      lazy<X extends Schema>(callback: () => X): X
      ValidationError: typeof ValidationError
    }

    interface Options {
      autofix?: boolean
      ignore?(data: any, schema: Schema): boolean
      path?: (keyof any)[]
    }

    export interface Meta<T = any> {
      default?: T extends {} ? Partial<T> : T
      required?: boolean
      disabled?: boolean
      collapse?: boolean
      badges?: { text: string; type: string }[]
      hidden?: boolean
      loose?: boolean
      role?: string
      extra?: any
      link?: string
      description?: string | Dict<string>
      comment?: string
      pattern?: { source: string; flags?: string }
      max?: number
      min?: number
      step?: number
    }
  }

  interface Schemastery<S = any, T = S> {
    (data?: S | null, options?: Schemastery.Options): T
    new (data?: S | null, options?: Schemastery.Options): T
    [kSchema]: true
    uid: number
    meta: Schemastery.Meta<T>
    type: string
    sKey?: Schema
    inner?: Schema
    list?: Schema[]
    dict?: Dict<Schema>
    bits?: Dict<number>
    callback?: Function
    builder?: Function
    value?: T
    refs?: Dict<Schema>
    preserve?: boolean
    toString(inline?: boolean): string
    toJSON(): Schema<S, T>
    required(value?: boolean): Schema<S, T>
    hidden(value?: boolean): Schema<S, T>
    loose(value?: boolean): Schema<S, T>
    role(text: string, extra?: any): Schema<S, T>
    link(link: string): Schema<S, T>
    default(value: T): Schema<S, T>
    comment(text: string): Schema<S, T>
    description(text: string): Schema<S, T>
    disabled(value?: boolean): Schema<S, T>
    collapse(value?: boolean): Schema<S, T>
    deprecated(): Schema<S, T>
    experimental(): Schema<S, T>
    pattern(regexp: RegExp): Schema<S, T>
    max(value: number): Schema<S, T>
    min(value: number): Schema<S, T>
    step(value: number): Schema<S, T>
    set(key: string, value: Schema): Schema<S, T>
    push(value: Schema): Schema<S, T>
    simplify(value?: any): any
    i18n(messages: Dict): Schema<S, T>
    extra<K extends keyof Schemastery.Meta>(key: K, value: Schemastery.Meta[K]): Schema<S, T>
  }
}

declare module globalThis {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export let __schemastery_index__: number
}

globalThis.__schemastery_index__ ??= 0

class ValidationError extends TypeError {
  name = 'ValidationError'

  constructor(message: string, public options: Schemastery.Options) {
    let prefix = '$'
    for (const segment of options.path || []) {
      if (typeof segment === 'string') {
        prefix += '.' + segment
      } else if (typeof segment === 'number') {
        prefix += '[' + segment + ']'
      } else if (typeof segment === 'symbol') {
        prefix += `[Symbol(${segment.toString()})]`
      }
    }
    if (prefix.startsWith('.')) prefix = prefix.slice(1)
    super((prefix === '$' ? '' : `${prefix} `) + message)
  }

  static is(error: any): error is ValidationError {
    return !!error?.[kValidationError]
  }
}

Object.defineProperty(ValidationError.prototype, kValidationError, {
  value: true,
})

type Schema<S = any, T = S> = Schemastery<S, T>

const Schema = function (options: Schema) {
  const schema = function (data: any, options: Schemastery.Options = {}) {
    return Schema.resolve(data, schema, options)[0]
  } as Schema

  if (options.refs) {
    const refs = valueMap(options.refs, options => new Schema(options))
    const getRef = (uid: any) => refs[uid]!
    for (const key in refs) {
      const options = refs[key]!
      options.sKey = getRef(options.sKey)
      options.inner = getRef(options.inner)
      options.list = options.list && options.list.map(getRef)
      options.dict = options.dict && valueMap(options.dict, getRef)
    }
    return refs[options.uid!]
  }

  Object.assign(schema, options)
  if (typeof schema.callback === 'string') {
    try {
      // eslint-disable-next-line no-new-func
      schema.callback = new Function('return ' + schema.callback)()
    } catch {}
  }
  Object.defineProperty(schema, 'uid', { value: globalThis.__schemastery_index__++ })
  Object.setPrototypeOf(schema, Schema.prototype)
  schema.meta ||= {}
  schema.toString = schema.toString.bind(schema)
  return schema
} as Schemastery.Static

Schema.prototype = Object.create(Function.prototype)

Schema.prototype[kSchema] = true

Schema.ValidationError = ValidationError

let refs: Record<number, Schema> | undefined

Schema.prototype.toJSON = function toJSON() {
  if (refs) {
    refs[this.uid] ??= JSON.parse(JSON.stringify({ ...this }))
    return this.uid as any
  }

  refs = { [this.uid]: { ...this } as Schema }
  refs[this.uid] = JSON.parse(JSON.stringify({ ...this }))
  const result = { uid: this.uid, refs }
  refs = undefined
  return result
}

Schema.prototype.set = function set(key, value) {
  this.dict![key] = value
  return this
}

Schema.prototype.push = function push(value) {
  this.list!.push(value)
  return this
}

function mergeDesc(original: undefined | string | Dict<string>, messages: Dict) {
  const result: Dict<string> = typeof original === 'string' ? { '': original } : { ...original }
  for (const locale in messages) {
    const value = messages[locale]
    if (value?.$description || value?.$desc) {
      result[locale] = value.$description || value.$desc
    } else if (typeof value === 'string') {
      result[locale] = value
    }
  }
  return result
}

function getInner(value: any) {
  return value?.$value ?? value?.$inner
}

function extractKeys(data: any) {
  return filterKeys(data ?? {}, key => !key.startsWith('$'))
}

Schema.prototype.i18n = function i18n(messages) {
  const schema = Schema(this)
  const desc = mergeDesc(schema.meta.description, messages)
  if (Object.keys(desc).length) schema.meta.description = desc
  if (schema.dict) {
    schema.dict = valueMap(schema.dict, (inner, key) => {
      return inner.i18n(valueMap(messages, (data) => getInner(data)?.[key] ?? data?.[key]))
    })
  }
  if (schema.list) {
    schema.list = schema.list!.map((inner, index) => {
      return inner.i18n(valueMap(messages, (data = {}) => {
        if (Array.isArray(getInner(data))) return getInner(data)[index]
        if (Array.isArray(data)) return data[index]
        return extractKeys(data)
      }))
    })
  }
  if (schema.inner) {
    schema.inner = schema.inner.i18n(valueMap(messages, (data) => {
      if (getInner(data)) return getInner(data)
      return extractKeys(data)
    }))
  }
  if (schema.sKey) {
    schema.sKey = schema.sKey.i18n(valueMap(messages, (data) => data?.$key))
  }
  return schema
}

Schema.prototype.extra = function extra(key, value) {
  const schema = Schema(this)
  schema.meta = { ...schema.meta, [key]: value }
  return schema
}

for (const key of ['required', 'disabled', 'collapse', 'hidden', 'loose']) {
  Object.assign(Schema.prototype, {
    [key](this: Schema, value = true) {
      const schema = Schema(this)
      schema.meta = { ...schema.meta, [key]: value }
      return schema
    },
  })
}

Schema.prototype.deprecated = function deprecated() {
  const schema = Schema(this)
  schema.meta.badges ||= []
  schema.meta.badges.push({ text: 'deprecated', type: 'danger' })
  return schema
}

Schema.prototype.experimental = function experimental() {
  const schema = Schema(this)
  schema.meta.badges ||= []
  schema.meta.badges.push({ text: 'experimental', type: 'warning' })
  return schema
}

Schema.prototype.pattern = function pattern(regexp) {
  const schema = Schema(this)
  const pattern = pick(regexp, ['source', 'flags'])
  schema.meta = { ...schema.meta, pattern }
  return schema
}

Schema.prototype.simplify = function simplify(this: Schema, value) {
  if (deepEqual(value, this.meta.default, this.type === 'dict')) return null
  if (isNullable(value)) return value
  if (this.type === 'object' || this.type === 'dict') {
    const result: Dict = {}
    for (const key in value) {
      const schema = this.type === 'object' ? this.dict![key] : this.inner
      const item = schema?.simplify(value[key])
      if (this.type === 'dict' || !isNullable(item)) result[key] = item
    }
    if (deepEqual(result, this.meta.default, this.type === 'dict')) return null
    return result
  } else if (this.type === 'array' || this.type === 'tuple') {
    const result: any[] = []
    ;(value as any[]).forEach((value, index) => {
      const schema = this.type === 'array' ? this.inner : this.list![index]
      const item = schema ? schema.simplify(value) : value
      result.push(item)
    })
    return result
  } else if (this.type === 'intersect') {
    const result: Dict = {}
    for (const item of this.list!) {
      Object.assign(result, item.simplify(value))
    }
    return result
  } else if (this.type === 'union') {
    for (const schema of this.list!) {
      try {
        Schema.resolve(value, schema, {})
        return schema.simplify(value)
      } catch {}
    }
  }
  return value
}

Schema.prototype.toString = function toString(inline?: boolean) {
  return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`
}

Schema.prototype.role = function role(role, extra) {
  const schema = Schema(this)
  schema.meta = { ...schema.meta, role, extra }
  return schema
}

for (const key of ['default', 'link', 'comment', 'description', 'max', 'min', 'step']) {
  Object.assign(Schema.prototype, {
    [key](this: Schema, value: any) {
      const schema = Schema(this)
      schema.meta = { ...schema.meta, [key]: value }
      return schema
    },
  })
}

const resolvers: Dict<Schemastery.Resolve> = {}

Schema.extend = function extend(type, resolve) {
  resolvers[type] = resolve
}

Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
  if (!schema) return [data]
  if (options.ignore?.(data, schema)) return [data]

  if (isNullable(data) && schema.type !== 'lazy') {
    if (schema.meta.required) throw new ValidationError(`missing required value`, options)
    let current = schema
    let fallback = schema.meta.default
    while (current?.type === 'intersect' && isNullable(fallback)) {
      current = current.list![0]
      fallback = current?.meta.default
    }
    if (isNullable(fallback)) return [data]
    data = clone(fallback)
  }

  const callback = resolvers[schema.type]
  if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options)

  try {
    return callback(data, schema, options, strict)
  } catch (error) {
    if (!schema.meta.loose) throw error
    return [schema.meta.default]
  }
}

Schema.from = function from(source: any) {
  if (isNullable(source)) {
    return Schema.any()
  } else if (['string', 'number', 'boolean'].includes(typeof source)) {
    return Schema.const(source).required()
  } else if (source[kSchema]) {
    return source
  } else if (typeof source === 'function') {
    switch (source) {
      case String: return Schema.string().required()
      case Number: return Schema.number().required()
      case Boolean: return Schema.boolean().required()
      case Function: return Schema.function().required()
      default: return Schema.is(source).required()
    }
  } else {
    throw new TypeError(`cannot infer schema from ${source}`)
  }
}

Schema.lazy = function lazy(builder) {
  const toJSON = () => {
    if (!schema.inner![kSchema]) {
      schema.inner = schema.builder!()
      schema.inner!.meta = { ...schema.meta, ...schema.inner!.meta }
    }
    return schema.inner!.toJSON()
  }
  const schema = new Schema({ type: 'lazy', builder, inner: { toJSON } as any })
  return schema as any
}

Schema.natural = function natural() {
  return Schema.number().step(1).min(0)
}

Schema.percent = function percent() {
  return Schema.number().step(0.01).min(0).max(1).role('slider')
}

Schema.date = function date() {
  return Schema.union([
    Schema.is(Date),
    Schema.transform(Schema.string().role('datetime'), (value, options) => {
      const date = new Date(value)
      if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options)
      return date
    }, true),
  ])
}

Schema.regExp = function regExp(flag = '') {
  return Schema.union([
    Schema.is(RegExp),
    Schema.transform(Schema.string().role('regexp', { flag }), (value, options) => {
      try {
        return new RegExp(value, flag)
      } catch (e: any) {
        throw new ValidationError(e.message, options)
      }
    }, true),
  ])
}

Schema.arrayBuffer = function arrayBuffer(encoding?: 'hex' | 'base64') {
  return Schema.union([
    Schema.is(ArrayBuffer),
    Schema.is(SharedArrayBuffer),
    Schema.transform(Schema.any<ArrayBufferView>(), (value, options) => {
      if (Binary.isSource(value)) return Binary.fromSource(value)
      throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options)
    }, true),
    ...encoding ? [Schema.transform(Schema.string(), (value, options) => {
      try {
        return encoding === 'base64'
          ? Binary.fromBase64(value)
          : Binary.fromHex(value)
      } catch (e: any) {
        throw new ValidationError(e.message, options)
      }
    }, true)] as const : [],
  ])
}

Schema.extend('lazy', (data, schema, options, strict) => {
  if (!schema.inner![kSchema]) {
    schema.inner = schema.builder!()
    schema.inner!.meta = { ...schema.meta, ...schema.inner!.meta }
  }
  return Schema.resolve(data, schema.inner!, options, strict)
})

Schema.extend('any', (data) => {
  return [data]
})

Schema.extend('never', (data, _, options) => {
  throw new ValidationError(`expected nullable but got ${data}`, options)
})

Schema.extend('const', (data, { value }, options) => {
  if (deepEqual(data, value)) return [value]
  throw new ValidationError(`expected ${value} but got ${data}`, options)
})

function checkWithinRange(data: number, meta: Schemastery.Meta<any>, description: string, options: Schemastery.Options, skipMin = false) {
  const { max = Infinity, min = -Infinity } = meta
  if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options)
  if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options)
}

Schema.extend('string', (data, { meta }, options) => {
  if (typeof data !== 'string') throw new ValidationError(`expected string but got ${data}`, options)
  if (meta.pattern) {
    const regexp = new RegExp(meta.pattern.source, meta.pattern.flags)
    if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options)
  }
  checkWithinRange(data.length, meta, 'string length', options)
  return [data]
})

function decimalShift(data: number, digits: number) {
  const str = data.toString()
  if (str.includes('e')) return data * Math.pow(10, digits)
  const index = str.indexOf('.')
  if (index === -1) return data * Math.pow(10, digits)
  const frac = str.slice(index + 1)
  const integer = str.slice(0, index)
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, '0'))
  return +(integer + frac.slice(0, digits) + '.' + frac.slice(digits))
}

function isMultipleOf(data: number, min: number, step: number) {
  step = Math.abs(step)
  if (!/^\d+\.\d+$/.test(step.toString())) {
    return (data - min) % step === 0
  }
  const index = step.toString().indexOf('.')
  const digits = step.toString().slice(index + 1).length
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0
}

Schema.extend('number', (data, { meta }, options) => {
  if (typeof data !== 'number') throw new ValidationError(`expected number but got ${data}`, options)
  checkWithinRange(data, meta, 'number', options)
  const { step } = meta
  if (step && !isMultipleOf(data, meta.min ?? 0, step)) {
    throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options)
  }
  return [data]
})

Schema.extend('boolean', (data, _, options) => {
  if (typeof data === 'boolean') return [data]
  throw new ValidationError(`expected boolean but got ${data}`, options)
})

Schema.extend('bitset', (data, { bits, meta }, options) => {
  let value = 0, keys: string[] = []
  if (typeof data === 'number') {
    value = data
    for (const key in bits!) {
      if (data & bits![key]!) {
        keys.push(key)
      }
    }
  } else if (Array.isArray(data)) {
    keys = data
    for (const key of keys) {
      if (typeof key !== 'string') throw new ValidationError(`expected string but got ${key}`, options)
      if (key in bits!) value |= bits![key]!
    }
  } else {
    throw new ValidationError(`expected number or array but got ${data}`, options)
  }
  if (value === meta.default) return [value]
  return [value, keys]
})

Schema.extend('function', (data, _, options) => {
  if (typeof data === 'function') return [data]
  throw new ValidationError(`expected function but got ${data}`, options)
})

Schema.extend('is', (data, { callback }, options) => {
  if (data instanceof callback!) return [data]
  throw new ValidationError(`expected ${callback!.name} but got ${data}`, options)
})

function property(data: any, key: keyof any, schema: Schema, options: Schemastery.Options) {
  try {
    const [value, adapted] = Schema.resolve(data[key], schema, {
      ...options,
      path: [...options.path || [], key],
    })
    if (adapted !== undefined) data[key] = adapted
    return value
  } catch (e) {
    if (!options?.autofix) throw e
    delete data[key]
    return schema.meta.default
  }
}

Schema.extend('array', (data, { inner, meta }, options) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options)
  checkWithinRange(data.length, meta, 'array length', options, !isNullable(inner!.meta.default))
  return [data.map((_, index) => property(data, index, inner!, options))]
})

Schema.extend('dict', (data, { inner, sKey }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options)
  const result: any = {}
  for (const key in data) {
    let rKey: string
    try {
      rKey = Schema.resolve(key, sKey!, options)[0]
    } catch (error) {
      if (strict) continue
      throw error
    }
    result[rKey] = property(data, key, inner!, options)
    data[rKey] = data[key]
    if (key !== rKey) delete data[key]
  }
  return [result]
})

Schema.extend('tuple', (data, { list }, options, strict) => {
  if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options)
  const result = list!.map((inner, index) => property(data, index, inner, options))
  if (strict) return [result]
  result.push(...data.slice(list!.length))
  return [result]
})

function merge(result: any, data: any) {
  for (const key in data) {
    if (key in result) continue
    result[key] = data[key]
  }
}

Schema.extend('object', (data, { dict }, options, strict) => {
  if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options)
  const result: any = {}
  for (const key in dict) {
    const value = property(data, key, dict![key]!, options)
    if (!isNullable(value) || key in data) {
      result[key] = value
    }
  }
  if (!strict) merge(result, data)
  return [result]
})

Schema.extend('union', (data, { list, toString }, options, strict) => {
  const messages: any[] = []
  for (const inner of list!) {
    try {
      return Schema.resolve(data, inner, options, strict)
    } catch (error) {
      messages.push(error)
    }
  }
  throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options)
})

Schema.extend('intersect', (data, { list, toString }, options, strict) => {
  if (!list!.length) return [data]
  let result
  for (const inner of list!) {
    const value: any = Schema.resolve(data, inner, options, true)[0]
    if (isNullable(value)) continue
    if (isNullable(result)) {
      result = value
    } else if (typeof result !== typeof value) {
      throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options)
    } else if (typeof value === 'object') {
      merge(result ??= {}, value)
    } else if (result !== value) {
      throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options)
    }
  }
  if (!strict && isPlainObject(data)) merge(result, data)
  return [result]
})

Schema.extend('transform', (data, { inner, callback, preserve }, options) => {
  const [result, adapted = data] = Schema.resolve(data, inner!, options, true)
  if (preserve) {
    return [callback!(result)]
  // } else if (isPlainObject(data)) {
  //   const temp: any = {}
  //   for (const key in result) {
  //     if (!(key in data)) continue
  //     temp[key] = data[key]
  //     delete data[key]
  //   }
  //   Object.assign(data, callback!(temp))
  //   return [callback!(result)]
  } else {
    return [callback!(result), callback!(adapted)]
  }
})

type Formatter = (schema: Schema, inline?: boolean) => string
const formatters: Dict<Formatter> = {}

function defineMethod(name: string, keys: (keyof Schema)[], format: Formatter) {
  formatters[name] = format
  Object.assign(Schema, {
    [name](...args: any[]) {
      const schema = new Schema({ type: name } as Schema)
      keys.forEach((key, index) => {
        switch (key) {
          case 'sKey': schema.sKey = args[index] ?? Schema.string(); break
          case 'inner': schema.inner = Schema.from(args[index]); break
          case 'list': schema.list = args[index].map(Schema.from); break
          case 'dict': schema.dict = valueMap(args[index], Schema.from); break
          case 'bits': {
            schema.bits = {}
            for (const key in args[index]) {
              if (typeof args[index][key] !== 'number') continue
              schema.bits[key] = args[index][key]
            }
            break
          }
          case 'callback': {
            schema.callback = args[index]
            ;(schema.callback as any)['toJSON'] ||= () => schema.callback!.toString()
            break
          }
          default: schema[key] = args[index] as never
        }
      })
      if (name === 'object' || name === 'dict') {
        schema.meta.default = {}
      } else if (name === 'array' || name === 'tuple') {
        schema.meta.default = []
      } else if (name === 'bitset') {
        schema.meta.default = 0
      }
      return schema
    },
  })
}

defineMethod('is', ['callback'], ({ callback }) => callback!.name)
defineMethod('any', [], () => 'any')
defineMethod('never', [], () => 'never')
defineMethod('const', ['value'], ({ value }) => typeof value === 'string' ? JSON.stringify(value) : value)
defineMethod('string', [], () => 'string')
defineMethod('number', [], () => 'number')
defineMethod('boolean', [], () => 'boolean')
defineMethod('bitset', ['bits'], () => 'bitset')
defineMethod('function', [], () => 'function')
defineMethod('array', ['inner'], ({ inner }) => `${inner!.toString(true)}[]`)
defineMethod('dict', ['inner', 'sKey'], ({ inner, sKey }) => `{ [key: ${sKey!.toString()}]: ${inner!.toString()} }`)
defineMethod('tuple', ['list'], ({ list }) => `[${list!.map((inner) => inner.toString()).join(', ')}]`)

defineMethod('object', ['dict'], ({ dict }) => {
  if (Object.keys(dict!).length === 0) return '{}'
  return `{ ${Object.entries(dict!).map(([key, inner]) => {
    return `${key}${inner!.meta.required ? '' : '?'}: ${inner!.toString()}`
  }).join(', ')} }`
})

defineMethod('union', ['list'], ({ list }, inline) => {
  const result = list!.map(({ toString: format }) => format()).join(' | ')
  return inline ? `(${result})` : result
})

defineMethod('intersect', ['list'], ({ list }) => {
  return `${list!.map((inner) => inner.toString(true)).join(' & ')}`
})

defineMethod('transform', ['inner', 'callback', 'preserve'], ({ inner }, isInner) => inner!.toString(isInner))

export = Schema
