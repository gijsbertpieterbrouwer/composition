<template>
  <div class="message-area" :class="{ 'has-message': !!value }">
    <div class="addressees"></div>
    <button class="resizer">
      <TickIcon name="resize" />
    </button>
    <!-- <textarea
      class="input"
      v-model="value"
      @keydown.shift.enter.prevent.stop="submit"
      v-focus
    /> -->
    <CodeMirror v-model="value" @submit="submit" />
    <div class="controls"></div>
    <button class="submit" @click="submit" :disabled="!value">
      <TickIcon name="send" />
    </button>
  </div>
</template>

<script lang="ts">
import { Component, VModel, Vue } from "vue-facing-decorator";

import { focus } from "@/directives";

import TickIcon from "@/components/TickIcon.vue";
import CodeMirror from "@/components/molecules/ticket/CodeMirror.vue";

@Component({
  components: { CodeMirror, TickIcon },
  emits: ["update:modelValue", "submit"],
  directives: { focus },
})
export default class MessageArea extends Vue {
  @VModel() private value!: string;

  private submit() {
    if (!this.value) {
      return;
    }
    this.$emit("submit");
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.message-area {
  display: grid;
  gap: 8px;
  padding: 8px 12px 12px 16px;
  grid-template-columns: 1fr 24px;
  grid-template-rows: 24px 104px 24px;
  grid-template-areas: "addressees resizer" "input input" "controls submit";
}

.addressees {
  grid-area: addressees;
}

.resizer {
  grid-area: resizer;
  color: $grey800;
  display: grid;
  place-content: center;
}

.input {
  grid-area: input;
  color: var(--c-contrast);
  line-height: 16px;
  font-size: 14px;
}

.controls {
  grid-area: controls;
}

.submit {
  grid-area: submit;
  border-radius: 999px;
  color: $white;
  background-color: $grey300;
  display: grid;
  place-content: center;
}

.has-message .submit {
  background-color: $brand;
}
</style>
