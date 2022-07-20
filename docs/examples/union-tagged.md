---
example: true
code: |
  Schema.intersect([
    Schema.object({
      shared: Schema.string().description('公用的配置项。'),
      type: Schema.union(['foo', 'bar']).required().description('选择一个类型。'),
    }),
    Schema.union([
      Schema.object({
        type: Schema.const('foo').required(),
        value: Schema.number().default(114514).description('请输入一个数值。'),
      }).description('特殊配置 1'),
      Schema.object({
        type: Schema.const('bar').required(),
        text: Schema.string().description('请输入一个字符串。'),
      }).description('特殊配置 2'),
    ]),
  ])
---

# Union (Tagged)

一种比较复杂的场景是以对象的某个属性值确定对象的其他属性的类型。善用 Intersect 和 Union，我们就可以轻松实现表单项的联动效果！试着切换 `type` 的取值，并观察下方表单项的变化吧。

```ts
export default Schema.intersect([
  Schema.object({
    shared: Schema.string(),
    type: Schema.union(['foo', 'bar']).required(),
  }),
  Schema.union([
    Schema.object({
      type: Schema.const('foo').required(),
      value: Schema.number().default(114514),
    }).description('特殊配置 1'),
    Schema.object({
      type: Schema.const('bar').required(),
      text: Schema.string(),
    }).description('特殊配置 2'),
  ]),
])
```
