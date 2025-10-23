<template>
  <SidebarPanel id="ticket-pause" :name="$translate(LanguagePath.App_FlowEditor_ActionDelayBeforeNextMsEditor_Title)">

    <div class="holder">
      <div class="delay">
        <span class="ms-suffix">{{ $translate(LanguagePath.App_FlowEditor_ActionDelayEditor_Prefix) }}</span>
        <TickInput class="ms" type="number" v-model="delayMs" :disabled="disabled" /> <span class="ms-suffix">{{ $translate(LanguagePath.App_FlowEditor_ActionDelayEditor_Sufffix) }}</span>
      </div>
    </div>
  </SidebarPanel>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import TickInput from '@/components/atoms/TickInput.vue';
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import { LanguagePath } from '@/TickApi';

@Component({
  emits: ["update:modelValue", "remove"],
  components: { TickTextarea, TickInput, ThenHr, SidebarPanel },
})
export default class ActionDelayBeforeNextMsEditor extends Vue {
  LanguagePath = LanguagePath
  @VModel() private value!: number;
  @Prop() private disabled!: boolean;

  private get delayMs() {
    return (this.value / 1000) || 0;
  }

  private set delayMs(to: number) {
    this.value = to * 1000;
    // this.update();
  }

  // private update() {
  //   this.$emit("update:modelValue", this.value);
  // }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.holder {

  .delay {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    //padding: 10px;


    .ms {
      width: 50px;
      margin: 0px 5px;
    }

    .ms-suffix {
      //flex-grow: 1;
      font-size: $text-size-regular;
    }

  }

}
</style>
