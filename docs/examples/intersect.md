---
example: true
code: |
  Schema.intersect([
    Schema.object({
      foo: Schema.number(),
      bar: Schema.string(),
    }).description('配置项 1'),
    Schema.object({
      baz: Schema.string(),
      qux: Schema.boolean(),
    }).description('配置项 2'),
  ])
---

# Intersect

Intersect 类型可用于合并多个类型，并且每个子类型都可以拥有自己的别名。

```ts
export default Schema.intersect([
  Schema.object({
    foo: Schema.number(),
    bar: Schema.string(),
  }).description('配置项 1'),
  Schema.object({
    baz: Schema.string(),
    qux: Schema.boolean(),
  }).description('配置项 2'),
])
```
