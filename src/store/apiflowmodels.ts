export interface Position {
  x: number;
  y: number;
}

export enum ActionType {
  Bot = "Bot",
  Logic = "Logic",
  Navigate = "Navigate",
  DataAdapter = "DataAdapter"
}

export enum NavigateActionType {
  Direct = "Direct",
  Conditional = "Conditional",
  Switch = "Switch",
}

export enum StorageLocation {
  Flow = 2,
  Communicator = 3,
  Ticket = 4,
}

export interface DataPointer {
  location?: StorageLocation;
  value: string;
}

type Reference = string | DataPointer;

interface Condition {
  referenceInput: Reference;
  type: "contains" | "match";
  operator: "does" | "doesnot";
}

interface ConditionWithValue extends Condition {
  referenceValue: Reference;
}

export interface ConditionGroup {
  matches: "or" | "and";
  conditions: ConditionWithValue[];
}

interface ConditionSettings {
  index: number;
  conditionGroup: ConditionGroup;
  targetStepId: string;
}

interface SwitchCase {
  index: number;
  referenceValue: Reference;
  targetStepId: string;
}

export interface ActionSettingsBase {
  targetStepId?: string;
}

interface NavigateActionSettingsBase {
  type: NavigateActionType;
}

// Does not extend ActionSettingsBase because navigation is handled differently
interface DirectNavigateActionSettings extends NavigateActionSettingsBase {
  type: NavigateActionType.Direct;
  targetStepId: string;
}

interface ConditionalNavigateActionSettings extends NavigateActionSettingsBase, ActionSettingsBase {
  type: NavigateActionType.Conditional;
  conditions: ConditionSettings[];
}

// Does not extend ActionSettingsBase because navigation is handled differently
interface SwitchNavigateActionSettings extends NavigateActionSettingsBase {
  type: NavigateActionType.Switch;
  condition: Condition;
  defaultStepId?: string;
  cases: SwitchCase[];
}

export type NavigateActionSettings = DirectNavigateActionSettings | ConditionalNavigateActionSettings | SwitchNavigateActionSettings;

export enum BotActionType {
  Message,
  TextualQuestion,
  Choice,
}

interface MessageBotActionSettingsBase extends ActionSettingsBase {
  action: BotActionType;
  botUserId: string;
  message: string;
}

interface MessageWithConfirmationBotActionSettingsBase extends MessageBotActionSettingsBase {
  confirmationMessage?: string;
}

export interface MessageBotActionSettings extends MessageBotActionSettingsBase {
  action: BotActionType.Message;
}

export enum ValidationType {
  Custom,
  Text,
  Number,
  Emailaddress,
}

interface ValidationBase {
  type: ValidationType;
  invalidMessage?: string;
}

export interface CustomValidation extends ValidationBase {
  type: ValidationType.Custom;
  regex: string;
}

export interface TextValidation extends ValidationBase {
  type: ValidationType.Text;
}
export interface NumberValidation extends ValidationBase {
  type: ValidationType.Number;
}
export interface EmailaddressValidation extends ValidationBase {
  type: ValidationType.Emailaddress;
}

export type Validation = CustomValidation | TextValidation | NumberValidation | EmailaddressValidation;

export interface MessageWithAnswerBotActionSettingsBase extends MessageWithConfirmationBotActionSettingsBase {
  answerStorage: DataPointer;
  validation: Validation;
  answerExtractionRegex?: string;
}

export interface TextualQuestionBotActionSettings extends MessageWithAnswerBotActionSettingsBase {
  action: BotActionType.TextualQuestion;
}

interface ChoiceBotActionOption {
  text: string;
  data: string;
  targetStepId?: string;
}

enum ChoiceBotActionSettingsSource {
  Options,
  Databag,
}

interface ChoiceBotActionSettingsBase extends MessageWithAnswerBotActionSettingsBase {
  action: BotActionType.Choice;
  source: ChoiceBotActionSettingsSource;
}

interface OptionsChoiceBotActionSettings extends ChoiceBotActionSettingsBase {
  source: ChoiceBotActionSettingsSource.Options;
  options: ChoiceBotActionOption[];
}

interface DatabagChoiceBotActionSettings extends ChoiceBotActionSettingsBase {
  source: ChoiceBotActionSettingsSource.Databag;
  optionsLocation: DataPointer;
  mappingJMESPath: string;
}

type ChoiceBotActionSettings = OptionsChoiceBotActionSettings | DatabagChoiceBotActionSettings;

export type BotActionSettings = MessageBotActionSettings | TextualQuestionBotActionSettings | ChoiceBotActionSettings;

export enum LogicActionType {
  Ticket,
  TicketLabels,
}

interface LogicActionSettingsBase {
  type: LogicActionType;
}

interface TicketLogicActionSettings extends LogicActionSettingsBase {
  type: LogicActionType.Ticket;
  finishTicket: boolean;
}

enum LabelActionType {
  Add,
  Remove,
}

interface LabelAction {
  labelId: string;
  type: LabelActionType;
}

interface TicketLabelsLogicActionSettings extends LogicActionSettingsBase {
  type: LogicActionType.TicketLabels;
  labelActions: LabelAction[];
}

export type LogicActionSettings = TicketLogicActionSettings | TicketLabelsLogicActionSettings;

export interface DataAdapterActionSettings {
  name: string;
}

interface ActionBase {
  id: string;
  name: string;
  index: number;
  type: ActionType;
}

export interface BotAction extends ActionBase {
  type: ActionType.Bot;
  settings: BotActionSettings;
}

export interface LogicAction extends ActionBase {
  type: ActionType.Logic;
  settings: LogicActionSettings;
}

export interface DataAdapterAction extends ActionBase {
  type: ActionType.DataAdapter;
  settings: DataAdapterActionSettings;
}

export interface NavigateAction extends ActionBase {
  type: ActionType.Navigate;
  settings: NavigateActionSettings;
}

export type Action = BotAction | LogicAction | NavigateAction | DataAdapterAction;
