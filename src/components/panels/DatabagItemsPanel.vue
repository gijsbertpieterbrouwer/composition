<template>
  <TickSettingsPanel class="panel" :panelOptions="panelOptions" @close="close">
    <template #title>{{ this.title }}</template>
    <template #actions>

      <TickButton @click.stop="navToCreateNew" v-if="allowCreate && this.viewState != ViewState.CreateNew" :size="Size.mini" :color="Color.contrast" :appearance="Appearance.secondary">
        {{ $translate(LanguagePath.App_Add) }}
      </TickButton>
      <TickButton @click.stop="viewState = ViewState.DatabagItems" v-if="allowedView && this.viewState == ViewState.CreateNew" :size="Size.mini" :color="Color.contrast"
        :appearance="Appearance.secondary">{{ $translate(LanguagePath.App_Back) }}
      </TickButton>

    </template>
    <div class="content">
      <template v-if="allowedView">
        <div class="toggle-bar" v-if="showInputFunctions && this.viewState != ViewState.CreateNew">
          <TickOptionBar v-model="viewState" :buttons="tabButtons" />
        </div>

        <template v-if="viewState == ViewState.DatabagItems">

          <TickInput class="filter-input" v-if="showFilter" v-model="filterText" v-focus :placeholder="$translate(LanguagePath.App_Search)" />
          <div class="info" v-if="filterText.length > 0 && !reducedFilteredItems.length">{{ $translate(LanguagePath.App_DatabagItemPanel_NoResults_CreateNewFromFilter_Explanation, {
            path: 'path', value:
              filterText
          }) }}</div>
          <div class="no-results" v-else-if="!options || !this.options.length">{{ this.noresults }}</div>

          <div class="list">

            <template v-for="(item, index) in reducedFilteredItems" :key="item.id">
              <button ref="items" class="item" :class="{ 'highlighted': this.isHighlighted(index) }" @click.stop="selectItem(item, index)">
                <span class="name">{{ item.name }}</span>
                <span class="token">({{ item.token }})</span>
              </button>
            </template>

            <PanelReduceSwitch :reduce="reduceLabelResults" @toggle=toggleReduceItems :nrHidden="nrOfHiddenItems" :totalCount="filteredItems.length" :maxNrOfItems="maxNrOfItems" />
          </div>
        </template>
        <template v-else-if="viewState == ViewState.MathFunctions">
          <TokenMathFunctionEditor @change="selectMathFunction" />

        </template>
        <template v-else-if="viewState == ViewState.CreateNew">
          <TickInput v-model="newNameProxy" v-focus :placeholder="$translate(LanguagePath.App_DatabagItemPanel_CreateNew_Name_Explanation)">
            {{ $translate(LanguagePath.App_DatabagItemPanel_CreateNew_Name_Title) }}</TickInput>

          <div class="flex-row">
            <TickSelector v-model="newStorageLocation" :options="storageLocationOptions">{{ $translate(LanguagePath.App_DatabagItemPanel_CreateNew_StorageLocation_Title) }}</TickSelector>
            <div class="dot">.</div>
            <TickInput v-model="newFullPath" :placeholder="$translate(LanguagePath.App_DatabagItemPanel_CreateNew_Path_Explanation)">
              {{ $translate(LanguagePath.App_DatabagItemPanel_CreateNew_Path_Title) }}</TickInput>
          </div>
          <TickInput v-model="newDefaultValue" :placeholder="$translate(LanguagePath.App_DatabagItemPanel_CreateNew_DefaultValue_Explanation)">
            {{ $translate(LanguagePath.App_DatabagItemPanel_CreateNew_DefaultValue_Title) }}</TickInput>

          <div>
          </div>
        </template>
      </template>

      <template v-else>
        <SalesUpSellViaFeatureBlock @close="close" :type="SubscriptionCostItemType.DatabagItem" />
      </template>
    </div>

    <template #footer>
      <TickButton v-if="viewState == ViewState.CreateNew" @click="addNewItem" :size="Size.regular" :color="Color.primary" :appearance="Appearance.primary">{{ $translate(LanguagePath.App_Create) }}
      </TickButton>
      <TickButton v-if="viewState == ViewState.MathFunctions" @click="useMathFunction" :size="Size.regular" :color="Color.primary" :appearance="Appearance.primary">{{ $translate(LanguagePath.App_Use)
      }}
      </TickButton>
    </template>

  </TickSettingsPanel>
