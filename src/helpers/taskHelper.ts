import { translate } from "@/plugins/translatePlugin";
import { FormFieldExplanationSettings, FormFieldInputSettings, FormFieldInputType, FormFieldSelectInputSettings, FormFieldSmartViewerSettings, FormTileSettings, LanguagePath, OptionsSourceEnum, TaskFilterOptions, ValidationTypeEnum } from "@/TickApi";
import generateId from "./guid";


export function getActiveFiltersNr(filters?: TaskFilterOptions) {
  let nrOfFilters = 0;
  if (filters?.assignedTo != null) {
    nrOfFilters++;
  }

  if (filters?.status != null) {
    nrOfFilters++;
  }

  if (filters?.filterCreationFromDate != null) {
    nrOfFilters++;
  }


  return nrOfFilters;
}

export function getDefaultSmartViewerSettings(title?: string) {
  const s: FormFieldSmartViewerSettings = {
    description: translate(LanguagePath.App_TaskDefinitionEditor_Form_Explanation_Default),
    name: title ?? translate(LanguagePath.App_Title),
    dataStoragePath: ""
  };
  return s;
}
export function getDefaultExplanationSettings(title?: string) {
  const s: FormFieldExplanationSettings = {
    description: translate(LanguagePath.App_TaskDefinitionEditor_Form_Explanation_Default),
    name: title ?? translate(LanguagePath.App_Title),
  };
  return s;
}

export function getDefaultInputSettings() {
  const s: FormFieldInputSettings = {
    description: "",
    name: translate(LanguagePath.App_TaskDefinitionEditor_Form_Input_Default),
    type: FormFieldInputType.SingleLine,
    required: true,
    validationType: ValidationTypeEnum.Text,
    answerStoragePath: "",
    invalidEcho: "",
    storeToState: false,
    validationRegEx: "",

  };
  return s;
}

export function getDefaultSelectInputSettings() {
  const s: FormFieldSelectInputSettings = {
    description: "",
    name: translate(LanguagePath.App_TaskDefinitionEditor_Form_Input_Default),
    type: FormFieldInputType.Select,
    required: false,
    storeToState: false,
    answerStoragePath: "",
    answerValueStoragePath: "",
    invalidEcho: "",
    optionsMappingJMESPath: "",
    optionsStorageLocationPath: "",
    validationRegEx: "",
    validationType: ValidationTypeEnum.Text,

    optionsSource: OptionsSourceEnum.Options,
    options: [
      {
        id: generateId(),
        data: "yes",
        text: translate(LanguagePath.Yes),
      },
      {
        id: generateId(),
        data: "no",
        text: translate(LanguagePath.No),
      },
    ],
  };
  return s;
}

export interface formLayoutItem {
  x: number;
  y: number;   // <- added semicolon
  w: number;
  h: number;
  i: string;
}

export function getFormTilesLayout(tiles: FormTileSettings[]): formLayoutItem[] {
  return tiles.map((t) => ({
    x: t.x ?? 0,
    y: t.y ?? 0,
    w: t.width ?? 1,
    h: t.height ?? 1,
    i: t.id ?? "",
  }));
}