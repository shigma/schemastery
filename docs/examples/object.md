---
example: true
code: |
  Schema.object({
    foo: Schema.string().required().description('这是一个必需属性。'),
    bar: Schema.number().description('这是一个可选属性。'),
    baz: Schema.object({
      qux: Schema.boolean().description('这是一个嵌套属性。'),
    }),
  }).description('配置项')
---

# Object

Object 类型描述了一个具有给定属性的对象。默认情况下所有属性都是可选的，可以通过 `.required()` 来声明一个必需属性。每个类型都可以通过 `.description()` 来附加一段描述。Object 类型本身的描述会作为小标题显示。

```ts
export default Schema.object({
  foo: Schema.string().required()
    .description('这是一个必需属性。'),
  bar: Schema.number()
    .description('这是一个可选属性。'),
  baz: Schema.object({
    qux: Schema.boolean()
      .description('这是一个嵌套属性。'),
  }),
}).description('配置项')
```
