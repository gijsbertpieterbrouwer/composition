<template>
  <TickDialogPanel :noClose="true" class="panel" @close="close" :type="this.step == ExchangeManifestCreatorStep.Entree ? PanelStyle.wizard : PanelStyle.normal">
    <template #title>{{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_Title) }}</template>

    <div class="content">


      <!-- Entree -->
      <div v-if="step == ExchangeManifestCreatorStep.Entree" class="section_content">
        <div class="entree-wrapper">
          <div class="entree-title">{{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_Welcome_Title) }}</div>
          <div class="entree-explanation"> {{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_Welcome_Explanation) }} </div>
        </div>
      </div>

      <!-- General  -->
      <div v-else-if="step == ExchangeManifestCreatorStep.General" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_Editor_General) }}</TickHeading>

        <TickInput>{{ $translate(LanguagePath.App_Name) }}</TickInput>
        <TickTextarea>{{ $translate(LanguagePath.App_Description) }}</TickTextarea>
      </div>

      <!-- Collection Items -->
      <div v-else-if="step == ExchangeManifestCreatorStep.SelectItems" class="section_content">
        <TickHeading>{{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_SelectItems_Title) }}</TickHeading>
        <div> {{ $translate(LanguagePath.App_ExchangeManifestCreatorPanel_SelectItems_Explanation) }} </div>

        <div class="collection-items-wrapper">
          <div class="collection-items-input">
            <CollectionsViewer @select="selectCollectionItem" @selectCollection="selectCollection" :allowCollectionSelect="true" :collection="collections" :typeFilters="objectTypeFilters"
              :disabled="true" />
          </div>
          <div class="collection-items-selection">
            <CollectionsViewer @select="selectCollectionItem" :collection="outputCollection" :typeFilters="objectTypeFilters" :disabled="true" />
          </div>
        </div>
      </div>

      <!-- Validate Manifest-->
      <div v-else-if="step == ExchangeManifestCreatorStep.ValidateManifest" class="section_content">
        <table class="styledTable">
          <!-- <thead>
            <tr>
              <th class="owner"></th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Workspace) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Process_configuration) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_TechnicalConfiguration) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Tickets) }}</th>
              <th>{{ $translate(LanguagePath.Authorizations_Type_Tasks) }}</th>
            </tr>
          </thead> -->
          <tbody>
            <ExchangeManifestPointerRow :pointer="pointer" v-for="pointer in manifestpointers" :key="pointer.id" />
          </tbody>
        </table>
      </div>

      <!-- FINISH -->
      <div v-else-if="step == ExchangeManifestCreatorStep.Finish" class="section_content">
        <HappyIndicator text="You are ready, click NEXT to start using Tick" />
      </div>

    </div>

    <template #footer>
      <div class="footer">
        <div class="secondaryActions">
          <TickButton class="action" :appearance="Appearance.transparent" @click="exit" :color="Color.contrast">{{ $translate(LanguagePath.App_Cancel) }}
          </TickButton>
        </div>

        <TickButton :busy="busyWithServer" @click="next" :size="Size.XXL"> {{ $translate(LanguagePath.App_Next) }}</TickButton>
      </div>
    </template>
  </TickDialogPanel>
</template>

<script lang="ts">
import { Collection, CollectionObject, CollectionObjectTypeEnum, ExchangeManifestInstallPointerType, ExchangeManifestPointer, ExchangeSetupManifest, GetCollectionResponse, LanguagePath } from "@/TickApi";
import TickIcon from "@/components/TickIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import generateId from "@/helpers/guid";
import { mount, unmount } from "@/helpers/mountHelper";
import { onConfirmation } from "@/helpers/questionHelper";
import { notifyError } from "@/notify";
import { createUnsavedManifest, saveManifest } from "@/services/exchangeService";
import useCollectionsStore from "@/store/collections";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Vue } from "vue-facing-decorator";
import HappyIndicator from "../atoms/HappyIndicator.vue";
import { PanelStyle } from "../atoms/TickPanel.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import TickTextarea from "../atoms/TickTextarea.vue";
import WizardOptionButton from "../atoms/WizardOptionButton.vue";
import WizardOptionItem from "../atoms/WizardOptionItem.vue";
import CollectionsViewer, { SelectedItem } from "../molecules/collection/CollectionsViewer.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";
import ExchangeManifestPointerRow from "../molecules/exchange/ExchangeManifestPointerRow.vue";
import UserCreator from "../molecules/user/UserCreator.vue";

const panelId = "ExchangeManifestCreatorPanel";

export function removeExchangeManifestCreatorPanelPanel() {
  unmount(panelId);
}

export function openExchangeManifestCreatorPanelPanel() {
  mount(ExchangeManifestCreatorPanel, {
    props: {

    },
    events: {
      close: () => {
        removeExchangeManifestCreatorPanelPanel();
      },
    },
  }, panelId);
}

enum ExchangeManifestCreatorStep {
  Entree = 0,
  General = 1,
  SelectItems = 2,
  ValidateManifest = 3,
  Finish = 4,
}

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    UserCreator,
    TickHeading,
    WizardOptionButton,
    HappyIndicator,
    WizardOptionItem,
    TickSwitch,
    CollectionsViewer,
    ExchangeManifestPointerRow,
    TickTextarea
  },
})
export default class ExchangeManifestCreatorPanel extends Vue {
  private objectTypeFilters: CollectionObjectTypeEnum[] = [];

  Appearance = ButtonAppearance;
  Size = ButtonSize;
  Color = ButtonColor;
  ExchangeManifestCreatorStep = ExchangeManifestCreatorStep;

  HeadingSize = HeadingSize;
  LanguagePath = LanguagePath;
  PanelStyle = PanelStyle;


