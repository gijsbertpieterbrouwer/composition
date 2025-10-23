<template>
  <div>
    <TickSwitch :disabled="disabled" v-model="active">Use wait attempts</TickSwitch>
    <EditorMessage v-if="flowWillWaitIndefinitely" :type="EditorMessageType.Warning" title="Waiting indefinitely for answer" message="When not given an answer, this flow wil wait indefinitely." />

    <div class="attempts" v-if="active">
      <template v-for="(attempt, index) in this.value.attemptSettings" :key="index">
        <BotWaitingForAnswerAttemptEditor :disabled="disabled" class="attempt" @remove="remove(index)" @update:modelValue="update" v-model="value.attemptSettings[index]" />
      </template>

      <div class="explanation" v-if="!flowWillWaitIndefinitely"> {{ $translate(LanguagePath.App_FlowEditor_WaitingAttempt_FinishWaiting_Explanation) }}</div>

      <TickButton :disabled="disabled" @click="addEmpty" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular">{{
        $translate(LanguagePath.App_FlowEditor_WaitingAttempt_AddButton_Title) }}
      </TickButton>
    </div>


  </div>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';

import { BotWaitingForResponseSettings, LanguagePath } from '@/TickApi';
import BotWaitingForAnswerAttemptEditor from './BotWaitingForAnswerAttemptEditor.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';

@Component({
  emits: ["update:modelValue"],
  components: { EditorMessage, BotWaitingForAnswerAttemptEditor, TickButton, TickSwitch },
})
export default class BotWaitingForAnswerEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  EditorMessageType = EditorMessageType
  @VModel() private value!: BotWaitingForResponseSettings;
  @Prop() private disabled!: boolean;

  private addEmpty() {
    this.value.attemptSettings.push({
      awaitSeconds: 30,
      message: "?"
    });

    this.update();
  }

  private get flowWillWaitIndefinitely() {
    return !this.value.active || !this.value.attemptSettings || !this.value.attemptSettings.length
  }

  private get active() {
    return this.value.active;
  }
  private set active(to: boolean) {
    this.value.active = to;
    this.update();
  }

  private remove(index: number) {
    if (this.disabled) { return; }
    this.value.attemptSettings.splice(index, 1);
    this.update();
  }

  private update() {
    this.$emit("update:modelValue", this.value,
    );
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.explanation {
  font-size: $text-size-regular;
}

.attempts {
  margin-top: 20px;
  display: grid;
  gap: 20px;


  label {
    line-height: 20px;
    font-size: 16px;
    padding: 2px 0;
    color: $grey700;
  }


  .attempt {}
}
</style>
