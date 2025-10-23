import { DropdownOption, DropdownOptionType } from "@/components/atoms/TickDropdown.vue";
import { translate } from "@/plugins/translatePlugin";
import { MessageSendingType } from "@/store/tickets";
import useUtilityDataStore from "@/store/utilitydata";
import {
  AdapterComponentPresentationTypeEnum,
  ApiMethod,
  AppearanceConditionOperatorEnum,
  AssignmentFilterEnum,
  AuthorizationObjectType,
  AuthorizationType,
  BillingCalculationPeriod,
  BillingPeriod,
  ChannelRoutingTypeEnum,
  ChartDataValueTypeEnum, ChartingTypeEnum,
  CollectionObjectTypeEnum,
  ColorsEnum,
  CommunicationDirection,
  CommunicationType,
  ComponentDataSourceTypeEnum,
  ConditionElement,
  CurrencyType,
  DashboardTileTemplateType,
  DatabagCalculateOperator,
  EventObjectType,
  ExtractionStrategyEnum,
  FlowTriggerEnum,
  FormFieldInputType,
  FormFieldType,
  GenderEnum,
  KnowledgeBaseTypeEnum,
  LanguagePath,
  LanguageType,
  LogSeverity,
  MetaDataComponentAdapterSourceViewerSettings,
  MetaDataComponentTickSourceViewerSettings,
  NotificationType,
  OptionsSourceEnum,
  Period,
  PeriodicTileShowPeriodEnum,
  PhoneActionItemType,
  ShowPeriodCustomDateRangeTypeEnum,
  SlaNotificationTypeEnum,
  SlaPeriod,
  SlaType,
  StorageLocation,
  SubscriptionCostItemType,
  TaskDefinitionPeriod,
  TaskFilterTaskStatusEnum,
  TaskInstanceStatus,
  TeamPhoneAuthorizationEnum,
  TickChannelSummary,
  TickComponentPresentationTypeEnum,
  TicketFilterTicketStatusEnum,
  TicketStatus,
  UserPhoneAuthorizationEnum,
  UserTypeEnum,
  ValidationTypeEnum,
  VoiceLanguageEnum
} from "@/TickApi";
import generateId from "./guid";


export function getLanguageByLocale(clientLocale: Locale): LanguageType {
  switch (clientLocale.code) {
    case "en-GB": return LanguageType.EnUs;
    case "nl": return LanguageType.NL;
    default:
      return LanguageType.EnUs;
  }
}

export function getChannelIconName(type: CommunicationType): string {
  switch (type) {
    case CommunicationType.ChatWidget: return "channel-chatwidget";
    case CommunicationType.Email: return "channel-email";
    case CommunicationType.FacebookMessenger: return "channel-fbmessenger";
    case CommunicationType.Telegram: return "channel-telegram";
    case CommunicationType.Phone: return "channel-phone";
    default: return "channel";
  }
}

export function getChannelStatusText(channel: TickChannelSummary) {

  if (channel.enableInboundMessages && channel.enableOutboundMessages) {
    return "Active"
  }

  if (channel.enableInboundMessages) {
    return "only inbound"
  }

  if (channel.enableOutboundMessages) {
    return "only outbound"
  }
  return "InActive";
}

export function getLanguageByLocaleCode(localeCode: string): LanguageType {
  switch (localeCode.toLowerCase()) {
    case "en-gb": return LanguageType.EnUs;
    case "nl": return LanguageType.NL;
    default:
      return LanguageType.EnUs;
  }
}


export function getCostItemTypeName(type: SubscriptionCostItemType) {

  switch (type) {
    case SubscriptionCostItemType.Channel: return translate(LanguagePath.Channels);
    case SubscriptionCostItemType.CustomDashboard: return translate(LanguagePath.Dashboards);
    case SubscriptionCostItemType.DataAdapter: return translate(LanguagePath.DataAdapters);
    case SubscriptionCostItemType.DatabagItem: return translate(LanguagePath.States_Variables);
    case SubscriptionCostItemType.EventSubscription: return translate(LanguagePath.EventSubscriptions);
    case SubscriptionCostItemType.ExecutionEnvironment: return translate(LanguagePath.ExecutionEnvironments);
    case SubscriptionCostItemType.Flow: return translate(LanguagePath.Flows);
    case SubscriptionCostItemType.InternetDomain: return translate(LanguagePath.DomainVerifications);
    case SubscriptionCostItemType.Labels: return translate(LanguagePath.Labels);
    case SubscriptionCostItemType.CannedResponse: return translate(LanguagePath.CannedResponses);
    case SubscriptionCostItemType.MetaDataComponent: return translate(LanguagePath.MetadataComponents);
    case SubscriptionCostItemType.Knowledgebase: return translate(LanguagePath.KnowledgeBases);
    case SubscriptionCostItemType.Sla: return translate(LanguagePath.SLAs);
    case SubscriptionCostItemType.User: return translate(LanguagePath.Users);
    case SubscriptionCostItemType.Teams: return translate(LanguagePath.Teams);
    case SubscriptionCostItemType.TaskDefinition: return translate(LanguagePath.TaskDefinitions);
    case SubscriptionCostItemType.FlowsAction: return translate(LanguagePath.FlowActions);
    case SubscriptionCostItemType.Seats: return translate(LanguagePath.Seats);
    case SubscriptionCostItemType.CompletedTickets: return translate(LanguagePath.Tickets);
    case SubscriptionCostItemType.PhoneChannelBaseCost: return translate(LanguagePath.App_PhoneChannel);
    case SubscriptionCostItemType.PhoneChannelCallMinutes: return translate(LanguagePath.App_PhoneChannel_Minutes);
    case SubscriptionCostItemType.WorkspaceFiles: return translate(LanguagePath.Files);
    case SubscriptionCostItemType.CommunicatorCategories: return translate(LanguagePath.CommunicatorCategories);
    case SubscriptionCostItemType.Workspaces: return translate(LanguagePath.Workspaces);

    default: return this.item.type.toString();
  }
}



