<template>
  <div class="start-node" :class="{ selected: this.selected, 'active-travel-data': this.hasStepLogData }" @contextmenu.prevent="showFlowStepContextMenu($event)">
    <div class="node-content">
      <label class="manual color-purple" v-if="isManualFlow" :title="$translate(LanguagePath.App_FlowEditor_StartNode_Manual_Tooltip)">{{
        $translate(LanguagePath.App_FlowEditor_StartNode_Manual_Title) }}</label>
      <label class="manual color-blue" v-else :title="$translate(LanguagePath.App_FlowEditor_StartNode_Auto_Tooltip)">{{ $translate(LanguagePath.App_FlowEditor_StartNode_Auto_Title) }}</label>
      <TickIcon name="flow" />
      {{ this.flowTitle }}
      <CommentButton class="comment" @add="addComment" @resolve="resolveComments" :comments="comments" />
      <TickHandle class="target-handle" id="start" :isConnected="startIsConnected" :isStartHandle="true" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";

import { DropdownOption } from "@/components/atoms/TickDropdown.vue";
import { openContextDropdownPanel } from "@/components/panels/contextPanels/ContextDropdownPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { onConfirmation } from '@/helpers/questionHelper';
import { translate } from '@/plugins/translatePlugin';
import FlowRtcHub from "@/services/rtc/FlowRtcHub";
import { FlowComment, FlowTriggerEnum, LanguagePath, TickFlowDefinition, TickFlowInstanceLog } from "@/TickApi";
import { Handle } from '@vue-flow/core';
import FlowTestPanel from "../panel/FlowTestPanel.vue";
import CommentButton from "./CommentButton.vue";
import TickHandle from "./TickHandle.vue";
@Component({
  emits: ["addComment", "resolveComments"],
  components: { Handle, TickHandle, CommentButton, TickIcon }
})
export default class StartNode extends Vue {
  LanguagePath = LanguagePath
  @Prop() private id!: string;
  @Prop() private trigger!: FlowTriggerEnum;
  @Prop({ default: false }) private selected!: boolean;
  @Prop() private startStepId!: string;
  @Prop() private comments!: FlowComment[];
  @Prop() private name!: string;
  @Prop() private flow!: TickFlowDefinition;
  @Prop() private selectedLog: TickFlowInstanceLog;

  private get hasStepLogData() {
    return this.stepLogData?.length > 0;
  }

  private get stepLogData() {
    return this.selectedLog?.travelData?.breadCrumbs || [];
  }

  private toggleActive() {
    const to = !this.flow.active;
    if (to) {
      onConfirmation(() => {
        FlowRtcHub.setFlowActive({
          flowVersionId: this.flow.versionId,
          active: to,
        });

      }, translate(LanguagePath.App_FlowEditor_StartNode_ToggleActive_Confirmation))
    } else {
      FlowRtcHub.setFlowActive({
        flowVersionId: this.flow.versionId,
        active: to,
      });
    }


  }

  private testFLowPanel: string = null;
  private showFlowStepContextMenu(e: MouseEvent) {

    const toggleActivateOption: DropdownOption = {
      id: 'toggle-activate',
      text: this.flow?.active ? translate(LanguagePath.App_FlowEditor_Deactivate) : translate(LanguagePath.App_FlowEditor_Activate),
      onSelect: () => {
        this.toggleActive();
      }
    }

    const options: DropdownOption[] = [
      {
        id: 'test',
        text: translate(LanguagePath.App_FlowEditor_Test),
        onSelect: () => {
          this.testFLowPanel = mount(FlowTestPanel, {
            props: {
              data: this.flow,
            },
            events: {
              close: () => {
                unmount(this.testFLowPanel);
              },
            },
          });
        },
      },
      toggleActivateOption
    ]

    openContextDropdownPanel(e, options, translate(LanguagePath.App_FlowEditor_StartNode_ContextMenu_Title));
    e.stopPropagation();
  }

  private get isManualFlow() {
    return this.trigger == FlowTriggerEnum.Manual;
  }

  private get startIsConnected() {
    return this.startStepId != null;
  }


  private addComment(to: FlowComment) {
    this.$emit("addComment", to);
  }
  private resolveComments() {
    this.$emit("resolveComments");
  }

  private get flowTitle() {
    return this.name
      ? this.name //translate(LanguagePath.App_FlowEditor_StartNode_HasName_Title, [{ path: 'name', value: this.name }])
      : translate(LanguagePath.App_FlowEditor_StartNode_Noname_Title);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.target-handle {
  position: absolute;
  right: -3px;
  bottom: 15px;
  width: 12px;
}

.start-node {
  padding: 2px;
  border-radius: 14px;

  &.selected {
    outline: 2px solid var(--c-contrast);
  }

  &.active-travel-data {
    box-shadow: $brand2 0 0 5px 5px;
  }


  .comment:not(.hasComments) {
    visibility: hidden;
  }

  &:hover {
    .comment {
      visibility: visible;
    }
  }
}

.node-content {
  background-color: var(--c-primary);

  color: $black;
  cursor: move;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  padding-right: 20px;

  border-radius: 12px;

  @include font-inter;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  text-align: center;

  .manual {
    @include neon-bg;
    @include font-inter;

    display: block;
    position: absolute;
    top: -12px;
    right: -10px;
    background-color: orange;

    padding: 0 4px;
    font-family: "Inter", sans-serif;
    font-weight: 700;
    font-size: 10px;
    line-height: 16px;
    white-space: nowrap;
    border-radius: 2px;
    color: #fff;
  }
}
</style>
