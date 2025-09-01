import { ValidateOptions, Schema } from '../core.ts'

namespace $Any {}

class $Any<T> extends Schema<T> {
  type = 'any'

  validate(value: unknown, options: ValidateOptions) {
    return { value: value as T }
  }
}

export { $Any as Any }

export function any<T = any>() {
  return new $Any<T>()
}
