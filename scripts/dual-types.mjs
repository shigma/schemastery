// Generate lib/index.d.cts and lib/index.d.mts from the tsc-emitted
// lib/index.d.ts (packages/core).
//
// The runtime build ships two entries:
//   - lib/index.cjs: CJS build, module.exports = Schema
//   - lib/index.mjs: ESM build, default export is Schema
//
// The tsc-emitted declaration uses the CJS export assignment shape
// ("export = Schema"). That shape is correct for require() consumers but
// wrong for the ESM entry: under NodeNext resolution a declaration with
// "export = Schema" describes no default export, so `import Schema from
// 'schemastery'` fails with TS1192/TS1259 depending on the resolution
// mode. This script derives one declaration file per entry point:
//
//   - lib/index.d.cts: verbatim copy, keeps "export = Schema"
//   - lib/index.d.mts: replaces the export assignment with an ESM default
//     export plus a type-only named export of the Schema<S, T> alias
//
// The package.json "exports" map wires each declaration to its matching
// runtime entry: { import: { types: index.d.mts, default: index.mjs },
// require: { types: index.d.cts, default: index.cjs } }.
import { readFile, writeFile, copyFile } from 'node:fs/promises'

const lib = new URL('../packages/core/lib/', import.meta.url)
const dts = new URL('index.d.ts', lib)

const source = await readFile(dts, 'utf8')
if (!source.trimEnd().endsWith('export = Schema;')) {
  throw new Error(
    `Unexpected export shape in ${dts.pathname}: expected trailing "export = Schema;"`,
  )
}

await copyFile(dts, new URL('index.d.cts', lib))

const esm = source.replace(
  /export = Schema;[\s]*$/,
  'export default Schema;\nexport type { Schema };\n',
)
await writeFile(new URL('index.d.mts', lib), esm)
