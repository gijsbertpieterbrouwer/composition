<template>
  <TickButton :title="tooltip" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" @click="click">{{ this.normalizedLabel }} </TickButton>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import { replaceAll } from "@/helpers/stringHelper";
import { openUrl } from "@/services/urls";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  name: "GenericMetaDataComponentDataItem",
  emits: [],
  components: { TickButton },
})
export default class GenericMetaDataComponentButtonDataItem extends Vue {
  Appearance = Appearance;
  Color = Color;
  Size = Size

  @Prop() private data!: string;
  @Prop() private label!: string;

  private get urlName() {
    const url = new URL(this.data)
    if (url.pathname.length) {
      const parts = url.pathname.split("/");
      const lastPart = parts[parts.length - 1];

      const normalized = replaceAll(lastPart, ["%20", "_", "-"], " ");

      return normalized;
    }


    return "Open";
  }

  private get normalizedLabel() {
    return this.label || this.urlName
  }

  private get tooltip() {
    const params = this.urlParams;
    return params.target == "new" ? `Open ${this.data} in new window` : `Open ${this.data} in popup`
  }

  private get urlParams() {
    const params = new Proxy(new URLSearchParams(this.data), {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (searchParams, prop) => searchParams.get(prop as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any;

    return params;
  }


  private click() {
    const params = this.urlParams;
    var openwindow = (params.target == "new") ? true : false;

    var width = params.width || 700;
    var height = params.height || 700;

    if (openwindow) {
      openUrl(this.data);
    } else {
      this.popupCenter(this.data, this.label, width, height);
    }
  }

  private popupCenter(url: string, title: string, w: number, h: number) {
    var left = window.screenLeft + window.innerWidth / 2 - w / 2;
    var top = window.screenTop + window.innerHeight / 2 - h / 2;
    window.open(
      url,
      title,
      "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=" +
      w +
      ", height=" +
      h +
      ", top=" +
      top +
      ", left=" +
      left
    );
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
