<template>
  <div class="databag-editor">

    <template v-if="loaded && this.databag">

      <TickScreen :title="name" hideScreenEstate="true" :showScreenEstate="showScreenEstate">
        <template v-slot:actions>
          <TickButton @click="save" :disabled="!readyForSave">{{ $translate(LanguagePath.App_Save) }}</TickButton>
        </template>

        <template v-slot:default>
          <TickEditorPanel v-for="(item, index) in this.items" :key="index">
            <TickButton @click="remove(item)" icon="delete" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Remove) }}</TickButton>
            <DataBagItem :item="item" :location="location"></DataBagItem>
          </TickEditorPanel>

          <TickButton v-if="allowAdd" @click="addEmpty">{{ $translate(LanguagePath.App_Add) }}</TickButton>
        </template>

      </TickScreen>
    </template>
    <template v-else>
      loading...
    </template>

  </div>
</template>

<script lang="ts">

import { DataItemDataType, LanguagePath, StorageLocation, SubscriptionCostItemType, TickDataBag, TickDatabagItem, } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickInput from "@/components/atoms/TickInput.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickScreen from '../editor/TickScreen.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import useDataBagsStore from '@/store/databags';
import DataBagItem from './DatabagItem.vue';
import useUserStore from '@/store/user';


@Component({
  emits: ["deleted", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, DataBagItem },
})
export default class DataBagEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private activeId!: string;
  @Prop({ default: true }) private showScreenEstate!: true;
  private databag: TickDataBag = null;
  private loaded = false;

  private get location(): StorageLocation {
    return this.databag.storage;
  }

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useDataBagsStore().get(id).then(databag => {
      this.databag = databag;
      this.loaded = true;
    })
  }
  mounted() {
    this.activate(this.activeId);
  }


  private get name() {
    return this.databag.storageName;
  }



  private get readyForSave() {
    return true;
  }

  private get items() {
    return this.databag.items
  }

  private addEmpty() {
    this.databag.items.push({
      data: "",
      path: this.databag.storageName.toLowerCase() + ".",
      dataType: DataItemDataType.Text,
    });
  }


  private get allowAdd(): boolean {
    return this.addAllowedInPlan;
  }

  private get addAllowedInPlan() {
    const currentNr = this.items.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.DatabagItem, currentNr)
  }


  private remove(item: TickDatabagItem) {

    const index = this.items.findIndex(s => s.path === item.path);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }

  private save() {
    useDataBagsStore().save(this.databag.id);
    this.$emit("saved");
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
