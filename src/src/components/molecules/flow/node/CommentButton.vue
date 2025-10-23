<template>
  <TickButton class="comment-button" :class="{ 'hasComments': this.hasActiveComments }" @click="togglePanelFor" ref="button" :icon="'comment'" :appearance="Appearance.transparent" :round="true"
    :color="Color.contrast" :size="Size.mini">
    <TickIndicator v-if="hasActiveComments" :indicator="indicatorData" />
  </TickButton>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickIndicator, { TickIndicatorData } from '@/components/atoms/TickIndicator.vue';
import { TickPanelOptions } from '@/components/atoms/TickPanel.vue';
import { mount, unmount } from '@/helpers/mountHelper';
import { getRefElementDOMRect } from '@/helpers/refHelpers';
import { translate } from '@/plugins/translatePlugin';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, ColorsEnum, FlowComment, LanguagePath } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import FlowCommentsPanel from '../panel/FlowCommentsPanel.vue';

@Component({
  emits: ["add", "resolve"],
  components: {
    TickButton,
    TickIndicator
  },
})
export default class CommentsButton extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size

  @Prop() private comments!: FlowComment[];
  @Prop() private showBorder!: boolean;

  private get indicatorData(): TickIndicatorData {
    if (!this.hasActiveComments) { return null }
    const c = this.comments.length;

    return {
      color: ColorsEnum.Red,
      title: c,
      tooltip: c === 1 ? translate(LanguagePath.App_CommentButton_Comment_Single_Tooltip) : translate(LanguagePath.App_CommentButton_Comment_Plural_Tooltip, [{ path: 'nr', value: c.toString() }]),
    }
  }

  private get disabled() {
    return !useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration)
  }

  private get hasActiveComments() {
    return this.comments && this.comments.length;
  }

  private activePanel = {
    panelId: "",
  }

  private togglePanelFor() {
    this.closeActivePanel();
    this.activePanel.panelId = this.openPanel();
  }

  beforeUnmount() {
    this.closeActivePanel();
  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.panelId = "";

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel() {
    //const control = getRefElement(this, id);
    //const rect = control.getBoundingClientRect();
    //const paddingTop = window.getComputedStyle(control).getPropertyValue('padding-top');

    const panelOptions: TickPanelOptions = {
      title: "CommentsPanel",
      from: getRefElementDOMRect(this, "button"),
      allowAsSubDialog: true,
    }

    return mount(FlowCommentsPanel, {
      props: {
        panelOptions: panelOptions,
        disabled: this.disabled,
        // position: {
        //   left: `${Math.ceil(rect.left + rect.width)}px`,
        //   top: `${Math.floor(rect.top + rect.height) + parseInt(paddingTop) - 4}px`,// 4px because it looks better
        // },
        comments: this.comments,
      },
      events: {
        close: () => { this.closeActivePanel(); },
        "add": (to: FlowComment) => {
          this.$emit("add", to);
        },
        "resolve": () => {
          this.$emit("resolve");
        },
      }
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.comment-button {
  position: relative;
}

// .hasComments {
//   //color: $brand;

// }</style>
