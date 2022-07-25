---
example: true
code: |
  Schema.object({
    foo: Schema.string().description('这是一个可见属性。'),
    bar: Schema.number().hidden(),
  }).description('配置项')
---

# .hidden()

`.hidden()` 用于隐藏某个类型。具有隐藏类型的配置项不会呈现在表单中，但是仍然会参与类型检查。许多应用会同时提供 API 和网页表单，而开发者可能不希望将全部配置项都提供给表单的填写者 (例如复杂的底层配置或者实验性设置)。在这种情况下，隐藏部分配置项将会是一个好的选择。

```ts
export default Schema.object({
  foo: Schema.string(),
  bar: Schema.number().hidden(),
})
```
