import { StandardSchemaV1 } from '@standard-schema/spec'

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
}

export abstract class Schema<S = any, T extends S = S> implements StandardSchemaV1 {
  abstract readonly type: string

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

  static is(schema: any): schema is Schema {
    return !!schema?.[kSchema]
  }
}

Object.defineProperty(Schema.prototype, kSchema, {
  value: true,
})
