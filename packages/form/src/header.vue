<template>
  <h3>
    <slot name="title"></slot>
    <el-dropdown
      placement="bottom"
      @command="$emit('command', $event)"
      @visible-change="$emit('visible-change', $event)">
      <svg class="trigger" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="m192 384 320 384 320-384z"></path>
      </svg>
      <template #dropdown>
        <el-dropdown-menu>
          <slot name="menu"></slot>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </h3>
  <slot name="description"></slot>
</template>

<script lang="ts" setup>

defineEmits(['visible-change', 'command'])

</script>
