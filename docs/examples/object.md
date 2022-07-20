---
layout: example
code: |
  Schema.object({
    foo: Schema.string().required(),
    bar: Schema.number().hidden(),
    baz: Schema.object({
      qux: Schema.boolean(),
    }),
  })
---

# Object

Object 类型描述了一个具有给定属性的对象。

- 通过 `.required()` 来声明一个必需属性 (默认情况下所有属性都是可选的)
- 通过 `.hidden()` 声明一个隐藏属性 (不可以在表单中配置，但是可以通过 API 传入)

```ts
export default Schema.object({
  foo: Schema.string().required(),
  bar: Schema.number().hidden(),
  baz: Schema.object({
    qux: Schema.boolean(),
  }),
})
```
