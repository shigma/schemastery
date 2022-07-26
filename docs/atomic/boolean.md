---
example: true
code: |
  Schema.object({
    enable: Schema.boolean().description('这是一个开关。'),
  }).description('配置项')
---

# Boolean

以开关的形式表达 boolean 类型的值。

```ts
export default Schema.object({
  enable: Schema.boolean(),
})
```
