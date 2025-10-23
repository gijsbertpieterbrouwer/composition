<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.App_Confirm_Title) }}</template>

    <div class="content">
      {{ this.prompt }}
    </div>
    <template #footer>
      <div class="footer">
        <TickButton @click="decline" :color="ButtonColor.primary" :appearance="ButtonAppearance.secondary"> &nbsp;&nbsp;&nbsp;&nbsp;{{ $translate(LanguagePath.No) }}&nbsp;&nbsp;&nbsp;&nbsp;
        </TickButton>
        <TickButton @click="confirm" v-focus :color="ButtonColor.primary"> &nbsp;&nbsp;&nbsp;&nbsp;{{ $translate(LanguagePath.Yes) }}&nbsp;&nbsp;&nbsp;&nbsp;</TickButton>
      </div>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus, handle, tokenize } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";


const dialogPanelId = "ConfirmDialogPanel";

export function removeConfirmDialogPanel() {
  unmount(dialogPanelId);
}

export function openConfirmDialogPanel(callback: (to: boolean) => void, prompt?: string, current?: boolean): void {
  mount(PromptDialog, {
    props: {
      current: current,
      prompt: prompt,
    },
    events: {
      close: () => {
        removeConfirmDialogPanel();
      },
      use: (to: boolean) => {
        removeConfirmDialogPanel();
        callback(to);
      },
    },
  }, dialogPanelId);
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


  @Prop() private current?: boolean = null;
  @Prop() private prompt?: string = null;


  private modelValue = false;

  private mounted() {
    this.modelValue = this.current || false;
  }

  private confirm() {
    this.modelValue = true;
    this.use();
  }

  private decline() {
    this.modelValue = false;
    this.use();
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

.footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%
}
</style>
