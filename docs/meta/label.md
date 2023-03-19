---
example: true
code: |
  Schema.object({
    foo: Schema.boolean()
      .description('这是*斜体*属性。')
      .label('Foo 配置'),
    bar: Schema.string()
      .description('这是**粗体**属性。')
      .label('Bar 配置'),
    ber: Schema.union([
      Schema.const('foo').label('选项 1'),
      Schema.const('bar').label('选项 2'),
      Schema.const('baz').label('选项 3').description('这是 baz 选项。'),
    ]).role('radio').description('从三个值中选择一个。'),
  }).label('配置项')
---

# .label()

`.label()` 用于设置某个类型的展示文案。

* 在属性上时会替换默认展示名称
* 在对象上时则会表现为小标题
* 在联合对象上体现为展示名称

```ts
export default Schema.object({
  foo: Schema.boolean()
    .description('这是*斜体*属性。')
    .label('Foo 配置'),
  bar: Schema.string()
    .description('这是**粗体**属性。')
    .label('Bar 配置'),
  ber: Schema.union([
    Schema.const('foo').label('选项 1'),
    Schema.const('bar').label('选项 2'),
    Schema.const('baz').label('选项 3').description('这是 baz 选项。'),
  ]).role('radio').description('从三个值中选择一个。'),
}).label('配置项')
```
