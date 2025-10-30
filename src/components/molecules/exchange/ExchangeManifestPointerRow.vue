<template>
  <tr>
    <td style="width:50px">
      <TickIcon :name="icon" />
    </td>
    <td>
      {{ name }}
    </td>
    <td style="width:200px">
      {{ description }}
    </td>
  </tr>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import { getCollectionObjectTypeIcon, getCollectionObjectTypeName } from "@/helpers/enumsHelper";
import { translate } from "@/plugins/translatePlugin";
import { ExchangeManifestInstallPointerType, ExchangeManifestPointer, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from 'vue-facing-decorator';

export enum EditorMessageType {
  Message = "message",
  Warning = "warning",
}

@Component({
  emits: [],
  components: { TickIcon },
})
export default class ExchangeManifestPointerRow extends Vue {
  @Prop() private pointer!: ExchangeManifestPointer;


  private get name() {
    return this.pointer?.name
  }


  private get description() {
    switch (this.pointer.pointerType) {
      case ExchangeManifestInstallPointerType.Label:
        return translate(LanguagePath.Label);
      case ExchangeManifestInstallPointerType.DatabagItem:
        return translate(LanguagePath.States_Variables);
      case ExchangeManifestInstallPointerType.CollectionItem:
        return this.collectionName
      default:
        return "-";
    }
  }


  private get icon() {
    switch (this.pointer.pointerType) {
      case ExchangeManifestInstallPointerType.Label:
        return "label";
      case ExchangeManifestInstallPointerType.DatabagItem:
        return "databagitem";
      case ExchangeManifestInstallPointerType.CollectionItem:
        return getCollectionObjectTypeIcon(this.pointer.collectionObjectType);
      default:
        return "-";
    }

  }

  private get collectionName() {
    return getCollectionObjectTypeName(this.pointer.collectionObjectType);

  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
