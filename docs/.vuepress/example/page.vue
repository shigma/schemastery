<template>
  <div class="example-container">
    <div class="left-container">
      <div class="top-container theme-default-content">
        <content></content>
      </div>
      <div class="bottom-container">
        {{ config }}
      </div>
    </div>
    <div class="right-container">
      <k-form :schema="schema" :initial="initial" v-model="config"></k-form>
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed, ref, watch } from 'vue'
import { clone } from 'schemastery-vue'
import { usePageFrontmatter } from '@vuepress/client'

const frontmatter = usePageFrontmatter()

const schema = computed(() => eval(frontmatter.value.code))

const initial = ref(null)
const config = ref(null)

watch(() => initial.value, () => {
  config.value = clone(initial.value)
})

</script>

<style lang="scss">

.example-container {
  position: relative;
  // padding-top: var(--navbar-height);
  padding-left: var(--sidebar-width);
  height: 100vh;
  box-sizing: border-box;
  display: flex;

  > * {
    flex: 1;
  }

  > .left-container {
    box-sizing: border-box;
    border-right: 1px solid var(--c-border);
    display: flex;
    flex-direction: column;
    max-width: 50%;
    background-color: var(--code-bg-color);
    transition: transform var(--t-transform), background-color var(--t-color), border-color var(--t-color);

    > * {
      flex: 1;
    }

    > .top-container {
      box-sizing: border-box;
      border-bottom: 1px solid var(--c-border);
      transition: transform var(--t-transform), background-color var(--t-color), border-color var(--t-color);
      padding: 0 2rem;
    }
  }

  .right-container {
    h2, h3 {
      border-bottom: none;
    }

    .k-form {
      padding: 2rem 2rem;
    }
  }
}

</style>
