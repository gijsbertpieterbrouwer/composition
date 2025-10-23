<template>
  <div class="container">
    <div class="panel" :class="{ 'loading': this.busy }" :style="{ width: (this.calculatedFormWidth) + 'px' }">

      <div>
        <TickIcon class="logo" name="tickname" />
        <!-- <span class="logo-slogan">The smart helpdesk</span> -->
      </div>

      <Heading size="medium">
        <slot name="heading" />
      </Heading>
      <p class="introduction" v-if="hasSlot('introduction')">
        <slot name="introduction" />
      </p>
      <form @submit.prevent="$emit('submit')">
        <slot />

        <p class="error" v-if="hasSlot('error')">
          <slot name="error" />
        </p>

        <div class="button-row" v-if="hasSlot('button')">
          <span class="extrabuttons" v-if="hasSlot('extrabuttons')">
            <slot name="extrabuttons" />
          </span>

          <TickButton :busy="busy" :disabled="disabled" type="submit" :size="buttonSize">
            <slot name="button" />
          </TickButton>
        </div>
      </form>
    </div>
    <div class="suffix" v-if="hasSlot('suffix')" :style="{ width: (this.calculatedFormWidth || 400) + 'px' }">
      <slot name="suffix" />
    </div>
  </div>
</template>

<script lang="ts">
import TickButton from "@/components/atoms/TickButton.vue";
import Heading from "@/components/atoms/TickHeading.vue";
import TickIcon from "../TickIcon.vue";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["toggle"],
  components: {
    TickButton,
    Heading,
    TickIcon
  },
})
export default class TickForm extends Vue {
  @Prop() private disabled!: boolean;
  @Prop() private busy: boolean;
  @Prop() private formWidth: number;
  @Prop() private buttonSize: string;

  private defaultWidth = 400;
  private get calculatedFormWidth(): number {
    const preferredWidth = this.formWidth || this.defaultWidth;

    const maxWidth = screen.width;
    const setWidth = Math.min(preferredWidth, maxWidth);
    return setWidth;
  }

  private hasSlot(name: string) {
    return !!this.$slots[name];
  }

}

// <!-- export default {
//   props: {
//     disabled: Boolean,
//     busy: Boolean,
//     formWidth: Number,
//     buttonSize: String,
//   },
//   components: {
//     TickButton,
//     Heading,
//     TickIcon
//   },
//   //calculatedFormWidth
//   setup: (props: any, params: any) => {
//     const hasSlot = (name: string) => !!params.slots[name];
//     return { hasSlot };
//   },
// }; -->


</script>


<style lang="scss" scoped>
@import "@/styles/theme";

@keyframes bg-spin {
  to {
    --border-angle: 1turn;
  }
}

@property --border-angle {
  syntax: "<angle>";
  inherits: true;
  initial-value: 0turn;
}

.container {
  height: 100dvh;
  display: grid;
  gap: 10px;
  justify-content: center;
  align-content: center;

  .introduction {
    padding-bottom: 20px;
  }


}

form {
  display: grid;
  gap: 8px;


}


.panel {
  width: 100dvw;
  overflow-y: scroll;
  min-width: 400px;
  border: 1px solid $grey200;
  background-color: $white;
  color: $black;
  padding: 40px 64px;
  display: grid;
  gap: 10px;

  border-radius: 16px;
  box-shadow: 0px 4px 8px 1px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;


  &.loading {
    --border-size: 3px;
    --border-angle: 0turn;

    background-image: conic-gradient(from var(--border-angle),
        #fff,
        #fff 50%,
        #fff),
      conic-gradient(from var(--border-angle), transparent 70%, $brand2, $brand2);
    background-size: calc(100% - (var(--border-size) * 2)) calc(100% - (var(--border-size) * 2)),
      cover;
    background-position: center center;
    background-repeat: no-repeat;
    animation: bg-spin 5s linear infinite;

  }




}


.logo {
  transform: translateX(-18px);
  width: 120px;
  height: 40px;
  fill: $brand2;
  display: inline-block;
}

.logo-slogan {
  margin-left: -10px;
  font-size: 1em;
  opacity: 0.7;
}


.button-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 5px;

  .extrabuttons {}
}

.error {
  color: $error;
  margin-top: 10px;
  font-size: $text-size-regular;
}

.suffix {
  color: $grey900;
  margin: 24px auto 0 auto;
  text-align: center;
}



@media only screen and (max-width: 1024px) {
  .container {
    align-content: start;
    height: 100%;
    gap: 30px;

    .panel {
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;

      form {
        gap: 25px;

      }
    }

    .suffix {

      align-self: flex-end;
    }

  }


}
</style>
