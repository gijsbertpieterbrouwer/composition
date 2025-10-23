<template>
  <div class="item-wrapper " :class="colorName">

    <TickIcon class="icon" :name="channelIconName" v-if="channelIconName" /> {{ title }}

    <div @click="remove" class="remove">
      <TickIcon class="icon" name="delete" />
    </div>
  </div>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import { getColorName } from "@/helpers/colorsHelper";
import { getChannelIconName } from "@/helpers/enumsHelper";
import { AddMessageRequestReceiver, ColorsEnum, CommunicationType, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import ChannelLabel from "../channel/ChannelLabel.vue";

@Component({
  emits: ["update:modelValue", "remove"],
  components: {
    TickIcon, ChannelLabel
  },
})
export default class TicketMessageReceiver extends Vue {
  LanguagePath = LanguagePath
  @Prop private item!: AddMessageRequestReceiver;
  @Prop() private disabled!: boolean;

  private get title(): string {
    switch (this.item.communicationType) {
      case CommunicationType.Email: return this.item.address;
      case CommunicationType.Phone: return this.item.address;
      default:
        return this.item.name;
    }
  }

  private get colorName() {
    return getColorName(ColorsEnum.BoldBlack);
  }

  private get channelIconName() {
    return getChannelIconName(this.item?.communicationType);
  }

  private remove() {
    this.$emit("remove");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.item-wrapper {
  @include neon-bg;
  @include font-inter;

  display: inline-flex;
  gap: 5px;
  width: auto;
  flex-grow: 0;
  height: 20px;
  align-content: center;
  align-items: center;
  align-self: center;


  padding: 0 6px 0px 3px;
  font-size: 10px;
  line-height: 10px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  border-radius: 100px;

  //max-width: 200px;
  min-width: 20px;



  .icon {
    width: 14px;
    height: 14px;

  }

  .remove {
    visibility: hidden;
    border-radius: 5px;
    margin-left: auto;

    &:hover {
      color: $error;
    }

  }

  &:hover {
    .remove {
      visibility: visible;
    }
  }


}
</style>
