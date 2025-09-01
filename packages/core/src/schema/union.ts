import { ValidateOptions, Schema } from '../core.ts'

export namespace Union {
  export interface Options {
    items: readonly Schema[]
  }
}

export class Union<S, T extends S = S> extends Schema<S, T> {
  type = 'union'
  options: Union.Options

  constructor(items: readonly Schema[]) {
    super()
    this.options = { items }
  }

  format() {
    return this.options.items.map(item => item.format()).join(' | ')
  }

  validate(value: unknown, options: ValidateOptions): Schema.Result<T> {
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

type UnionS<X extends readonly Schema[], S = never> =
  | X extends readonly [Schema<infer L, infer _>, ...infer R extends readonly Schema[]]
  ? UnionS<R, S | L>
  : S

type UnionT<X extends readonly Schema[], T = never> =
  | X extends readonly [Schema<infer _, infer L>, ...infer R extends readonly Schema[]]
  ? UnionT<R, T | L>
  : T

export function union<const X extends readonly Schema[]>(items: X) {
  return new Union<UnionS<X>, UnionT<X>>(items)
}
