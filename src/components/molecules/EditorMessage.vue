<template>
  <div class="message-holder">
    <div class="header" v-if="this.title">
      <TickIcon :name="icon" /> {{ this.title }}
    </div>
    <div class="content">
      <TickIcon v-if="!this.title" :name="icon" />{{ this.message }}
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import { Component, Prop, Vue } from 'vue-facing-decorator';

export enum EditorMessageType {
  Message = "message",
  Warning = "warning",
}

@Component({
  emits: [],
  components: { TickIcon },
})
export default class EditorMessage extends Vue {
  @Prop() private type!: EditorMessageType;
  @Prop() private title!: string;
  @Prop() private message!: string;

  private get icon() {
    switch (this.type) {
      case EditorMessageType.Warning:
        return "warning";
      case EditorMessageType.Message:
        return "message";
    }

    return "";
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.message-holder {
  border-radius: 10px;
  border: 1px solid var(--c-contrast);
  padding: 12px;
  margin: 20px 0px;
  display: grid;
  gap: 5px;


  .header {
    margin-bottom: 10px;
    font-weight: 600;
  }

  .content {
    font-size: $text-size-regular;
    opacity: 0.7;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

}
</style>
