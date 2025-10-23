<template>
  <TickInputLabel>
    <slot />
    <CommunicationChannelsSelector :allowAsSubDialog="allowAsSubDialog" v-if="showChannelSelector" :availableCommunicationTypes="availableCommunicationTypes"
      :emptyLabel="$translate(LanguagePath.Channel)" :closeAfterSelect="true" v-model="communicationChannelIds" />
    <div class="flex">

      <!-- <CommunicatorIcon v-if="hasCommunicatorData" :communicator="chosenCommunicator" :currentAddressId="communicatorAddressId" :sizePx="30" />
      <CommunicatorIcon v-else :sizePx="30" :disabled="true" /> -->

      <!-- :placeholder="$translate(LanguagePath.App_CommunicatorSelector_Placeholder)" -->
      <TickInput ref="searchInput" class="address" v-model="inputQuery" v-focus @keyup="keyup" />
      <BusyIndicator :loading="busySearching" />
    </div>
  </TickInputLabel>
</template>

<script lang="ts">
import BusyIndicator from "@/components/atoms/BusyIndicator.vue";
import CommunicatorIcon from "@/components/atoms/CommunicatorIcon.vue";
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import { DropdownOption } from "@/components/atoms/TickDropdown.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import DropdownPanel, { DropdownActionButton } from "@/components/panels/DropdownPanel.vue";
import { focus } from "@/directives";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { translate } from '@/plugins/translatePlugin';
import { searchCommunicatorAddress } from "@/services/CommunicatorsService";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { CommunicationType, LanguagePath, SearchCommunicatorAddressRequest, TickCommunicator } from "@/TickApi";
import { computed } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import CommunicationChannelsSelector from "./CommunicationChannelsSelector.vue";

export interface CommunicatorAddressOption {
  communicatorAddressId?: string;
  communicatorAddress?: string;
  communicationChannelId?: string;
  communicationType?: CommunicationType;
  communicator: TickCommunicator;
}

export enum CommunicatorSelectorType {
  address = 'address',
  name = 'name',
}

@Component({
  emits: ["select"],
  directives: { focus },
  components: {
    TickInput,
    TickInputLabel,
    DropdownPanel,
    TickButton,
    TickSelector,
    CommunicationChannelsSelector,
    BusyIndicator,
    CommunicatorIcon,
  },
})
export default class CommunicatorSelector extends Vue {
  Appearance = ButtonAppearance;
  Size = ButtonSize;
  Color = ButtonColor;
  LanguagePath = LanguagePath
  @Prop() private disabled: boolean;
  @Prop() private title = "";
  @Prop() private availableCommunicationTypes: CommunicationType[];
  @Prop() private startingAddress: string;

  @Prop() private hideChannels: boolean;
  @Prop() private ignoreCommunicatorIds: string[];
  @Prop({ default: CommunicatorSelectorType.address }) private selectionType?: CommunicatorSelectorType;
  @Prop() private allowAsSubDialog: boolean;
  @Prop() private resetAfterSelection: boolean;

  private activePanel = "";
  private communicatorOptions: DropdownOption[] = [];
  private typingDelay = 500;
  private minTypingChars = 3;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queryTimer: any = null;
  private busySearching = false;
  private ignoreAddressChange = false;

  private communicationChannelId = "";
  private address = "";

  private chosenOption: CommunicatorAddressOption = null;



  private get showChannelSelector(): boolean {
    return this.hideChannels != true;
  }

