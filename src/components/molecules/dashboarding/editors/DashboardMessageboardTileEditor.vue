<template>
  <div>
    <TickEditorPanel :name="$translate(LanguagePath.App_MessageBoardEditor_Title)" :noBorder="true">
      <template #actions>
        <TickColorSelector v-model="color" :allowAsSubDialog="true" />
      </template>
      <TickInput v-focus v-model="name">{{ $translate(LanguagePath.App_Title) }}</TickInput>


      <TickInputLabel>{{ $translate(LanguagePath.App_Message) }}</TickInputLabel>
      <TickEditor class="editor" v-model="message" :autoSize="true" :tokenizable="true" :locations="tokenLocations" />
    </TickEditorPanel>
  </div>
</template>

<script lang="ts">
import { ColorsEnum, LanguagePath, MessageboardTileSettings } from "@/TickApi";
import { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickInputLabel from '@/components/atoms/TickInputLabel.vue';
import { focus } from "@/directives";
import { getReadStorageLocationsForMessageBoard } from '@/helpers/enumsHelper';
import { Component, VModel, Vue } from 'vue-facing-decorator';
import TickColorSelector from '../../Selectors/TickColorSelector.vue';
import TickEditorPanel from '../../editor/TickEditorPanel.vue';
import TickEditor from '../../ticket/TickEditor.vue';

@Component({
  directives: { focus },
  emits: ["update:modelValue"],
  components: { TickInput, TickEditorPanel, TickEditor, TickInputLabel, TickColorSelector }
})
export default class DashboardMessageboardTileEditor extends Vue {
  Appearance = Appearance;
  Color = Color;
  LanguagePath = LanguagePath
  @VModel({ required: true }) private model!: Required<MessageboardTileSettings>;

  private onTileSettingsUpdate() {
    this.pushUpdate();
  }

  private pushUpdate() {
    this.$emit("update:modelValue", this.model);
  }

  private get tokenLocations() {
    return getReadStorageLocationsForMessageBoard();
  }

  private get color() {
    return this.model?.color;
  }

  private set color(to: ColorsEnum) {
    this.model.color = to ?? ColorsEnum.Grey;
    this.onTileSettingsUpdate();
  }


  private get name() {
    return this.model?.title;
  }

  private set name(to: string) {
    this.model.title = to;
  }
  private get message() {
    return this.model?.messageMarkdown;
  }
  private set message(to: string) {
    this.model.messageMarkdown = to;
  }





}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.editor {
  padding: 4px 4px 0 4px;
  border-radius: 4px;
  font-size: $text-size-regular;

  min-height: 300px;
  display: block;
  width: 100%;
  padding: 8px;

  background-color: var(--c-base-300);
  color: var(--c-contrast);
}
</style>
