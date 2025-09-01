import { ValidateOptions, Schema } from '../core.ts'

export namespace Never {}

export class Never extends Schema<never> {
  type = 'never'

  validate(value: unknown, options: ValidateOptions) {
    return this.failure(value, options.path)
  }
}

export function never() {
  return new Never()
}
