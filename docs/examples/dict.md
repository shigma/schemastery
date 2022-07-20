---
layout: example
code: |
  Schema.object({
    values: Schema.dict(Boolean),
  })
---

# Dict

Dict 类型描述了一个对象，其中的键是任意字符串，而值是给定的类型。

```ts
export default Schema.object({
  values: Schema.dict(Boolean),
})
```
