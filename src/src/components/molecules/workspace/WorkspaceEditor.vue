<template>
  <div class="workspace-editor">
    <template v-if="loaded && this.workspace">
      <TickScreen :title="titleName">
        <template v-slot:actions>
          <TickButton @click="navigateToLogs" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.WorkspaceLogs) }}</TickButton>
          <TickButton @click="save" :disabled="!readyForSave" v-if="editallowed">{{ $translate(LanguagePath.App_Save) }}</TickButton>
        </template>

        <template v-slot:default>
          <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">
            <TickInput v-model="name" :maxlength="20">{{ $translate(LanguagePath.App_Name) }} </TickInput>

            <FileDataUploaderZone @uploadsCompleted="uploadsCompleted" class="workspace-icon" :disableUploaderView="true" :fileType="FileSourceType.WorkspaceIcon" :disableMultiple="true"
              :accepts="acceptableAvatarFormats">
              <div class="workspace-icon-content">
                <WorkspaceIcon :overrideFileId="this.editableIconFileId" :sizePx="80" />
                <div class="workspace-icon-actions">
                  <TickButton class="action" @click="resetWorkspaceIcon" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_Clear) }}</TickButton>
                </div>
              </div>
            </FileDataUploaderZone>


          </TickEditorPanel>
          <TickEditorPanel name="Integrations">
            <WorkspaceIntegrationsEditor />
          </TickEditorPanel>

        </template>
      </TickScreen>
    </template>
    <template v-else> loading... </template>
  </div>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import WorkspaceIcon from "@/components/atoms/WorkspaceIcon.vue";
import WorkspaceIntegrationsEditor from "@/components/molecules/workspaceintegration/WorkspaceIntegrationsEditor.vue";
import { acceptableImageFormats } from "@/helpers/fileHelper";
import { RouterToLogs } from "@/router";
import useUserStore from "@/store/user";
import { AuthorizationObjectType, FileLink, FileSourceType, LanguagePath, TickWorkspace } from "@/TickApi";
import { Component, Prop, Vue, Watch } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import TickScreen from "../editor/TickScreen.vue";
import FileDataUploaderZone from "../files/FileDataUploaderZone.vue";

@Component({
  emits: ["saved"],
  components: {
    TickInput,
    TickButton,
    TickScreen,
    TickEditorPanel,
    WorkspaceIntegrationsEditor,
    FileDataUploaderZone,
    WorkspaceIcon
  },
})
export default class WorkspaceEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  FileSourceType = FileSourceType

  @Prop() private activeId!: string;
  private workspace: TickWorkspace = null;
  private loaded = false;

  private editableName = "";
  private editableIconFileId = "";

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    this.workspace = useUserStore().getWorkspace(id);
    this.editableName = this.workspace.name;
    this.editableIconFileId = this.workspace.iconFileId;
    this.loaded = true;
  }

  mounted() {
    this.activate(this.activeId);
  }

  private navigateToLogs() {
    RouterToLogs();
  }

  private resetWorkspaceIcon() {
    this.editableIconFileId = null;
  }

  private uploadsCompleted(data: FileLink[]) {
    if (!data || !data.length) { return; }
    this.editableIconFileId = data[0].fileDataId


  }

  private get acceptableAvatarFormats(): string[] {
    return acceptableImageFormats();
  }


  private get editallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  private get titleName() {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
  private get name() {
    return this.editableName;
  }
  private set name(to: string) {
    this.editableName = to;
  }


  private get readyForSave() {
    return true;
  }

  private save() {

    this.workspace.name = this.editableName;
    this.workspace.iconFileId = this.editableIconFileId;

    useUserStore()
      .saveWorkspace()
      .then(() => {
        this.$emit("saved");
      });

  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.workspace-icon-content {
  display: flex;
  gap: 10px;

  .workspace-icon-actions {
    display: grid;
    align-content: end;
  }


}
</style>
