import { ValidateOptions, Schema } from '../core.ts'

class $Function extends Schema<Function> {
  type = 'function'

  validate(value: unknown, options: ValidateOptions) {
    if (typeof value !== 'function') return this.failure(value, options.path)
    return { value }
  }
}

function $function() {
  return new $Function()
}

export { $Function as Function, $function as function }
