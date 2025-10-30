<template>
  <div class="initiator">
    <template v-if="hasData">
      <template v-if="!showName && this.data.type == InitiatorTypeEnum.User">
        <UserIcon :userId="data.id" :sizePx="sizePx" :hideAdminBadge="true" />
        <template v-if="showFull">{{ this.initiatorName }}</template>
      </template>
      <template v-else>{{ this.initiatorName }}</template>
    </template>
  </div>
</template>

<script lang="ts">
import useUtilityDataStore from "@/store/utilitydata";
import { Initiator, InitiatorTypeEnum } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import UserIcon from "../atoms/UserIcon.vue";

@Component({
  components: { UserIcon },
})
export default class TickInitiator extends Vue {
  InitiatorTypeEnum = InitiatorTypeEnum;
  @Prop() private data: Required<Initiator>;
  @Prop() private sizePx: number;
  @Prop() private showName: boolean;
  @Prop() private showFull: boolean;

  private get hasData() {
    return this.data != null;
  }

  private get sizeAsPixels() {
    return (this.sizePx || 40).toString() + "px";
  }

  private get initiatorName(): string {
    switch (this.data.type) {
      case InitiatorTypeEnum.Flow: {
        return "a flow";
      }
      case InitiatorTypeEnum.User: {
        let user = useUtilityDataStore().user(this.data.id);
        return user != null ? user.name : "a user";
      }
      case InitiatorTypeEnum.System: {
        return "tick";
      }
    }
    return "-";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.initiator {
  display: inline-flex;
  height: 20px;
  width: 20px;
  align-items: center;
  gap: 5px;
  text-transform: capitalize;
}
</style>
