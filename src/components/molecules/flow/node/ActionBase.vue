<template>
  <div class="action">
    <div class="action-details">
      <div class="action-header action-handle">
        <TickIcon class="titleIcon actionIcon" :name="icon" /> <span class="title">{{ this.getTitle }}</span>
        <CommentButton class="comment" @add="addComment" :comments="comments" @resolve="$emit('resolveComments')" />
      </div>
      <!-- <TickActionDraggableHandle :title="action.name" :icon="icon" :comments="action.comments" @addComment="addComment" @resolveComments="resolveComments" /> -->

      <EditorMessage :type="warning.type" :title="warning.title" :message="warning.message" v-for="(warning, index) in warnings" :key="index" />

      <div class="content action-handle" v-if="hasContent">
        <div v-if="hasMessage" class="message">
          <slot name="message" />
        </div>

        <slot />

        <div v-if="hasSelectedLogs" class="travel-wrapper">
          <div class="travel-content" v-for="(item, index) in this.selectedLogsForAction" :key="index">
            <TickTokenizedContentViewer class="message" :content="item.message" />
          </div>
        </div>
      </div>

      <div class="routes" v-if="hasRoutes">
        <slot name="routes" />
      </div>
      <!-- <div class="spacer"></div> -->

    </div>
    <ThenHr class="then-hr" :isLast="isLastAction" />
  </div>

</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickTokenizedContentViewer from '@/components/atoms/TickTokenizedContentViewer.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import TickIcon from "@/components/TickIcon.vue";
import { getConnectionHandleId } from "@/helpers/flowhelpers";
import { FlowComment, FlowDefinitionAction, LogData, TickFlowInstanceLog } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import CommentButton from './CommentButton.vue';
import { FlowStepEditorMessage } from "./StepNode.vue";
import TickHandle from './TickHandle.vue';


@Component({
  emits: ["addComment", "resolveComments"],
  components: { TickIcon, ThenHr, EditorMessage, TickHandle, CommentButton, TickTokenizedContentViewer },
})
export default class ActionBase extends Vue {
  EditorMessageType = EditorMessageType
  @Prop() private action!: FlowDefinitionAction;
  @Prop({ default: false }) private isLastAction!: boolean;
  @Prop({ default: false }) private selected!: boolean;
  @Prop({ default: false }) private allowConnections!: boolean;

  @Prop({ default: "" }) private stepId!: string;
  @Prop({ default: "" }) private icon!: string;
  @Prop() private selectedLog: TickFlowInstanceLog;
  @Prop({ default: [] }) private warnings: FlowStepEditorMessage[];

  private get hasSelectedLogs(): boolean {
    return this.selectedLogsForAction?.length > 0;
  }

  private get selectedLogsForAction(): LogData[] {
    return this.selectedLog?.flowLog?.filter(p => p.stepId == this.stepId && p.actionId == this.action.id) || [];
  }

  private get hasMessage(): boolean {
    return this.$slots.message != null;
  }

  private get hasContent(): boolean {
    return this.$slots.default != null || this.$slots.message != null;
  }

  private get hasRoutes(): boolean {
    return this.$slots.routes != null;
  }

  private get isSelected(): boolean {
    return this.selected;
  }

  private addComment(comment: FlowComment) {
    this.$emit("addComment", this.stepId, this.action.id, comment);
  }
  private resolveComments() {
    this.$emit("resolveComments", this.action.id);
  }
  private optionHandleId(option: string) {
    return getConnectionHandleId(this.stepId, this.action.id, option);
  }

  private get comments() {
    return this.action.comments || [];
  }

  private get getTitle() {
    return this.action.name;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.action {
  font-size: 14px;
  line-height: 16px;
  position: relative;
  padding: 0 12px;
  position: relative;

}

.message {
  font-style: italic;
  padding: 0 0px;
  color: var(--c-contrast-200);
}

.action-details {

  display: grid;
  gap: 5px;

  &.selected {
    box-shadow: -8px 0px 0px 0px $brand;
    background-color: var(--c-base-100);
  }

  &:hover {
    // background-color: var(--c-base-300);


    .comment {
      visibility: visible !important;
    }
  }

}

.content {
  display: grid;
  gap: 5px;

  cursor: move;

  * {
    cursor: move;
  }
}

.routes {
  display: grid;
  gap: 2px;
  padding: 0px 20px;

}

.spacer {
  height: 10px;
}



.action-header {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;

  .title {
    font-weight: 600;
    line-height: 20px;
    flex-grow: 1;
    align-content: center;
    justify-content: left;
    display: grid;
  }

  .comment:not(.hasComments) {
    visibility: hidden;
  }



  .moveIcon {
    display: none;
    color: var(--c-contrast);
  }

  .actionIcon {
    display: inline-block;
  }

  .titleIcon {
    cursor: move;
  }

  .title {
    cursor: move;
  }
}


.travel-wrapper {
  display: grid;
  gap: 10px;
  border-radius: 10px;
  border-left: 1px solid var(--c-contrast);
  padding: 12px;
  margin-left: 20px;

  .travel-content {
    max-height: 80px;
    overflow: hidden;
  }
}
</style>
