# Schemastery
 
Yet another schema validator.

## Advantages

- **Lightweight.** No dependencies.
- **Easy to use.** You can use any schema as a function or constructor directly.
- **Powerful.** Schemastery supports some advanced types such as `transform`.
- **Serializable.** Schema objects can be serialized into JSON and then be hydrated in another environment.

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

// config is an instance of Config
// in this case, that is { foo: red, bar: [] }
const config = new Config()
```

## Builtin Types

- any
- never
- number
- string
- boolean
- select
- dict
- array
- object
- tuple
- union
- intersect
- adapt

### Schema.any()

### Schema.never()

### Schema.number()

### Schema.string()

### Schema.boolean()

### Schema.enum()

### Schema.dict()

### Schema.array()

### Schema.object()

### Schema.tuple()

### Schema.union()

### Schema.intersect()

### Schema.transform()

## Serializability

```js
const schema1 = Schema.object({
  foo: Schema.string(),
  bar: Schema.number(),
})

// should be the same as schema1
const schema2 = Schema.create(JSON.parse(JSON.stringify(schema1)))
```
