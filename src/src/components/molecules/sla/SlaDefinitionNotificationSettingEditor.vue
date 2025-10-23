<template>
  <tr>
    <td>
      <UsersAndTeamsSelector class="selector" :disabled="disabled" v-model="usersAndTeams" />
    </td>
    <td>
      <TickSelector :disabled="disabled" v-model="notificationType" :options="notificationTypeOptions" />
    </td>
    <td>
      <TickButton v-if="!disabled" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
    </td>
  </tr>
</template>



<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import { getSlaNotificationTypeEnumOptions } from "@/helpers/enumsHelper";
import { NotificationSettingsItem, SlaNotificationTypeEnum } from "@/TickApi";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "../Selectors/UsersAndTeamsSelector.vue";
@Component({
  emits: ["updated", "remove"],
  components: {
    TickInput,
    TickButton,
    TickSelector,
    UsersAndTeamsSelector
  },
})
export default class SlaDefinitionNotificationSettingEditor extends Vue {
  SlaNotificationTypeEnum = SlaNotificationTypeEnum;
  Appearance = Appearance
  Color = Color
  Size = Size

  @VModel({ required: true }) private data!: NotificationSettingsItem;
  @Prop() private disabled: boolean;


  private get notificationType() {
    return this.data.type;
  }
  private set notificationType(to: SlaNotificationTypeEnum) {
    this.data.type = to;
  }

  private get usersAndTeams(): UsersAndTeamsSelection {
    return {
      userIds: this.data.userIds || [],
      teamIds: this.data.teamIds || [],
    };
  }

  private set usersAndTeams(to: UsersAndTeamsSelection) {
    this.data.userIds = to.userIds || [];
    this.data.teamIds = to.teamIds || [];
  }

  private get notificationTypeOptions() {
    return getSlaNotificationTypeEnumOptions();
  }

  private remove() {
    this.$emit("remove");
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.selector {
  background-color: var(--c-base-300);
}

.flex-row {
  display: flex;
  gap: 5px;

  align-content: center;
  align-self: center;
  align-items: center;


}
</style>
