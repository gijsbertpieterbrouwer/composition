<template>
  <div class="wrapper" :class="{ 'disabled': disabled }">
    <TickAvatar @click="togglePanel" :color="color" :sizePx="sizePx" :online="false" :fileId="fileId" :name="name">
      <span class="overlay" :class="{ 'has': this.hasAvatarFileId }">{{
        $translate(LanguagePath.App_UserEditor_AvatarPicker_Choose) }}</span>
    </TickAvatar>
  </div>
</template>

<script lang="ts">
import BusyIndicator from "@/components/atoms/BusyIndicator.vue";
import TickAvatar from "@/components/atoms/TickAvatar.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import AvatarSelectorPanel, { AvatarSelection } from "@/components/panels/AvatarSelectorPanel.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import { ColorsEnum, LanguagePath, UserTypeEnum } from "@/TickApi";
import { computed } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["select"],
  directives: {},
  components: {
    TickInput,
    TickInputLabel,
    TickButton,
    TickSelector,
    BusyIndicator,
    TickAvatar,
    AvatarSelectorPanel
  },
})
export default class AvatarSelector extends Vue {
  Appearance = ButtonAppearance;
  Size = ButtonSize;
  Color = ButtonColor;
  LanguagePath = LanguagePath
  @Prop({ default: 40 }) private sizePx!: number;
  @Prop() private type: UserTypeEnum;
  @Prop() private name: string;
  @Prop() private fileId?: string;
  @Prop() private color?: ColorsEnum;
  @Prop() private disabled?: boolean;

  private activePanel = "";

  private get hasAvatarFileId() {
    return !stringIsNullOrEmpty(this.fileId);
  }

  private select(to: AvatarSelection) {

    this.$emit("select", to);
    this.closePanel();
  }


  private togglePanel() {

    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.disabled) {
      return;
    }

    if (this.activePanel) {
      return;
    }
    const panelOptions: TickPanelOptions = {
      title: "AvatarSelectorPanel",
      allowAsSubDialog: true,
    }

    this.activePanel = mount(AvatarSelectorPanel, {
      props: {
        panelOptions: panelOptions,
        modelValue: computed(() => ""),

        fileId: this.fileId,
        name: this.name,
        type: this.type,
        color: this.color,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        select: (to: AvatarSelection) => {
          this.select(to);
        },

      },
    });


  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  display: inline-block;

  &.disabled {
    opacity: 0.5;
    //filter: grayscale(10);
  }

  .overlay {
    position: relative;
    bottom: -50%;
    padding-top: 5px;

    &.has {
      bottom: -105%;
      opacity: 0.7;
    }

    background-color: var(--c-base-300);
    color: var(--c-contrast);

    width: 150px;
    height: 35px;
    text-align: center;
    font-size: $text-size-regular;
    font-weight: 600;

  }
}
</style>
