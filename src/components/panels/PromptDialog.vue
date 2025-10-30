<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ title }}</template>

    <div class="content">

      <TickInput v-focus v-model="modelValue" :maxlength="maxlength">{{ this.prompt }}</TickInput>
    </div>
    <template #footer>
      <TickButton @click="use"> {{ this.normalizedButtonTitle }}</TickButton>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus, handle, tokenize } from "@/directives";
import keyboard from "@/helpers/keyboard";
import { mount, unmount } from "@/helpers/mountHelper";
import { translate } from "@/plugins/translatePlugin";
import { LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";


const promptDialogPanelId = "PromptDialogPanel";

export function removePromptDialogPanel() {
  unmount(promptDialogPanelId);
}

export function openPromptDialogPanel(callback: (to: string) => void, current?: string, prompt?: string, maxLength?: number, title?: string, buttonTitle?: string): void {
  mount(PromptDialog, {
    props: {
      current: current,
      prompt: prompt,
      buttonTitle: buttonTitle,
      title: title,
      maxlength: maxLength,
    },
    events: {
      close: () => {
        removePromptDialogPanel();
      },
      use: (to: string) => {
        removePromptDialogPanel();
        if (to != current) {
          callback(to);
        }
      },
    },
  }, promptDialogPanelId);
}

@Component({
  directives: { focus, handle, tokenize },
  emits: ["close", "use"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
  },
})
export default class PromptDialog extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath


  @Prop() private current?: string = null;
  @Prop() private prompt?: string = null;
  @Prop() private title?: string = null;

  @Prop() private buttonTitle?: string = null;
  @Prop() private maxlength?: number = null;

  private modelValue = "";
  private keyboardId = null;

  private mounted() {
    this.modelValue = this.current || "";

    this.keyboardId = keyboard.on(
      "Enter", () => {
        this.use();
      }, { ignoreInputFieldEvents: false }
    );
  }
  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }

  private get normalizedButtonTitle() {
    return this.buttonTitle ? this.buttonTitle : translate(LanguagePath.App_Use)
  }

  private use() {
    this.$emit("use", this.modelValue);
  }

  private close() {
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 500px;
  display: grid;
  gap: 10px;


}

.flexrow {
  display: flex;
  gap: 5px;
  align-items: baseline;
  font-size: $text-size-regular;
}
</style>
