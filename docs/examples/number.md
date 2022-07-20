---
example: true
code: |
  Schema.object({
    foo: Schema.number().description('一个普通的数值。'),
    bar: Schema.natural().role('slider').min(0).max(100).default(30).description('一个 0 到 100 之间的整数。'),
  })
---

# Number

用于表达 number 类型的值，支持输入框和滑块。

```ts
export default Schema.object({
  foo: Schema.number(),
  bar: Schema.natural().role('slider')
    .min(0).max(100).default(30),
})
```
