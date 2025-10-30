<template>
  <TickScreen :loading="!loaded" :title="$translate(LanguagePath.Labels)">
    <template v-slot:actions>
      <TickButton @click="save" :disabled="!readyForSave" v-if="editallowed">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>

    <template v-slot:default>

      <div class="wrapper">
        <div class="info">{{ $translate(LanguagePath.App_LabelsEditor_Explanation) }} </div>


        <div class="labels">
          <TickCheckbox class="removed-checkbox" v-model="showDeleted">{{ $translate(LanguagePath.App_LabelsEditor_ShowDeleted_Title) }} </TickCheckbox>
          <table class="styledTable">
            <tbody>
              <template v-for="label, in this.filteredLabels" :key="label.id">
                <tr class="labeleditor" :class="{ deleted: label.deleted }">
                  <td>
                    <Ticklabel :color="label.color || ColorsEnum.Grey" :name="label.name" :disableCollapse="true" :disableToggle="true" />
                  </td>
                  <td>
                    <TickInput class="name" v-model="label.name" :maxlength="40" :placeholder="$translate(LanguagePath.App_Name)" />
                  </td>
                  <td>
                    <TickColorSelector v-model="label.color" />
                  </td>

                  <td>
                    <TickButton v-if="!label.deleted && this.editallowed" @click="removeLabel(label)" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
                    <TickButton v-if="label.deleted && this.editallowed" @click="unDeleteLabel(label)" class="right" :appearance="Appearance.secondary" :color="Color.contrast">
                      {{ $translate(LanguagePath.App_LabelsEditor_ShowDeleted_ActivateButton) }}
                    </TickButton>
                  </td>
                </tr>

                <tr v-if="label.color == null || label.color == ColorsEnum.Grey" class="no-border">
                  <td colspan="100">
                    <div class="info">
                      <TickIcon name="eye-off" /> {{ $translate(LanguagePath.App_LabelsEditor_NoColor_Explanation) }}
                    </div>

                  </td>
                </tr>
              </template>

            </tbody>
          </table>

        </div>

        <!-- <TickButton @click="addEmptyLabel" v-if="editallowed && this.addAllowedInPlan" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast">
          {{ $translate(LanguagePath.App_Add) }}
        </TickButton> -->

        <TickAddCostItemButton :appearance="Appearance.secondary" :color="Color.contrast" icon="plus" @add="addEmptyLabel" :requiredAuth="AuthorizationObjectType.Workspace"
          :costItem="SubscriptionCostItemType.Labels" :currentNr="this.currentNr" :title="LanguagePath.App_Add" />
      </div>
    </template>
  </TickScreen>

</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { AuthorizationObjectType, ColorsEnum, LanguagePath, SubscriptionCostItemType, TickLabelDefinition, TickWorkspace } from "@/TickApi";
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import TickScreen from "../editor/TickScreen.vue";

import Ticklabel from "@/components/atoms/TickLabel.vue";
import generateId from "@/helpers/guid";
import useUserStore from "@/store/user";

import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickColorSelector from "@/components/molecules/Selectors/TickColorSelector.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getColorOptions } from "@/helpers/enumsHelper";
import useManagingStore from "@/store/managingStore";

@Component({
  emits: ["saved"],
  components: {
    TickInput,
    TickTextArea,
    TickButton,
    TickCheckbox,
    ThenHr,
    TickScreen,
    TickEditorPanel,
    Ticklabel,
    TickSelector,
    TickColorSelector,
    TickIcon,
    TickAddCostItemButton
  },
})
export default class LabelsEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  ColorsEnum = ColorsEnum
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType
  SubscriptionCostItemType = SubscriptionCostItemType;

  @Prop() private activeId!: string;
  private workspace: TickWorkspace = null;
  private loaded = false;
  private showDeleted = false;
  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    this.workspace = useUserStore().getWorkspace(id);
    this.loaded = true;
  }

  private get currentNr() {
    const currentNr = this.labels.filter((p) => p.deleted == false).length;
    return currentNr;
  }
  mounted() {
    this.activate(this.activeId);
    useManagingStore().useLabels();
  }


  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  private removeLabel(label: TickLabelDefinition) {
    const index = this.labels.findIndex((s) => label.id === s.id);
    if (index > -1) {
      // this.labels.splice(index, 1);
      this.labels[index].deleted = true;
    }
  }

  private unDeleteLabel(label: TickLabelDefinition) {
    const index = this.labels.findIndex((s) => label.id === s.id);
    if (index > -1) {
      this.labels[index].deleted = false;
    }
  }

  private addEmptyLabel() {
    this.labels.push({
      id: generateId(),
      name: "",
      color: ColorsEnum.Grey,
      deleted: false,
    });
  }

  private get labelColorOptions() {
    return getColorOptions();
  }

  private get editorSubTitle() {
    return "edit mode";
  }

  private get readyForSave() {
    return true;
  }

  // @Watch("labels", {
  //   deep: true,
  // })
  // private async labelsChanged(labels: TickLabelDefinition[]) {
  //   for (let i = 0; i < labels.length; i++) {
  //     //const label = labels[i];
  //    // const colorName = getColorName(label.color);
  //     //label.colorName = colorName.toLowerCase();
  //   }
  // }

  private get filteredLabels() {
    const labels = this.labels;

    return this.showDeleted == true
      ? labels
      : labels.filter((p) => p.deleted == false);
  }

  private get labels() {
    return useManagingStore().labels;
  }

  private save() {
    useManagingStore()
      .saveLabels()
      .then(() => {
        this.$emit("saved");
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.labels {
  margin-top: 30px;
  display: grid;
  gap: 10px;

  .removed-checkbox {
    justify-self: end;
  }
}


.info {
  font-size: 0.7em;
  opacity: 0.7;
  padding-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.styledTable {
  margin-bottom: 40px;
  width: 100%;


  .owner {
    width: 80px;
  }

  tbody {
    tr:not(:first-child):not(.no-border) {
      border-top: solid 1px var(--c-base-200);
    }

    tr:hover {
      background-color: var(--c-base-100);
    }
  }
}
</style>
