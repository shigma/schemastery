---
layout: example
code: |
  Schema.object({
    choice: Schema.union(['foo', 'bar', 'qux']).description('从三个值中选择一个。'),
  })
---

# Union (Select)

Union 描述了多个子类型的联合。它的最基础形式是从多个固定值中选择一个。这里的每一个字符串是 `Schema.const()` 的简写形式。

```ts
export default Schema.object({
  choice: Schema.union(['foo', 'bar', 'qux']),
})
```
