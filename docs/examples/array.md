---
layout: example
code: |
  Schema.object({
    values: Schema.array(Schema.number()),
  })
---

# Array

Array 类型描述了一个数组，其中的元素满足给定的类型。

```ts
export default Schema.object({
  values: Schema.array(Schema.number()),
})
```
