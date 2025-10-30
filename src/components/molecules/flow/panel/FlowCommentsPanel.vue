<template>
  <TickSettingsPanel :panelOptions="panelOptions" :transparentBackdrop="true" class="panel" @close="close">
    <div class="content">
      <div class="header">
        <div class="title">{{ $translate(LanguagePath.App_CommentsPanel_Title) }} </div>
        <div class="actions">
          <TickButton v-if="filteredComments.length" @click="resolve" icon="finish" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular" title="Mark as solved">
            {{ $translate(LanguagePath.App_CommentsPanel_ResolveAll) }}</TickButton>
        </div>
      </div>

      <div class="comments">
        <div class="comment text-selectable" v-for="comment in this.filteredComments" :key="comment.id">
          <TickInitiator :sizePx="20" :data="comment.initiator" />
          {{ comment.text }}
        </div>
        <template v-if="!filteredComments.length"><span class="empty-data"> {{ $translate(LanguagePath.App_CommentsPanel_NoData) }}</span></template>
      </div>

      <template v-if="!disabled">
        <div>

          <TickTextarea v-model="newCommentText" :minimumrows="3" v-handle />
        </div>

        <div class="actions">
          <span class="tip"> {{ $translate(LanguagePath.App_CommentsPanel_HandleTip) }}</span>
          <TickButton class="add-button" @click="addComment" ref="button" :appearance="Appearance.primary" :size="Size.regular">{{ $translate(LanguagePath.App_Add) }}</TickButton>
        </div>
      </template>
    </div>

  </TickSettingsPanel>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickPanel, { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import TickSettingsPanel from '@/components/panels/TickSettingsPanel.vue';
import { closable, handle } from "@/directives";
import generateId from '@/helpers/guid';
import { notifyError } from '@/notify';
import useUserStore from '@/store/user';
import { FlowComment, LanguagePath } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickInitiator from '../../TickInitiator.vue';

@Component({
  emits: ["add", "close", "resolve"],
  directives: { closable, handle },
  components: { TickPanel, TickTextarea, TickButton, TickInitiator, TickSettingsPanel },
})
export default class FlowCommentsPanel extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private comments!: FlowComment[];
  //@Prop() private position!: Position;
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private disabled: boolean;
  private newCommentText = "";

  private close() {
    this.$emit("close");
  }
  private resolve() {
    this.$emit("resolve");
    this.close();
  }



  private addComment() {
    const newComment: FlowComment = {
      id: generateId(),
      initiator: useUserStore().userAsInitiator,
      text: this.newCommentText,
    }

    if (!this.newCommentText) {
      notifyError("Action required", "Please type a comment");
      return;
    }

    this.$emit("add", newComment);
    this.newCommentText = "";
    this.close();
  }

  private get filteredComments() {
    return this.comments || [];
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.empty-data {
  font-size: $text-size-regular;
  font-style: italic;
}

.content {
  padding: 10px;
  width: 330px;

  display: grid;
  gap: 10px;

  .tip {
    font-size: 0.7em;
    opacity: 0.7;
    font-style: italic;
    display: block;
    text-align: center;
    padding: 10px;
  }

  .header {
    display: flex;
    padding-bottom: 12px;

    .title {
      flex-grow: 1;
      @include font-outfit;
      text-transform: uppercase;
      font-size: $text-size-regular;
      font-weight: 600;
      line-height: 20px;
    }

    button {
      flex-shrink: 0;
      opacity: 0.6;
    }
  }

  .comments {
    display: grid;
    padding: 10px;
    gap: 10px;

    .comment {
      display: flex;
      justify-items: center;
      gap: 5px;
      border-radius: 0 12px 12px 12px;
      border: 1px solid var(--c-contrast-200);
      padding: 12px;
      font-size: $text-size-regular;
      line-height: 16px;
      text-wrap: wrap;
      width: 300px;
      word-break: break-all;
    }
  }

  .actions {

    display: flex;
    // align-items: end;
    // justify-content: end;
    justify-content: space-between;
    align-content: center;

    .add-button {}
  }
}
</style>
