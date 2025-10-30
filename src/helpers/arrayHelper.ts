import { MetaDataItem } from "@/TickApi";

export const maxDetailsListItems = 20;
export const defaultListSize = 20;


export function allElementsEqual<T>(arr: T[]): boolean {
  if (arr.length === 0) {
    return true; // An empty array is considered to have all elements equal
  }

  // Compare each element to the first element
  const firstElement = arr[0];
  return arr.every(element => element === firstElement);
}

export function areEqual(array1: unknown[], array2: unknown[]) {
  if (array1 == undefined && array2 != undefined) { return false; }

  if (array1.length == 0 && array2.length == 0) {
    return true;
  }

  if (array1.length === array2.length) {
    return array1.every((element, index) => {
      if (element === array2[index]) {
        return true;
      }

      return false;
    });
  }

  return false;
}

export interface FilterOptions<T> {
  minMatch?: number;
  filterProps: (keyof T)[];
}

export function smartFilter<T>(
  search: string,
  items: T[],
  options: FilterOptions<T>
): T[] {
  const found: T[] = [];
  const minMatch = options.minMatch ?? 0.9;

  for (const item of items) {
    let matchedProps = 0;

    for (const prop of options.filterProps) {
      const value = item[prop];

      if (value == null) continue; // skip null/undefined safely

      const text = String(value);
      const match = fuzzySearch(text, search, minMatch);

      if (match) matchedProps++;
    }

    if (matchedProps > 0) {
      found.push(item);
    }
  }

  return found;
}

export function fuzzySearch(input: string, term: string, ratio: number) {
  const string = input.toLowerCase();
  const compare = term.toLowerCase();
  let matches = 0;
  if (string.indexOf(compare) > -1) return true; // covers basic partial matches
  for (let i = 0; i < compare.length; i++) {
    string.indexOf(compare[i]) > -1 ? (matches += 1) : (matches -= 1);
  }
  return matches / input.length >= ratio || term == "";
}

export function patchMetaDataListSummary(item: MetaDataItem, list: MetaDataItem[]) {
  const summary = (list).find((s) => s.id === item.id);
  if (!summary) { return; }
  summary.name = item.name
}

export function patchMetaDataList<T extends { id: string }>(
  newData: T,
  list: T[] | undefined | null,
  maxLength: number | null
): T[] {
  if (!newData) { return list || []; }

  if (!list) {
    list = [newData];
    return list;
  }
  const index = list.findIndex(  // No cast needed—list is T[]
    (s) => s.id === newData.id
  );
  if (index === -1) {
    list.push(newData);
    delimitList(list, maxLength);  // Assume delimitList is also generic or safe
  } else {
    list.splice(index, 1, newData);
  }
  return list;
}

export function removeInMetaDataList(dataToDelete: { id: string }, list: { id: string }[]): { id: string }[] {

  if (!dataToDelete || !dataToDelete.id) { return list; }

  if (!list) {
    list = [];
    return list;
  }

  const index = list.findIndex((s) => s.id === dataToDelete.id);
  if (index > -1) {
    list.splice(index, 1);
  }


  return list;
}

export function patchMultipleInMetaDataList<T extends { id: string }>(newDatas: T[] | undefined | null, list: T[] | undefined | null, maxLength: number | null): T[] {
  if (!list) {
    list = newDatas || [];
    return list;
  }

  if (!newDatas || !newDatas.length || areEqual(newDatas, list)) { return list; }

  for (let index = 0; index < newDatas.length; index++) {
    const item = newDatas[index];
    list = patchMetaDataList(item, list, maxLength) as T[];
  }
  return list;
}

export function delimitList<T>(list: T[], maxLength?: number | null) {
  if (maxLength && maxLength > 1 && list.length > maxLength) {
    list.shift();
  }
}

export function findMaxValueInList<T extends Record<string, any>>(
  arr: T[],
  property: keyof T
): number {
  if (!Array.isArray(arr) || arr.length === 0) return 0;

  return arr.reduce((max, obj) => {
    const value = obj[property];
    return typeof value === "number" && value > max ? value : max;
  }, 0);
}