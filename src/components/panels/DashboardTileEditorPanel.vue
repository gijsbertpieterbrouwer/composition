<template>
  <TickDialogPanel class="panel" @close="$emit('close')">
    <template #title>{{ $translate(LanguagePath.DashboardEditor_Tile_SettingsMenu_EditSettings) }}</template>

    <div class="content">
      <DashboardChartingTileEditor v-if="type == DashboardTileType.Charting" v-model="tileSettingsAsChart" />
      <DashboardCounterTileEditor v-if="type == DashboardTileType.Counter" v-model="tileSettingsAsCounter" />
      <DashboardPieTileEditor v-if="type == DashboardTileType.Pie" v-model="tileSettingsAsPie" />
      <DashboardMessageboardTileEditor v-if="type == DashboardTileType.Messageboard" v-model="tileSettingsAsMessageboard" />
      <DashboardHeatmapTileEditor v-if="type == DashboardTileType.Heatmap" v-model="tileSettingsAsHeatmap" />
    </div>
  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import DashboardChartingTileEditor from '@/components/molecules/dashboarding/editors/DashboardChartingTileEditor.vue';
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { jsonProxy } from "@/helpers/jsonProxy";
import useUtilityDataStore from "@/store/utilitydata";
import { DashboardTileSettings, DashboardTileType, DatawarehouseChartDataTileSettings, DatawarehouseCounterDataTileSettings, DatawarehousePieDataTileSettings, DatawarehousHeatmapDataTileSettings, LanguagePath, MessageboardTileSettings, TickDashboard } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import DashboardCounterTileEditor from "../molecules/dashboarding/editors/DashboardCounterTileEditor.vue";
import DashboardHeatmapTileEditor from "../molecules/dashboarding/editors/DashboardHeatmapTileEditor.vue";
import DashboardMessageboardTileEditor from "../molecules/dashboarding/editors/DashboardMessageboardTileEditor.vue";
import DashboardPieTileEditor from "../molecules/dashboarding/editors/DashboardPieTileEditor.vue";
import TickEditorPanel from "../molecules/editor/TickEditorPanel.vue";

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickDialogPanel,
    TickInput,
    TickIcon,
    TickButton,
    TickEditorPanel,
    DashboardChartingTileEditor,
    DashboardCounterTileEditor,
    DashboardPieTileEditor,
    DashboardMessageboardTileEditor,
    DashboardHeatmapTileEditor

  },
})
export default class DashboardTileEditorPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  DashboardTileType = DashboardTileType;
  LanguagePath = LanguagePath
  @Prop() private dashboardId = "";
  @Prop() private tileId = "";


  private get type() {
    return this.tile.type;
  }
  private get tileSettingsAsPie() {
    return jsonProxy<DatawarehousePieDataTileSettings>(
      this.tile.tileSettingsJson || "{}",
      (json) => {
        this.tile.tileSettingsJson = json;
      }
    );
  }
  private get tileSettingsAsMessageboard() {
    return jsonProxy<MessageboardTileSettings>(
      this.tile.tileSettingsJson || "{}",
      (json) => {
        this.tile.tileSettingsJson = json;
      }
    );
  }

  private get tileSettingsAsCounter() {
    return jsonProxy<DatawarehouseCounterDataTileSettings>(
      this.tile.tileSettingsJson || "{}",
      (json) => {
        this.tile.tileSettingsJson = json;
      }
    );
  }
  private set tileSettingsAsCounter(data: DatawarehouseCounterDataTileSettings) {

    this.tile.tileSettingsJson = JSON.stringify(data);
  }

  private get tileSettingsAsHeatmap() {
    return jsonProxy<DatawarehousHeatmapDataTileSettings>(
      this.tile.tileSettingsJson || "{}",
      (json) => {
        this.tile.tileSettingsJson = json;
      }
    );
  }
  private set tileSettingsAsHeatmap(data: DatawarehousHeatmapDataTileSettings) {

    this.tile.tileSettingsJson = JSON.stringify(data);
  }

  private get tileSettingsAsChart() {
    return jsonProxy<DatawarehouseChartDataTileSettings>(
      this.tile.tileSettingsJson || "{}",
      (json) => {
        // console.log(json);
        this.tile.tileSettingsJson = json;
      }
    );
  }
  private set tileSettingsAsChart(data: DatawarehouseChartDataTileSettings) {
    //console.log("push", data);
    this.tile.tileSettingsJson = JSON.stringify(data);
  }


  private get dashboard(): TickDashboard {
    const def = useUtilityDataStore().dashboard(this.dashboardId) as TickDashboard;

    return def || null;
  }

  private get dashboardTiles(): DashboardTileSettings[] {
    return this.dashboard?.settings?.tiles || [];
  }

  private get tile(): DashboardTileSettings {
    return this.dashboardTiles.find(p => p.id == this.tileId);
  }




}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  width: 800px;
}
</style>