export function getEventObjectTypeOptions() {
  const list = [
    {
      text: "All",
      value: EventObjectType.All,
    },
    {
      text: translate(LanguagePath.App_Notification),
      value: EventObjectType.Notification,
    },
    {
      text: translate(LanguagePath.Ticket),
      value: EventObjectType.Ticket,
    },
    {
      text: translate(LanguagePath.TaskInstance),
      value: EventObjectType.Task,
    },
    {
      text: translate(LanguagePath.Tenant),
      value: EventObjectType.Tenant,
    },
  ];

  return list;
}



export function getKnowledgeBaseTypeOptions() {
  const list = [
    {
      text: translate(LanguagePath.KnowledgeBase_Type_Internal),
      id: KnowledgeBaseTypeEnum.Internal,
    },
    {
      text: translate(LanguagePath.KnowledgeBase_Type_Public),
      id: KnowledgeBaseTypeEnum.Public,
    },
  ];

  return list;
}


export function getBillingPeriodName(type: BillingPeriod) {
  switch (type) {
    case BillingPeriod.Month: return translate(LanguagePath.Billing_Period_Monthly);
    default: "-";
  }
}

export function getBillingCalculationPeriodName(type: BillingCalculationPeriod) {
  switch (type) {
    case BillingCalculationPeriod.Day: return translate(LanguagePath.Day);
    case BillingCalculationPeriod.Month: return translate(LanguagePath.Month);
    default: "-";
  }
}

export function getCurrencyName(type: CurrencyType) {
  switch (type) {
    case CurrencyType.Euro: return translate(LanguagePath.Currency_Euro);
    default: "-";
  }
}

export function getMetaDataComponent(type: ComponentDataSourceTypeEnum, viewerSettingsJson: string) {
  switch (type) {
    case ComponentDataSourceTypeEnum.DataAdapter: return getMetaDataComponentAdapter(viewerSettingsJson);
    case ComponentDataSourceTypeEnum.Tick: return getMetaDataComponentTickSource(viewerSettingsJson);
    default: "div";
  }
}
export function getMetaDataComponentTickSource(viewerSettingsJson: string) {
  const settings = JSON.parse(viewerSettingsJson || "{}") as MetaDataComponentTickSourceViewerSettings;
  switch (settings.type) {
    case TickComponentPresentationTypeEnum.CommunicatorHistory: return "CommunicatorHistoryMetaDataComponent";
    case TickComponentPresentationTypeEnum.CommunicatorInfo: return "CommunicatorInfoMetaDataComponent";

    default: "GenericMetaDataComponent";
  }
}


export function getMetaDataComponentAdapter(viewerSettingsJson: string) {
  const settings = JSON.parse(viewerSettingsJson || "{}") as MetaDataComponentAdapterSourceViewerSettings;
  switch (settings.presentationType) {
    case AdapterComponentPresentationTypeEnum.Debug: return "DebugMetaDataComponent";
    case AdapterComponentPresentationTypeEnum.List: return "ListMetaDataComponent";
    case AdapterComponentPresentationTypeEnum.Generic: return "GenericMetaDataComponent";
    default: "GenericMetaDataComponent";
  }
}

export function getLanguageOptions(): DropdownOption[] {
  return [{
    id: 'nl',
    icon: 'flagnl',
    text: translate(LanguagePath.App_LanguageSelector_nlNl),
  },
  {
    id: 'en-GB',
    icon: 'flagus',
    text: translate(LanguagePath.App_LanguageSelector_enUs),
  }]
}

export enum MetaDataComponentOption {
  DataAdapter,
  CommunicatorHistory,
  CommunicatorInfo,
}

export function getComponentDataSourceOptions(): DropdownOption[] {
  return [
    {
      text: translate(LanguagePath.MetadataComponent_Option_DataAdapter),
      id: MetaDataComponentOption.DataAdapter,
    },
    {
      text: translate(LanguagePath.MetadataComponent_Option_Communicator_Info),
      id: MetaDataComponentOption.CommunicatorInfo,
    }, {
      text: translate(LanguagePath.MetadataComponent_Option_Communicator_History),
      id: MetaDataComponentOption.CommunicatorHistory,
    },
  ];


}

export function getUserTypeOptions() {
  const list = [
    {
      text: translate(LanguagePath.User_Type_User),
      id: UserTypeEnum.User,
    },
    {
      text: translate(LanguagePath.User_Type_Bot),
      id: UserTypeEnum.Bot,
    },
  ];

  return list;
}

export function getOptionsSourceOptions() {
  const list = [
    {
      text: translate(LanguagePath.Options_Source_Databag),
      value: OptionsSourceEnum.Databag,
    },
    {
      text: translate(LanguagePath.Options_Source_Options),
      value: OptionsSourceEnum.Options,
    },
  ];

  return list;
}

export function getMathTokenFunctionsOptions() {
  const list = [
    {
      text: translate(LanguagePath.Math_Add),
      value: "add",
    },
    {
      text: translate(LanguagePath.Math_Subtract),
      value: "minus",
    },
  ];

  return list;
}


export function isDatabagLocation(l: StorageLocation): boolean {
  const databagLocations = [StorageLocation.Vault, StorageLocation.Workspace];
  return databagLocations.some(p => p == l)
}


