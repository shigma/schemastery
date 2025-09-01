import { ValidateOptions, Schema } from '../core.ts'

namespace $Union {
  export interface Options {
    items: Schema[]
  }
}

class $Union<S, T extends S = S> extends Schema<S, T> {
  type = 'union'
  options: $Union.Options

  constructor(items: Schema[]) {
    super()
    this.options = { items }
  }

  validate(value: unknown, options: ValidateOptions) {
    const issues: Schema.Issue[] = []
    for (const item of this.options.items) {
      const result = item.validate(value, options)
      if (!result.issues) return result
      issues.push(...result.issues)
    }
    // TODO: sub-issues?
    return this.failure(value, options.path)
  }
}

export { $Union as Union }
