---
example: true
code: |
  Schema.object({
    foo: Schema.string().required().description('这是一个必需属性。'),
  }).description('配置项')
---

# .required()

`.required()` 限制一个类型是 nullable 的能力 (我们不区分 `null` 和 `undefined`)。默认情况下，所有配置项都是可选的；必需的配置项的左侧会出现红色的提示线。

```ts
export default Schema.object({
  foo: Schema.string().required(),
})
```
