---
example: true
code: |
  Schema.object({
    value: Schema.date().description('选择日期与时间 (对象)。'),
    datetime: Schema.string().role('datetime').description('选择日期与时间 (字符串)。'),
    date: Schema.string().role('date').description('选择日期 (字符串)。'),
    time: Schema.string().role('time').description('选择时间 (字符串)。'),
  }).description('配置项')
---

# Date

由于 Date 不便于序列化，我们提供了两套描述 Date 的方式：

- 使用 Date 类型：输入字符串，输出 Date 实例
- 使用 String 类型与三种可选的 `role` 属性

其中，Date 类型与 `datetime` 的前端体验是完全一致的，唯一区别在于输出的格式不同。字符串额外多出 `date` 和 `time` 两种格式，用于表达纯日期和纯时间字符串。

```ts
export default Schema.object({
  value: Schema.date(),
  datetime: Schema.string().role('datetime'),
  date: Schema.string().role('date'),
  time: Schema.string().role('time'),
})
```
