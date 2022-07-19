---
layout: example
code: |
  Schema.intersect([
    Schema.object({
      shared: Schema.string(),
      type: Schema.union(['foo', 'bar']).required(),
    }),
    Schema.union([
      Schema.object({
        type: Schema.const('foo').required(),
        other: Schema.number(),
      }),
      Schema.object({
        type: Schema.const('bar').required(),
        other: Schema.boolean(),
      }),
    ]),
  ])
---

# Union (Tagged)

```ts
export default Schema.intersect([
  Schema.object({
    shared: Schema.string(),
    type: Schema.union(['foo', 'bar']).required(),
  }),
  Schema.union([
    Schema.object({
      type: Schema.const('foo').required(),
      other: Schema.number(),
    }),
    Schema.object({
      type: Schema.const('bar').required(),
      other: Schema.boolean(),
    }),
  ]),
])
```
