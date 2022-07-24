---
example: true
code: |
  Schema.object({
    text: Schema.string().description('一段普通的文本。'),
    secret: Schema.string().role('secret').default('114514').description('请输入密码。'),
    link: Schema.string().role('url').default('https://github.com').description('点击访问链接。'),
  }).description('配置项')
---

# String

用于表达 string 类型的值，支持多种特殊模式。

- secret：默认情况下不显示输入框中的内容，可点击按钮切换
- url：点击可访问输入框中的链接 (同时输入框也会稍长一些)

```ts
export default Schema.object({
  text: Schema.string(),
  secret: Schema.string().role('secret')
    .default('114514'),
  link: Schema.string().role('url')
    .default('https://github.com'),
})
```
