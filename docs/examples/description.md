---
example: true
code: |
  Schema.object({
    foo: Schema.boolean().description('这是*斜体*属性。'),
    bar: Schema.string().description('这是**粗体**属性。'),
  }).description('配置项')
---

# .description()

`.description()` 用于设置某个类型的描述文本。当添加在属性上时会显示在名称下方，当添加在对象上时则会表现为小标题。我们还支持了基本的行内 Markdown 语法。

```ts
export default Schema.object({
  foo: Schema.boolean().description('这是*斜体*属性。'),
  bar: Schema.string().description('这是**粗体**属性。'),
}).description('配置项')
```
