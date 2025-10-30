<template>
  <div class="attempt">
    {{ $translate(LanguagePath.App_FlowEditor_WaitingAttempt_Prefix) }}
    &nbsp;
    <TickInput class="sec" type="number" v-model="await" :disabled="disabled" /> <span class="seconds"> {{ $translate(LanguagePath.App_FlowEditor_WaitingAttempt_Suffix) }}</span>
    <TickButton @click="remove" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" icon="delete"></TickButton>
    <TickTextarea v-model="message" class="message" :disabled="disabled" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import { BotAttemptSettings, StorageLocation, LanguagePath } from '@/TickApi';
import TickInput from '@/components/atoms/TickInput.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import { tokenize } from '@/directives';
import { getFlowReadStorageLocations } from '@/helpers/enumsHelper';
@Component({
  directives: { tokenize },
  emits: ["update:modelValue", "remove"],
  components: { TickTextarea, TickInput, ThenHr, TickButton },
})
export default class BotWaitingForAnswerAttemptEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @VModel() private value!: BotAttemptSettings;
  @Prop() private disabled!: boolean;

  private get readLocations() {
    return getFlowReadStorageLocations();
  }

  private get await() {
    return this.value.awaitSeconds || 30;
  }

  private set await(to: number) {
    this.value.awaitSeconds = to;
    this.update();
  }

  private get message() {
    return this.value.message || "";
  }

  private set message(to: string) {
    this.value.message = to;
    this.update();
  }

  private remove() {
    this.$emit("remove");
  }

  private update() {
    this.$emit("update:modelValue", this.value);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.attempt {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  border: dotted 1px var(--c-contrast);
  padding: 10px;
  border-radius: 8px;
  font-size: $text-size-regular;

  .sec {
    width: 70px;
    margin: 0px 5px;
  }

  .seconds {
    flex-grow: 1;
  }

  .message {
    width: 100%;
  }



}
</style>