export function getTaskInstanceStatusOptions(configurableOnly: boolean) {
  const options = [
    {
      text: translate(LanguagePath.Task_Instance_Status_Failed),
      value: TaskInstanceStatus.Failed,
    },
    {
      text: translate(LanguagePath.Task_Filter_Status_Completed),
      value: TaskInstanceStatus.Finished,
    },
  ];

  if (!configurableOnly) {
    options.push({
      text: translate(LanguagePath.Task_Instance_Status_InProgress),
      value: TaskInstanceStatus.InProgress,
    });

    options.push({
      text: translate(LanguagePath.Task_Instance_Status_Todo),
      value: TaskInstanceStatus.Todo,
    });
  }
  return options;
}

export function getTaskFormInputTypeOptions() {
  return [
    {
      text: translate(LanguagePath.TaskDefinition_Form_Objects_Checkbox),
      value: FormFieldInputType.Checkbox,
    },
    {
      text: translate(LanguagePath.TaskDefinition_Form_Objects_DatePicker),
      value: FormFieldInputType.Date,
    },
    {
      text: translate(LanguagePath.TaskDefinition_Form_Objects_MultiLine),
      value: FormFieldInputType.MultiLine,
    },
    {
      text: translate(LanguagePath.TaskDefinition_Form_Objects_Number),
      value: FormFieldInputType.Numeric,
    },
    {
      text: translate(LanguagePath.TaskDefinition_Form_Objects_SingleLine),
      value: FormFieldInputType.SingleLine,
    },
  ];

}

export function getTaskFormFieldTypeOptions(): DropdownOption[] {
  return [
    {
      text: translate(LanguagePath.TaskDefinition_FormField_Type_Explanation),
      id: FormFieldType.Explanation,
    },
    {
      text: translate(LanguagePath.TaskDefinition_FormField_Type_SmartViewer),
      id: FormFieldType.SmartViewer,
    },
    {
      id: 'spacer',
      text: '',
      type: DropdownOptionType.spacer
    },
    {
      text: translate(LanguagePath.TaskDefinition_FormField_Type_Input),
      id: FormFieldType.Input,
    },
    {
      text: translate(LanguagePath.TaskDefinition_FormField_Type_SelectInput),
      id: FormFieldType.SelectInput,
    },
  ];

}

export function getSlaNotificationTypeEnumOptions() {
  return [
    {
      text: translate(LanguagePath.SLA_Notification_Type_Notification),
      value: SlaNotificationTypeEnum.Notification,
    },
    {
      text: translate(LanguagePath.SLA_Notification_Type_Email),
      value: SlaNotificationTypeEnum.Email,
    },
  ];

}

export function getSlaPeriodTypeOptions() {
  return [
    {
      text: translate(LanguagePath.Seconds),
      value: SlaPeriod.Second,
    },
    {
      text: translate(LanguagePath.Minutes),
      value: SlaPeriod.Minute,
    },
    {
      text: translate(LanguagePath.Hours),
      value: SlaPeriod.Hour,
    },
    {
      text: translate(LanguagePath.Days),
      value: SlaPeriod.Day,
    },
  ];

}

export function getTaskPeriodTypeOptions() {
  return [
    {
      text: translate(LanguagePath.Minutes),
      value: TaskDefinitionPeriod.Minute,
    },
    {
      text: translate(LanguagePath.Hours),
      value: TaskDefinitionPeriod.Hour,
    },
    {
      text: translate(LanguagePath.Days),
      value: TaskDefinitionPeriod.Day,
    },
  ];

}

export function getTextualQuestionValidationTypeOptions() {
  return [
    {
      text: translate(LanguagePath.App_Validation_Type_Text),
      value: ValidationTypeEnum.Text,
    },
    {
      text: translate(LanguagePath.App_Validation_Type_Number),
      value: ValidationTypeEnum.Number,
    },
    {
      text: translate(LanguagePath.App_Validation_Type_Mail),
      value: ValidationTypeEnum.Emailaddress,
    },
    {
      text: translate(LanguagePath.App_Validation_Type_Custom),
      value: ValidationTypeEnum.Custom,
    },
  ];

}

export function getChannelRoutingTypeEnumOptions() {
  return [
    {
      text: translate(LanguagePath.Team),
      value: ChannelRoutingTypeEnum.Team,
    },
    {
      text: translate(LanguagePath.User),
      value: ChannelRoutingTypeEnum.User,
    }
  ];
}

export function getStorageLocationStringValue(input: StorageLocation): string {
  switch (input) {
    case StorageLocation.Tick: return translate(LanguagePath.StorageLocation_Tick);
    case StorageLocation.Contact: return translate(LanguagePath.StorageLocation_Communicator);
    case StorageLocation.Flow: return translate(LanguagePath.StorageLocation_Flow);
    case StorageLocation.Environment: return translate(LanguagePath.StorageLocation_ExecutionEnvironment);
    case StorageLocation.Memory: return translate(LanguagePath.StorageLocation_Memory);
    case StorageLocation.Ticket: return translate(LanguagePath.StorageLocation_Ticket);
    case StorageLocation.Vault: return translate(LanguagePath.StorageLocation_Vault);
    case StorageLocation.Workspace: return translate(LanguagePath.StorageLocation_Workspace);
  }
}

export function GetCostItemSortOrder() {
  return [
    SubscriptionCostItemType.User,
    SubscriptionCostItemType.Seats,
    SubscriptionCostItemType.Teams,
    SubscriptionCostItemType.Labels,
    SubscriptionCostItemType.CannedResponse,
    SubscriptionCostItemType.WorkspaceFiles,
    SubscriptionCostItemType.TaskDefinition,
    SubscriptionCostItemType.Flow,
    SubscriptionCostItemType.FlowsAction,
    SubscriptionCostItemType.Knowledgebase,
    SubscriptionCostItemType.InternetDomain,
    SubscriptionCostItemType.DataAdapter,
    SubscriptionCostItemType.DatabagItem,
    SubscriptionCostItemType.Channel,
    SubscriptionCostItemType.CustomDashboard,
    SubscriptionCostItemType.ExecutionEnvironment,
    SubscriptionCostItemType.InternetDomain,
    SubscriptionCostItemType.MetaDataComponent,
    SubscriptionCostItemType.Sla,
    SubscriptionCostItemType.EventSubscription,
  ]
}

