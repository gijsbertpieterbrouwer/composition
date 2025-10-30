<template>
  <TickDialogPanel class="panel" @close="close">
    <template #title>{{ $translate(LanguagePath.App_Edit) }}</template>
    <template #actions>
      <TickButton @click="remove" icon="delete" v-if="!disabled" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast">{{ $translate(LanguagePath.App_Remove) }}</TickButton>
    </template>

    <div class="content">
      <FormFieldEditor v-if="editableData" @delete="remove" v-model="editableData" :disabled="disabled" :readLocations="readLocations" :writeLocations="writeLocations"
        :defaultNewStorageLocation="defaultNewStorageLocation" />
    </div>

    <template #footer>
      <TickButton @click="save" v-if="!disabled" :appearance="Appearance.primary" :size="Size.regular">{{ $translate(LanguagePath.App_Use) }}</TickButton>
    </template>
  </TickDialogPanel>
</template>

<script lang="ts">
import { FormFieldDefinition, LanguagePath, StorageLocation } from "@/TickApi";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickDialogPanel from '@/components/panels/TickDialogPanel.vue';
import { mount, unmount } from '@/helpers/mountHelper';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import FormFieldEditor from "../FormFieldEditor.vue";


const panelId = "FormFieldEditorPanel";

export interface FormFieldLocations {
  read: StorageLocation[]
  write: StorageLocation[]
  create: StorageLocation
}

export function removeFormFieldEditorPanelPanel() {
  unmount(panelId);
}

export function openForFieldEditorPanelPanel(locations: FormFieldLocations, disabled: boolean, field: FormFieldDefinition, patch: (to: FormFieldDefinition) => void, remove: (to: FormFieldDefinition) => void) {
  mount(FormFieldEditorPanel, {
    props: {
      disabled: disabled,
      data: field,
      readLocations: locations.read,
      writeLocations: locations.write,
      defaultNewStorageLocation: locations.create,
    },
    events: {
      close: () => {
        removeFormFieldEditorPanelPanel();
      },
      patch: (to: FormFieldDefinition) => {
        if (patch) {
          patch(to)
        }
      },
      remove: (to: FormFieldDefinition) => {
        if (remove) {
          remove(to)
        }
        removeFormFieldEditorPanelPanel();
      },
    },
  }, panelId);
}



@Component({
  emits: ["patch", "close", "remove"],
  components: { TickDialogPanel, TickButton, FormFieldEditor },
})
export default class FormFieldEditorPanel extends Vue {
  LanguagePath = LanguagePath
  Appearance = Appearance
  Color = Color
  Size = Size
  @Prop() private data!: FormFieldDefinition;
  @Prop() private disabled: boolean;
  @Prop() private readLocations: StorageLocation[];
  @Prop() private writeLocations: StorageLocation[];
  @Prop() private defaultNewStorageLocation: StorageLocation;

  private editableData: FormFieldDefinition = null;

  mounted() {
    this.editableData = this.data;
  }

  private set field(to: FormFieldDefinition) {
    this.$emit("patch", this.editableData);
  }

  beforeUnmount() {
    this.$emit("patch", this.editableData);
  }

  private save() {
    this.$emit("patch", this.editableData);
    this.close();
  }
  private remove() {
    this.$emit("remove", this.editableData);
  }

  private close() {
    this.$emit('close');
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.content {
  width: 700px;
  display: grid;
  gap: 10px;
}

.flex-row {
  display: flex;
  gap: 10px;
}
</style>
