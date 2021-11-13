# Schemastery
 
Just another schema validator.

## Examples

### use as validator (JavaScript)

```js
const Schema = require('schemastery')

const validate = Schema.number({ default: 10 })

validate(0)     // 0
validate(null)  // 10
validate('')    // Error
```

### use as constructor (TypeScript)

```ts
import Schema from 'schemastery'

interface Config {
  foo?: 'red' | 'blue'
  bar: string[]
}

const Config = Schema.object({
  foo: Schema.select(['red', 'blue'], { default: 'red' }),
  bar: Schema.array(Schema.string()),
})

const config = new Config()
// config is an instance of Config
// in this case, that is, { foo: red, bar: [] }
```