</template>

<script lang="ts">
import { AssigneeTypeEnum, AuthorizationObjectType, DatabagItemDefinitionSummary, DataItemDataType, LanguagePath, StorageLocation, SubscriptionCostItemType, TickDatabagItemDefinition } from "@/TickApi";
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { smartFilter } from "@/helpers/arrayHelper";
import { getStorageLocationOptions } from "@/helpers/enumsHelper";
import generateId from "@/helpers/guid";
import keyboard from "@/helpers/keyboard";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import { notifyError } from "@/notify";
import { translate } from '@/plugins/translatePlugin';
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { ComputedRef } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickIcon from "../TickIcon.vue";
import TickButton, { Appearance, Color, Size } from "../atoms/TickButton.vue";
import TickOptionBar, { OptionBarItem } from "../atoms/TickOptionBar.vue";
import TickSelector from "../atoms/TickSelector.vue";
import TokenMathFunctionEditor from "../molecules/databag/TokenMathFunctionEditor.vue";
import SalesUpSellViaFeatureBlock from "../molecules/sales/SalesUpSellViaFeatureBlock.vue";
import PanelReduceSwitch from "./PanelReduceSwitch.vue";
import { openUsersAndTeamsItemPanel, usersAndTeamsSelection } from "./UsersAndTeamsPanel.vue";

export function removeDatabagItemPanel(panelId: string) {
  unmount(panelId);
}

export function openDatabagItemPanel(panelOptions: TickPanelOptions, showInputFunctions: boolean, title: string, locations: StorageLocation[], defaultNewStorageLocation: StorageLocation, onSelect: (token: string) => unknown, onClose: () => void) {
  const newPanelId = "DatabagItemsPanel_" + generateId();

  const activePanelId = mount(DatabagItemsPanel, {
    props: {
      title: title,
      panelOptions: panelOptions,
      locations: locations,
      defaultNewStorageLocation: defaultNewStorageLocation,
      noFilter: false,
      modelValue: "",
      noresults: "",
      showInputFunctions: showInputFunctions,
    },
    events: {
      close: () => {
        //console.log("close");
        removeDatabagItemPanel(activePanelId);
        onClose();
      },

      select: (to: string) => {
        onSelect(to);
      },
    },
    loadComponents: [TickSettingsPanel]
  }, newPanelId);
}

enum ViewState {
  CreateNew,
  DatabagItems,
  MathFunctions,
}
@Component({
  directives: { focus },
  emits: ["close", "select"],
  components: {
    TickSettingsPanel,
    TickIcon,
    TickInput,
    PanelReduceSwitch,
    TickButton,
    TokenMathFunctionEditor,
    TickSelector,
    TickOptionBar,
    SalesUpSellViaFeatureBlock
  },
})
export default class DatabagItemsPanel extends Vue {
  Size = Size;
  Color = Color;
  Appearance = Appearance;
  ViewState = ViewState;
  SubscriptionCostItemType = SubscriptionCostItemType;
  LanguagePath = LanguagePath

  @Prop() private panelOptions!: TickPanelOptions;
  @Prop({ default: "Variables" }) private title!: string;
  @Prop() private noFilter!: boolean;
  @Prop() private modelValue!: ComputedRef<string>;
  @Prop({ default: "Nothing found" }) private noresults!: string;
  @Prop({ default: true }) private sort!: string;
  @Prop() private locations: StorageLocation[];
  @Prop() private defaultNewStorageLocation: StorageLocation;
  @Prop() private showInputFunctions: boolean;

  private newName = "";
  private newFullPath = "";
  private newDefaultValue = "";
  private newStorageLocation = StorageLocation.Workspace;
  private filterText = "";
  private keyboardId!: number;
  private highlightedIndex = -1; // -1 is no highlight
  private viewState: ViewState = ViewState.DatabagItems; // default viewstate
  private tempMathFunction = "";

