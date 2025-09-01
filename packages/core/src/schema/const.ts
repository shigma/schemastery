import { deepEqual } from 'cosmokit'
import { ParseOptions, Schema } from '../core.ts'

export namespace $Const {
  export interface Options<T> {
    value: T
  }
}

export class $Const<T> extends Schema<T> {
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

  validate(value: unknown, options: ParseOptions) {
    if (!deepEqual(value, this.options.value, true)) {
      return this.failure(value, options.path)
    }
    return { value: value as T }
  }
}
