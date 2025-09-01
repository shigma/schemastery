import { ValidateOptions, Schema } from '../core.ts'

export class Function extends Schema<globalThis.Function> {
  type = 'function'

  validate(value: unknown, options: ValidateOptions) {
    if (typeof value !== 'function') return this.failure(value, options.path)
    return { value }
  }
}

function _function() {
  return new Function()
}

export { _function as function }
