---
example: true
code: |
  Schema.object({
    value1: Schema.union(['foo', 'bar', 'qux']).description('从三个值中选择一个。'),
    value2: Schema.union([
      Schema.const('foo').description('选项 1'),
      Schema.const('bar').description('选项 2'),
      Schema.const('baz').description('选项 3'),
    ]).role('radio').description('从三个值中选择一个。'),
  }).description('配置项')
---

# Union (Select)

Union 描述了多个子类型的联合。它的最基础形式是从多个固定值中选择一个。这里的每一个字符串是 `Schema.const()` 的简写形式。

如果每个可选值有很长的描述文本，你可以进一步将 `role` 设置为 `radio`，这样一来所有的选项将显示在下方而不是右侧。

```ts
export default Schema.object({
  value1: Schema.union(['foo', 'bar', 'qux']),
  value2: Schema.union([
    Schema.const('foo').description('选项 1'),
    Schema.const('bar').description('选项 2'),
    Schema.const('baz').description('选项 3'),
  ]).role('radio'),
})
```
