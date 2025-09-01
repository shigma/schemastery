import { ValidateOptions, Schema } from '../core.ts'

namespace $Intersect {
  export interface Options {
    items: Schema[]
  }
}

class $Intersect<S, T extends S = S> extends Schema<S, T> {
  type = 'intersect'
  options: $Intersect.Options

  constructor(items: Schema[]) {
    super()
    this.options = { items }
  }

  format() {
    return this.options.items.map(item => item.format()).join(' & ')
  }

  validate(value: unknown, options: ValidateOptions) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this.failure(value, options.path)
    }
    const merged: any = {}
    const issues: Schema.Issue[] = []
    for (const item of this.options.items) {
      const result = item.validate(value, options)
      if (result.issues) {
        issues.push(...result.issues)
      } else {
        Object.assign(merged, result.value)
      }
    }
    if (issues.length) return { issues }
    return { value: merged }
  }
}

export { $Intersect as Intersect }
