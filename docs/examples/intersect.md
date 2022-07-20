---
example: true
code: |
  Schema.intersect([
    Schema.object({
      foo: Schema.number(),
      bar: Schema.string(),
    }),
    Schema.object({
      baz: Schema.string(),
      qux: Schema.boolean(),
    }),
  ])
---

# Intersect

Intersect 类型可用于合并多个类型，并且每个子类型都可以拥有自己的别名。

```ts
export default Schema.intersect([
  Schema.object({
    foo: Schema.number(),
    bar: Schema.string(),
  }).description('Part 1'),
  Schema.object({
    baz: Schema.string(),
    qux: Schema.boolean(),
  }).description('Part 2'),
])
```