export function getReadStorageLocationsForMessageBoard(): StorageLocation[] {
  return [StorageLocation.Tick, StorageLocation.Workspace];
}

export function getReadStorageLocationsForCannedResponse(): StorageLocation[] {
  return [StorageLocation.Tick, StorageLocation.Contact, StorageLocation.Ticket, StorageLocation.Workspace];
}

export function getReadStorageLocations(): StorageLocation[] {
  return [StorageLocation.Tick, StorageLocation.Contact, StorageLocation.Ticket, StorageLocation.Workspace, StorageLocation.Flow];
}

export function getApiReadStorageLocations(): StorageLocation[] {
  return [StorageLocation.Tick, StorageLocation.Contact, StorageLocation.Ticket, StorageLocation.Workspace, StorageLocation.Flow, StorageLocation.Vault];
}

export function getFlowReadStorageLocations(): StorageLocation[] {
  return [StorageLocation.Tick, StorageLocation.Contact, StorageLocation.Ticket, StorageLocation.Workspace, StorageLocation.Flow];
}
export function getFlowWriteStorageLocations(): StorageLocation[] {
  return [StorageLocation.Contact, StorageLocation.Ticket, StorageLocation.Flow];
}

export function getTaskReadStorageLocations(fromFlow: boolean): StorageLocation[] {
  return fromFlow
    ? [StorageLocation.Tick, StorageLocation.Contact, StorageLocation.Ticket, StorageLocation.Workspace, StorageLocation.Flow]
    : [StorageLocation.Tick, StorageLocation.Contact, StorageLocation.Workspace];
}
export function getTaskWriteStorageLocations(): StorageLocation[] {
  return [StorageLocation.Contact, StorageLocation.Ticket, StorageLocation.Flow];
}


export function getCommunicatorReadStorageLocations(): StorageLocation[] {
  return [StorageLocation.Tick, StorageLocation.Contact, StorageLocation.Ticket, StorageLocation.Workspace, StorageLocation.Flow];
}
export function getCommunicatorWriteStorageLocations(): StorageLocation[] {
  return [StorageLocation.Contact, StorageLocation.Ticket,];
}

export function getStorageLocationOptions(addReadOnly: boolean, addVault: boolean) {
  const list = [
    {
      text: translate(LanguagePath.StorageLocation_Tick),
      value: StorageLocation.Tick,
    },
    {
      text: translate(LanguagePath.StorageLocation_Ticket),
      value: StorageLocation.Ticket,
    },
    {
      text: translate(LanguagePath.StorageLocation_Flow),
      value: StorageLocation.Flow,
    },
    {
      text: translate(LanguagePath.StorageLocation_Communicator),
      value: StorageLocation.Contact,
    },

  ];

  if (addReadOnly) {
    list.push({
      text: translate(LanguagePath.StorageLocation_Workspace),
      value: StorageLocation.Workspace,
    })

  }
  if (addVault) {
    list.push({
      text: translate(LanguagePath.StorageLocation_Vault),
      value: StorageLocation.Vault,
    });
  }

  return list;
}

export function getTeamAuthorizationName(type: AuthorizationObjectType) {

  switch (type) {
    case AuthorizationObjectType.Workspace: return translate(LanguagePath.Authorizations_Type_Workspace);
    case AuthorizationObjectType.ConfigurationSecrets: return translate(LanguagePath.Authorizations_Type_WorkspaceVault);
    case AuthorizationObjectType.ProcessConfiguration: return translate(LanguagePath.Authorizations_Type_Process_configuration);
    case AuthorizationObjectType.TechnicalConfiguration: return translate(LanguagePath.Authorizations_Type_TechnicalConfiguration);
    case AuthorizationObjectType.Ticket: return translate(LanguagePath.Authorizations_Type_Tickets);
    case AuthorizationObjectType.TaskInstance: return translate(LanguagePath.Authorizations_Type_Tasks);
    default: return AuthorizationObjectType[type].toString();
  }
}

export function getTeamAuthorizationOptions() {
  const authTypesInts = Object.values(AuthorizationObjectType).filter((v) => !isNaN(Number(v))) as AuthorizationObjectType[];
  const options = authTypesInts.map((auth) => ({
    text: getTeamAuthorizationName(auth as AuthorizationObjectType),
    id: auth,
  }));

  return options;
}


export function getComponentPresentationTypeEnumName(type: AdapterComponentPresentationTypeEnum) {

  switch (type) {
    case AdapterComponentPresentationTypeEnum.Debug: return translate(LanguagePath.MetadataComponent_Presentation_type_Raw);
    case AdapterComponentPresentationTypeEnum.Generic: return translate(LanguagePath.MetadataComponent_Presentation_type_Smart);
    case AdapterComponentPresentationTypeEnum.List: return translate(LanguagePath.MetadataComponent_Presentation_type_List);

    default: return AdapterComponentPresentationTypeEnum[type].toString();
  }
}

export function getComponentPresentationTypeEnumOptions() {
  const authTypesInts = Object.values(AdapterComponentPresentationTypeEnum).filter((v) => !isNaN(Number(v))) as AdapterComponentPresentationTypeEnum[];
  const options = authTypesInts.map((auth) => ({
    text: getComponentPresentationTypeEnumName(auth as AdapterComponentPresentationTypeEnum),
    value: auth,
  }));

  return options;
}



