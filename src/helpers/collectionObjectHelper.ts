import { AdapterComponentPresentationTypeEnum, CollectionObjectTypeEnum, ComponentDataSourceTypeEnum, TickComponentPresentationTypeEnum, TickKnowledgeBaseSummary } from "@/TickApi";
import { openFlowCreatorPanel } from "@/components/panels/FlowCreatorPanel.vue";
import { RouterToItem } from "@/router";
import useDataAdaptersStore from "@/store/dataadapters";
import useManagingStore from "@/store/managingStore";
import { MetaDataComponentOption } from "./enumsHelper";

export async function addAndNavToEmptyFlow() {

  openFlowCreatorPanel();

  // const flow = await useFlowStore().add();
  // RouterToItem(CollectionObjectTypeEnum.Flow, flow.id, flow.versionId);
}

export async function addAndNavToNewDataAdapter(collectionId?: string, name?: string, copyOfId?: string) {
  const id = await useDataAdaptersStore().add(collectionId, name, copyOfId);
  RouterToItem(CollectionObjectTypeEnum.DataAdapter, id);
}

export async function addAndNavToEmptyKnowledgeBase() {
  useManagingStore().addKnowledgeBase().then((newItem: TickKnowledgeBaseSummary) => {
    RouterToItem(CollectionObjectTypeEnum.KnowledgeBase, newItem.id);
  })
}

export async function addAndNavToEmptyTaskDefinition() {
  const task = await useManagingStore().addTaskDefinition()
  RouterToItem(CollectionObjectTypeEnum.Task, task.id);
}

export async function addAndNavToEmptyMetaDataComponentDefinition(selection: MetaDataComponentOption) {

  let type: ComponentDataSourceTypeEnum | null = null;
  let subType: AdapterComponentPresentationTypeEnum | TickComponentPresentationTypeEnum

  switch (selection) {
    case MetaDataComponentOption.DataAdapter:
      type = ComponentDataSourceTypeEnum.DataAdapter;
      subType = AdapterComponentPresentationTypeEnum.Generic;
      break;
    case MetaDataComponentOption.CommunicatorHistory:
      type = ComponentDataSourceTypeEnum.Tick;
      subType = TickComponentPresentationTypeEnum.CommunicatorHistory;
      break;
    case MetaDataComponentOption.CommunicatorInfo:
      type = ComponentDataSourceTypeEnum.Tick;
      subType = TickComponentPresentationTypeEnum.CommunicatorInfo;
      break;

    default:
      return;
  }

  const item = await useManagingStore().addMetadataComponent(type, subType);
  RouterToItem(CollectionObjectTypeEnum.MetaDataComponent, item.id);
}