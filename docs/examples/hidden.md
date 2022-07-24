---
example: true
code: |
  Schema.object({
    foo: Schema.string().description('这是一个可见属性。'),
    bar: Schema.number().hidden(),
  }).description('配置项')
---

# Hidden

可以通过 `.hidden()` 声明一个隐藏属性。隐藏属性不会显示在表单中，但是仍然会参与类型检查。

```ts
export default Schema.object({
  foo: Schema.string(),
  bar: Schema.number().hidden(),
})
```