export function conditionTypeOptions() {
  const list = [
    {
      text: translate(LanguagePath.Condition_Element_Type_Group),
      value: ConditionElement.Group,
    },
    {
      text: translate(LanguagePath.Condition_Element_Type_Single),
      value: ConditionElement.Single,
    },
  ];

  return list;
}


export function apiMethodEnumOptions() {
  const list = [
    {
      text: translate(LanguagePath.DataAdapter_Method_Type_Get),
      value: ApiMethod.Get,
    },
    {
      text: translate(LanguagePath.DataAdapter_Method_Type_Post),
      value: ApiMethod.Post,
    },
  ];

  return list;
}

export function apiLogEnumOptions() {
  const list = [
    {
      text: translate(LanguagePath.DataAdapter_LogSeverity_Always),
      value: LogSeverity.Always,
    },
    {
      text: translate(LanguagePath.DataAdapter_LogSeverity_Failures),
      value: LogSeverity.Failures,
    },
    {
      text: translate(LanguagePath.DataAdapter_LogSeverity_None),
      value: LogSeverity.None,
    },
  ];

  return list;
}


export function extractionStrategyOptions() {
  const list = [
    {
      text: translate(LanguagePath.Extraction_strategy_Unredacted),
      value: ExtractionStrategyEnum.Unredacted,
    },
    {
      text: translate(LanguagePath.Extraction_strategy_Jmespath),
      value: ExtractionStrategyEnum.JMESPath,
    },
  ];

  return list;
}


// export function getNotificationTypeName(input: NotificationType): string {
//   switch (input) {
//     case NotificationType.Normal: return "normal";
//     case NotificationType.Error: return "error";
//     case NotificationType.Subscription: return "subscription";
//     default: return "";
//   }
// }

export function getNotificationTypeColor(input: NotificationType): ColorsEnum {
  switch (input) {
    case NotificationType.Normal: return ColorsEnum.BoldLime;
    case NotificationType.Error: return ColorsEnum.Red;
    case NotificationType.Subscription: return ColorsEnum.Yellow;
    default: return ColorsEnum.Grey;
  }
}

export function getNotificationTypeDuration(input: NotificationType): number {
  //return 60000

  switch (input) {
    case NotificationType.Normal: return 2000;
    case NotificationType.Error: return 4000;
    case NotificationType.Subscription: return 6000;
    default: return 2000;
  }
}

export function getSlaTypeAbbreviation(type: SlaType) {
  switch (type) {
    case SlaType.OutboundMessageCount: return "MOM";
    case SlaType.ResponseTime: return "IRT";

    default: return "";
  }
}

export function getSlaTypeOptions() {
  const list = [
    {
      text: `${translate(LanguagePath.SLA_Type_IRT)} (${getSlaTypeAbbreviation(SlaType.ResponseTime)})`,
      id: SlaType.ResponseTime,
    },
    {
      text: `${translate(LanguagePath.SLA_Type_MOM)} (${getSlaTypeAbbreviation(SlaType.OutboundMessageCount)})`,
      id: SlaType.OutboundMessageCount,
    },
  ];

  return list;
}

export function getPhoneChannelActionItemType() {
  const list = [
    {
      text: translate(LanguagePath.PhoneActionItemType_StartFlow),
      value: PhoneActionItemType.StartFlow,
    },
    {
      text: translate(LanguagePath.PhoneActionItemType_TransferCall),
      value: PhoneActionItemType.TransferCall,
    },
  ];

  return list;
}

export function getGenderOptions() {
  const list = [
    {
      text: translate(LanguagePath.GenderEnum_Female),
      value: GenderEnum.Female,
    },
    {
      text: translate(LanguagePath.GenderEnum_Male),
      value: GenderEnum.Male,
    },
  ];

  return list;
}

export function getVoiceLangOptions() {
  const list = [
    {
      text: translate(LanguagePath.VoiceLanguageEnum_English),
      value: VoiceLanguageEnum.English,
    },
    {
      text: translate(LanguagePath.VoiceLanguageEnum_Dutch),
      value: VoiceLanguageEnum.Dutch,
    },
  ];

  return list;
}


export function getUserPhoneAuthorizationOptions() {
  const list = [
    {
      text: translate(LanguagePath.App_UserEditor_PhoneAuthorization_Never_Title),
      value: UserPhoneAuthorizationEnum.NeverCall,
    },
    {
      text: translate(LanguagePath.App_UserEditor_PhoneAuthorization_OnlyOnVoiceDevice_Title),
      value: UserPhoneAuthorizationEnum.OnlyOnVoiceDevice,
    },
    {
      text: translate(LanguagePath.App_UserEditor_PhoneAuthorization_PhoneWhenNoVoiceDevice_Title),
      value: UserPhoneAuthorizationEnum.PhoneWhenNoVoiceDevice,
    },
    {
      text: translate(LanguagePath.App_UserEditor_PhoneAuthorization_PhoneWhenLoggedOut_Title),
      value: UserPhoneAuthorizationEnum.PhoneWhenLoggedOut,
    },
  ];
  return list;
}


export function getTeamPhoneAuthorizationOptions() {
  const list = [
    {
      text: translate(LanguagePath.App_TeamEditor_PhoneAuthorization_NeverCall_Title),
      value: TeamPhoneAuthorizationEnum.NeverCall,
    },
    {
      text: translate(LanguagePath.App_TeamEditor_PhoneAuthorization_OnlyOnPhoneNumber_Title),
      value: TeamPhoneAuthorizationEnum.OnlyOnPhoneNumber,
    }, {
      text: translate(LanguagePath.App_TeamEditor_PhoneAuthorization_OnlyToTeamUser_Title),
      value: TeamPhoneAuthorizationEnum.OnlyToTeamUser,
    },
    {
      text: translate(LanguagePath.App_TeamEditor_PhoneAuthorization_PhoneWhenNoUserAvailable_Title),
      value: TeamPhoneAuthorizationEnum.PhoneWhenNoUserAvailable,
    },

  ];
  return list;
}

