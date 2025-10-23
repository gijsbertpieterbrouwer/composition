<template>

  <TickScreen :loading="!loaded" :title="name">
    <template v-slot:actions>
      <TickButton v-if="allowEdit" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
      <TickButton v-if="allowEdit" @click="save" :disabled="!readyForSave">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>

    <template v-slot:default>
      <TickEditorPanel>
        <template v-slot:explainer>
          {{ $translate(LanguagePath.App_KnowledgeBaseArticleEditor_Explanation) }}
        </template>

        <TickSwitch v-model="published" :disabled="disabled"> {{ $translate(LanguagePath.App_KnowledgeBaseArticleEditor_Publish_Title) }}</TickSwitch>

        <TickInput :maxlength="150" v-model="tagString" :disabled="disabled">{{ $translate(LanguagePath.App_KnowledgeBaseArticleEditor_Tags_Title) }}</TickInput>
        <EditorMessage v-if="showShortTagWarning" :type="EditorMessageType.Warning" title="short tags detected" message="Please make sure the tags are longer than 3 characters" />

        <TickInput :maxlength="100" v-model="name" :disabled="disabled">{{ $translate(LanguagePath.App_Title) }}</TickInput>

        <TickEditor class="tickeditor" :minimumrows="2" :maxlength="150" :maxheight="200" v-model="articleSummaryMarkdown" :disabled="disabled" :tokenizable="false"
          :placeholder="$translate(LanguagePath.App_KnowledgeBaseArticleEditor_Summary_Placeholder)">
        </TickEditor>

        <TickEditor class="tickeditor long" :minimumrows="10" :maxheight="600" v-model="articleMarkdown" :tokenizable="false" :disabled="disabled"
          :placeholder="$translate(LanguagePath.App_KnowledgeBaseArticleEditor_Article_Placeholder)">
        </TickEditor>
      </TickEditorPanel>

    </template>
  </TickScreen>
</template>


<script lang="ts">
import { AuthorizationObjectType, LanguagePath, TickKnowledgeBaseArticle, } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickInput from "@/components/atoms/TickInput.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickScreen from '../editor/TickScreen.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';
import TickEditor from '../ticket/TickEditor.vue';
import EditorMessage, { EditorMessageType } from '../EditorMessage.vue';


@Component({
  emits: ["deleted", "saved"],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, TickScreen, TickEditorPanel, TickDropdown, TickListItem, TickSwitch, TickEditor, EditorMessage },
})
export default class KnowledgeBaseArticleEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  EditorMessageType = EditorMessageType
  @Prop() private activeId!: string;
  private data: TickKnowledgeBaseArticle = null;
  private loaded = false;

  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useManagingStore().getKnowledgeBaseArticle(id).then((data: TickKnowledgeBaseArticle) => {
      this.data = data;
      this.loaded = true;
    })
  }

  private get tagString() {
    return this.data?.tags.join(",");
  }

  private set tagString(to: string) {
    const arr = to.split(",");
    this.data.tags = arr;
  }

  private get showShortTagWarning(): boolean {
    return this.tags.some(p => p && p.length < 4);
  }

  private get tags() {
    return this.data?.tags || [];
  }

  private get disabled() {
    return !this.allowEdit;
  }

  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration)
  }

  mounted() {
    this.activate(this.activeId);
  }
  private get published() {
    return this.data?.published;
  }

  private set published(to: boolean) {
    this.data.published = to;
  }
  private get name() {
    return this.data?.name;
  }

  private set name(to: string) {
    this.data.name = to;
  }
  private get articleSummaryMarkdown() {
    return this.data?.articleSummaryMarkDown;
  }

  private set articleSummaryMarkdown(to: string) {
    this.data.articleSummaryMarkDown = to;
  }
  private get articleMarkdown() {
    return this.data?.articleMarkdown;
  }

  private set articleMarkdown(to: string) {
    this.data.articleMarkdown = to;
  }

  private get readyForSave() {
    if (stringIsNullOrEmpty(this.name)) { return false; }
    if (stringIsNullOrEmpty(this.tagString)) { return false; }
    if (stringIsNullOrEmpty(this.articleSummaryMarkdown)) { return false; }
    return true;
  }

  private save() {
    useManagingStore().saveKnowledgeBaseArticle(this.data.id);
    this.$emit("saved");
  }
  private remove() {
    useManagingStore().deleteKnowledgeBaseArticle(this.data.id);
    this.$emit("deleted");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.tickeditor {
  padding: 4px 4px 0 4px;
  border-radius: 4px;
  font-size: $text-size-regular;

  min-height: 100px;
  display: block;
  width: 100%;
  padding: 8px;

  background-color: var(--c-base-300);
  color: var(--c-contrast);

  &.long {
    min-height: 600px;
  }
}

.inputRow {
  margin-bottom: 10px;
}
</style>
