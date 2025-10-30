<template>
  <span class="typers-holder" v-if="typingOccurs">
    <template v-if="!onlyShowLabel">
      <UserIcon class="typer" :disabled="false" v-for="(id, index) in this.filteredUserIds" :key="id" :userId="id" :sizePx="24" :style="{
        zIndex: this.communicatorIds.length + (this.filteredUserIds.length - index),
      }" />

      <template v-for="(id, index) in this.communicators" :key="id">
        <CommunicatorIcon class="typer" :communicator="communicators[index]" :address="null" :sizePx="20" :style="{ zIndex: this.communicators.length - index }" />
      </template>
    </template>
    <span class="typers-text">{{ this.typersText }}</span>

  </span>
</template>

<script lang="ts">
import useUserStore from "@/store/user";
import { Component, Prop, Vue } from "vue-facing-decorator";
import UserIcon from "./UserIcon.vue";
import { LanguagePath, TickTicketCommunicator } from "@/TickApi";
import CommunicatorIcon from "./CommunicatorIcon.vue";
import { translate } from "@/plugins/translatePlugin";

@Component({
  components: { UserIcon, CommunicatorIcon },
})
export default class TypingIndicator extends Vue {
  @Prop({ default: [] }) private userIds!: string[];
  @Prop({ default: [] }) private communicatorIds!: string[];
  @Prop({ default: [] }) private knownCommunicators!: TickTicketCommunicator[];
  @Prop({ default: true }) private hideSelf!: boolean;
  @Prop({ default: false }) private onlyShowLabel: boolean;
  @Prop() private sizePx: number;

  private get typingOccurs(): boolean {
    return this.typersCount > 0;
  }

  private get filteredUserIds() {
    //return this?.userIds; //.concat(this?.userIds)
    return this.hideSelf ? (this?.userIds || []).filter(p => !useUserStore().isSelf(p))
      : this?.userIds || [];
  }

  private get communicators() {
    return this.knownCommunicators.filter(p => this.communicatorIds.some(a => a == p.id)) || [];
  }

  private get unknownCommunicatorIds() {
    return this.communicatorIds.filter(a => !this.knownCommunicators.some(k => k.id == a))
  }

  private get typersCount() {
    return this?.filteredUserIds.length
      + this?.communicators.length
      + this.unknownCommunicatorIds?.length;
  }

  private get onlyOneTyper() {
    return (this.typersCount) == 1;
  }

  private get typersText() {
    // const unknownTypersText = (this.typersCount > (this.communicators.length + this.userIds.length))
    //   ? this.onlyOneTyper
    //     ? translate(LanguagePath.APP_TypingIndicator_Typing_Someone).toLowerCase()  :  translate(LanguagePath.APP_TypingIndicator_Typing_Multiple).toLowerCase()
    //   : "";

    return `${translate(LanguagePath.APP_TypingIndicator_Typing_Someone).toLowerCase()}...`
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.typers-holder {
  padding: 4px;
  border-radius: 2px;
  height: 32px;
  transition: background-color 200ms ease;
  display: flex;
  align-items: center;


  .typer:not(:first-child) {
    margin-left: -10px;
  }

  .typers-text {
    margin-left: 5px;
    font-size: 0.7em;
  }
}
</style>
