---
layout: example
code: |
  Schema.object({
    foo: Schema.string(),
    bar: Schema.number().hidden(),
  })
---

# Hidden

通过 `.hidden()` 声明一个隐藏属性。隐藏属性不可以在表单中配置，但是可以通过 API 传入。

```ts
export default Schema.object({
  foo: Schema.string(),
  bar: Schema.number().hidden(),
})
```
