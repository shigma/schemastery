<template>
  <parent-layout>
    <template #page v-if="frontmatter.layout === 'example'">
      <div class="example-layout">
        <div class="left">
          <div class="top">
            <content></content>
          </div>
          <div class="bottom">
            {{ config }}
          </div>
        </div>
        <div class="right">
          <h1>{{ page.title }}</h1>
          <k-form :schema="schema" :initial="initial" v-model="config"></k-form>
        </div>
      </div>
    </template>
  </parent-layout>
</template>

<script setup lang="ts">

import Schema from 'schemastery'
import Page from '@theme/Page.vue'
import { ref, watch } from 'vue'
import { clone } from 'schemastery-vue'
import { usePageData, usePageFrontmatter } from '@vuepress/client'
import ParentLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'

const page = usePageData()
const frontmatter = usePageFrontmatter()

self.Schema = Schema

const schema = eval(frontmatter.value.code)

const initial = ref(null)
const config = ref(null)

watch(() => initial.value, () => {
  config.value = clone(initial.value)
})

</script>

<style lang="scss" scoped>

.example-layout {
  position: relative;
  padding-top: var(--navbar-height);
  padding-left: var(--sidebar-width);
  height: 100vh;
  box-sizing: border-box;
  display: flex;

  > * {
    flex: 1;
  }

  .left {
    box-sizing: border-box;
    border-right: 1px solid var(--c-border);
    display: flex;
    flex-direction: column;
    transition: transform var(--t-transform), background-color var(--t-color), border-color var(--t-color);

    > * {
      flex: 1;
    }

    .top {
      box-sizing: border-box;
      border-bottom: 1px solid var(--c-border);
      transition: transform var(--t-transform), background-color var(--t-color), border-color var(--t-color);
    }
  }
}

</style>
