---
layout: example
code: |
  Schema.object({
    value: Schema.union([
      Schema.const().description('unset'),
      Schema.number().description('number'),
      Schema.string().description('string'),
      Schema.const(true).description('true'),
      Schema.const(false).description('false'),
      Schema.object({
        foo: Schema.string(),
        bar: Schema.number(),
      }).description('object'),
    ]),
  })
---

# Union (Arbitrary)

```ts
export default Schema.object({
  value: Schema.union([
    Schema.const().description('unset'),
    Schema.number().description('number'),
    Schema.string().description('string'),
    Schema.const(true).description('true'),
    Schema.const(false).description('false'),
    Schema.object({
      foo: Schema.string(),
      bar: Schema.number(),
    }).description('object'),
  ]),
})
```
