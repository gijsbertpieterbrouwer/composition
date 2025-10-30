<template>
  <div>
    <div class="wrapper">
      <slot name="header" />
    </div>

    <div class="list">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { focus } from "@/directives";
import { Component, Vue } from "vue-facing-decorator";

@Component({
  directives: { focus },
  emits: [],
  components: {

  },
})
export default class GenericResultWithListItem extends Vue {

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.list {
  display: grid;
  gap: 5px;

}
</style>