  private get newNameProxy() {
    return this.newName;
  }
  private set newNameProxy(to: string) {
    this.newName = to.trim();

    if (!this.newFullPath || to.includes(this.newFullPath)) {
      this.newFullPath = to;
    }

  }

  private get allowedView() {
    return useUserStore().allowedInPlan(SubscriptionCostItemType.DatabagItem);
  }

  private navToCreateNew() {
    this.viewState = ViewState.CreateNew;
  }

  private get storageLocationOptions() {
    const options = getStorageLocationOptions(true, true);
    const allowOptions = this.locations ? options.filter(p => this.locations.some(a => a == p.value)) : options;

    return allowOptions;
  }


  private get tabButtons(): OptionBarItem[] {
    return [
      {
        id: ViewState.DatabagItems,
        text: translate(LanguagePath.App_DatabagItemPanel_Tab_Variables_Title)//"Variables" ,
      },
      {
        id: ViewState.MathFunctions,
        text: translate(LanguagePath.App_DatabagItemPanel_Tab_Calculation_Title)//"Calculation",
      },

    ]
  }

  private useMathFunction() {
    this.selectToken(this.tempMathFunction);
  }


  private selectMathFunction(to: string) {
    this.tempMathFunction = to;
    // this.selectToken(to);
  }

  private get allowCreate() {
    return this.allowedView && useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration);
  }


  private isHighlighted(index: number): boolean {
    return this.highlightedIndex == index;
  }

  private get allItems() {
    return useUtilityDataStore().utilityData.databagItemDefinitions;
  }

  private get options(): DatabagItemDefinitionSummary[] {
    return this.allItems || [];

  }

  private get showFilter() {
    return !this.noFilter && (this.options && this.options.length);
  }


  private get model() {
    return this.modelValue.value;
  }

  private maxNrOfItems = 15;
  private reduceLabelResults = true;

  private toggleReduceItems() {
    this.reduceLabelResults = !this.reduceLabelResults;
  }
  private get nrOfHiddenItems() {
    return this.filteredItems.length - this.reducedFilteredItems.length;
  }

  private get reducedFilteredItems() {
    if (!this.reduceLabelResults) { return this.filteredItems; }
    const items = this.filteredItems;
    return items.slice(0, this.maxNrOfItems);
  }

  private get filteredItems() {
    let allItems = this.allItems

    if (this.locations && this.locations.length > 0) {
      allItems = this.allItems.filter(p => this.locations.some(a => a == p.storageLocation)) || [];
    }

    if (this.filterText) {

      return smartFilter(this.filterText, allItems, {
        filterProps: ['name', 'token'],
      })

    } else {
      return allItems;
    }

  }

  private close() {
    this.$emit("close");

  }


  private selectToken(to: string) {
    this.$emit('select', to);
    this.close();
  }


  private selectItem(to: DatabagItemDefinitionSummary, index: number) {
    let token = to.token;

    //this.$emit("update:modelValue", to);
    //this.selectToken(to.token);

    // special case "location.path.@.path" => .@. must be replaced with a user handle
    const replacablePathPart = ".@someone.";
    const indexOfUserHandlePart = token.indexOf(replacablePathPart);
    if (indexOfUserHandlePart == -1) {
      this.$emit("update:modelValue", to);
      this.selectToken(token);
    } else {

      // retrieve user

      var from = getRefElementDOMRect(this, (this.$refs.items as [])[index]);
      const panelOptions: TickPanelOptions = {
        title: "Select user or team",
        allowAsSubDialog: true,
        from: from,
        showAsModal: from ? false : true,
      }

      openUsersAndTeamsItemPanel(panelOptions, "Select user or team", [AssigneeTypeEnum.User], false, (to: usersAndTeamsSelection) => {
        let handle = "";
        if (to?.userIds?.length > 0) {
          const user = useUtilityDataStore().user(to.userIds[0])
          if (user) {
            handle = user.handle;
          }
        }

        if (to?.teamIds?.length > 0) {
          const team = useUtilityDataStore().team(to.teamIds[0])
          if (team) {
            handle = team.handle;
          }
        }


        let preToken = token.substring(0, indexOfUserHandlePart);
        const postToken = token.substring(indexOfUserHandlePart + replacablePathPart.length);
        token = `${preToken}.${handle}.${postToken}`

        this.$emit("update:modelValue", to);
        this.selectToken(token);

      }, this.close);

    }

  }

  private setHighLightIndex(newIndex: number) {
    this.highlightedIndex = newIndex;

    if (this.highlightedIndex < -1) { this.highlightedIndex = this.reducedFilteredItems.length - 1; }
    if (this.highlightedIndex > this.reducedFilteredItems.length - 1) {
      this.highlightedIndex = 0;  // back to first item in list
    }
  }

  private mounted() {
    if (this.allItems.length == 0) {
      this.viewState = ViewState.CreateNew;
    }

    if (this.defaultNewStorageLocation) {
      this.newStorageLocation = this.defaultNewStorageLocation;
    }


    this.keyboardId = keyboard.on("Down", () => {
      this.setHighLightIndex(this.highlightedIndex + 1);
    },
      { ignoreInputFieldEvents: false });

    this.keyboardId = keyboard.on("Up", () => {
      this.setHighLightIndex(this.highlightedIndex - 1);
    },
      { ignoreInputFieldEvents: false });


    this.keyboardId = keyboard.on("Enter", () => {
      if (this.viewState == ViewState.DatabagItems) {

        if (!this.reducedFilteredItems.length && this.filterText.length > 0) {
          this.viewState = ViewState.CreateNew
          this.newNameProxy = this.filterText;

        } else {

          let selectedIndex = this.highlightedIndex;
          if (selectedIndex == -1) { selectedIndex = 0; }

          this.selectItem(this.reducedFilteredItems[selectedIndex], selectedIndex);
        }
      }

      else if (this.viewState == ViewState.CreateNew) {
        this.addNewItem();
      }
    },
      { ignoreInputFieldEvents: false });

  }

  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }


  private addNewItem() {
    //validate
    if (stringIsNullOrEmpty(this.newName)) { notifyError("Attention", "Please fill in a name to use"); return; }
    if (stringIsNullOrEmpty(this.newFullPath)) { notifyError("Attention", "Please fill in a path to use"); return; }



    const alreadyExist = this.allItems.some(p => p.token == this.newFullPath);
    if (alreadyExist) { notifyError("Attention", "Path already in use"); return; }

    useManagingStore().addDatabagItemDefinition({
      id: generateId(),
      name: this.newName,
      dataType: DataItemDataType.Text,
      defaultValue: this.newDefaultValue,
      storageLocation: this.newStorageLocation,
      fullPath: this.newFullPath,
    }).then((d: TickDatabagItemDefinition) => {
      this.viewState = ViewState.DatabagItems;
      this.newName = "";
      this.newDefaultValue = "";
      this.newFullPath = "";

      this.selectItem(d, 0);

    }).catch(() => {
      //console.error(error);
    });


  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.flex-row {
  display: flex;
  gap: 10px;

  .dot {
    display: flex;
    flex-wrap: wrap;
    align-content: flex-end;
    padding-bottom: 3px;
  }

}


.panel {

  .toggle-bar {
    display: flex;
    gap: 10px;
  }

  .list {
    min-width: 200px;
    border-radius: 4px;
    overflow: hidden;
    display: grid;
    gap: 4px;


    .item {
      font-size: $text-size-regular;
      display: flex;
      align-items: center;
      line-height: 16px;
      padding: 6px 12px;
      gap: 8px;
      width: calc(100% + 8px);
      transition: background-color 200ms ease;
      margin: 0 -4px;
      justify-content: space-between;

      .name {
        display: block;
        flex-grow: 1;
        text-transform: capitalize;
      }

      .token {
        opacity: 0.7;
        font-size: 0.8em;
        text-transform: lowercase;
      }

      &:hover {
        color: var(--c-contrast);
        background-color: var(--c-base-300);
      }

      &.highlighted {
        color: var(--c-contrast);
        background-color: var(--c-base-200);
      }

    }

  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 600px;
    min-height: 100px;


    .no-results {
      text-align: center;
      font-style: italic;
      font-size: 0.8em;
    }

    .info {
      text-align: center;
      font-style: italic;
      font-size: 0.8em;
    }
  }
}
</style>
