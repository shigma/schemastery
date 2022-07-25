---
example: true
code: |
  Schema.object({
    foo: Schema.string().default('lol'),
    bar: Schema.number().default(2333),
  }).description('配置项')
---

# .default()

`.default()` 用于设置某个类型的默认值。默认值会作为初始状态呈现在表单中，但它并不意味着修改你传入的配置。正相反，如果你将某个配置项修改为了默认值，则该配置项实际上会被清除，以确保配置文件的简洁性。

```ts
export default Schema.object({
  foo: Schema.string().default('lol'),
  bar: Schema.number().default(2333),
})
```
