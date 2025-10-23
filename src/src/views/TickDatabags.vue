<template>
  <template v-if="hasActiveItem">
    <DataBagEditor :activeId="selectedItemId" />
  </template>
  <template v-else>
    <TickScreen title="States & Variables">
      <template v-slot:actions>
        <TickButton v-if="allowEdit" @click="saveDefinitionItems" :disabled="!allowEdit">{{ $translate(LanguagePath.App_Save) }}</TickButton>
      </template>

      <template v-slot:default>

        <div class="info">State variables are used to fill messages, data-adapters and steer flows.
          Example: You define a contact.age variable. You can use it as such: Your age is: &#123;&#123;contact.age&#125;&#125;. => The result will look like "Your age is 37".
          Variables can be used in:
          <ul class="styledList">
            <li>
              Messaging: Canned responses as well as a direct message
            </li>
            <li>
              Data-adapters: In the body but also in the url leading towards the external API. <br /> The API-response (or a part of) can also be saved in a variable.
            </li>
            <li>
              Flows: Use them to steer, or fill variables by asking questions.
            </li>
          </ul>

        </div>

        <DatabagItemDefinitionsEditor />

      </template>
    </TickScreen>
  </template>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-facing-decorator";

import TickButton from "@/components/atoms/TickButton.vue";
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";

import TickListItem from "@/components/atoms/TickListItem.vue";
import DataBagEditor from "@/components/molecules/databag/DatabagEditor.vue";
import DatabagItemDefinitionsEditor from "@/components/molecules/databag/DatabagItemDefinitionsEditor.vue";
import TickEditorPanel from "@/components/molecules/editor/TickEditorPanel.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import { notifyError } from "@/notify";
import { TickRouteParams } from "@/router";
import useDataBagsStore from "@/store/databags";
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import { AuthorizationObjectType, LanguagePath, StorageLocation, TickDatabagItemDefinition, TickDataBagSummary } from "@/TickApi";

@Component({
  directives: { focus },
  components: {
    TickButton,
    DataBagEditor,
    TickIcon,
    TickScreen,
    TickEditorPanel,
    TickListItem,
    DatabagItemDefinitionsEditor,
    TickHeading
  },
})
export default class TickDataAdapters extends Vue {
  HeadingSize = HeadingSize
  LanguagePath = LanguagePath
  private selectedItemId = "";

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }

  private get summaries() {
    return useDataBagsStore().summaries;
  }
  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration);
  }

  private get hasDuplicateKeys() {
    let hasDuplicates = false;
    const items = useManagingStore().databagItemDefinitions as TickDatabagItemDefinition[] || [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (items.find(p => p.id != item.id && p.fullPath == item.fullPath)) {
        hasDuplicates = true;
        break;
      }
    }

    return hasDuplicates;
  }


  private saveDefinitionItems() {
    if (this.hasDuplicateKeys) {

      notifyError("Cannot save", "Multiple variables have the same path, please fix before save.")

      return;
    }
    useManagingStore().saveDatabagItemDefinitions().then(() => {
      //this.$emit("saved");
    });

  }

  mounted() {
    useDataBagsStore().use();

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  private getIcon(item: TickDataBagSummary) {
    if (item.storage == StorageLocation.Vault) {
      return "secure";
    } else {
      return "databag";
    }
  }

  private selectItem(item: TickDataBagSummary) {
    this.$router.push({ params: { ...this.$route.params, id: item.id } });
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.styledList {
  margin-left: 20px;
}

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 50px;
}

.info {
  font-size: 0.8em;
  opacity: 0.7;
  padding-bottom: 45px;
}
</style>
