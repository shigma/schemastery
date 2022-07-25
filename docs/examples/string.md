---
example: true
code: |
  Schema.object({
    text: Schema.string().description('一段普通的文本。'),
    secret: Schema.string().role('secret').default('114514').description('请输入密码。'),
    link: Schema.string().role('link').default('https://github.com').description('点击访问链接。'),
    area: Schema.string().role('textarea').description('在下方输入多行文本。'),
  }).description('配置项')
---

# String

用于表达 string 类型的值，支持多种特殊模式。

- secret：默认情况下不显示输入框中的内容，可点击按钮切换
- link：点击可访问输入框中的链接 (同时输入框也会稍长一些)
- textarea：输入框显示在下方，为自适应高度的多行文本框

```ts
export default Schema.object({
  text: Schema.string(),
  secret: Schema.string().role('secret')
    .default('114514'),
  link: Schema.string().role('link')
    .default('https://github.com'),
  area: Schema.string().role('textarea'),
})
```
