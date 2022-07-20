<template>
  <div class="example-container">
    <div class="left-container">
      <section class="theme-default-content">
        <main>
          <content></content>
        </main>
      </section>
      <section>
        <header>Input</header>
        <main>{{ config ?? 'null' }}</main>
      </section>
      <section>
        <header>Output</header>
        <main>{{ output ?? 'null' }}</main>
      </section>
    </div>
    <section class="right-container">
      <k-form :schema="schema" :initial="initial" v-model="config"></k-form>
    </section>
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

const output = computed(() => {
  try {
    return schema.value(config.value)
  } catch (e) {}
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

    .theme-default-content h1 {
      font-size: 1.75rem;
      margin-top: 1rem;

      + p {
        margin-top: 1rem;
      }
    }

    section {
      flex: 1;
      box-sizing: border-box;
      transition: transform var(--t-transform), background-color var(--t-color), border-color var(--t-color);

      main {
        padding: 1rem 2rem;
      }
    }

    section + section {
      border-top: 1px solid var(--c-border);
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

  section header {
    height: 3rem;
    border-bottom: 1px solid var(--c-border);
    padding: 0 2rem;
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 1.125rem;
  }
}

</style>
