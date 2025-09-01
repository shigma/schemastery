import { deepEqual } from 'cosmokit'
import { ValidateOptions, Schema } from '../core.ts'

namespace $Const {
  export interface Options<T> {
    value: T
  }
}

class $Const<T> extends Schema<T> {
  type = 'const'
  options: $Const.Options<T>

  constructor(value: T) {
    super()
    this.options = { value }
  }

  format() {
    return typeof this.options.value === 'string'
      ? JSON.stringify(this.options.value)
      : String(this.options.value)
  }

  validate(value: unknown, options: ValidateOptions) {
    if (!deepEqual(value, this.options.value, true)) {
      return this.failure(value, options.path)
    }
    return { value: value as T }
  }
}

function $const<T>(value: T) {
  return new $Const(value)
}

export { $Const as Const, $const as const }
