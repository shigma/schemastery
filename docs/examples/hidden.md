---
example: true
code: |
  Schema.object({
    foo: Schema.string().description('这是一个可见属性。'),
    bar: Schema.number().hidden(),
  }).description('配置项')
---

# Hidden

许多应用会同时提供 API 和网页表单，而开发者可能不希望将全部配置项都提供给表单的填写者 (例如复杂的底层配置或者实验性设置)。在这种情况下，可以使用 `.hidden()` 来声明隐藏属性。隐藏属性不会呈现在表单中，但是仍然会参与类型检查。

```ts
export default Schema.object({
  foo: Schema.string(),
  bar: Schema.number().hidden(),
})
```
