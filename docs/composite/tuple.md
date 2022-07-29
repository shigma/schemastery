---
example: true
code: |
  Schema.object({
    point: Schema.tuple([Number, Number]).description('请输入点的坐标。'),
  }).description('配置项')
---

# Tuple

Tuple 类型描述了一个数组，它的长度是固定的，你需要分别给出其中每个元素的类型。它们会被显示在同一行中。

注意：尽管在验证时 tuple 支持传入任何子类型，但用作表单时，我们只接受内部元素是原始类型的情况。如果你要描述类型比较复杂，推荐使用 object 或 array 替代。

```ts
export default Schema.object({
  point: Schema.tuple([Number, Number]),
})
```
