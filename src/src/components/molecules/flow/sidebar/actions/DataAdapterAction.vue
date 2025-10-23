<template>
  <div class="action">
    <SidebarPanel id="adapter-general" :name="$translate(LanguagePath.App_FlowEditor_SideBar_DataAdapter_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_DataAdapter_Explanation) }}
      </template>


      <TickSelector v-model="setAdapter" :disabled="disabled" :options="adapterOptions" />

      <TickButton icon="edit" ref="adapter" v-if="hasAdapterChosen" @click="editSelectedAdapter" :appearance="Appearance.secondary" :color="Color.contrast">{{
        $translate(LanguagePath.App_FlowEditor_SideBar_DataAdapter_EditAdapter)
      }}</TickButton>


    </SidebarPanel>

    <DocuHolder class="docuHolder" :group="docuBlocks" />

  </div>
</template>

<script lang="ts">
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { mount, unmount } from '@/helpers/mountHelper';
import getRefElement from '@/helpers/refHelpers';
import useUtilityDataStore from '@/store/utilitydata';
import { ApiAdapterSettingsData, DocumentationGroup, FlowDefinitionAction, LanguagePath } from "@/TickApi";
import { ApiDataAdapterActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import AdapterEditorPanel from '../../panel/AdapterEditorPanel.vue';

@Component({
  emits: ["remove", "update"],
  components: { DocuHolder, SidebarPanel, StorageInput, TickIcon, TickCheckbox, TickTextarea, TickButton, AdapterEditorPanel, TickSelector },
})
export default class DataAdapterAction extends Vue {
  Appearance = Appearance;
  Size = Size
  Color = Color
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: ApiDataAdapterActionSettings;
  @Prop() private disabled!: boolean;

  private get docuBlocks(): DocumentationGroup[] {
    const r: DocumentationGroup[] = []
    r.push(DocumentationGroup.AdapterEditor)
    return r;
  }

  private activePanel = {
    itemId: "",
    panelId: "",
  }


  private get data() {
    return jsonProxy<ApiAdapterSettingsData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }

  private get hasAdapterChosen() {
    return this.data.apiAdapterDefinitionId != null;
  }

  private get setAdapter() {
    return this.data.apiAdapterDefinitionId;
  }

  private set setAdapter(input: string) {
    this.data.apiAdapterDefinitionId = input;
  }


  private get adapterOptions() {
    const adapters = useUtilityDataStore().utilityData.adapterDefinitions;
    let options = adapters.map((adapter) => ({
      text: adapter.name,
      value: adapter.id,
    }))

    return options;
  }

  private editSelectedAdapter() {
    if (!this.data.apiAdapterDefinitionId) { return; }

    this.togglePanelFor("adapter", this.data.apiAdapterDefinitionId);
  }

  private togglePanelFor(fromRef: string, itemId: string) {
    this.closeActivePanel();

    this.activePanel.itemId = itemId;
    this.activePanel.panelId = this.openPanel(fromRef, { adapterId: itemId });
  }

  beforeUnmount() {
    this.closeActivePanel();
  }

  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.panelId = "";
    this.activePanel.itemId = "";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>,) {
    const control = getRefElement(this, id);
    const rect = control.getBoundingClientRect();
    const paddingTop = window.getComputedStyle(control).getPropertyValue('padding-top');

    return mount(AdapterEditorPanel, {
      props: {
        ...props,
        // position: {
        //   right: `${window.innerWidth - Math.ceil(rect.left)}px`,
        //   top: `${Math.floor(rect.top) + parseInt(paddingTop) - 4}px`,// 4px because it looks better
        // }
      },
      events: {
        close: () => { this.closeActivePanel(); },
        //patch: (route: OptionsItemData) => { this.patchOption(route); }
      }
    });
  }

  @Watch("settings")
  private settingsChanged() {
    // FIXME: Panel props don't automatically update, so re-open panel when settings change.
    // if (this.replyPanelId) {
    //   this.closeReplyPanel();
    //   this.toggleReplyPanel();
    // }
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.docuHolder {
  height: auto;
  margin-top: 100px;
}

.title {
  font-weight: 600;
}

.message {
  font-style: italic;
  margin: 0 36px 0 8px;
}
</style>
