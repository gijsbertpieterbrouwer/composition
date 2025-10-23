import { Condition, ConditionElement, ConditionGroup, ConditionLogicalOperator, ConditionOperator, ConditionType, ICondition } from "@/TickApi";
import generateId from "./guid";


export function getEmptyConditiongroup(name?: string): ConditionGroup {
  return {
    conditions: [getDefaultCondition(name)],
    elementType: ConditionElement.Group,
    id: generateId(),
    logicalOperator: ConditionLogicalOperator.All,
    name: name || "",
  }
}

export function getDefaultCondition(name?: string): ICondition {
  name = name || "";
  let conditionType = ConditionType.Contains;
  let referenceValue = name || "";

  if (name.startsWith("<")) {
    conditionType = ConditionType.SmallerThen
    referenceValue = referenceValue.substring(1);

  } else if (name.startsWith(">")) {
    conditionType = ConditionType.GreaterThen
    referenceValue = referenceValue.substring(1);
  } else if (name.startsWith("=")) {
    conditionType = ConditionType.Match
    referenceValue = referenceValue.substring(1);
  }

  const newCondition: Condition = {
    conditionOperator: ConditionOperator.Does,
    conditionType: conditionType,
    referenceInput: "",
    referenceValue: referenceValue.trim(),
    id: generateId(),
    elementType: ConditionElement.Single,
  };
  return newCondition;
}

