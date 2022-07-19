---
layout: example
code: |
  Schema.object({
    text: Schema.string(),
    password: Schema.string().role('secret').default('114514'),
    link: Schema.string().role('link').default('https://github.com'),
  })
---

# String

用于表达 string 类型的值，支持多种特殊模式。

```ts
export default Schema.object({
  text: Schema.string(),
  password: Schema.string().role('secret')
    .default('114514'),
  link: Schema.string().role('link')
    .default('https://github.com'),
})
```
