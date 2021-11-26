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

const validate = Schema.number().default(10)

validate(0)     // 0
validate(null)  // 10
validate('')    // TypeError
```

### use as constructor (TypeScript)

```ts
import Schema from 'schemastery'

interface Config {
  foo?: 'red' | 'blue'
  bar: string[]
}

const Config = Schema.object({
  foo: Schema.select(['red', 'blue']).default('red'),
  bar: Schema.array(Schema.string()),
})

// config is an instance of Config
// in this case, that is { foo: red, bar: [] }
const config = new Config()
```

## Builtin Types

- [any](#schema-any)
- [never](#schema-never)
- [number](#schema-number)
- [string](#schema-string)
- [boolean](#schema-boolean)
- select
- dict
- array
- object
- tuple
- union
- intersect
- adapt

### Schema.any()

Assert that the value is of any type.

```js
const validate = Schema.any()

validate()        // undefined
validate(0)       // 0
validate({})      // {}
```

### Schema.never()

Assert that the value is nullable.

```js
const validate = Schema.never()

validate()        // undefined
validate(0)       // TypeError
validate({})      // TypeError
```

### Schema.number()

Assert that the value is a number.

```js
const validate = Schema.number()

validate()          // undefined
validate(1)         // 1
validate(Number())  // 0
validate('')        // TypeError
```

### Schema.string()

Assert that the value is a string.

```js
const validate = Schema.string()

validate()          // undefined
validate(0)         // TypeError
validate('foo')     // 'foo'
validate(String())  // ''
```

### Schema.boolean()

Assert that the value is a boolean.

```js
const validate = Schema.boolean()

validate()          // undefined
validate(0)         // TypeError
validate(true)      // true
validate(Boolean()) // false
```

### Schema.select()

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

// should have the same effect as schema1
const schema2 = Schema.from(JSON.parse(JSON.stringify(schema1)))
```
