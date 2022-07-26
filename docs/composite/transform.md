---
example: true
code: |
  Schema.object({
    value: Schema.union([
      Schema.array(String),
      Schema.transform(String, value => [value]),
    ]).default([]),
  }).description('配置项')
---

# Transform

Transform 用于定义一个转换类型，通常与 Union 一同使用。当输入满足一参数类型时，将调用二参数转换输入作为输出。此次转换将直接修改输入的对象，以确保类型满足输出类型。在网页表单中，将只会显示输出类型。

```ts
export default Schema.object({
  value: Schema.union([
    Schema.array(String),
    Schema.transform(String, value => [value]),
  ]).default([]),
})
```
