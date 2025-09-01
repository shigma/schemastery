import { ValidateOptions, Schema } from '../core.ts'

export namespace Transform {
  export interface Options<S, T extends S, U extends T> {
    inner: Schema<S, T>
    callback: (value: T) => Schema.Result<U>
  }
}

export class Transform<S, T extends S = S, U extends T = T> extends Schema<S, U> {
  type = 'transform'
  options: Transform.Options<S, T, U>

  constructor(inner: Schema<S, T>, callback: (value: T) => Schema.Result<U>) {
    super()
    this.options = { inner, callback }
  }

  validate(value: unknown, options: ValidateOptions) {
    const result = this.options.inner.validate(value, options)
    if (result.issues) return result
    return this.options.callback(result.value)
  }
}

export function transform<const X, U extends Schema.InferT<X>>(inner: X, callback: (value: Schema.InferT<X>) => Schema.Result<U>) {
  return new Transform(Schema.from(inner), callback)
}
