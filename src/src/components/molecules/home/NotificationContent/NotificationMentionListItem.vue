<template>
  <button class="mention-notification" @click.self="routeToMention" :title="buttonText">
    <div class="header">
      <TickInitiator :sizePx="20" :data="initiator" /> <span class="notifcation-type">{{ $translate(LanguagePath.App_NotificationMentionListItem_MentionsYou) }}</span>

      <TickButton class="resolve-button" @click="$emit('resolve')" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">
        {{ $translate(LanguagePath.App_NotificationMentionListItem_Resolve) }}
      </TickButton>
    </div>
    <div class="content">
      {{ this.message }}
    </div>


  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { CollectionObjectTypeEnum, LanguagePath, MentionTargetEnum, TickMention, TickNotification } from "@/TickApi";
import { jsonProxy } from '@/helpers/jsonProxy';
import { RouterToItem, RouterToTicket } from '@/router';
import { debugAction } from '@/log';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInitiator from '../../TickInitiator.vue';
import { translate } from '@/plugins/translatePlugin';

@Component({
  emits: ["resolve"],
  components: { TickButton, TickInitiator }
})
export default class NotificationMention extends Vue {
  Appearance = Appearance;
  Size = Size
  Color = Color
  LanguagePath = LanguagePath
  @Prop() private notification: Required<TickNotification>;
  @Prop() private selected: boolean;

  private get readOnlyTypeData() {
    return jsonProxy<TickMention>(this.notification.dataJSon, () => { /* do nothing */ });
  }

  private get initiator() {
    return this.readOnlyTypeData.initiator || {};
  }

  private get buttonText() {
    switch (this.readOnlyTypeData.targetType) {
      case MentionTargetEnum.Ticket:
        return translate(LanguagePath.App_NotificationMentionListItem_Ticket_Button_Title);
      default:
        return translate(LanguagePath.App_NotificationMentionListItem_Unknown_Button_Title);
    }
  }

  private routeToMention() {
    switch (this.readOnlyTypeData.targetType) {
      case MentionTargetEnum.Ticket:
        debugAction(`[NOTIFICATION:MENTION] Follow mention to ticket with id: ${this.readOnlyTypeData.targetObjectId}`)
        RouterToTicket(this.readOnlyTypeData.targetObjectId);
        break;
      case MentionTargetEnum.Flow:
        debugAction(`[NOTIFICATION:MENTION] Follow mention to flow with id: ${this.readOnlyTypeData.targetObjectId} and version: ${this.readOnlyTypeData.targetObjectVersionId}`)
        RouterToItem(CollectionObjectTypeEnum.Flow, this.readOnlyTypeData.targetObjectId, this.readOnlyTypeData.targetObjectVersionId);
        break;
    }
  }

  private get message() {
    return this.notification.message || "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.mention-notification {
  border-radius: 0 12px 12px 12px;
  //border: 1px solid var(--c-base-400);
  background-color: var(--c-base-300);
  transition-duration: 0.2s;

  padding: 12px;
  font-size: $text-size-regular;
  line-height: 16px;

  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;

  &:hover {
    background-color: var(--c-base-400);

    .header {
      .resolve-button {
        visibility: visible;
      }
    }
  }

  .header {
    display: flex;
    gap: 10px;
    line-height: 20px;

    .notifcation-type {
      opacity: 0.6
    }

    .resolve-button {
      margin-left: auto;
      visibility: hidden;
    }
  }


  .content {
    font-size: $text-size-regular;

  }
}
</style>
