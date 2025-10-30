<template>
  <!-- <TickListItem class="list-item" :name="callName">
    <template #actions>

      <Attachment v-if="call.recordingFileLink" :attachmentLink="call.recordingFileLink" />

      <TickButton v-if="call.ticketId" @click="navigateToTicket(call.ticketId)" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">{{
        $translate(LanguagePath.App_TaskInstanceEditor_TicketButton_Title) }}</TickButton>
    </template>
</TickListItem> -->


  <div class="list-item">
    <button class="list-button">

      <div class="icon">
        <tickIcon name="phone" />
      </div>

      <div class="content">
        <div class="name">{{ this.name }}</div>
        <div class="description">
          <UsersAndTeamsSelector v-if="hasTickParticipations" v-model="tickParticipators" :disabled="true" />
        </div>
      </div>

      <div class="actions">
        <Attachment v-if="call.recordingFileLink" :attachmentLink="call.recordingFileLink" />

        <TickButton v-if="call.ticketId" @click="navigateToTicket(call.ticketId)" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">{{
          $translate(LanguagePath.App_TaskInstanceEditor_TicketButton_Title) }}</TickButton>
      </div>

      <TickIcon name="arrow-right" />
    </button>
  </div>

</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import { displayDate } from '@/helpers/dateHelper';
import { RouterToTicket } from '@/router';
import { LanguagePath, ParticipantsTypeEnum, TickPhoneCallSummary } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from '../molecules/Selectors/UsersAndTeamsSelector.vue';
import Attachment from '../molecules/ticket/Timeline/Attachment.vue';
import TickIcon from '../TickIcon.vue';

@Component({
  name: "TickListItem",
  emits: [
    "select",
  ],
  components: {
    TickListItem, TickIcon, Attachment, TickButton, UsersAndTeamsSelector
  }
})

export default class TickPhoneCallListItem extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath

  @Prop() private call: TickPhoneCallSummary;



  private navigateToTicket(ticketId: string) {
    RouterToTicket(ticketId);
  }

  private get name() {
    return displayDate(this.call?.creationDate);
  }

  private get hasTickParticipations(): boolean {
    return this.tickParticipators.teamIds.length > 0 || this.tickParticipators.userIds.length > 0;
  }

  private get tickParticipators(): UsersAndTeamsSelection {
    const users = this.call.participations?.filter(p => p.type == ParticipantsTypeEnum.User);
    const teams = this.call.participations?.filter(p => p.type == ParticipantsTypeEnum.Team);

    const userIds = users.map((p) => p.participantObjectId);
    const teamIds = teams.map((p) => p.participantObjectId);

    return {
      userIds: userIds,
      teamIds: teamIds,
    }
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list-item {
  overflow: hidden;

  &:not(:last-child) {
    border-bottom: 1px solid var(--c-base-200);
  }

  .list-button {
    display: grid;
    grid-template-columns: 48px 1fr auto 32px;
    grid-template-areas: "icon content actions indicator";
    align-items: center;
    width: 100%;


    &.no-icon {
      grid-template-areas: "content content actions indicator";
    }

    &:hover {
      color: var(--c-contrast);
      background-color: var(--c-base-300);

    }
  }

  .icon {
    grid-area: icon;
    display: grid;
    justify-content: center;
    align-content: center;

    height: 90%;
    width: 90%;
    margin-left: 5px;
    border-radius: 4px;
  }

  .content {
    grid-area: content;
    padding: 8px 10px;
    text-align: left;
  }

  .actions {
    padding-right: 10px;
    display: flex;
    gap: 10px;
    align-items: center;
    align-content: center;
    flex-wrap: wrap;
  }

  .name {
    font-size: 14px;
    line-height: 20px;
  }

  .description {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    font-size: $text-size-regular;
    line-height: 16px;
    color: var(--c-contrast-hsl);

  }
}
</style>
