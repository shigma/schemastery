# schemastery-vue

[![Codecov](https://img.shields.io/codecov/c/github/shigma/schemastery?style=flat-square)](https://codecov.io/gh/shigma/schemastery)
[![downloads](https://img.shields.io/npm/dm/schemastery-vue?style=flat-square)](https://www.npmjs.com/package/schemastery-vue)
[![npm](https://img.shields.io/npm/v/schemastery-vue?style=flat-square)](https://www.npmjs.com/package/schemastery-vue)
[![GitHub](https://img.shields.io/github/license/shigma/schemastery?style=flat-square)](https://github.com/shigma/schemastery/blob/master/LICENSE)

vue component for schemastery.

## Quick Start

This section describes how to use schemastery-vue in your project.

### Installation

```shell
npm i -D schemastery-vue element-plus vue-i18n markdown-vue @vueuse/core @maikolib/vite-plugin-yaml
# or
yarn add -D schemastery-vue element-plus vue-i18n markdown-vue @vueuse/core @maikolib/vite-plugin-yaml
```

### Usage

```ts
// main.ts
import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import form from "schemastery-vue";
import { createI18n } from "vue-i18n";
import Markdown from "markdown-vue";
import App from "./App.vue";

const i18n = createI18n({
  legacy: false,
});
const app = createApp(App);

app.use(ElementPlus);
app.use(i18n);
app.use(form);
app.component("k-markdown", Markdown);
app.mount("#app");
```

```vue
<!-- App.vue -->
<template>
  <k-form v-model="config" :schema="Config" :initial="initial"></k-form>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Schema from "schemastery";

interface Config {
  foo: boolean;
  bar: string[];
}

const Config = Schema.object({
  foo: Schema.boolean().default(false),
  bar: Schema.array(Schema.string()).default([]),
});

const config = ref<Config>({
  foo: false,
  bar: ["foo"],
});
const initial = ref<Config>({
  foo: false,
  bar: ["foo"],
});
</script>
```

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import yaml from "@maikolib/vite-plugin-yaml";

export default defineConfig({
  // ...
  plugins: [
    // ...
    vue(),
    yaml(),
  ],
});
```

## Projects Using This Package

Here are some repositories that are using this package:

1. [koishijs/docs](https://github.com/koishijs/docs/blob/main/.vitepress/theme/index.ts) - Documentation for Koishi.
2. [koishijs/webui](https://github.com/koishijs/webui/blob/main/packages/components/client/form/index.ts) - WebUI plugins for Koishi.
3. [DGCK81LNN/koishi-plugin-miniplug](https://github.com/DGCK81LNN/koishi-plugin-miniplug/blob/main/plugins/codemirror/client/components/codemirror.vue) - Code simple JavaScript plugins in your Koishi console
4. [initialencounter/chrome-extensions](https://github.com/initialencounter/chrome-extensions/blob/master/lims/src/options/src/main.ts) - Chrome-Extensions Pages

You can also refer to how they are used!
