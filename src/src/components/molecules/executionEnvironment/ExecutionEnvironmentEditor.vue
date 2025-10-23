<template>

  <TickScreen :loading="!loaded" :title="name">
    <template v-slot:actions>
      <TickButton @click="setAsCreator" v-if="editallowed && isDefaultForCreation == false" :busy="busySettingAsCreator">
        {{ $translate(LanguagePath.App_ExecutionEnvironmentEditor_Set_As_Default_Creation_Title) }}
      </TickButton>
      <TickButton @click="setAsProduction" v-if="editallowed && isProduction == false" :busy="busySettingAsProduction">{{
        $translate(LanguagePath.App_ExecutionEnvironmentEditor_Set_As_Prod_Title) }}</TickButton>
      <TickButton @click="remove" v-if="deleteallowed" :busy="busyDeleting" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
      <TickButton @click="save" v-if="editallowed" :disabled="!readyForSave" :busy="busySaving">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>

    <template v-slot:default>
      <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">
        <TickInput v-model="name" placeholder="Environment name">{{ $translate(LanguagePath.App_Name) }}</TickInput>
      </TickEditorPanel>

      <TickEditorPanel :name="$translate(LanguagePath.States_Variables)">
        <DataBagEditor :activeId="dataBagId" showScreenEstate="false" />
      </TickEditorPanel>
    </template>

  </TickScreen>
</template>



<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { onConfirmation } from '@/helpers/questionHelper';
import { translate } from '@/plugins/translatePlugin';
import useDataBagsStore from '@/store/databags';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, LanguagePath, TickExecutionEnvironment, } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import DataBagEditor from '../databag/DatabagEditor.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';

@Component({
  emits: ["deleted", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, DataBagEditor },
})
export default class ExecutionEnvironmentEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private activeId!: string;
  private env: TickExecutionEnvironment = null;
  private loaded = false;
  private busySaving = false;
  private busyDeleting = false;
  private busySettingAsProduction = false;
  private busySettingAsCreator = false;

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useManagingStore().getEnvironment(id).then(env => {
      this.env = env;
      this.loaded = true;
    })
  }
  mounted() {
    this.activate(this.activeId);
  }
  private get dataBagId() {
    return this.env?.dataBagId;
  }
  private get isProduction() {
    return this.env?.isProduction;
  }
  private get isDefaultForCreation() {
    return this.env?.isDefaultForCreation;
  }
  private get deleteallowed() {
    const allow = this.editallowed;
    return allow;
  }


  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration)
  }

  private get name() {
    return this.env?.name;
  }
  private set name(to: string) {
    this.env.name = to;
  }
  private get editorSubTitle() {
    return "edit mode";
  }

  private get readyForSave() {
    return true;
  }

  private save() {
    this.busySaving = true;

    useDataBagsStore().save(this.env.dataBagId).then(() => {
      useManagingStore().saveEnvironment(this.env.id).then(() => {
        this.busySaving = false;
        this.$emit("saved");
      });
    });
  }

  private remove() {
    onConfirmation(() => {
      this.busyDeleting = true;
      useManagingStore().deleteEnvironment(this.env.id).then(() => {
        this.busyDeleting = false;
        this.$emit("deleted");
      }, () => {
        this.busyDeleting = false;
      });

    }, translate(LanguagePath.ExecutionEnvironmentEditor_ConfirmDelete))
    //if (!askConfirmation(translate(LanguagePath.ExecutionEnvironmentEditor_ConfirmDelete))) { return; }





  }

  private setAsProduction() {
    onConfirmation(() => {
      this.busySettingAsProduction = true;
      useManagingStore().setEnvironmentAsProduction(this.env.id).then(() => {
        this.busySettingAsProduction = false;
      }, () => {
        this.busySettingAsProduction = false;
      });
    }, translate(LanguagePath.ExecutionEnvironmentEditor_ConfirmSetAsProduction))
    // if (!askConfirmation(translate(LanguagePath.ExecutionEnvironmentEditor_ConfirmSetAsProduction))) { return; }


  }

  private setAsCreator() {
    this.busySettingAsCreator = true;
    useManagingStore().setEnvironmentAsCreator(this.env.id).then(() => {
      this.busySettingAsCreator = false;
    }, () => {
      this.busySettingAsCreator = false;
    });
  }


}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.delete {
  float: right;
  margin-bottom: 5px;
}
</style>
