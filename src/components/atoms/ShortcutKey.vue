<template>
  <div class="shortcut-key">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/theme";

.shortcut-key {
  height: 24px;
  min-width: 24px;
  border-radius: 4px;
  background-color: var(--c-secondary);
  color: $black;
  font-size: $text-size-regular;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
  padding: 4px 8px;
}
</style>
