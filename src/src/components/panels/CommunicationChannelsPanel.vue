<!-- Used for dropdown list selector -->

<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="users-and-teams-panel" @close="close">
    <template #title>{{ this.titleText }}</template>

    <div class="content">
      <TickInput class="filter-input" v-model="filterText" v-focus :placeholder="$translate(LanguagePath.App_Search)" />
      <TickCommunicationChannelDisplay class="assignable" :class="{ 'highlighted': this.isHighlighted(index) }" :allowRemove="false" v-for="(channel, index) in this.reducedFilteredChannels"
        :key="channel.id" :selected="model.indexOf(channel.id) > -1" :channel="channel" @toggle="toggleChannel" />
      <PanelReduceSwitch :reduce="reduceChannelResults" @toggle=this.toggleReduce :nrHidden="nrOfHiddenChannels" :totalCount="filteredChannels.length" :maxNrOfItems="maxNrOfItems" />
    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickAssigneeDisplay from "@/components/molecules/TickAssigneeDisplay.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { smartFilter } from "@/helpers/arrayHelper";
import keyboard from "@/helpers/keyboard";
import useUtilityDataStore from "@/store/utilitydata";
import { AssigneeTypeEnum, CommunicationType, LanguagePath } from "@/TickApi";
import { ComputedRef } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickCommunicationChannelDisplay from "../molecules/TickCommunicationChannelDisplay.vue";
import PanelReduceSwitch from "./PanelReduceSwitch.vue";

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickSettingsPanel,
    TickAssigneeDisplay,
    TickInput,
    PanelReduceSwitch,
    TickCommunicationChannelDisplay
  },
})
export default class CommunicationChannelsPanel extends Vue {
  AssigneeTypeEnum = AssigneeTypeEnum;
  @Prop() private title: string;
  @Prop() private typeFilters!: AssigneeTypeEnum[];
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private modelValue!: ComputedRef<string[]>;
  @Prop() private closeAfterSelect: boolean;
  @Prop() private availableCommunicationTypes: CommunicationType[];
  LanguagePath = LanguagePath
  private filterText = "";
  private maxNrOfItems = 5;
  private reduceChannelResults = true;

  private keyboardId!: number;
  private highlightedIndex = -1; // -1 is no highlight

  private setHighLightIndex(newIndex: number) {
    this.highlightedIndex = newIndex;

    if (this.highlightedIndex < -1) { this.highlightedIndex = this.reducedFilteredChannels.length - 1; }
    if (this.highlightedIndex > this.reducedFilteredChannels.length - 1) {
      this.highlightedIndex = 0;  // back to first item in list
    }
  }


  private mounted() {

    this.keyboardId = keyboard.on("Down", () => {
      this.setHighLightIndex(this.highlightedIndex + 1);
    },
      { ignoreInputFieldEvents: false });

    this.keyboardId = keyboard.on("Up", () => {
      this.setHighLightIndex(this.highlightedIndex - 1);
    },
      { ignoreInputFieldEvents: false });


    this.keyboardId = keyboard.on("Enter", () => {
      let selectedIndex = this.highlightedIndex;
      if (selectedIndex == -1) { selectedIndex = 0; }

      this.toggleChannel(this.reducedFilteredChannels[selectedIndex].id);
      // this.selectItem(this.filteredItems[selectedIndex]);
    },
      { ignoreInputFieldEvents: false });


  }

  private beforeUnmount() {
    keyboard.off(this.keyboardId);
  }


  private isHighlighted(index: number): boolean {
    return this.highlightedIndex == index;
  }

  private toggleReduce() {
    this.reduceChannelResults = !this.reduceChannelResults;
  }

  beforeMount() {
    //useManagingStore().useTeams();
  }

  private get titleText() {
    return this.title || "Channels"
  }

  private get model() {
    return this.modelValue.value || [];
  }

  private get nrOfHiddenChannels() {
    return this.filteredChannels.length - this.reducedFilteredChannels.length;
  }


  private get reducedFilteredChannels() {
    if (!this.reduceChannelResults) { return this.filteredChannels; }

    const items = this.filteredChannels;
    return items.slice(0, this.maxNrOfItems);
  }


  private get filteredChannels() {
    const items = smartFilter(this.filterText, this.allChannels, {
      filterProps: ['name'],
    });


    return items;
  }

  private get allChannels() {
    const channels = useUtilityDataStore().utilityData.communicationChannels || []

    if (this.availableCommunicationTypes?.length > 0) {

      return channels.filter(p => this.availableCommunicationTypes.some(a => a == p.communicationType));
    } else {
      return channels;
    }
  }

  private close() {
    this.$emit('close');
  }

  private toggleChannel(id: string) {
    if (this.model.includes(id)) {
      this.setChannels(
        this.model.slice().filter((l) => l !== id)
      );
    } else {
      this.setChannels(
        [...this.model.slice(), id]
      );
    }
  }

  private setChannels(channelIds: string[]) {
    this.$emit("update:modelValue", channelIds);

    if (channelIds.length) {
      if (this.closeAfterSelect) {
        this.close();
      }
    }
  }

  // private keyup(e: KeyboardEvent) {
  //   switch (e.key) {
  //     case "Enter":
  //       if (this.filteredChannels.length === 1) {
  //         this.toggleChannel(this.filteredChannels[0].id);
  //       }
  //       break;
  //   }
  // }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.assignable {
  width: 100%;

  &.highlighted {
    background-color: var(--c-base-200);
  }
}

.moreitems-message {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  font-style: italic;
}

.title {
  line-height: 20px;
  opacity: 0.6;
  font-weight: 500;
  font-size: $text-size-regular;
  letter-spacing: 0.04em;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
