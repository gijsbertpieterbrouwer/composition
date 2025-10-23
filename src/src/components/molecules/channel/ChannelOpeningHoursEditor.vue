<template>
  <div class="item" v-if="data">

    <span class="name">{{ this.name }}</span>
    <TickSwitch class="allday" v-model="openAllDay" :disabled="disabled" :title="$translate(LanguagePath.App_ChannelEditor_Chatwidget_OpeningHoursEditor_AllDay)" />

    <div class='opening-hours' :class="{ 'all-day': this.openAllDay }">
      <TickInput class="hours" type="number" :max="23" :min="0" v-model="fromHours" :placeholder="$translate(LanguagePath.Hour)" :disabled="disabled || this.openAllDay" />:
      <TickInput class="minutes" type="number" :max="59" :min="0" v-model="fromMinutes" :placeholder="$translate(LanguagePath.Minute)" :disabled="disabled || this.openAllDay" />
      {{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_OpeningHoursEditor_Until) }}
      <TickInput class="hours" type="number" :max="23" :min="0" v-model="toHours" :placeholder="$translate(LanguagePath.Hour)" :disabled="disabled || this.openAllDay" />:
      <TickInput class="minutes" type="number" :max="59" :min="0" v-model="toMinutes" :placeholder="$translate(LanguagePath.Minute)" :disabled="disabled || this.openAllDay" />
    </div>
  </div>
</template>

<script lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import { stringToNumber } from "@/helpers/stringHelper";
import { LanguagePath, OpeningHoursItem, } from "@/TickApi";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";


@Component({
  emits: ["update:modelValue"],
  components: { TickInput, TickListItem, TickSwitch },
})
export default class ChannelOpeningHoursEditor extends Vue {
  @VModel({ required: true }) private data!: OpeningHoursItem;
  @Prop() private disabled!: boolean;
  @Prop() private name!: string;
  LanguagePath = LanguagePath

  private delete() {
    this.$emit("delete");
  }

  private get openAllDay() {
    return this.data.allDay;
  }
  private set openAllDay(to: boolean) {
    this.data.allDay = to
    this.updateModel();
  }

  private normalize(input: string | number, min: number, max: number) {
    let val = stringToNumber(input);
    if (val > max) { val = max; }
    if (val < min) { val = min; }

    return val;
  }

  private get fromHours() {
    return this.data.fromUtcHours || 0
  }
  private set fromHours(to: number) {
    this.data.fromUtcHours = this.normalize(to, 0, 23);
    this.updateModel();
  }

  private get fromMinutes() {
    return this.data.fromUtcMinutes || 0
  }
  private set fromMinutes(to: number) {
    this.data.fromUtcMinutes = this.normalize(to, 0, 59);
    this.updateModel();
  }


  private get toHours() {
    return this.data.toUtcHours || 0
  }
  private set toHours(to: number) {
    this.data.toUtcHours = this.normalize(to, 0, 23);
    this.updateModel();
  }

  private get toMinutes() {
    const minutes = this.data.toUtcMinutes || 0;
    return minutes;
  }
  private set toMinutes(to: number) {
    this.data.toUtcMinutes = this.normalize(to, 0, 59);
    this.updateModel();
  }


  private updateModel() {
    this.$emit("update:modelValue", this.data);
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.item {
  display: flex;
  gap: 5px;
  align-content: center;


  .name {
    width: 130px;
    align-content: center;
  }

  .allday {
    width: 100px;
  }

  .opening-hours {
    flex-grow: 1;
    display: flex;
    gap: 5px;
    align-items: baseline;
    font-size: $text-size-regular;

    .hours {
      width: 60px;
    }

    .minutes {
      width: 60px;
    }
  }

}
</style>