export function isChatCommunicationType(input: CommunicationType) {
  return input == CommunicationType.ChatWidget || input == CommunicationType.FacebookMessenger || input == CommunicationType.Telegram;
}

export function getSearchableCommunicationTypeOptions() {
  const searchable = [CommunicationType.Email]

  const list = getCommunicationTypeOptions();
  return list.filter(p => searchable.some(a => a == p.id));
}

export function getCommunicationTypeOptions() {
  const list = [
    {
      text: translate(LanguagePath.Communication_Type_Telegram),
      id: CommunicationType.Telegram,
      icon: getChannelIconName(CommunicationType.Telegram)
    },
    {
      text: translate(LanguagePath.Communication_Type_Mail),
      id: CommunicationType.Email,
      icon: getChannelIconName(CommunicationType.Email)
    },
    {
      text: translate(LanguagePath.Communication_Type_FacebookMessenger),
      id: CommunicationType.FacebookMessenger,
      icon: getChannelIconName(CommunicationType.FacebookMessenger)
    },
    {
      text: translate(LanguagePath.Communication_Type_ChatWidget),
      id: CommunicationType.ChatWidget,
      icon: getChannelIconName(CommunicationType.ChatWidget)
    },
    {
      text: translate(LanguagePath.Communication_Type_Phone),
      id: CommunicationType.Phone,
      icon: getChannelIconName(CommunicationType.Phone)
    },

  ];

  return list;
}

export function getCommunicationDirectionTypeOptions() {
  const list = [
    {
      text: translate(LanguagePath.Communication_Direction_Inbound),
      id: CommunicationDirection.Inbound,
    },
    {
      text: translate(LanguagePath.Communication_Direction_Outbound),
      id: CommunicationDirection.Outbound,
    },
  ];

  return list;

}


export function getPeriodicTileShowPeriodEnumOptions(includeLastKnown: boolean, includeCustom: boolean) {
  const list = [
    {
      text: translate(LanguagePath.Dashboard_Period_Show_Last_60min),
      value: PeriodicTileShowPeriodEnum.Last60Min,
    },
    {
      text: translate(LanguagePath.Dashboard_Period_Show_Last_24h),
      value: PeriodicTileShowPeriodEnum.Last24Hours,
    },
    {
      text: translate(LanguagePath.Dashboard_Period_Show_Last_30d),
      value: PeriodicTileShowPeriodEnum.Last30Days,
    },
    {
      text: translate(LanguagePath.Dashboard_Period_Show_Last_365d),
      value: PeriodicTileShowPeriodEnum.Last365Days,
    },
  ];


  if (includeCustom) {
    list.push({
      text: translate(LanguagePath.Dashboard_Period_Show_Custom),
      value: PeriodicTileShowPeriodEnum.Custom,
    })
  }

  if (includeLastKnown) {
    list.push({
      text: translate(LanguagePath.Dashboard_Period_Show_Last_known),
      value: PeriodicTileShowPeriodEnum.LastKnown,
    })
  }

  return list;

}


export function getPeriodOptions() {
  const list = [
    {
      text: translate(LanguagePath.Minute),
      value: Period.Minute,
    },
    {
      text: translate(LanguagePath.Five_minutes),
      value: Period.FiveMinutes,
    },
    {
      text: translate(LanguagePath.Hour),
      value: Period.Hour,
    },
    {
      text: translate(LanguagePath.Day),
      value: Period.Day,
    },
    {
      text: translate(LanguagePath.Week),
      value: Period.Week,
    },
    {
      text: translate(LanguagePath.Month),
      value: Period.Month,
    },
    {
      text: translate(LanguagePath.Year),
      value: Period.Year,
    },
  ];

  return list;

}

export function showPeriodCustomDateRangeOptions() {
  const list = [
    {
      text: translate(LanguagePath.Dashboard_Period_Show_Range_Fixed),
      value: ShowPeriodCustomDateRangeTypeEnum.Fixed,
    },
    {
      text: translate(LanguagePath.Dashboard_Period_Show_Range_Periodic),
      value: ShowPeriodCustomDateRangeTypeEnum.Periodic,
    },
  ];

  return list;

}

export function getColorOptions() {
  const colors = Object.keys(ColorsEnum).filter((v) => isNaN(Number(v)));
  const list = colors.map((c) => ({
    text: c,
    value: (ColorsEnum as unknown)[c],
  }));

  return list;
}

export function getTileAppearanceOperatorOptions() {
  const list = [
    {
      text: translate(LanguagePath.Dashboard_appearance_Condition_LessThen),
      value: AppearanceConditionOperatorEnum.LessThen,
    },
    {
      text: translate(LanguagePath.Dashboard_appearance_Condition_Equals),
      value: AppearanceConditionOperatorEnum.Equals,
    },
    {
      text: translate(LanguagePath.Dashboard_appearance_Condition_GreaterThen),
      value: AppearanceConditionOperatorEnum.GreaterThan,
    },

  ];

  return list;

}


