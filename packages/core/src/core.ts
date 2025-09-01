import { StandardSchemaV1 } from '@standard-schema/spec'
import { isNullable } from 'cosmokit'
import * as z from './index.ts'

const kSchema = Symbol.for('schemastery')

export interface ValidateOptions {
  autofix?: boolean
  ignore?: (data: any, schema: Schema) => boolean
  path?: PropertyKey[]
}

export namespace Schema {
  export type Result<Output> = SuccessResult<Output> | FailureResult

  export interface SuccessResult<Output> extends StandardSchemaV1.SuccessResult<Output> {
    readonly value: Output
    readonly issues?: undefined
  }

  export interface FailureResult extends StandardSchemaV1.FailureResult {
    readonly issues: readonly Issue[]
  }

  export interface Issue extends StandardSchemaV1.Issue {
    readonly message: string
    readonly path?: readonly PropertyKey[]
  }

  export interface Meta {
    disabled?: boolean
    hidden?: boolean
    role?: string
    link?: string
    description?: string
  }

  type From<X> =
    | X extends string | number | boolean | bigint | null | undefined ? X
    : X extends typeof BigInt ? bigint
    : X extends typeof Boolean ? boolean
    : X extends typeof Function ? Function
    : X extends typeof Number ? number
    : X extends typeof String ? string
    : X extends new (...args: any) => infer S ? S
    : never

  export type InferS<X> = X extends Schema<infer S, infer T> ? S : From<X>
  export type InferT<X> = X extends Schema<infer S, infer T> ? T : From<X>
}

export abstract class Schema<S = any, T extends S = S> implements StandardSchemaV1 {
  abstract readonly type: string
  public meta: Schema.Meta = {}

  readonly '~standard': StandardSchemaV1.Props<S, T> = {
    version: 1,
    vendor: 'schemastery',
    validate: (value: unknown) => {
      return this.validate(value, {})
    },
  }

  abstract validate(value: unknown, options: ValidateOptions): Schema.Result<T>

  format(): string {
    return this.type
  }

  simplify(value: T): S {
    return value
  }

  failure(value: unknown, path?: PropertyKey[], suffix = ''): Schema.FailureResult {
    const message = `expected ${this.format()}${suffix} but got ${value}`
    return { issues: [{ message, path }] }
  }

  disabled() {
    this.meta.disabled = true
    return this
  }

  hidden() {
    this.meta.hidden = true
    return this
  }

  description(text: string) {
    this.meta.description = text
    return this
  }

  link(url: string) {
    this.meta.link = url
    return this
  }

  role(role: string) {
    this.meta.role = role
    return this
  }

  static is(schema: any): schema is Schema {
    return !!schema?.[kSchema]
  }

  static from<const X>(value: X): Schema<Schema.InferS<X>, Schema.InferT<X>>
  static from(value: any) {
    if (isNullable(value)) {
      return z.const(value)
    } else if (['string', 'number', 'boolean', 'bigint'].includes(typeof value)) {
      return z.const(value)
    } else if (Schema.is(value)) {
      return value
    } else if (typeof value === 'function') {
      switch (value) {
        case BigInt: return z.bigint()
        case Boolean: return z.boolean()
        case Number: return z.number()
        case String: return z.string()
        case Function: return z.function()
        default: return z.is(value)
      }
    } else {
      throw new TypeError(`cannot infer schema from ${value}`)
    }
  }
}

Object.defineProperty(Schema.prototype, kSchema, {
  value: true,
})
