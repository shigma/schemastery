import { ValidateOptions, Schema } from '../core.ts'

namespace $Transform {
  export interface Options<S, T extends S = S> {
    inner: Schema<S>
    callback: (value: S) => T
  }
}

class $Transform<S, T extends S = S> extends Schema<S, T> {
  type = 'transform'
  options: $Transform.Options<S, T>

  constructor(inner: Schema<S>, callback: (value: S) => T) {
    super()
    this.options = { inner, callback }
  }

  validate(value: unknown, options: ValidateOptions) {
    const result = this.options.inner.validate(value, options)
    if (result.issues) return result
    return { value: this.options.callback(result.value) }
  }
}

export { $Transform as Transform }
