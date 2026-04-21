import { Dict, deduplicate } from 'cosmokit'
import { markRaw, reactive, ref } from 'vue'
import zhCN from './locales/zh-CN.yml'
import enUS from './locales/en-US.yml'

export const locale = ref('en-US')

export type LocaleTree = { [key in string]: LocaleTree }

export namespace LocaleTree {
  export function from(locales: string[]) {
    const tree: LocaleTree = {}
    for (const locale of locales.filter(Boolean)) {
      const tokens = locale.split('-')
      let current = tree
      for (let i = 0; i < tokens.length; i++) {
        const key = tokens.slice(0, i + 1).join('-')
        current = current[key] = current[key] || {}
      }
    }
    return tree
  }
}

type LocaleEntry = readonly [string, LocaleEntry[]]

function toLocaleEntry(key: string, tree: LocaleTree): LocaleEntry {
  return [key, [[key, []], ...Object.entries(tree).map(([key, value]) => toLocaleEntry(key, value))]]
}

function* traverse([key, children]: LocaleEntry, ignored: LocaleEntry[]): Generator<string> {
  if (!children.length) {
    return yield key
  }
  for (const child of children) {
    if (ignored.includes(child)) continue
    yield* traverse(child, ignored)
  }
}

export function fallback(tree: LocaleTree, locales: string[]): string[] {
  const root = toLocaleEntry('', tree)
  const ignored: LocaleEntry[] = []
  for (const locale of deduplicate(locales).filter(Boolean).reverse()) {
    let prefix = '', children = root[1]
    const tokens = locale ? locale.split('-') : []
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!
      const current = prefix + token
      const index = children.findIndex(([key]) => key === current)
      if (index < 0) break
      const entry = children[index]
      if (index > 0) {
        children.splice(index, 1)
        children.unshift(entry)
      }
      children = entry[1]
      prefix = current + '-'
      if (current === locale) {
        ignored.unshift(entry)
      }
    }
  }
  ignored.push(root)
  const results: string[] = []
  for (const entry of ignored) {
    results.push(...traverse(entry, ignored))
  }
  return results
}

export function translate(
  messages: Dict<Dict<string>>,
  locales: string[],
  paths: string[],
): string | undefined {
  const keys = Object.keys(messages).map(k => k.startsWith('$') ? k.slice(1) : k)
  locales = fallback(LocaleTree.from(keys), locales)
  for (const path of paths) {
    for (const locale of locales) {
      for (const key of ['$' + locale, locale]) {
        const value = messages[key]?.[path]
        if (value === undefined || !value && !locale && path !== '') continue
        return value
      }
    }
  }
}

function resolve(tree: any, key: string): string | undefined {
  let node = tree
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return
    node = node[part]
  }
  return typeof node === 'string' ? node : undefined
}

function interpolate(template: string, args: readonly unknown[]) {
  return template.replace(/\{(\d+)\}/g, (_, i) => String(args[+i] ?? ''))
}

export function useI18nText() {
  return (message?: string | Dict<string>) => {
    if (!message || typeof message === 'string') return message as string
    const locales = fallback(LocaleTree.from(Object.keys(message)), [locale.value])
    for (const loc of locales) {
      if (loc in message) return message[loc]
    }
    return message['']
  }
}

const defaultMessages = reactive<Dict<any>>({
  'zh-CN': markRaw(zhCN),
  'en-US': markRaw(enUS),
})

if (import.meta.hot) {
  import.meta.hot.accept('./locales/zh-CN.yml', (m) => {
    if (m) defaultMessages['zh-CN'] = markRaw(m.default)
  })
  import.meta.hot.accept('./locales/en-US.yml', (m) => {
    if (m) defaultMessages['en-US'] = markRaw(m.default)
  })
}

export function useI18n(messages: Dict<any> = defaultMessages) {
  const tt = useI18nText()
  return (key: string, args: readonly unknown[] = []) => {
    const dict: Dict<string> = {}
    for (const loc in messages) {
      const text = resolve(messages[loc], key)
      if (text !== undefined) dict[loc] = text
    }
    const text = tt(dict) ?? key
    return args.length ? interpolate(text, args) : text
  }
}
