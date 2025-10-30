<template>
  <TickDialogPanel :panelOptions="panelOptions" class="panel" @close="$emit('close')">
    <template #title> {{ $translate(LanguagePath.App_AvatarSelector_Title) }}</template>
    <template #actions>
      <TickColorSelector :allowAsSubDialog="true" v-model="selection.color" />
    </template>
    <div class="content">

      <div class="groups">

        <div class="group" v-for="(item, index) in this.options" :key="index">
          <div class="group-header">
            <TickHeading>{{ item.name }}</TickHeading>
          </div>

          <div class="options-wrapper">

            <template v-for="(option, index) in item.styles" :key="index">
              <FileDataUploaderZone v-if="option.isCustom" @uploadsCompleted="uploadsCompleted" class="option profile-picture" :disableUploaderView="true" :fileType="FileSourceType.InternalAvatar"
                :disableMultiple="true" :accepts="acceptableAvatarFormats">

                <div class="camera-wrapper">
                  <TickIcon class="camera" name="camera" />
                </div>
              </FileDataUploaderZone>

              <TickAvatar v-else class="option" :class="{ 'selected': this.optionIsSelected(option) }" @click="select(option)" @dblclick.prevent="select(option, true)" :color="selection.color"
                :sizePx="sizePx" :online="false" :fileId="option.fileId" :name="name" />

            </template>

          </div>
        </div>
      </div>

    </div>

    <template #footer>
      <TickButton @click="useSelection">{{ $translate(LanguagePath.App_Use) }}</TickButton>
    </template>

  </TickDialogPanel>
</template>

<script lang="ts">
import TickButton, { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import TickDialogPanel from "@/components/panels/TickDialogPanel.vue";
import { focus } from "@/directives";
import { acceptableAvatarFormats } from "@/helpers/fileHelper";
import { getAvatarStyles } from "@/services/TeamsService";
import { ColorsEnum, FileLink, FileSourceType, LanguagePath, TickUserAvatarStyleGroup, UserAvatarStyle, UserTypeEnum } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickAvatar from "../atoms/TickAvatar.vue";
import { TickPanelOptions } from "../atoms/TickPanel.vue";
import FileDataUploaderZone from "../molecules/files/FileDataUploaderZone.vue";
import TickColorSelector from "../molecules/Selectors/TickColorSelector.vue";
import TickIcon from "../TickIcon.vue";


export interface AvatarSelection {
  color?: ColorsEnum;
  fileId?: string;
}

@Component({
  directives: { focus },
  emits: ["select", "close"],
  components: {
    TickDialogPanel,
    TickAvatar,
    FileDataUploaderZone,
    TickButton,
    TickIcon,
    TickColorSelector

  },
})
export default class AvatarSelectorPanel extends Vue {
  ButtonAppearance = ButtonAppearance;
  ButtonSize = ButtonSize;
  ButtonColor = ButtonColor;
  LanguagePath = LanguagePath
  FileSourceType = FileSourceType

  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private type?: UserTypeEnum;
  @Prop() private fileId: string;
  @Prop() private name: string;
  @Prop() private color: ColorsEnum;

  private options: TickUserAvatarStyleGroup[] = [];
  private sizePx = 120;
  private selection: AvatarSelection = {};

  private refresh() {
    if (this.type != undefined && this.type != null) {
      getAvatarStyles(this.type).then((styles) => {
        this.options = styles
      }).catch(() => {
        //do nothing
      });
    } else {
      this.options = [
        {
          name: "Custom",
          styles: [
            {
              fileId: null,
              isCustom: false,

            },
            {
              fileId: null,
              isCustom: true,

            }
          ]
        }
      ]
    }
  }

  mounted() {
    this.selection = {
      color: this.color,
      fileId: this.fileId,
    };

    this.refresh();
  }


  private useSelection() {
    this.$emit("select", this.selection);
  }

  private select(to: UserAvatarStyle, directEmit?: boolean) {
    this.selection.fileId = to.fileId

    if (directEmit) {
      this.useSelection();
    }
  }

  private optionIsSelected(item: UserAvatarStyle): boolean {
    return this.selection.fileId == item.fileId
  }
  private uploadsCompleted(data: FileLink[]) {
    if (!data || !data.length) { return; }
    this.selection.fileId = data[0].fileDataId

    this.useSelection();
    // this.$emit("select", data[0].fileDataId);
  }

  private get acceptableAvatarFormats(): string[] {
    return acceptableAvatarFormats()
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  min-width: 400px;
  width: clamp(400px, 70vw, 1400px);
  display: grid;
  gap: 20px;

  .color-selector {}

  .camera-wrapper {
    width: 120px;
    height: 120px;
    display: inline-block;
    padding: 20px;
    border: 4px dotted var(--c-base-100);
    border-radius: 100px;
    justify-content: center;
    display: grid;
    align-content: center;

    .camera {
      width: 40px;
      height: 40px;
    }

    &:hover {
      background-color: var(--c-base-300);
    }


  }

  .groups {
    display: grid;
    gap: 40px;

    .group {
      display: grid;
      gap: 10px;

      .group-header {}

      .options-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;

        .option {
          display: inline-block;

          &:hover {
            box-shadow: 0 0 8px 4px var(--c-contrast);
          }

          &.selected {
            box-shadow: 0 0 8px 4px var(--c-primary);
          }

        }
      }
    }
  }
}
</style>
