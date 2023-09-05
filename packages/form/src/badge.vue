<template>
  <span class="k-badge" :class="type">
    <slot></slot>
  </span>
</template>

<script lang="ts" setup>

defineProps<{ type?: string }>()

</script>

<style lang="scss">

@mixin apply-color($name) {
  &.#{$name} {
    background-color: var(--k-color-#{$name});
  }
}

.k-badge {
  display: inline-block;
  font-size: 14px;
  height: 1.25rem;
  border-radius: 4px;
  padding: 0 6px;
  margin-left: 0.5rem;
  color: white;
  font-weight: 500;
  white-space: nowrap;
  line-height: 1.25rem;
  vertical-align: baseline;

  @include apply-color(primary);
  @include apply-color(warning);
  @include apply-color(success);
  @include apply-color(danger);
}

</style>
