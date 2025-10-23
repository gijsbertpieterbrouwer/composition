<template>
  <SidebarPanel :id="definitionId" :name="name" @contextmenu.prevent="showContextMenu($event)">
    <template #header>

      <!-- {{ weight }} -->
      <slot name="header" />
      <TickButton v-if="showRefreshButton" class="refresh-button" :appearance="Appearance.transparent" :color="Color.base" :size="Size.mini" icon="refresh" @click="refresh" title="Refresh"
        :round="true" />
    </template>

    <template #subheader>
      <slot name="subheader" />
    </template>

    <div class="content">
      <template v-if="success">
        <slot />

      </template>
      <template v-else-if="failed">
        {{ $translate(LanguagePath.App_MetaDataComponentWrapper_Failed) }}
      </template>
      <template v-else-if="isLoading">
        <div class="busy-wrapper">
          <BusyIndicator :loading="!ready" />
        </div>

      </template>
    </div>

  </SidebarPanel>
</template>

<script lang="ts">

import BusyIndicator from '@/components/atoms/BusyIndicator.vue';
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import { DropdownOption } from '@/components/atoms/TickDropdown.vue';
import TickHeading from '@/components/atoms/TickHeading.vue';
import { openContextDropdownPanel } from '@/components/panels/contextPanels/ContextDropdownPanel.vue';
import { translate } from '@/plugins/translatePlugin';
import { RouterToMetadataComponent } from '@/router';
import { refreshMetadatacomponent } from '@/services/TicketsService';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, ComponentDataSourceTypeEnum, LanguagePath, MetaDataComponentUpdate } from '@/TickApi';
import { Component, Prop, Vue, } from 'vue-facing-decorator';


@Component({
  name: "GenericMetaDataComponent",
  emits: ["refresh"],
  components: { BusyIndicator, TickButton, TickHeading, SidebarPanel },
})
export default class MetaDataComponentWrapper extends Vue {
  @Prop() private data!: MetaDataComponentUpdate;
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  private showContextMenu(e: MouseEvent) {

    const options: DropdownOption[] = [{
      icon: "refresh",
      id: "refresh",
      text: translate(LanguagePath.App_Refresh),
      onSelect: () => {
        this.refresh();
      }
    }];

    if (this.allowEdit) {
      options.push({
        icon: "edit",
        id: "edit",
        text: translate(LanguagePath.App_Edit),
        onSelect: () => {
          this.edit();
        }
      })
    }



    openContextDropdownPanel(e, options, translate(LanguagePath.MetadataComponent));
    e.stopPropagation();
  }

  private edit() {
    RouterToMetadataComponent(this.data.metaDataComponentDefinitionId);
  }

  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration);
  }
  private get weight() {
    return this.data.weight
  }
  // private get titleTooltip() {
  //   return this.data.lastUpdateDate ? `Data retrieval date: ${displayDate(this.data.lastUpdateDate)}` : null;
  // }

  private get showRefreshButton() {
    return this.ready && this.data.sourceType == ComponentDataSourceTypeEnum.DataAdapter
  }

  private refresh() {
    refreshMetadatacomponent(this.data.ticketMetaDataComponentId);
  }

  private get definitionId() {
    return this.data.metaDataComponentDefinitionId;
  }

  private get name() {
    return this.data.componentName;
  }

  private get ready() {
    return this.data && this.data.ready;
  }

  private get success() {
    return this.ready && this.data.dataRetrievalSuccess;
  }

  private get failed() {
    return !this.ready && !this.data.dataRetrievalSuccess && this.data.isFinalDataRetrievalAttempt;
  }

  private get isLoading() {
    return !this.ready;
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";



.busy-wrapper {
  align-content: center;
  justify-content: center;
  margin-left: 8px;
}

.component {
  margin-bottom: 10px;
  padding: 10px;

  .header {
    display: flex;
    gap: 10px;
    overflow: hidden;
    line-height: 32px;
    font-family: 'Poppins', sans-serif;
    font-style: normal;
    letter-spacing: -0.02em;
    font-size: 16px;
    white-space: nowrap;

    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    margin-bottom: 5px;
    opacity: 0.7;

    .refresh-button {
      margin-left: auto;
      // display: inline-flex;

    }

  }



}

.content {
  display: flex;
  gap: 10px;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 10px;
  overflow: hidden;
}
</style>
