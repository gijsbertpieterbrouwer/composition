<template>
  <button :type="type" :disabled="disabled" :class="[viewstate, { 'round': round }]">
    <TickIcon class="icon" v-if="icon && (!busy || !round)" :name="icon" :class="{ 'has-label': !iconOnly }" />

    <BusyIndicator v-if="busy && round" class="icon" :loading="busy" />

    <div class="content" v-if="!iconOnly">
      <slot />
    </div>
    <BusyIndicator v-if="busy && !round" class="loader" :loading="busy" />
    <TickIndicator v-if="indicator" class="indicator" :indicator="indicator" />
  </button>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickIcon from "../TickIcon.vue";
import BusyIndicator from "./BusyIndicator.vue";
import TickIndicator, { TickIndicatorData } from "./TickIndicator.vue";

export enum Size {
  mini = "mini",
  regular = "regular",
  XXL = "xxl",
}

export enum Appearance {
  primary = "primary",
  secondary = "secondary",
  transparent = "transparent",
}

export enum Color {
  primary = "primary",
  secondary = "secondary",
  tertiary = "tertiary",
  contrast = "contrast",
  base = "base",
  failure = "failure",
  affirm = "affirm",
}

@Component({
  emits: ["update:modelValue"],
  components: { BusyIndicator, TickIcon, TickIndicator },
})
export default class TickButton extends Vue {
  @Prop({ default: "button" }) private type!: "button" | "submit" | "reset"
  @Prop({ default: false }) private busy!: boolean;
  @Prop({ default: false }) private disabled: boolean;
  @Prop({ default: "" }) private icon: string;
  @Prop({ default: Size.regular }) private size: Size;
  @Prop({ default: Appearance.primary }) private appearance: Appearance;
  @Prop({ default: Color.primary }) private color: Color;
  @Prop({ default: false }) private round: boolean;
  @Prop() private indicator?: TickIndicatorData;

  private get iconOnly() {
    return !this.$slots.default;
  }

  private get viewstate() {
    return [
      `size-${this.size}`,
      this.appearance,
      `in-${this.color}`,
      { "icon-only": this.iconOnly },
    ];
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

button {
  border-radius: 6px;
  display: flex;
  gap: 5px;
  font-size: $text-size-regular;
  line-height: 20px;
  //transition: all 100ms ease-in; // don/t use transitions here because of initial state change when using other templates(such as switching between tickets)
  align-items: center;
  justify-items: center;

  min-width: 20px;
  min-height: 20px;

  &.icon-only {

    &:not([disabled]):hover,
    &:not([disabled]):focus-visible {
      filter: brightness(112%);
      box-shadow: 0 0 2px 1px var(--c-primary);
    }
  }

  .indicator {
    position: relative;
    left: 5px;
    top: -17px;
  }


  &:disabled {
    //text-decoration-line: line-through;
    filter: grayscale(100%);
  }

  .content {
    flex-grow: 1;
    display: flex;
    gap: 5px;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;

  }

  .loader {
    width: 20px;
    height: 20px;
  }

  &.round {
    border-radius: 99px;
  }

  &.icon-only {
    align-items: center;
    justify-content: center;

  }

  &.size-regular {
    padding: 6px 12px;


    &.icon-only {
      padding: 6px;
    }
  }

  &.size-mini {
    padding: 2px 6px;


    &.icon-only {
      padding: 2px;
    }
  }

  &.size-xxl {
    padding: 10px 24px;
    font-size: 16px;

    .icon {
      width: 20px;
      height: 20px;
    }

    &.icon-only {
      padding: 10px;
    }
  }


  &.primary {
    font-weight: 500;

    &.size-mini {
      font-weight: 500;
    }


    &.in-primary {
      color: var(--c-evening-night);
      background-color: var(--c-primary);

      &:not([disabled]):hover,
      &:not([disabled]):focus-visible {
        filter: brightness(112%);
        box-shadow: 0 0 2px 1px var(--c-primary);
      }
    }

    &.in-secondary {
      color: var(--c-morning-light);
      background-color: var(--c-secondary);

      &:not([disabled]):hover,
      &:not([disabled]):focus-visible {
        filter: brightness(112%);
        box-shadow: 0 0 2px 1px var(--c-secondary);
      }
    }

    &.in-tertiary {
      color: var(--c-morning-light);
      background-color: var(--c-purple-neon);

      &:not([disabled]):hover,
      &:not([disabled]):focus-visible {
        filter: brightness(112%);
        box-shadow: 0 0 2px 1px var(--c-secondary);
      }
    }

    &.in-contrast {
      color: var(--c-base);
      background-color: var(--c-contrast);

      &:not([disabled]):hover,
      &:not([disabled]):focus-visible {
        filter: brightness(112%);
        box-shadow: 0 0 2px 1px var(--c-secondary);
      }
    }

    &.in-base {
      color: var(--c-contrast);
      background-color: var(--c-base);

      &:not([disabled]):hover,
      &:not([disabled]):focus-visible {
        filter: brightness(112%);
        box-shadow: 0 0 2px 1px var(--c-base);
      }
    }

    &.in-failure {
      color: $white;
      background-color: $delete;

      &:not([disabled]):hover,
      &:not([disabled]):focus-visible {
        filter: brightness(112%);
        box-shadow: 0 0 2px 1px var($delete);
      }
    }

    &.in-affirm {
      color: $white;
      background-color: $success;

      &:not([disabled]):hover,
      &:not([disabled]):focus-visible {
        filter: brightness(112%);
        box-shadow: 0 0 2px 1px var($success);
      }
    }
  }

  &.secondary {
    font-weight: 600;

    &.size-mini {
      font-weight: 500;
    }


    &.in-contrast {
      border: 1px solid var(--c-contrast);
      color: var(--c-contrast);

      &:hover {
        border-color: var(--c-primary);
      }

    }

    &.in-base {
      border: 1px solid var(--c-base);
      color: var(--c-base);

      &:hover {
        border-color: var(--c-primary);
      }
    }

    &.in-primary {
      border: 1px solid var(--c-primary);
      color: var(--c-primary);

      &:hover {
        border-color: var(--c-contrast);
      }
    }

    &.in-secondary {
      border: 1px solid var(--c-secondary);
      color: var(--c-secondary);

      &:hover {
        border-color: var(--c-primary);
      }
    }

    &.in-failure {
      border: 1px solid $delete;
      color: var(--c-contrast);

      &:hover {
        border-color: var(--c-contrast);
      }
    }

    &.in-affirm {
      border: 1px solid $success;
      color: var(--c-contrast);

      &:hover {
        border-color: var(--c-contrast);
      }
    }
  }
}
</style>
