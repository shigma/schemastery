import { ValidateOptions, Schema } from '../core.ts'

export namespace Intersect {
  export interface Options {
    items: readonly Schema[]
  }
}

export class Intersect<S, T extends S = S> extends Schema<S, T> {
  type = 'intersect'
  options: Intersect.Options

  constructor(items: readonly Schema[]) {
    super()
    this.options = { items }
  }

  format() {
    return this.options.items.map(item => item.format()).join(' & ')
  }

  validate(value: unknown, options: ValidateOptions): Schema.Result<T> {
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

type IntersectS<X extends readonly Schema[], S = any> =
  | X extends readonly [Schema<infer L, infer _>, ...infer R extends readonly Schema[]]
  ? IntersectS<R, S & L>
  : S

type IntersectT<X extends readonly Schema[], T = any> =
  | X extends readonly [Schema<infer _, infer L>, ...infer R extends readonly Schema[]]
  ? IntersectT<R, T & L>
  : T

export function intersect<const X extends readonly Schema[]>(items: X) {
  return new Intersect<IntersectS<X>, IntersectT<X>>(items)
}
