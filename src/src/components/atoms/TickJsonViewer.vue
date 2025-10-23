<template>
  <div class="wrapper">
    <div class="content text-selectable">
      <vue-json-pretty v-if="isValidJson" :data="asJsonObject" :deep="deepCollapse" :showLength="true" :show-line="true" :showIcon="false" @node-click="nodeClick" />
      <pre v-else>{{ this.indentedBodyJson }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { asJsonObject } from "@/helpers/jsonHelper";
import { Component, Prop, Vue } from "vue-facing-decorator";
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';


@Component({
  emits: ["selectPath"],
  components: {
    VueJsonPretty
  },
})
export default class TickJsonViewer extends Vue {
  @Prop({ default: "" }) private json!: string;
  @Prop({ default: false }) private noCollapse!: boolean;
  @Prop({ default: "" }) private rootPath!: string;

  private defaultCollapse = 3;
  private maxCollapse = 9999;


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private nodeClick(event: any) {
    let path = event.path as string;
    const root = "root";
    if (path.startsWith(root)) {
      path = path.substring(root.length);
    }


    const isArrayIndicator = path.startsWith("[");
    const seperator = isArrayIndicator ? "" : ".";
    path = this.rootPath
      ? this.rootPath + seperator + path
      : path;

    const prefixDot = ".";
    if (path.startsWith(prefixDot)) {
      path = path.substring(prefixDot.length);
    }

    this.$emit("selectPath", path);
  }

  private get deepCollapse() {
    return this.noCollapse ? this.maxCollapse : this.defaultCollapse
  }

  //https://www.npmjs.com/package/vue-json-pretty
  private get isValidJson() {
    return this.asJsonObject != null;
  }

  private get asJsonObject(): unknown {
    return asJsonObject(this.json)
  }

  private get indentedBodyJson(): string {
    const r = this.json as string;
    // no json => return as is
    //if (!r || !r.trim().startsWith("{")) { return r; }

    try {
      const jsonObj = JSON.parse(r);
      const str = JSON.stringify(jsonObj, null, 2); // spacing level = 2
      return str;
    } catch (error) {
      return r;
    }
  }
}
</script>
<style lang="scss">
@import "@/styles/theme";

.vjs-tree-node {

  &:hover {
    color: var(--c-contrast);
    background-color: var(--c-base-200);
    opacity: 1;

  }
}



.vjs-value {
  &.vjs-value-string {
    color: $palette-teal;
  }

  &.vjs-value-number {
    color: $palette-red;
  }

  &.vjs-value-boolean {
    color: $palette-blue;
  }
}
</style>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  font-size: 0.7em;
}
</style>
