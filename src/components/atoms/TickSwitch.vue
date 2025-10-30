<template>
  <label class="input-container">
    <input class="input" :class="{ 'trueAsSuccess': this.trueAsSuccess }" type="checkbox" v-model="value" :disabled="disabled" />
    <span class="switch"></span>
    <span class="label">
      <slot />
    </span>
  </label>
</template>

<script lang="ts">
import { ColorsEnum } from '@/TickApi';
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';
import TickInputLabel from './TickInputLabel.vue';

@Component({
  components: [TickInputLabel],
  emits: ["update:modelValue"],
})
export default class TickSwitch extends Vue {
  @VModel() private value!: boolean;
  @Prop({ default: false }) private disabled!: boolean;
  @Prop() private trueAsSuccess!: ColorsEnum;
  private hasFocus = false;

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.input-container {
  display: flex;
  align-items: center;
  min-width: 40px;

  line-height: 20px;
  font-size: $text-size-regular;
  padding: 2px 0;
  //color: var(--c-contrast);


  .label {
    margin-left: 12px;
    /* Show an ellipsis if the text takes more than one line */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Visually hide the checkbox input */
  .input {
    visibility: hidden;
    //position: absolute;
    width: 1px;
    height: 1px;
    //padding: 0;
    //margin: -1px;
    //overflow: hidden;
    //clip: rect(0, 0, 0, 0);
    // white-space: nowrap;
    //border-width: 0;
  }

  .switch {
    --switch-container-width: 40px;
    --switch-size: calc(var(--switch-container-width) / 2);
    --light-gray: #e2e8f0;
    --gray: #cbd5e0;
    --dark-gray: #a0aec0;
    --teal: #4fd1c5;
    --dark-teal: #319795;
    /* Vertically center the inner circle */
    display: flex;
    align-items: center;
    position: relative;
    height: var(--switch-size);
    flex-basis: var(--switch-container-width);
    /* Make the container element rounded */
    border-radius: var(--switch-size);
    // background-color: var(--light-gray);

    background-color: var(--c-base-300);

    /* In case the label gets really long, the toggle shouldn't shrink. */
    flex-shrink: 0;
    transition: background-color 0.2s ease-in-out;
  }

  .switch::before {
    content: "";
    position: absolute;
    /* Move a little bit the inner circle to the right */
    left: 1px;
    height: calc(var(--switch-size) - 4px);
    width: calc(var(--switch-size) - 4px);
    /* Make the inner circle fully rounded */
    border-radius: 9999px;
    background-color: white;
    border: 2px solid var(--light-gray);
    transition: transform 0.2s ease-in-out;
  }

  .input:checked+.switch {
    background-color: $brand;
  }

  .input.trueAsSuccess:checked+.switch {
    background-color: $success;
  }

  .input:checked+.switch::before {
    border-color: var(--teal);

    /* Move the inner circle to the right */
    transform: translateX(calc(var(--switch-container-width) - var(--switch-size)));
  }

  // .input:focus+.switch {
  //   border-color: var(--teal);
  // }

  .input:focus+.switch::before {
    border-color: $brand;
  }

  .input:focus:checked+.switch::before {
    border-color: var(--dark-teal);
  }

  .input:disabled+.switch {
    background-color: var(--gray);
  }

  .input:disabled+.switch::before {
    background-color: var(--dark-gray);
    border-color: var(--dark-gray);
  }
}
</style>