export function getDataValueTypeOptions() {
  const list = [
    {
      text: translate(LanguagePath.Dashboard_Chart_Data_Value_Type_Min),
      value: ChartDataValueTypeEnum.Min,
    },
    {
      text: translate(LanguagePath.Dashboard_Chart_Data_Value_Type_Max),
      value: ChartDataValueTypeEnum.Max,
    },
    {
      text: translate(LanguagePath.Dashboard_Chart_Data_Value_Type_Average),
      value: ChartDataValueTypeEnum.Average,
    },
    {
      text: translate(LanguagePath.Dashboard_Chart_Data_Value_Type_Count),
      value: ChartDataValueTypeEnum.Count,
    },
  ];

  return list;

}

export function getChartingTypeOptions() {
  const list = [
    {
      text: translate(LanguagePath.Dashboard_Chart_Type_Bar),
      value: ChartingTypeEnum.Bar,
    },
    {
      text: translate(LanguagePath.Dashboard_Chart_Type_Line),
      value: ChartingTypeEnum.Line,
    },
    // {
    //   text: "Pie",
    //   value: ChartingTypeEnum.Pie,
    // },
    {
      text: translate(LanguagePath.Dashboard_Chart_Type_Area),
      value: ChartingTypeEnum.Timeline,
    },
  ];

  return list;

}

export function getNewTileTemplateOptions(): DropdownOption[] {
  let options: DropdownOption[] = [
    //Messageboard
    {
      type: DropdownOptionType.spacer,
      id: generateId(),
      text: translate(LanguagePath.Tickets)
    },
    {
      id: DashboardTileTemplateType.MessageBoard,
      text: translate(LanguagePath.Dashboard_Tile_Type_MessageBoard),
    },
    //Ticket
    {
      id: DashboardTileTemplateType.ChartingHeatmapUnfinishedTickets,
      text: translate(LanguagePath.Dashboard_Tile_Type_ChartingHeatmapUnfinishedTickets),//"Open Tickets per day of week",
    },
    {
      id: DashboardTileTemplateType.CounterTicketUnfinished,
      text: translate(LanguagePath.Dashboard_Tile_Type_CounterTicketUnfinished),//"Open Tickets Counter",
    },
    {
      id: DashboardTileTemplateType.ChartingTicketUnfinishedVsCompletion,
      text: translate(LanguagePath.Dashboard_Tile_Type_ChartingTicketUnfinishedVsCompletion),//"Tickets completed vs open",
    },
    {
      id: DashboardTileTemplateType.CounterTicketCompletionTime,
      text: translate(LanguagePath.Dashboard_Tile_Type_CounterTicketCompletionTime),//"Tickets completion time Counter",
    },
    {
      id: DashboardTileTemplateType.ChartingTicketWaitingFor,
      text: translate(LanguagePath.Dashboard_Tile_Type_ChartingTicketWaitingFor),//"Tickets awaiting input",
    },
    {
      id: DashboardTileTemplateType.PieTicketCompletedBy,
      text: translate(LanguagePath.Dashboard_Tile_Type_PieTicketCompletedBy),//"Tickets completed per channel",
    },
    {
      id: DashboardTileTemplateType.PieTicketLabels,
      text: translate(LanguagePath.Dashboard_Tile_Type_PieTicketLabels),//"Open Ticket per label",
    },

    //ADAPTER
    {
      type: DropdownOptionType.spacer,
      id: generateId(),
      text: translate(LanguagePath.DataAdapters)
    },
    {
      id: DashboardTileTemplateType.CounterAdapterExecutions,
      text: translate(LanguagePath.Dashboard_Tile_Type_CounterAdapterExecutions),//"Adapters executions Counter",
    },
    {
      id: DashboardTileTemplateType.ChartingAdaptersExecutionTime,
      text: translate(LanguagePath.Dashboard_Tile_Type_ChartingAdaptersExecutionTime),//"Adapters executions chart",
    },
    {
      id: DashboardTileTemplateType.ChartingAdaptersSuccess,
      text: translate(LanguagePath.Dashboard_Tile_Type_ChartingAdaptersSuccess),//"Adapters success % chart",
    },
    {
      id: DashboardTileTemplateType.PieAdapterExecutionTime,
      text: translate(LanguagePath.Dashboard_Tile_Type_PieAdapterExecutionTime),//"Adapters execution time pie",
    },

    //TASK
    {
      type: DropdownOptionType.spacer,
      id: generateId(),
      text: translate(LanguagePath.TaskInstances)
    },
    {
      id: DashboardTileTemplateType.CharterTasksOpen,
      text: translate(LanguagePath.Dashboard_Tile_Type_CharterTasksOpen),//"Open tasks chart",
    },
    {
      id: DashboardTileTemplateType.PieTasksOpen,
      text: translate(LanguagePath.Dashboard_Tile_Type_PieTasksOpen),//"Open tasks pie",
    },
    {
      id: DashboardTileTemplateType.CounterTasksCompleted,
      text: translate(LanguagePath.Dashboard_Tile_Type_CounterTasksCompleted),//"Completed tasks counter",
    },
    {
      id: DashboardTileTemplateType.CounterTasksOverdue,
      text: translate(LanguagePath.Dashboard_Tile_Type_CounterTasksOverdue),//"Overdue tasks counter",
    },
    {
      id: DashboardTileTemplateType.CounterTasksOpen,
      text: translate(LanguagePath.Dashboard_Tile_Type_CounterTasksOpen),//"Open tasks counter",
    },

  ]

  const hasPhoneChannel = useUtilityDataStore().utilityData.communicationChannels.some(p => p.communicationType == CommunicationType.Phone);

  if (hasPhoneChannel) {
    const phoneOptions: DropdownOption[] = [
      {
        type: DropdownOptionType.spacer,
        id: generateId(),
        text: translate(LanguagePath.App_PhoneChannel)
      },
      {
        id: DashboardTileTemplateType.Counter_PhoneChannel_Queued_Total,
        text: translate(LanguagePath.Dashboard_Tile_Type_PhoneChannel_Queued_Total),
      },
      {
        id: DashboardTileTemplateType.Charting_PhoneChannel_Queued_PerChannel,
        text: translate(LanguagePath.Dashboard_Tile_Type_PhoneChannel_Queued_PerChannel),
      },
    ]

    options = [...options, ...phoneOptions];

  }

  return options;
}