  private keyup(e: KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        if (!this.activePanel) {
          this.onAddressChange();
        }
        break;
    }
  }

  private onAddressChange() {
    if (this.canSearch(this.address)) {
      this.executeSearch(this.address, this.communicationChannelId);
    }
  }

  private get hasCommunicatorData(): boolean {
    return this.chosenCommunicator != null;
  }

  private get chosenCommunicator(): TickCommunicator {
    return this.chosenOption?.communicator;
  }

  private get communicatorAddressId(): string {
    return this.hasCommunicatorData ? this.chosenOption?.communicatorAddressId : null;
  }

  mounted() {
    this.address = this.startingAddress || "";
    if (this.availableChannels.length == 1) {
      this.communicationChannelIds = [this.availableChannels[0].id];
    }

    this.onAddressChange();
  }

  private get communicationChannelIds() {
    return this.communicationChannelId ? [this.communicationChannelId] : [];
  }

  private set communicationChannelIds(to: string[]) {
    this.communicationChannelId = to[to.length - 1];
    this.onInputChange();
  }


  private get availableChannels() {
    const channels = useUtilityDataStore().utilityData.communicationChannels || []
    if (this.availableCommunicationTypes?.length > 0) {
      return channels.filter(p => this.availableCommunicationTypes.some(a => a == p.communicationType));
    } else {
      return channels;
    }
  }

  private select(to: CommunicatorAddressOption) {
    this.chosenOption = to;
    this.$emit("select", to);
    this.closePanel();

    if (this.resetAfterSelection && to.communicatorAddressId) {
      this.reset();
    }
  }


  private get inputQuery() {
    return this.address;
  }

  private set inputQuery(to: string) {
    this.address = to;
    this.onInputChange();
  }

  private onInputChange() {
    if (this.ignoreAddressChange) {
      this.ignoreAddressChange = false;
      return;
    }

    this.select({
      communicatorAddress: this.address,
      communicatorAddressId: null,
      communicationChannelId: this.communicationChannelId,
      communicationType: null,
      communicator: null,

    })

    this.delayedSearch(this.address);
  }

  private getAddressOptions(c: TickCommunicator): CommunicatorAddressOption[] {
    let options: CommunicatorAddressOption[] = [];

    for (let index = 0; index < c.addresses.length; index++) {
      const address = c.addresses[index];

      options.push({
        communicator: c,
        communicatorAddressId: address.id,
        communicatorAddress: address.address,
        communicationChannelId: this.communicationChannelId,
        communicationType: address.type,
      })
    }

    return options;
  }

  private executeSearch(searchQuery: string, channelId?: string, communicationTypes?: CommunicationType[]) {
    //searchCommunicator address
    const workspaceId = useUserStore().activeWorkspaceId;

    //if (!channelId || stringIsNullOrEmpty(searchQuery)) { return; }

    this.busySearching = true;

    const request: SearchCommunicatorAddressRequest = {
      query: searchQuery,
      workspaceId: workspaceId,
      communicationChannelId: channelId,
      communicationTypes: communicationTypes,
    }

    searchCommunicatorAddress(request).then(serverData => {
      this.busySearching = false;
      const communicators = serverData;


      // dont open panel when nothing found
      if (communicators.length == 0) { return; }

      let options: CommunicatorAddressOption[] = [];

      for (let index = 0; index < communicators.length; index++) {
        const c = communicators[index];
        if (this.ignoreCommunicatorIds?.some(p => p == c.id)) { continue; }


        switch (this.selectionType) {
          case CommunicatorSelectorType.address:
            options = this.getAddressOptions(c);
            this.communicatorOptions = options.map((item) => ({
              text: item.communicatorAddress,
              id: item.communicatorAddressId,
              data: item,
            }));

            break;
          case CommunicatorSelectorType.name:

            options.push({
              communicator: c,
              communicatorAddressId: null,
              communicatorAddress: null,
              communicationChannelId: this.communicationChannelId,
            });
            this.communicatorOptions = options.map((item) => ({
              text: item.communicator.name,
              id: item.communicator.id,
              data: item,
            }));
            break;

        }

        // for (let index = 0; index < c.addresses.length; index++) {
        //   const address = c.addresses[index];

        //   options.push({
        //     communicator: c,
        //     communicatorAddressId: address.id,
        //     communicatorAddress: address.address,
        //     communicationChannelId: this.communicationChannelId,
        //   })
        // }


      }


      const exact = this.communicatorOptions.find(p => p.text == this.address);
      if (exact) {
        this.selectOption(exact)
      } else {
        this.openPanel();
      }


    });
  }

  private canSearch(searchQuery: string): boolean {
    if (searchQuery.length < this.minTypingChars) {
      return false;
    }

    return true;
  }

  private delayedSearch(searchQuery: string) {
    if (this.queryTimer) {
      clearTimeout(this.queryTimer);
    }

    if (!this.canSearch(searchQuery)) {
      return;
    }

    this.queryTimer = setTimeout(() => {
      this.executeSearch(searchQuery, this.communicationChannelId);
    }, this.typingDelay);
  }

  private reset() {
    this.address = "";
  }

  private get actionButtons(): DropdownActionButton[] {
    return []
  }

  private selectOption(option: DropdownOption) {
    const address = option.data as CommunicatorAddressOption;
    this.ignoreAddressChange = true;

    this.inputQuery = address.communicatorAddress;


    this.select(option.data)
    // this.select(option.)

    // this.$emit("update:modelValue", option.id, option);
    //this.close();
  }



  private selectAction(action: DropdownActionButton) {
    // no actions defined
    console.log(action);
  }

  private togglePanel() {
    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.disabled) {
      return;
    }

    if (this.activePanel) {
      return;
    }
    const panelOptions: TickPanelOptions = {
      title: "DropdownPanel",
      from: getRefElementDOMRect(this, "searchInput"),
      allowAsSubDialog: this.allowAsSubDialog,
    }

    this.activePanel = mount(DropdownPanel, {
      props: {
        panelOptions: panelOptions,
        actionButtons: this.actionButtons,
        modelValue: computed(() => ""),
        title: this.title,
        noFilter: true,
        options: this.communicatorOptions,
        noresults: translate(LanguagePath.NoResults),
      },
      events: {
        close: () => {
          this.closePanel();
        },
        action: (to: DropdownActionButton) => {
          this.selectAction(to);
        },
        "update:modelValue": (to: DropdownOption) => {
          this.selectOption(to);
        },
      },
    });


  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.flex {
  display: flex;
  gap: 10px;
  justify-content: stretch;
  align-items: center;
}

.address {
  flex-grow: 1;
}
</style>
