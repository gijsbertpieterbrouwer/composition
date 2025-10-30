import { FilesBaseUrl } from "@/services/urls";
import { FormField, FormFieldDefinition, FormFieldExplanationSettings, FormFieldInputSettings, FormFieldSelectInputSettings, FormFieldSmartViewerSettings, FormFieldType, OptionsItemData, OptionsSourceEnum } from "@/TickApi";
import { jsonProxy } from "./jsonProxy";


export function getFormFieldSampleData(data: FormFieldDefinition): FormField {
  if (!data.id) {
    throw new Error("Field definition must have an id to get sample data.");
  }
  switch (data.type) {
    case FormFieldType.Input:
      return getInputfieldSampleData(data.id, settingsAs<FormFieldInputSettings>(data));
    case FormFieldType.SelectInput:
      return selectInputfieldSampleData(data.id, settingsAs<FormFieldSelectInputSettings>(data));
    case FormFieldType.Explanation:
      return explanationfieldSampleData(data.id, settingsAs<FormFieldExplanationSettings>(data));
    case FormFieldType.SmartViewer:
      return smartViewerfieldSampleData(data.id, settingsAs<FormFieldSmartViewerSettings>(data));
    default:
      return {};
  }
}

function smartViewerfieldSampleData(fieldId: string, settings: FormFieldSmartViewerSettings): FormField {
  const d: FormField = {
    id: fieldId,
    type: FormFieldType.SmartViewer,
    description: settings.description ?? undefined,
    name: settings.name,
    value: JSON.stringify({
      presenting: settings.dataStoragePath,
      sampleData: {
        image: `${FilesBaseUrl()}/demo/genericAdapterPicture.png`,
        link: "https://www.tick.cloud",
        items: [
          { name: 'Order A', price: 100 },
          { name: 'Order B', price: 50 },
          { name: 'Order B', price: 50 },
        ]
      }
    }),
  }

  return d;
}

function explanationfieldSampleData(fieldId: string, settings: FormFieldExplanationSettings): FormField {
  const d: FormField = {
    id: fieldId,
    type: FormFieldType.Explanation,
    description: settings.description ?? undefined,
    name: settings.name,
  }

  return d;
}

function selectInputfieldSampleData(fieldId: string, settings: FormFieldSelectInputSettings): FormField {
  let options: (OptionsItemData)[] = [];

  if (settings.optionsSource == OptionsSourceEnum.Options) {

    options = settings?.options?.map((o) => {
      return {
        id: o.id,
        data: o.data,
        text: o.text,
      }
    }) ?? [];

  } else {
    options.push({ data: "sample_1", id: "1", text: "Sample 1 from state" });
    options.push({ data: "sample_2", id: "2", text: "Sample  2 from state" });
  }

  const sampleValue = options.length ? options[0].data : "";

  const d: FormField = {
    id: fieldId,
    description: settings.description ?? undefined,
    name: settings.name,
    inputType: settings.type,
    value: sampleValue,
    options: options,
    required: settings.required,
    valueEdited: false,
    type: FormFieldType.SelectInput,
  }

  return d;
}

function getInputfieldSampleData(fieldId: string, settings: FormFieldInputSettings): FormField {
  const d: FormField = {
    id: fieldId,
    description: settings.description ?? undefined,
    name: settings.name,
    inputType: settings.type,
    value: "",
    required: settings.required,
    valueEdited: false,
    type: FormFieldType.Input,
    textArea_Minimumrows: settings.textArea_Minimumrows,
  }

  return d;
}



function settingsAs<T>(data: FormFieldDefinition) {
  return jsonProxy<T>(data.settingsJson || "{}", (json) => {
    data.settingsJson = json;
  });
}