export function getFlowTriggerEnumOptions() {
  return [
    {
      value: FlowTriggerEnum.Auto,
      text: translate(LanguagePath.Flow_Trigger_Type_Auto)
    },
    {
      value: FlowTriggerEnum.Manual,
      text: translate(LanguagePath.Flow_Trigger_Type_Manual)
    },
  ]
}

export function getAuthorizationTypeOptions() {
  return [
    {
      value: AuthorizationType.Viewer,
      text: translate(LanguagePath.Authorization_Type_Viewer)
    },
    {
      value: AuthorizationType.Contributor,
      text: translate(LanguagePath.Authorization_Type_Contributor)
    },
    {
      value: AuthorizationType.Owner,
      text: translate(LanguagePath.Authorization_Type_Owner)
    },

  ]
}



export function getFilterAssignmentOptions() {
  return [
    {
      value: AssignmentFilterEnum.All,
      text: translate(LanguagePath.Filter_Assignment_All)
    },
    {
      value: AssignmentFilterEnum.Me,
      text: translate(LanguagePath.Filter_Assignment_Me)
    },
    {
      value: AssignmentFilterEnum.Unassigned,
      text: translate(LanguagePath.Filter_Assignment_Unassigned)
    },
    {
      value: AssignmentFilterEnum.Custom,
      text: translate(LanguagePath.Filter_Assignment_Custom)
    }
  ]
}


export function getTaskStatusOptions() {
  return [
    {
      value: TaskFilterTaskStatusEnum.All,
      text: translate(LanguagePath.Task_Filter_Status_All)
    },
    {
      value: TaskFilterTaskStatusEnum.Open,
      text: translate(LanguagePath.Task_Filter_Status_Open)
    },
    {
      value: TaskFilterTaskStatusEnum.Completed,
      text: translate(LanguagePath.Task_Filter_Status_Completed)
    },
  ]
}

export function getTicketStatusOptions() {
  return [
    {
      value: TicketFilterTicketStatusEnum.All,
      text: translate(LanguagePath.Tickets_Filter_Status_All)
    },
    {
      value: TicketFilterTicketStatusEnum.Open,
      text: translate(LanguagePath.Tickets_Filter_Status_Open)
    },
    {
      value: TicketFilterTicketStatusEnum.Completed,
      text: translate(LanguagePath.Tickets_Filter_Status_Completed)
    },
  ]
}

export function getTicketStatus(status: TicketStatus) {
  switch (status) {
    case TicketStatus.Finished: return translate(LanguagePath.Tickets_Filter_Status_Completed)
    case TicketStatus.WaitingForCommunicator: return translate(LanguagePath.Tickets_Filter_Status_WaitingForCommunicator)
    case TicketStatus.WaitingForTickUser: return translate(LanguagePath.Tickets_Filter_Status_WaitingForTickUser)
  }
}

export function getDatabagCalculateOperatorOptions() {
  return [
    {
      value: DatabagCalculateOperator.Add,
      text: translate(LanguagePath.Databag_Calculator_Operator_Add)
    },
    {
      value: DatabagCalculateOperator.Minus,
      text: translate(LanguagePath.Databag_Calculator_Operator_Subtract)
    },
    {
      value: DatabagCalculateOperator.Multiply,
      text: translate(LanguagePath.Databag_Calculator_Operator_Multiply)
    },
    {
      value: DatabagCalculateOperator.Divide,
      text: translate(LanguagePath.Databag_Calculator_Operator_Divide)
    },

  ]
}


export function getResponseOptions() {
  return [
    {
      text: translate(LanguagePath.App_Ticket_MessageSending_Type_InternalNote),
      id: MessageSendingType.Internal,
    },
    {
      text: translate(LanguagePath.App_Ticket_MessageSending_Type_Public),
      id: MessageSendingType.Public,
    },
    {
      text: translate(LanguagePath.App_Ticket_MessageSending_Type_External),
      id: MessageSendingType.External,
    },

  ]
}


export function getCollectionObjectTypeIcon(input: CollectionObjectTypeEnum) {
  switch (input) {
    case CollectionObjectTypeEnum.DataAdapter:
      return "adapter";
    case CollectionObjectTypeEnum.Flow:
      return "flow";
    case CollectionObjectTypeEnum.MetaDataComponent:
      return "metadata-component";
    case CollectionObjectTypeEnum.File:
      return "file";
    case CollectionObjectTypeEnum.Task:
      return "task";
    case CollectionObjectTypeEnum.KnowledgeBase:
      return "knowledgebase"

  }
  return "";
}

export function getCollectionObjectTypeName(input: CollectionObjectTypeEnum) {
  switch (input) {
    case CollectionObjectTypeEnum.DataAdapter:
      return translate(LanguagePath.DataAdapter);
    case CollectionObjectTypeEnum.Flow:
      return translate(LanguagePath.Flow);
    case CollectionObjectTypeEnum.MetaDataComponent:
      return translate(LanguagePath.MetadataComponent);
    case CollectionObjectTypeEnum.File:
      return translate(LanguagePath.File);
    case CollectionObjectTypeEnum.Task:
      return translate(LanguagePath.TaskDefinition);
    case CollectionObjectTypeEnum.KnowledgeBase:
      return translate(LanguagePath.KnowledgeBase);

  }
  return "";
}