  private step: ExchangeManifestCreatorStep = ExchangeManifestCreatorStep.Entree;
  private busyWithServer = false;

  private selectedCollections: Collection[] = [];
  private selectedCollectionItems: CollectionObject[] = [];
  private manifest: ExchangeSetupManifest = null;
  private selectCollection(item: Collection) {
    if (this.selectedCollections.some(p => p.id == item.id)) {
      notifyError("", LanguagePath.App_ExchangeManifestCreatorPanel_SelectItems_ItemAlreadyInOutput);
      return;
    }
    this.selectedCollections.push(item);
  }

  private selectCollectionItem(item: SelectedItem) {
    if (this.selectedCollections.some(p => p.id == item.id)) {
      notifyError("", LanguagePath.App_ExchangeManifestCreatorPanel_SelectItems_ItemAlreadyInOutput);
      return;
    }
    this.selectedCollectionItems.push(item.collectionObject);
  }

  private get prodExecutionEnvironment() {
    return useUtilityDataStore().utilityData.executionEnvironments.find(p => p.isProduction);
  }

  private get allCollectionItemPointers() {
    let result: ExchangeManifestPointer[] = [];

    // selected items
    for (let index = 0; index < this.selectedCollectionItems.length; index++) {
      const item = this.selectedCollectionItems[index];
      result.push({
        collectionObjectType: item.objectType,
        id: generateId(),
        objectId: item.id,
        name: item.name,
        objectVersionId: item.versions.find(p => p.executionEnvironmentId == this.prodExecutionEnvironment.id)?.id,
        pointerType: ExchangeManifestInstallPointerType.CollectionItem,
      })
    }

    //selected collections
    for (let index = 0; index < this.selectedCollections.length; index++) {
      const col = this.selectedCollections[index];
      var childItems = this.recursivlyCalcReferencePointersFromSelection(col);
      result = result.concat(childItems);
    }

    return result;
  }

  private recursivlyCalcReferencePointersFromSelection(inputCollection: Collection): ExchangeManifestPointer[] {
    let result: ExchangeManifestPointer[] = [];
    const items = inputCollection.objects;
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      result.push({
        collectionObjectType: item.objectType,
        id: generateId(),
        objectId: item.id,
        name: item.name,
        objectVersionId: item.versions.find(p => p.executionEnvironmentId == this.prodExecutionEnvironment.id)?.id,
        pointerType: ExchangeManifestInstallPointerType.CollectionItem,
      })
    }

    const children = inputCollection.children;
    for (let index = 0; index < children.length; index++) {
      const col = children[index];
      var childItems = this.recursivlyCalcReferencePointersFromSelection(col);
      result = result.concat(childItems);
    }


    return result;
  }

  private get manifestpointers() {
    return this.manifest?.references || [];
  }

  private getEmptyManifest() {
    var collectionItemPointers = this.allCollectionItemPointers;

    this.busyWithServer = true;
    createUnsavedManifest({
      name: null, // set later in wizard,
      description: null, //set later in wizard
      references: collectionItemPointers,

    }).then((manifest) => {
      this.manifest = manifest;
      this.busyWithServer = false;
    });
  }

  private saveManifest() {
    this.busyWithServer = true;
    saveManifest(this.manifest).then((manifest) => {
      this.manifest = manifest;
      this.busyWithServer = false;
    });
  }

  private get collections() {
    const knownCollections = useCollectionsStore().collections;

    return {
      collections: knownCollections.collections.filter(p => !this.selectedCollections.some(s => s.id == p.id)),
      objectsOutsideCollection: knownCollections.objectsOutsideCollection.filter(p => !this.selectedCollectionItems.some(s => s.id == p.id)),
    }
  }

  private get outputCollection(): GetCollectionResponse {
    return {
      collections: this.selectedCollections,
      objectsOutsideCollection: this.selectedCollectionItems
    }
  }


  private exit() {
    onConfirmation(() => {
      this.close();
    })
  }

  beforeMount() {
    useCollectionsStore().use();
  }
  mounted() {
    useUtilityDataStore().use();
  }


  private goNext() {
    if (this.step == ExchangeManifestCreatorStep.Finish) {
      this.close();
    } else {
      this.step++;
    }

  }

  private next() {
    switch (this.step) {
      case ExchangeManifestCreatorStep.SelectItems:
        this.getEmptyManifest();
        break;
      case ExchangeManifestCreatorStep.ValidateManifest:
        this.saveManifest();
        break;
      case ExchangeManifestCreatorStep.Finish:
        this.close();
        break;

    }
    this.goNext();
  }

  private close() {
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: clamp(200px, 1500px, 90dvw);
  min-height: 700px;


  .section_content {
    display: grid;
    gap: 20px;
    font-size: 14px;
    max-height: 70vh;
    overflow-y: scroll;

    .explanation {
      font-size: 14px;
      line-height: 25px;

      .important {
        font-weight: 600;
      }

      &.center {
        text-align: center;
      }
    }
  }

  .entree-wrapper {
    height: 100%;
    display: grid;
    gap: 40px;
    justify-items: center;
    margin-top: 100px;

    .entree-title {
      @include font-outfit;
      font-size: 130px;
      line-height: 60px;
      font-weight: 600;
    }

    .entree-explanation {
      @include font-outfit;
      font-size: 30px;
      line-height: 60px;
      font-weight: 600;
    }
  }



  .collection-items-wrapper {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;

    .collection-items-input,
    .collection-items-selection {
      width: 45%;
    }

  }


}

.footer {
  width: 100%;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  justify-content: space-between;

  .secondaryActions {
    display: flex;
    gap: 5px;

    .action:hover {
      border-bottom: solid 1px var(--c-contrast);
    }
  }

}
</style>
