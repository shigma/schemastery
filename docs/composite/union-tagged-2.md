---
example: true
code: |
  Schema.intersect([
    Schema.object({
      enabled: Schema.boolean().default(false).description('是否开启功能'),
    }).description('基础配置'),
    Schema.union([
      Schema.object({
        enabled: Schema.const(true).required(),
        foo: Schema.number().description('请输入一个数值。'),
        bar: Schema.string().description('请输入一个字符串。'),
      }),
      Schema.object({
        enabled: Schema.const(false).required(),
      }),
    ])
  ])
---

# Union (Tagged 2)

一种比较复杂的场景是以对象的某个属性值确定对象的其他属性的类型。善用 Intersect 和 Union，我们就可以轻松实现表单项的联动效果！试着切换 `type` 的取值，并观察下方表单项的变化吧。

```ts
export default Schema.intersect([
  Schema.object({
    enabled: Schema.boolean().default(false),
  }).description('基础配置'),
  Schema.union([
    Schema.object({
      enabled: Schema.const(true).required(),
      foo: Schema.number().description('请输入一个数值。'),
      bar: Schema.string().description('请输入一个字符串。'),
    }),
    Schema.object({}),
  ])
])
```
