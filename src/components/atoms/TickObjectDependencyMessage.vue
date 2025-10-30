<template>
  <tr>
    <td>
      <TickIcon :name="icon" />
    </td>
    <td>
      {{ this.text }}
    </td>
    <td>
      <TickButton v-if="hasDependentObject" @click="navigateToDependentObject" :appearance="ButtonAppearance.secondary" :color="ButtonColor.contrast" :size="ButtonSize.mini">Open
      </TickButton>
    </td>
  </tr>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import { RouterToItem, RouterToKnowledgeBase, RouterToMetadataComponent, RouterToTaskDefinition } from '@/router';
import { CollectionObjectTypeEnum, ObjectDependency, ObjectTypeEnum } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from './TickButton.vue';


@Component({
  name: "TickObjectDependencyMessage",
  emits: [
    "close",
  ],
  components: {
    TickIcon,
    TickButton
  }
})

export default class TickObjectDependencyMessage extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;

  @Prop() private data!: ObjectDependency;

  private get text() {
    return this.data?.message
  }

  private get icon() {
    return this.data?.required ? "warning" : "message";
  }

  private get hasDependentObject() {
    return this.data.required && this.data.dependentObjectType != null && this.data.dependentObjectId;
  }

  private navigateToDependentObject() {
    if (!this.hasDependentObject) { return; }

    switch (this.data.dependentObjectType) {
      case ObjectTypeEnum.Adapter:
        RouterToItem(CollectionObjectTypeEnum.DataAdapter, this.data.dependentObjectId, this.data.dependentObjectVersionId);
        break;
      case ObjectTypeEnum.Flow:
        RouterToItem(CollectionObjectTypeEnum.Flow, this.data.dependentObjectId, this.data.dependentObjectVersionId);
        break;
      case ObjectTypeEnum.KnowledgeBase:
        RouterToKnowledgeBase(this.data.dependentObjectId);
        break;
      case ObjectTypeEnum.MetaDataComponent:
        RouterToMetadataComponent(this.data.dependentObjectId);
        break;
      case ObjectTypeEnum.Task:
        RouterToTaskDefinition(this.data.dependentObjectId);
        break;
      case ObjectTypeEnum.WorkspaceFile:
        RouterToTaskDefinition(this.data.dependentObjectId);
        break;
    }
    this.$emit("close")
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list-item {
  overflow: hidden;

  &:not(:last-child) {
    border-bottom: 1px solid var(--c-base-200);
  }

  .list-button {
    display: grid;
    grid-template-columns: 48px 1fr auto 32px;
    grid-template-areas: "icon content actions indicator";
    align-items: center;
    width: 100%;

    &:hover {
      background-color: hsla(c("base-hsl"), 0.4);
    }
  }

  .icon {
    grid-area: icon;
    display: grid;
    justify-content: center;
    align-content: center;

    height: 90%;
    width: 90%;
    margin-left: 5px;
    border-radius: 4px;
  }

  .content {
    grid-area: content;
    padding: 8px 10px;
    text-align: left;
  }

  .actions {
    padding-right: 10px;
  }

  .name {
    font-size: 14px;
    line-height: 20px;
  }

  .description {
    font-size: $text-size-regular;
    line-height: 16px;

    color: var(--c-contrast);
    opacity: 0.7;
  }
}
</style>
