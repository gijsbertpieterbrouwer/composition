<template>
  <tr class="wrapper">
    <td>
      <TickInput :disabled="disabled" v-model="key" :placeholder="$translate(LanguagePath.App_Name)" />
    </td>
    <td>
      <!-- <TickInput :disabled="disabled" v-model="value" :placeholder="$translate(LanguagePath.App_Value)" v-tokenize="{ locations: this.apiStorageLocations }" /> -->

      <DatabagItemSelector v-model="value" :allowCustomValue="true" :allowAsSubDialog="true" :locations="apiStorageLocations" :disabled="disabled"
        :defaultNewStorageLocation="StorageLocation.Ticket" />
    </td>

    <td class="icons">
      <TickButton v-if="allowRemove" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular" />
      <TickIcon name="secure" v-if="isAuthHeader" />
    </td>

  </tr>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickIcon from "@/components/TickIcon.vue";
import { tokenize } from '@/directives';
import { getApiReadStorageLocations } from "@/helpers/enumsHelper";
import { LanguagePath, StorageLocation, TemplateHeaderItem } from "@/TickApi";
import { toRefs } from "vue";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import DatabagItemSelector from "../Selectors/DatabagItemSelector.vue";
export interface actionPatch {
  id: string;
  settingsJson: string;
}

@Component({
  directives: { tokenize },
  emits: ["update:modelValue", "remove"],
  components: { TickInput, TickTextArea, TickIcon, TickButton, DatabagItemSelector },
})
export default class AdapterHeaderEditor extends Vue {
  Size = Size
  Appearance = Appearance
  Color = Color
  LanguagePath = LanguagePath
  StorageLocation = StorageLocation
  // @Prop() private header!: TemplateHeaderItem;
  @VModel({ required: true }) private data!: TemplateHeaderItem;
  @Prop({ default: false }) private isAuthHeader!: boolean;
  @Prop({ default: false }) private allowRemove!: boolean;
  @Prop({ default: false }) private disabled!: boolean;

  private emitUpdate() {
    this.$emit("update:modelValue", this.data);
  }
  private remove() {
    this.$emit("remove", this.data);
  }
  private get apiStorageLocations(): StorageLocation[] {
    return getApiReadStorageLocations();
  }

  private get key() {
    return this.data.key;
  }
  private set key(to: string) {
    this.data.key = to;
    this.emitUpdate();
  }

  private get value() {
    return this.data.value;
  }
  private set value(to: string) {
    this.data.value = to;
    this.emitUpdate();
  }

  setup(props: object) {
    const header = toRefs(props);
    return { header };
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  .icons {
    // justify-content: end;
    // display: flex;
    // padding-right: 10px;
  }
}


// .header-editor {

//   align-items: center;

//   .name,
//   .value,
//   .remove,
//   .secure {
//     display: inline-block;
//   }

//   .name {
//     width: 30%;
//   }

//   .value {
//     margin-left: 5px;
//     width: calc(70% - 25px);
//   }

//   .remove,
//   .secure {
//     width: 20px;

//   }
// }</style>
