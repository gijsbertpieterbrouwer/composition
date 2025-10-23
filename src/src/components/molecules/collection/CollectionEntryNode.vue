<template>
  <div class="node" :data-id="getId" :data-type="getType">
    <TickListItem :icon="icon" :name="name" @select="selectItem">
      <CollectionObjectVersion v-for="version in this.versions" :key="version.id" :item="version" @select="selectVersion" :showEnvironment="showEnvironment" />
    </TickListItem>
  </div>
</template>

<script lang="ts">
import { CollectionObject, CollectionObjectTypeEnum } from '@/TickApi';
import TickIcon from "@/components/TickIcon.vue";
import TickListItem from '@/components/atoms/TickListItem.vue';
import { getCollectionObjectTypeIcon } from '@/helpers/enumsHelper';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import CollectionObjectVersion from './CollectionObjectVersion.vue';
import { SelectedItem } from './CollectionsViewer.vue';

@Component({
  name: "CollectionEntryNode",
  emits: [
    "select",
  ],
  components: {
    CollectionObjectVersion, TickIcon, TickListItem
  }
})

export default class CollectionEntryNode extends Vue {
  // todo: allow selecting versions

  @Prop() private item!: CollectionObject;

  private get name(): string {
    return this.item.name || "-";
  }


  private get getId() {
    return this.item.id;
  }

  private get getType() {
    return this.item.objectType;
  }

  private get showEnvironment() {
    return this.item.objectType == CollectionObjectTypeEnum.Flow;
  }

  private get versions() {

    return this.item.versions || [];
  }
  private selectItem() {

    const selectedItem: SelectedItem = { id: this.item.id, versionId: this.item.currentVersionId, objectType: this.item.objectType, collectionObject: this.item };
    this.$emit('select', selectedItem);
  }

  private selectVersion(versionId: string) {

    const selectedItem: SelectedItem = { id: this.item.id, versionId: versionId, objectType: this.item.objectType, collectionObject: this.item };
    this.$emit('select', selectedItem);
  }

  private get icon() {
    return getCollectionObjectTypeIcon(this.item.objectType);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.collection-entry-node {
  border: 1px solid $grey300;
  display: grid;
  grid-template-columns: 48px 1fr 32px;
  grid-template-areas: "icon content indicator";
  align-items: center;
  width: 100%;
  background-color: #fff;

  &:not(:last-of-type) {
    border-bottom-width: 0;
  }
}

.indicator {
  grid-area: indicator;
  justify-self: center;
}

.node-icon {
  grid-area: icon;
  display: grid;
  justify-content: center;
  align-content: center;
  background-color: #efefef;
  height: 90%;
  width: 90%;
  margin-left: 5%;
}

.content {
  grid-area: content;
  padding: 12px 10px;
  text-align: left;
}

.node-name {
  font-size: 14px;
  line-height: 20px;
}

.node-description {
  font-size: $text-size-regular;
  line-height: 16px;
  color: $grey900;
}
</style>
