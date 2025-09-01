import { ValidateOptions, Schema } from '../core.ts'

namespace $Never {}

class $Never extends Schema<never> {
  type = 'never'

  validate(value: unknown, options: ValidateOptions) {
    return this.failure(value, options.path)
  }
}

export { $Never as Never }

export function never() {
  return new $Never()
}
