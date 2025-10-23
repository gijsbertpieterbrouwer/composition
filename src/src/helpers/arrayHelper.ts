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

export interface FilterOptions {
  minMatch?: number;
  filterProps: string[];
}

export function smartFilter<T = unknown>(
  search: string,
  items: T[],
  options: FilterOptions
) {
  const found: T[] = [];

  options.minMatch = options.minMatch || 0.9;

  items.forEach((i) => {
    let props = 0;

    // Take a look at each property in the object
    options.filterProps.forEach((p) => {
      const propValue = (i as unknown)[p].toString();
      const propMatch = fuzzySearch(propValue, search, options.minMatch);
      if (propMatch) {
        props++;
      }
    });

    // If the search query was found in any properties
    if (props >= 1) {
      found.push(i);
    }
  });

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

export function patchMetaDataList(newData: { id: string }, list: { id: string }[], maxLength: number): { id: string }[] {
  if (!newData) { return list; }

  if (!list) {
    list = [newData];
    return list;
  }
  const index = (list).findIndex(
    (s) => s.id === newData.id
  );
  if (index === -1) {
    list.push(newData);
    delimitList(list, maxLength);


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

export function patchMultipleInMetaDataList(newDatas: { id: string }[], list: { id: string }[], maxLength: number): { id: string }[] {
  if (!list) {
    list = newDatas;
    return list;
  }

  if (!newDatas || !newDatas.length || areEqual(newDatas, list)) { return list; }


  for (let index = 0; index < newDatas.length; index++) {
    const item = newDatas[index];
    list = patchMetaDataList(item, list, maxLength);
  }
  return list;
}

export function delimitList(list: { id: string }[], maxLength?: number) {
  if (maxLength && maxLength > 1) {
    // if on max => remove first
    if (list.length > maxLength) {
      list.shift();
    }
  }
}


export function findMaxValueInList(arr: unknown[], property: string): number {
  return (arr.reduce((max, obj) => {
    return obj[property] > max ? obj[property] : max;
  }, 0)) as number;
}