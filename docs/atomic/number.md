---
example: true
code: |
  Schema.object({
    foo: Schema.number().description('一个普通的数值。'),
    bar: Schema.number().role('slider').min(0).max(100).step(1).default(30).description('一个 0 到 100 之间的整数。'),
  }).description('配置项')
---

# Number

用于表达 number 类型的值，支持输入框和滑块。

```ts
export default Schema.object({
  foo: Schema.number(),
  bar: Schema.number().role('slider')
    .min(0).max(100).step(1).default(30),
})
```
