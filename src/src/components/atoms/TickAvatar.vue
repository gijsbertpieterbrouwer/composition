<template>
  <template v-if="showAvatar">
    <div :title="name" class="avatar-icon" :class="[this.avatarColor, { online: this.isonline }]" :style="{
      backgroundImage: 'url(' + this.downloadUrl + ')',
      width: this.sizeAsPixels,
      height: this.sizeAsPixels,
    }">
      <slot />
    </div>
  </template>
  <template v-else>
    <div :title="name" v-bind:style="{
      width: this.sizeAsPixels,
      height: this.sizeAsPixels,
      fontSize: `${this.sizePx * 0.4}px`,
    }" class="avatar-icon" :class="[{ online: this.isonline }, this.avatarColor]">
      {{ this.initials }}
      <slot />
    </div>
  </template>
</template>

<script lang="ts">
import { getColorName } from "@/helpers/colorsHelper";
import { getDownloadUrl } from "@/helpers/fileHelper";
import { calcInitials } from "@/helpers/stringHelper";
import useUserStore from "@/store/user";
import { ColorsEnum } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component
export default class TickAvatar extends Vue {
  @Prop({ default: "" }) private fileId: string;
  @Prop({ default: "" }) private fileUrl: string;
  @Prop({ default: "" }) private name!: string;
  @Prop({ default: false }) private online!: boolean;
  @Prop({ default: 40 }) private sizePx!: number;
  @Prop({ default: ColorsEnum.Grey }) private color: ColorsEnum;
  private get sizeAsPixels() {
    return `${this.sizePx}px`;
  }

  private get tenantId() {
    return useUserStore().tenantId;
  }
  private get initials() {
    return calcInitials(this.name);
  }
  private get showAvatar() {
    return (this.fileId != null && this.fileId.length) || this.fileUrl?.length;
  }



  private get avatarColor() {
    const c = this.color || ColorsEnum.Grey;

    if (c != ColorsEnum.Grey) {
      return getColorName(this.color || ColorsEnum.Grey);
    } else {
      return null;
    }
  }

  private get hasAvatar() {
    return this.fileId ? true : false;
  }

  private get downloadUrl() {
    if (this.fileUrl) { return this.fileUrl }
    return getDownloadUrl(this.fileId, "png");
  }

  private get isonline() {
    return this.online;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.avatar-icon {
  @include neon-bg;
  @include font-inter;
  grid-area: icon;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  flex-shrink: 0;
  text-align: center;

  display: grid; // used for display initials
  place-content: center;
  background-color: var(--c-base-300);
  color: var(--c-contrast);


  font-weight: 500;
  font-size: 0.6em;

  overflow: hidden;

  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid var(--c-base-100);

  &.online {
    border: 1px solid $success;
  }
}
</style>
