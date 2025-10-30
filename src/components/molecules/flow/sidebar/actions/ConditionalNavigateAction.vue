<template>
  <div class="action">

    <SidebarPanel id="flow-general" :name="$translate(LanguagePath.App_FlowEditor_SideBar_ConditionalNavigate_Title)">
      <template #subheader>
        {{ $translate(LanguagePath.App_FlowEditor_SideBar_ConditionalNavigate_Explanation) }}
      </template>
      <div class="container">
        <TickListItem icon="navigate" :name="route.name" v-for="route in this.routes" :key="route.id" ref="editRouteButtons" @select="editCondition('editRouteButtons', route)">
          <template #actions>
            <TickButton icon="delete" v-if="!disabled" @click.stop="removeRoute(route)" class="delete small" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" />
          </template>
        </TickListItem>
      </div>
      <TickButton v-if="!disabled" @click="addRoute" :appearance="Appearance.secondary" :color="Color.contrast">Add route</TickButton>
    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import TickConditionGroupEditor from "@/components/molecules/flow/panel/TickConditionGroupEditor.vue";
import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getEmptyConditiongroup } from "@/helpers/conditionHelper";
import generateId from "@/helpers/guid";
import { jsonProxy } from "@/helpers/jsonProxy";
import { mount, unmount } from "@/helpers/mountHelper";
import { askNewName } from "@/helpers/questionHelper";
import {
  ConditionGroup,
  FlowConditionData,
  FlowDefinitionAction,
  LanguagePath,
  NextStepLogicConditionalNavigateData,
} from "@/TickApi";
import { ConditionalNavigateActionSettings } from "@/TickApiModels";
import { Component, Prop, Vue } from "vue-facing-decorator";
import ConditionEditorPanel from "../../panel/ConditionEditorPanel.vue";
import TickCondition from "../../panel/TickCondition.vue";
import TickConditionElement from "../../panel/TickConditionElement.vue";
@Component({
  emits: ["remove", "update"],
  components: {
    SidebarPanel, StorageInput, TickIcon, TickCheckbox,
    TickTextarea, TickButton,
    TickInput, TickConditionGroupEditor,
    ConditionEditorPanel, TickListItem,
  },
})
export default class ConditionalNavigateAction extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: ConditionalNavigateActionSettings;
  @Prop() private disabled!: boolean;

  private activePanel = {
    group: "",
    optionId: "",
    panelId: "",
  };

  private get data() {
    return jsonProxy<NextStepLogicConditionalNavigateData>(
      this.settings.actionDataJson || "{}",
      (json) => {
        this.settings.actionDataJson = json;
      }
    );
  }

  private get routes() {
    return this.data.navigateConditions || [];
  }

  private editCondition(fromRef: string, route: FlowConditionData) {
    this.toggleConditionPanelFor(fromRef, route.id, route.condition);
  }

  private removeRoute(route: FlowConditionData) {
    const index = this.data.navigateConditions.findIndex(
      (p) => p.id === route.id
    );
    if (index > -1) {
      this.data.navigateConditions.splice(index, 1);
      //fixme: proxy needs to see array changes
      this.data.navigateConditions = this.data.navigateConditions.slice();
    }
  }

  private addRoute() {

    askNewName((name) => {
      const newRoute = {
        condition: getEmptyConditiongroup(name),
        index: this.data.navigateConditions.length,
        targetStepId: null,
        id: generateId(),
        name: name,
      };

      this.data.navigateConditions.push(newRoute);

      //fixme: proxy needs to see array changes
      this.data.navigateConditions = this.data.navigateConditions.slice();

      // edit the condition
      this.editCondition('editRouteButtons', newRoute)
    }, '');


  }

  beforeUnmount() {
    this.closeActivePanel();
  }

  private patchConditionGroup(routeId: string, condition: ConditionGroup) {
    const route = this.data.navigateConditions.find((p) => p.id == routeId);
    route.condition = JSON.parse(JSON.stringify(condition));

    route.name = condition.name;

    this.data.navigateConditions = this.data.navigateConditions.slice();
  }

  private toggleConditionPanelFor(
    fromRef: string,
    routeId: string,
    condition: ConditionGroup
  ) {
    const isCurrentActivePanel =
      this.activePanel.group === fromRef &&
      this.activePanel.optionId === condition.id;
    this.closeActivePanel();

    if (isCurrentActivePanel) {
      return;
    }

    this.activePanel.group = fromRef;
    this.activePanel.optionId = routeId;
    this.activePanel.panelId = this.openPanel(fromRef, {
      condition: condition,
      disabled: this.disabled,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private openPanel(id: string, props?: Record<string, any>) {

    return mount(
      ConditionEditorPanel,
      {
        props: {
          ...props,
        },
        events: {
          cancel: () => {
            this.closeActivePanel();
          },
          exit: (conditionGroup: ConditionGroup) => {
            this.patchConditionGroup(this.activePanel.optionId, conditionGroup);
            this.closeActivePanel();
          },
        },
        loadComponents: [TickConditionElement, TickCondition, TickConditionGroupEditor]
      },

    );
  }
  private closeActivePanel() {
    if (this.activePanel.panelId) {
      unmount(this.activePanel.panelId);
    }

    this.activePanel.group = "";
    this.activePanel.panelId = "";
    this.activePanel.optionId = "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.title {
  font-weight: 600;
}

.container {
  margin-bottom: 10px;
}
</style>
