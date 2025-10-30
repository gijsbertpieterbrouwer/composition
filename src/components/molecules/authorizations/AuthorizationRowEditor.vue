<template>
  <tr :title="tooltip">

    <td>
      <slot />
      <!-- <span class="admin-indicator" v-if="isGlobalAdmin" title="This user is Administrator, no further authorizations required">admin</span> -->
    </td>

    <td>
      <TickSelector v-model="workspaceAs" :options="asOptions" :disabled="!canEditAuthorizations" :sort="false" />
    </td>
    <td>
      <TickSelector v-model="processConfigAs" :options="asOptions" :disabled="!canEditAuthorizations" :sort="false" />
    </td>
    <td>
      <TickSelector v-model="technicalConfigAs" :options="asOptions" :disabled="!canEditAuthorizations" :sort="false" />
    </td>
    <td>
      <TickSelector v-model="ticketAs" :options="asOptions" :disabled="!canEditAuthorizations" :sort="false" />
    </td>
    <td>
      <TickSelector v-model="taskAs" :options="asOptions" :disabled="!canEditAuthorizations" :sort="false" />
    </td>
  </tr>
</template>

<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import { AuthorizationObjectType, AuthorizationSubjectType, AuthorizationType, LanguagePath } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';

import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';

import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickSelector, { Option } from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import { getAuthorizationTypeOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { translate } from '@/plugins/translatePlugin';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';


@Component({
  emits: ["deleted", "saved"],
  components: {
    TickInput, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, TickDropdown, TickSelector, TickSwitch,
  },
})
export default class AuthorizationRowEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size

  @Prop({ required: true }) private subjectId!: string;
  @Prop({ required: true }) private subjectType!: AuthorizationSubjectType;
  @Prop({ required: false }) private disabled!: boolean
  @Prop({ required: false }) private isGlobalAdmin!: boolean

  private get workspaceId() {
    return useUserStore().activeWorkspaceId;

  }
  private get tooltip() {
    return this.isGlobalAdmin ? translate(LanguagePath.AuthorizationRowEditor_Owner_Explanation) : null;

  }

  private get canEditAuthorizations() {
    return !this.disabled && !this.isGlobalAdmin;
  }

  private get asOptions(): Option[] {
    const o = getAuthorizationTypeOptions();
    o.unshift({
      text: translate(LanguagePath.AuthorizationRowEditor_Option_NoRights),
      value: null,
    })
    return o;
  }

  private get subjectAuthorizations() {
    return this.allAuthorizations.filter(p => p.subjectId == this.subjectId);
  }

  private get allAuthorizations() {
    return useManagingStore().workspaceAuthorizations || [];
  }

  private getAuthorization(auth: AuthorizationObjectType) {
    const subjectAuth = this.subjectAuthorizations.find(p => p.objectType == auth);
    return subjectAuth?.as;
  }

  private updateAuthorization(type: AuthorizationObjectType, to: AuthorizationType) {
    const existingAuth = this.subjectAuthorizations.find(p => p.objectType == type);

    if (!to) {
      //remove auth
      if (existingAuth) {
        useManagingStore().workspaceAuthorizations = useManagingStore().workspaceAuthorizations.filter(p => p.id != existingAuth.id);
      }
    } else {
      // Add/update auth

      if (existingAuth) {
        existingAuth.as = to;
      } else {
        useManagingStore().workspaceAuthorizations.push({
          id: generateId(),
          workspaceId: this.workspaceId,
          creationDate: new Date(),
          as: to,
          objectType: type,
          subjectId: this.subjectId,
          subjectType: this.subjectType,
        })
      }
    }
    // // remove existing auth
    // useManagingStore().workspaceAuthorizations = useManagingStore().workspaceAuthorizations.filter(p => p.subjectId == this.subjectId && p.objectType != type);

    // if (to) {
    //   useManagingStore().workspaceAuthorizations.push({
    //     id: generateId(),
    //     workspaceId: this.workspaceId,
    //     creationDate: new Date(),
    //     as: to,
    //     objectType: type,
    //     subjectId: this.subjectId,
    //     subjectType: this.subjectType,
    //   })
    // }
  }


  private get workspaceAs(): AuthorizationType {
    return this.getAuthorization(AuthorizationObjectType.Workspace);
  }

  private set workspaceAs(to: AuthorizationType) {
    this.updateAuthorization(AuthorizationObjectType.Workspace, to)
  }

  private get ticketAs(): AuthorizationType {
    return this.getAuthorization(AuthorizationObjectType.Ticket);
  }

  private set ticketAs(to: AuthorizationType) {
    this.updateAuthorization(AuthorizationObjectType.Ticket, to)
  }
  private get taskAs(): AuthorizationType {
    return this.getAuthorization(AuthorizationObjectType.TaskInstance);
  }

  private set taskAs(to: AuthorizationType) {
    this.updateAuthorization(AuthorizationObjectType.TaskInstance, to)
  }

  private get processConfigAs(): AuthorizationType {
    return this.getAuthorization(AuthorizationObjectType.ProcessConfiguration);
  }

  private set processConfigAs(to: AuthorizationType) {
    this.updateAuthorization(AuthorizationObjectType.ProcessConfiguration, to)
  }


  private get technicalConfigAs(): AuthorizationType {
    return this.getAuthorization(AuthorizationObjectType.TechnicalConfiguration);
  }

  private set technicalConfigAs(to: AuthorizationType) {
    this.updateAuthorization(AuthorizationObjectType.TechnicalConfiguration, to)
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.admin-indicator {
  position: relative;
  bottom: 35px;
  right: 5px;
  font-size: 0.7em;
  color: var(--c-contrast);
}
</style>
