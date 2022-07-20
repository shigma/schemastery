---
example: true
code: |
  Schema.object({
    intents: Schema
      .bitset({ FOO: 1, BAR: 2, QUX: 4 }).default(5)
      .description('选择要启用的功能。'),
  })
---

# Bitset

以 bitset 的形式表达一个整数，通常每一位表达某种特征。

```ts
enum Intents { FOO = 1, BAR = 2, QUX = 4 }

export default Schema.object({
  intents: Schema.bitset(Intents)
    .default(Intents.FOO | Intents.QUX),
})
```
