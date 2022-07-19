---
layout: example
code: |
  Schema.object({
    choice: Schema.union(['foo', 'bar', 'qux']),
  })
---

# Union (Select)

```ts
export default Schema.object({
  choice: Schema.union(['foo', 'bar', 'qux']),
})
```
