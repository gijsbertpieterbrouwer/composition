<template>
  <tr class="auth">
    <td class="who">
      <TickInitiator v-if="isUserRule" :data="ruleAsUserInitiator" :showFull="true" />
      <TeamIcon v-else :teamId="teamId" />
    </td>
    <td class="what">
      <TickSelector class="authSelector" v-model="authAs" :options="authOptions" :disabled="!canEdit" />
    </td>

    <td class="revoke">
      <TickButton v-if="canEdit" @click="remove" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular">
        {{ $translate(LanguagePath.App_ObjectAuthorizationsSelector_Revoke_Title) }}</TickButton>
    </td>
  </tr>
</template>

<script lang="ts">
import { Component, VModel, Vue } from 'vue-facing-decorator';
import { AuthorizationSubjectType, AuthorizationType, Initiator, InitiatorTypeEnum, WorkspaceAuthorization, LanguagePath } from "@/TickApi";
import TickSelector from "@/components/atoms/TickSelector.vue";
import { getAuthorizationTypeOptions } from '@/helpers/enumsHelper';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';


import TickInitiator from '@/components/molecules/TickInitiator.vue';
import useUserStore from '@/store/user';
import TeamIcon from '@/components/atoms/TeamIcon.vue';

@Component({
  emits: ["update:modelValue", "remove"],
  components: { TickSelector, TickButton, TickInitiator, TeamIcon }
})
export default class ObjectAuthorizationRuleEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size;
  LanguagePath = LanguagePath
  @VModel({ required: true }) private model!: Required<WorkspaceAuthorization>;

  private remove() {
    this.$emit("remove");
    return false;
  }

  private pushUpdate() {
    this.$emit("update:modelValue", this.model);
  }

  private get authAs() {
    return this.model.as;
  }

  private set authAs(to: AuthorizationType) {
    this.model.as = to;
  }

  private get isUserRule() {
    return this.model.subjectType == AuthorizationSubjectType.User;
  }
  private get ruleAsUserInitiator(): Initiator {
    return {
      type: InitiatorTypeEnum.User,
      id: this.model.subjectId,
    }
  }

  private get teamId() {
    return this.model.subjectId;
  }

  private get authOptions() {
    return getAuthorizationTypeOptions();
  }

  private get canEdit(): boolean {
    return !useUserStore().isSelf(this.model.subjectId);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.auth {
  // display: grid;
  // width: 100%;
  // grid-template-columns: 1fr 100px 80px;
  // gap: 10px;

  height: 40px;

  .who {
    width: 500px;
  }

  .what {
    width: 400px;
  }

  .revoke {
    width: 200px;
  }


  .authSelector {
    display: inline-block;
    // align-self: flex-end;

  }


}
</style>
