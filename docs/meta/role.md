---
example: true
code: |
  Schema.intersect([
    Schema.object({
      number: Schema.percent().role('').default(0.5).description('点击按钮修改数值。'),
      string: Schema.string().default('password').description('可见的输入框。'),
      choice: Schema.union(['foo', 'bar', 'qux']).default('foo').description('从选择器中取值。'),
    }).description('配置项 1'),
    Schema.object({
      number: Schema.percent().role('slider').default(0.5).description('拖动滑块修改数值。'),
      string: Schema.string().role('secret').default('password').description('隐藏的密码框。'),
      choice: Schema.union(['foo', 'bar', 'qux']).default('foo').role('radio').description('从单选框中取值。'),
    }).description('配置项 2'),
  ])
---

# .role()

`.role()` 描述了一个配置项的外观，而不会影响该类型的实际行为。不同类型的可选外观各有不同，我们将在每种类型的示例中分别介绍。

```ts
export default Schema.object({
  number: Schema.percent().role(''),
  string: Schema.string().role(''),
  choice: Schema
    .union(['foo', 'bar', 'qux'])
    .role(''),
})

export default Schema.object({
  number: Schema.percent().role('slider'),
  string: Schema.string().role('secret'),
  choice: Schema
    .union(['foo', 'bar', 'qux'])
    .role('radio'),
})
```
