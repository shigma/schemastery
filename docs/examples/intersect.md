---
example: true
code: |
  Schema.intersect([
    Schema.object({
      foo: Schema.number().description('这是一个属性。'),
      bar: Schema.string().description('这是另一个属性。'),
    }).description('分组 1'),
    Schema.object({
      baz: Schema.string().description('这是又一个属性。'),
      qux: Schema.boolean().description('这是最后一个属性。'),
    }).description('分组 2'),
  ])
---

# Intersect

Intersect 类型可用于合并多个类型。一种最常见的用法是将配置项分为多组显示。

```ts
export default Schema.intersect([
  Schema.object({
    foo: Schema.number(),
    bar: Schema.string(),
  }).description('分组 1'),
  Schema.object({
    baz: Schema.string(),
    qux: Schema.boolean(),
  }).description('分组 2'),
])
```
