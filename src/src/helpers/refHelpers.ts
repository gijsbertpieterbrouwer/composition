import { ComponentPublicInstance } from "vue";

export function isVue(tbd: unknown): tbd is ComponentPublicInstance {
  return (tbd as ComponentPublicInstance).$el !== undefined;
}

export function isVueArray(tbd: unknown): tbd is ComponentPublicInstance[] {
  const firstElement = (tbd as unknown)[0];
  return firstElement !== undefined && firstElement.$el !== undefined;
}

export function isElement(tbd: { outerHTML?: string }): tbd is HTMLElement {
  return tbd.outerHTML !== undefined;
}

export function isElementArray(tbd: unknown): tbd is HTMLElement[] {
  const firstElement = (tbd as unknown)[0];
  return firstElement !== undefined && firstElement.outerHTML !== undefined;
}

export default function getRefElement(vue: ComponentPublicInstance, name: string): HTMLElement | null {
  if (!vue) { return null; }

  if (isVue(name)) {
    return name.$el;
  }


  const ref = vue.$refs[name];
  if (!ref) return null;

  if (isVue(ref)) {
    return ref.$el;
  }
  if (isVueArray(ref)) {
    return ref[0].$el;
  }
  if (isElement(ref)) {
    return ref;
  }
  if (isElementArray(ref)) {
    return ref[0];
  }
  return null;
}

export function getRefElementDOMRect(vue: ComponentPublicInstance, name: string) {
  const isEl = name as unknown instanceof HTMLElement;
  const control = !isEl ? getRefElement(vue, name) : name as unknown as HTMLElement;
  const rect = control.getBoundingClientRect();
  return rect;
}


