<template>
  <parent-layout>
    <template #page v-if="frontmatter.layout === 'example'">
      <div class="example-layout">
        <div class="left">
          <div class="top"></div>
          <div class="bottom"></div>
        </div>
        <div class="right"></div>
      </div>
    </template>
  </parent-layout>
</template>

<script setup lang="ts">

import { usePageFrontmatter } from '@vuepress/client'
import ParentLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'

const frontmatter = usePageFrontmatter()

</script>

<style lang="scss" scoped>

.example-layout {
  position: relative;
  padding-top: var(--navbar-height);
  padding-left: var(--sidebar-width);
  height: 100vh;
  box-sizing: border-box;
}

</style>
